import { z } from "zod";

export const addBatchSchema = z.object({
  courseId: z.string().min(1, { message: "Course is required" }),
  academicSessionId: z
    .string()
    .min(1, { message: "Academic session is required" }),
  perSemesterFee: z
    .number()
    .int({ message: "Fee must be a whole number" })
    .min(0, { message: "Fee cannot be negative" }),
});

export type AddBatchSchema = z.infer<typeof addBatchSchema>;
