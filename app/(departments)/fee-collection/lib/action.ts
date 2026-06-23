"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable, StudentFeePaymentTable } from "@/lib/db/schema/student";
import { courseTable, batchTable } from "@/lib/db/schema/department";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }

  return { success: true as const, data: session };
}

export async function getFilterOptions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const courses = await db.query.courseTable.findMany({
      where: eq(courseTable.isActive, true),
      with: {
        batches: {
          where: eq(batchTable.isActive, true),
          with: {
            academicSession: true,
          },
        },
      },
    });

    return { success: true, data: courses };
  } catch (error: any) {
    console.error("[getFilterOptions] Error:", error);
    return { success: false, message: error.message || "Failed to fetch filter options" };
  }
}

export async function getFeeCollectionReport(batchId: string, semesterCount: number) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    if (!batchId || !semesterCount) {
      return { success: false, message: "Batch ID and Semester Count are required" };
    }

    const students = await db.query.AdmittedStudentTable.findMany({
      where: eq(AdmittedStudentTable.batchId, batchId),
      with: {
        feePayments: {
          where: eq(StudentFeePaymentTable.semesterCount, semesterCount),
        },
      },
      orderBy: (students, { asc }) => [asc(students.collegeRoll)],
    });

    return { success: true, data: students };
  } catch (error: any) {
    console.error("[getFeeCollectionReport] Error:", error);
    return { success: false, message: error.message || "Failed to fetch fee collection report" };
  }
}

export async function getGlobalFeeStats() {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    const [{ count: courseCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(courseTable);
      
    const [{ count: studentCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(AdmittedStudentTable);

    const [{ count: batchCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(batchTable);

    const [{ sum: totalCollected }] = await db
      .select({ sum: sql`sum(${StudentFeePaymentTable.amount})`.mapWith(Number) })
      .from(StudentFeePaymentTable)
      .where(eq(StudentFeePaymentTable.status, "Success"));

    return {
      success: true,
      data: {
        totalCourses: courseCount,
        totalStudents: studentCount,
        totalBatches: batchCount,
        totalCollected: totalCollected || 0,
      },
    };
  } catch (error: any) {
    console.error("[getGlobalFeeStats] Error:", error);
    return { success: false, message: error.message || "Failed to fetch global stats" };
  }
}

