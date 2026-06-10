import { z } from "zod";

export const COURSE_TYPES = [
  "UG Regular",
  "UG Part Time",
  "UG Vocational",
  "PG Regular",
  "PG Part Time",
  "PG Vocational",
] as const;

export const COURSE_DURATIONS = [2, 3, 4, 5, 6, 7, 8] as const;

export const newCourseSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Course name is required" })
    .max(50, { message: "Course name cannot exceed 50 characters" }),
  code: z
    .string()
    .min(1, { message: "Course code is required" })
    .max(10, { message: "Course code cannot exceed 10 characters" }),
  type: z.enum(COURSE_TYPES, { message: "Select a valid course type" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(255, { message: "Description cannot exceed 255 characters" }),
  departmentId: z.string().min(1, { message: "Department is required" }),
  duration: z.coerce
    .number()
    .int()
    .min(2, { message: "Duration must be at least 2 years" })
    .max(8, { message: "Duration cannot exceed 8 years" }),
});

export type NewCourseSchema = z.infer<typeof newCourseSchema>;
