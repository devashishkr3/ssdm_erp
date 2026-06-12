"use server";

import { db } from "@/lib/db";
import { EnrolledStudentTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";
import { subjectTable } from "@/lib/db/schema/department";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

/**
 * Generate student password from their name and DOB.
 * Format: first 4 chars of name (lowercase, no spaces) + year of DOB
 * Example: name="Amit Kumar", DOB="2005-03-15" → "amit2005"
 */
function generateStudentPassword(name: string, dob: string): string {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const first4 = cleanName.slice(0, 4);
  const year = new Date(dob).getFullYear().toString();
  return `${first4}${year}`;
}

/**
 * Generate a synthetic email from UAN for better-auth (which requires email).
 * Format: uan@student.ssdm.local
 */
function generateStudentEmail(uan: string): string {
  return `${uan.toLowerCase()}@student.ssdm.local`;
}

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

    // Generate credentials
    const email = generateStudentEmail(student.UAN);
    const password = generateStudentPassword(student.name, student.DOB);

    // Try to create the user account via better-auth.
    // If the account already exists, we skip creation and just return credentials.
    try {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!existingUser) {
        await auth.api.signUpEmail({
          body: {
            name: student.name,
            email,
            password,
            role: "student",
          },
        });
      }
    } catch (signupError) {
      // If user already exists, that's fine — the student can still sign in.
      console.error("[Student Auto-Signup]:", signupError);
    }

    return {
      success: true,
      verification: true,
      credentials: {
        username: student.UAN,
        password,
        name: student.name,
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
