"use client";

import { useState } from "react";
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
import { CredentialsDialog } from "./credentials-dialog";

interface Credentials {
  username: string;
  password: string;
  name: string;
}

export const VerificationCard = ({ batchId }: { batchId: string }) => {
  const router = useRouter();
  const form = useForm<VerifyStudentUANType>({
    resolver: zodResolver(verifyStudentUANZodSchema),
    defaultValues: { uan: "", subMJC: "" },
  });

  const [uan, setUan] = useState("");
  const [mjc, setMjc] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    ...verifyEnrolledStudentMutationOptions(batchId),
    onSuccess: (data) => {
      if (data.credentials) {
        setCredentials(data.credentials);
        setShowCredentials(true);
      }
    },
  });

  const onSubmit = (data: VerifyStudentUANType) => {
    setUan(data.uan);
    setMjc(data.subMJC);
    mutate({ UAN: data.uan, MJC: data.subMJC });
  };

  const handleCredentialsContinue = () => {
    setShowCredentials(false);
    router.push("/auth/student/signin");
  };

  return (
    <>
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
                Student verified successfully!
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
                Verify
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CredentialsDialog
        open={showCredentials}
        credentials={credentials}
        onContinue={handleCredentialsContinue}
      />
    </>
  );
};
