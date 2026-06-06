'use server'

import { db } from "@/lib/db"
import { AdmittedStudentTable, EnrolledStudentTable } from "@/lib/db/schema/student"
import { and, eq } from "drizzle-orm"

export const fetchEnrolledStudent = async ({ UAN, batch }: { UAN: string, batch: string }) => {
  try {

    const existingStudent = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN)
    })

    if (existingStudent) {
      return {
        success: false,
        message: "Student already take their admission"
      }
    }

    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(eq(EnrolledStudentTable.UAN, UAN), eq(EnrolledStudentTable.batchId, batch)),
      with: {
        courseSession: {
          with: {
            course: {
              with: {
                department: true,
              },
            },
            session: true,
            semesters: {
              with: {
                semesterSubjects: {
                  with: {
                    subject: true,
                  }
                }
              }
            },
          },
        },
      },
    })



    if (!student) {
      return {
        success: false,
        message: "Student not found"
      }
    }

    return {
      success: true,
      data: student
    }

  } catch (error) {
    console.error("[fetchEnrolledStudent] Error:", error);
    return {
      success: false,
      message: "Internal Server Error during fetching enrolled student",
      error: error
    }
  }
}
