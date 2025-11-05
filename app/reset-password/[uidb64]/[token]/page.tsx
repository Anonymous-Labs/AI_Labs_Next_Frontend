"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/api/hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormFieldWrapper } from "@/components/ui/form";
import Link from "next/link";

export default function ResetWithTokenPage() {
  const router = useRouter();
  const params = useParams<{ uidb64: string; token: string }>();
  const uidb64 = params?.uidb64 as string;
  const token = params?.token as string;

  const [success, setSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.replace("/auth");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!uidb64 || !token) {
      form.setError("root", { message: "Invalid reset link" });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        uidb64,
        token,
        newPassword: data.new_password,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gradient-to-b from-background to-muted/20 py-12">
          <Container size="sm" className="w-full">
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <Heading level={2}>Password updated</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been successfully updated. Redirecting to sign in…
              </p>
            </div>
          </Container>
        </div>
      </AuthLayout>
    );
  }

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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <Heading level={2}>Set a new password</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a strong password for your account. Make sure it's at least 8 characters long.
              </p>
            </div>

            {(resetPasswordMutation.error || form.formState.errors.root) && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {getErrorMessage(resetPasswordMutation.error) || form.formState.errors.root?.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormFieldWrapper>
                <FormField
                  name="new_password"
                  label="New password"
                  required
                  description="Must be at least 8 characters"
                  error={form.formState.errors.new_password?.message}
                >
                  <Input
                    {...form.register("new_password")}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-11"
                    autoFocus
                  />
                </FormField>

                <FormField
                  name="confirm_password"
                  label="Confirm new password"
                  required
                  error={form.formState.errors.confirm_password?.message}
                >
                  <Input
                    {...form.register("confirm_password")}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-11"
                  />
                </FormField>
              </FormFieldWrapper>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Password requirements:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use a mix of letters, numbers, and symbols
                  </li>
                </ul>
              </div>

              <Button type="submit" disabled={resetPasswordMutation.isPending} className="w-full" size="lg">
                {resetPasswordMutation.isPending ? "Updating…" : "Update password"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/auth" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </Container>
      </div>
    </AuthLayout>
  );
}
