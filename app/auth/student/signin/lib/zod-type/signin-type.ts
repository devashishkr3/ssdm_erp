import { z } from "zod";

export const signinSchema = z.object({
  uan: z.string().min(1, { message: "UAN number is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SigninSchema = z.infer<typeof signinSchema>;
