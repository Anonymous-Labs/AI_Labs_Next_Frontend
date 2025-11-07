"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset, useResetPassword } from "@/api/hooks/use-auth";
import { requestPasswordResetSchema, resetPasswordSchema, type RequestPasswordResetInput, type ResetPasswordInput } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormFieldWrapper } from "@/components/ui/form";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>}>
      <ResetPasswordBody />
    </Suspense>
  );
}

function ResetPasswordBody() {
  const [sent, setSent] = useState(false);
  const requestPasswordResetMutation = useRequestPasswordReset();
  const resetPasswordMutation = useResetPassword();
  const searchParams = useSearchParams();
  const router = useRouter();

  const uidb64 = searchParams.get("uidb64");
  const token = searchParams.get("token");
  const hasToken = Boolean(uidb64 && token);

  const requestForm = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onRequest = async (data: RequestPasswordResetInput) => {
    try {
      await requestPasswordResetMutation.mutateAsync(data);
      setSent(true);
    } catch (error) {
      console.error("Password reset request error:", error);
    }
  };

  const onReset = async (data: ResetPasswordInput) => {
    if (!uidb64 || !token) {
      resetForm.setError("root", { message: "Invalid reset link" });
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ uidb64, token, newPassword: data.new_password });
      router.replace("/auth");
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gradient-to-b from-background to-muted/20 py-12">
        <Container size="sm" className="w-full">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
            {!hasToken ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <Heading level={2}>Reset your password</Heading>
                  <p className="mt-2 text-sm text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
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
                          If an account exists for <span className="font-medium">{requestForm.getValues("email")}</span>, we've sent a password reset link.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-6">
                    <FormFieldWrapper>
                      <FormField
                        name="email"
                        label="Email address"
                        required
                        description="Enter the email address associated with your account"
                        error={requestForm.formState.errors.email?.message}
                      >
                        <Input {...requestForm.register("email")} type="email" placeholder="name@example.com" autoComplete="email" className="h-11" autoFocus />
                      </FormField>
                    </FormFieldWrapper>

                    <Button type="submit" disabled={requestPasswordResetMutation.isPending} className="w-full" size="lg">
                      {requestPasswordResetMutation.isPending ? "Sending…" : "Send reset link"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Remember your password?{" "}
                      <Link href="/auth" className="font-medium text-primary hover:underline">Sign in</Link>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Heading level={2}>Set a new password</Heading>
                  <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account.</p>
                </div>

                {(resetPasswordMutation.error || resetForm.formState.errors.root) && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{getErrorMessage(resetPasswordMutation.error) || resetForm.formState.errors.root?.message}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-6">
                  <FormFieldWrapper>
                    <FormField name="new_password" label="New password" required description="Must be at least 8 characters" error={resetForm.formState.errors.new_password?.message}>
                      <Input {...resetForm.register("new_password")} type="password" placeholder="••••••••" autoComplete="new-password" className="h-11" autoFocus />
                    </FormField>
                    <FormField name="confirm_password" label="Confirm new password" required error={resetForm.formState.errors.confirm_password?.message}>
                      <Input {...resetForm.register("confirm_password")} type="password" placeholder="••••••••" autoComplete="new-password" className="h-11" />
                    </FormField>
                  </FormFieldWrapper>

                  <Button type="submit" disabled={resetPasswordMutation.isPending} className="w-full" size="lg">
                    {resetPasswordMutation.isPending ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </Container>
      </div>
    </AuthLayout>
  );
}
