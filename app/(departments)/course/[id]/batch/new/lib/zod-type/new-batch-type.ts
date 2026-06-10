import { z } from "zod";

// ── Fee row ──────────────────────────────────────────────────────────────────
export const feeRowSchema = z.object({
  institution: z.coerce.number().min(0).default(0),
  university: z.coerce.number().min(0).default(0),
  practical: z.coerce.number().min(0).default(0),
  cultural: z.coerce.number().min(0).default(0),
  sports: z.coerce.number().min(0).default(0),
  miscellaneous: z.coerce.number().min(0).default(0),
  late: z.coerce.number().min(0).default(0),
});

export type FeeRowSchema = z.infer<typeof feeRowSchema>;

export const DEFAULT_FEE_ROW: FeeRowSchema = {
  institution: 0,
  university: 0,
  practical: 0,
  cultural: 0,
  sports: 0,
  miscellaneous: 0,
  late: 0,
};

// ── Full batch schema ─────────────────────────────────────────────────────────
export const newBatchSchema = z.object({
  sessionId: z.string().min(1, { message: "Academic session is required" }),

  subjects: z.object({
    sameForAll: z.boolean(),
    // key = semesterIndex (0-based), value = array of subjectIds
    assignments: z.record(z.string(), z.array(z.string())),
  }),

  fees: z.object({
    sameForAll: z.boolean(),
    // key = semesterIndex (0-based)
    fees: z.record(z.string(), feeRowSchema),
  }),
});

export type NewBatchSchema = z.infer<typeof newBatchSchema>;
