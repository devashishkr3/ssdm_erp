"use server";

import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseTable } from "@/lib/db/schema";
import { newCourseSchema, type NewCourseSchema } from "./zod-type/new-course-type";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, message: "Unauthorized" };
  if (session.user.role !== "admin" && session.user.role !== "superAdmin")
    return { success: false as const, message: "Forbidden" };
  return { success: true as const, data: session };
}

export async function createCourse(input: NewCourseSchema) {
  try {
    const sessionCheck = await getAdminSession();
    if (!sessionCheck.success) return sessionCheck;

    const parsed = newCourseSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, message: "Invalid course details" };
    }

    const { name, code, type, description, departmentId, duration } = parsed.data;

    const duplicate = await db.query.courseTable.findFirst({
      where: or(eq(courseTable.name, name), eq(courseTable.code, code)),
    });

    if (duplicate) {
      const field = duplicate.name === name ? "name" : "code";
      return {
        success: false as const,
        message: `Course ${field} already exists`,
      };
    }

    const [course] = await db
      .insert(courseTable)
      .values({ name, code, type, description, departmentId, duration, isActive: true })
      .returning();

    return { success: true as const, data: course };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}
