"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset } from "@/api/hooks/use-auth";
import { requestPasswordResetSchema, type RequestPasswordResetInput } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormFieldWrapper } from "@/components/ui/form";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const requestPasswordResetMutation = useRequestPasswordReset();

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: RequestPasswordResetInput) => {
    try {
      await requestPasswordResetMutation.mutateAsync(data);
      setSent(true);
    } catch (error) {
      console.error("Password reset request error:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gradient-to-b from-background to-muted/20 py-12">
        <Container size="sm" className="w-full">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <Heading level={2}>Reset your password</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {requestPasswordResetMutation.error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{getErrorMessage(requestPasswordResetMutation.error)}</AlertDescription>
              </Alert>
            )}

            {sent ? (
              <Alert className="mb-6">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      If an account exists for <span className="font-medium">{form.getValues("email")}</span>, 
                      we've sent a password reset link to your email address.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check your inbox and follow the instructions to reset your password.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormFieldWrapper>
                  <FormField
                    name="email"
                    label="Email address"
                    required
                    description="Enter the email address associated with your account"
                    error={form.formState.errors.email?.message}
                  >
                    <Input
                      {...form.register("email")}
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="h-11"
                      autoFocus
                    />
                  </FormField>
                </FormFieldWrapper>

                <Button type="submit" disabled={requestPasswordResetMutation.isPending} className="w-full" size="lg">
                  {requestPasswordResetMutation.isPending ? "Sending…" : "Send reset link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/auth" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Didn't receive the email?</strong> Check your spam folder or 
                try again. If you continue to have problems, contact{" "}
                <Link href="/contact" className="font-medium text-primary hover:underline">
                  support
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </div>
    </AuthLayout>
  );
}
