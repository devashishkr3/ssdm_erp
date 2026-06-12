"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { signUp } from "@/lib/auth-client";
import { type SignupSchema, signupSchema } from "../lib/zod-type/signup-type";
import { InputForSignup } from "./Input-for-signup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function MainSignupForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<SignupSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(signupSchema) as any,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupSchema) => {
    setErrorMsg("");

    await signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "admin",
      },
      {
        onSuccess: () => {
          router.push("/auth/admin/signin");
        },
        onError: (ctx) => {
          setErrorMsg(ctx.error.message || "Something went wrong");
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
            <CardTitle className="text-2xl">Admin Sign Up</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <InputForSignup form={form} />
              </div>

              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <Button type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Sign up
                </LoadingSwap>
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/admin/signin"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
