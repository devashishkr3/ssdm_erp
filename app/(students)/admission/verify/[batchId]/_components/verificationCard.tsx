"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type VerifyStudentUANType,
  verifyStudentUANZodSchema,
} from "../lib/zod-type/verify-student-uan";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputForVerification } from "./input-for-verification";
import { useMutation } from "@tanstack/react-query";
import { verifyEnrolledStudentMutationOptions } from "../query/verify-enrolled-student";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const VerificationCard = ({ batchId }: { batchId: string }) => {
  const router = useRouter();
  const form = useForm<VerifyStudentUANType>({
    resolver: zodResolver(verifyStudentUANZodSchema),
    defaultValues: { uan: "", subMJC: "" },
  });

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    ...verifyEnrolledStudentMutationOptions(batchId),
    onSuccess: (data) => {
      // Verification successful — redirect to registration form
      if (!data.student) return;
      const uan = data.student.UAN;
      const mjc = data.student.MJC;
      router.push(
        `/admission/register?batch=${batchId}&uan=${uan}&mjc=${mjc}`,
      );
    },
  });

  const onSubmit = (data: VerifyStudentUANType) => {
    mutate({ UAN: data.uan, MJC: data.subMJC });
  };

  return (
    <Card className="max-w-[600px] mx-auto w-full">
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Please Verify your identity to proceed with the admission process
            </CardTitle>
          </CardHeader>

          <div className="flex  flex-col justify-center items-center gap-5 mt-5">
            <InputForVerification form={form} />
          </div>

          {isSuccess && (
            <p className="text-sm text-green-600 mt-2">
              Student verified successfully! Redirecting...
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive mt-2">{error.message}</p>
          )}

          <div className="flex justify-end mt-4 gap-4">
            <Button onClick={() => form.reset()} disabled={isPending}>
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
