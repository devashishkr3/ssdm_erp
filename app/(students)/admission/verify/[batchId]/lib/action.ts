"use server";

import { db } from "@/lib/db";
import { EnrolledStudentTable } from "@/lib/db/schema";
import { subjectTable } from "@/lib/db/schema/department";
import { and, eq } from "drizzle-orm";

/**
 * Verify that a student is enrolled in the given batch with the given UAN and MJC.
 * No longer creates a user account — signup is handled after registration form submission.
 */
export const fetchEnrolledStudent = async ({
  batchId,
  UAN,
  MJC,
}: {
  batchId: string;
  UAN: string;
  MJC: string;
}) => {
  try {
    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(
        eq(EnrolledStudentTable.batchId, batchId),
        eq(EnrolledStudentTable.UAN, UAN),
        eq(EnrolledStudentTable.subMJC, MJC),
      ),
    });

    if (!student) {
      return { success: false, message: "Student Not Found" };
    }

    return {
      success: true,
      verification: true,
      student: {
        UAN: student.UAN,
        name: student.name,
        batchId,
        MJC,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        "Internal Server Error, Failed to fetch enrolled student details",
    };
  }
};

export const fetchActiveSubjects = async () => {
  try {
    const subjects = await db.query.subjectTable.findMany({
      where: eq(subjectTable.isActive, true),
      orderBy: (subjects, { asc }) => [asc(subjects.name)],
    });
    return {
      success: true,
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    };
  } catch (error) {
    return { success: false, message: "Failed to fetch subjects" };
  }
};
