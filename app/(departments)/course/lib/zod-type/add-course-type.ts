import { z } from "zod";

const courseTypes = [
  "UG Regular",
  "UG Part Time",
  "UG Vocational",
  "PG Regular",
  "PG Part Time",
  "PG Vocational",
] as const;

export const addCourseSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Course name is required" })
    .max(50, { message: "Name cannot be more than 50 characters" }),
  code: z
    .string()
    .min(1, { message: "Course code is required" })
    .max(10, { message: "Code cannot be more than 10 characters" }),
  type: z.enum(courseTypes, { message: "Select a valid course type" }),
  description: z
    .string()
    .max(200, { message: "Description cannot be more than 200 characters" })
    .optional(),
  departmentId: z.string().min(1, { message: "Department is required" }),
  duration: z
    .number()
    .int({ message: "Duration must be a whole number" })
    .min(2, { message: "Duration must be at least 2 years" })
    .max(8, { message: "Duration cannot exceed 8 years" }),
});

export type AddCourseSchema = z.infer<typeof addCourseSchema>;

export const COURSE_TYPES = courseTypes;
