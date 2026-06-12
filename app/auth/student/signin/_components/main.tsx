"use client";

import { useForm } from "react-hook-form";
import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SigninSchema, signinSchema } from "../lib/zod-type/signin-type";
import { InputForSignin } from "./Input-for-signin";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getStudentRedirectInfo } from "../lib/action";
import { useState } from "react";

export function MainSigninForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<SigninSchema>({
    resolver: zodResolver(signinSchema),
    defaultValues: { uan: "", password: "" },
  });

  const onSubmit = async (data: SigninSchema) => {
    setErrorMsg("");

    // Convert UAN to the synthetic email used during signup
    const email = `${data.uan.toLowerCase()}@student.ssdm.local`;

    await signIn.email(
      { email, password: data.password },
      {
        onSuccess: async () => {
          // Look up student details for the redirect URL
          const info = await getStudentRedirectInfo(data.uan);
          if (info.success && info.data) {
            router.push(
              `/admission/register?batch=${info.data.batchId}&uan=${info.data.uan}&mjc=${info.data.mjc}`,
            );
          } else {
            // Fallback: signed in but can't find enrollment data
            router.push("/");
          }
        },
        onError: (ctx) => {
          setErrorMsg(ctx.error.message || "Invalid UAN or password");
          form.reset();
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Student Sign In</CardTitle>
            <CardDescription>
              Enter your UAN number and password to access your admission portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <InputForSignin form={form} />
              </div>

              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <Button type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Sign in
                </LoadingSwap>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
