"use server";

import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  batchTable,
  feeTable,
  semesterSubjectTable,
  semesterTable,
} from "@/lib/db/schema";
import { buildSemesterLabels } from "@/app/(departments)/course/lib/semester";
import { newBatchSchema, type NewBatchSchema } from "./zod-type/new-batch-type";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, message: "Unauthorized" };
  if (session.user.role !== "admin" && session.user.role !== "superAdmin")
    return { success: false as const, message: "Forbidden" };
  return { success: true as const, data: session };
}

export async function createBatch(courseId: string, input: NewBatchSchema) {
  try {
    const sessionCheck = await getAdminSession();
    if (!sessionCheck.success) return sessionCheck;

    const parsed = newBatchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, message: "Invalid batch details" };
    }

    const { sessionId, subjects, fees } = parsed.data;

    // ── Fetch course to get duration ───────────────────────────────────────
    const course = await db.query.courseTable.findFirst({
      where: (t, { eq }) => eq(t.id, courseId),
    });
    if (!course) {
      return { success: false as const, message: "Course not found" };
    }

    // ── Prevent duplicate session for the same course ──────────────────────
    const existingBatch = await db.query.batchTable.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.courseId, courseId), eq(t.sessionId, sessionId)),
    });
    if (existingBatch) {
      return {
        success: false as const,
        message: "A batch with this academic session already exists for this course",
      };
    }

    const semesterLabels = buildSemesterLabels(course.duration);
    if (!semesterLabels.length) {
      return {
        success: false as const,
        message: "Unable to generate semesters for this course",
      };
    }

    // ── Create batch + semesters + subjects + fees in one transaction ──────
    const result = await db.transaction(async (tx) => {
      const [batch] = await tx
        .insert(batchTable)
        .values({ courseId, sessionId })
        .returning();

      const semesters = await tx
        .insert(semesterTable)
        .values(
          semesterLabels.map((label, idx) => ({
            batchId: batch.id,
            name: label,
            semesterNumber: idx + 1,
          })),
        )
        .returning();

      // Subjects
      const subjectRows: { semesterId: string; subjectId: string }[] = [];
      for (let i = 0; i < semesters.length; i++) {
        const key = subjects.sameForAll ? "0" : String(i);
        const ids = subjects.assignments[key] ?? [];
        for (const subjectId of ids) {
          subjectRows.push({ semesterId: semesters[i].id, subjectId });
        }
      }
      if (subjectRows.length > 0) {
        await tx.insert(semesterSubjectTable).values(subjectRows);
      }

      // Fees
      const feeRows: {
        semesterId: string;
        institution: number;
        university: number;
        practical: number;
        cultural: number;
        sports: number;
        miscellaneous: number;
        late: number;
      }[] = [];
      for (let i = 0; i < semesters.length; i++) {
        const key = fees.sameForAll ? "0" : String(i);
        const f = fees.fees[key];
        if (f) {
          feeRows.push({ semesterId: semesters[i].id, ...f });
        }
      }
      if (feeRows.length > 0) {
        await tx.insert(feeTable).values(feeRows);
      }

      return { batch, semesterCount: semesters.length };
    });

    return { success: true as const, data: { ...result, courseId } };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create batch",
    };
  }
}
