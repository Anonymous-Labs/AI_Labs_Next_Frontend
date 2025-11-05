"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset } from "@/api/hooks/use-auth";
import { requestPasswordResetSchema, type RequestPasswordResetInput } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
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
      // Error handled by mutation
      console.error("Password reset request error:", error);
    }
  };

  return (
    <Container size="sm" className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={2}>Reset password</Heading>
        <Link href="/auth" className="text-sm text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </div>

      {requestPasswordResetMutation.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{getErrorMessage(requestPasswordResetMutation.error)}</AlertDescription>
        </Alert>
      )}

      {sent ? (
        <Alert className="mb-4">
          <AlertDescription>
            If an account exists for <span className="font-medium">{form.getValues("email")}</span>, a reset link has
            been sent to your email.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormFieldWrapper>
            <FormField
              name="email"
              label="Email"
              required
              description="Enter your email address to receive a password reset link"
              error={form.formState.errors.email?.message}
            >
              <Input
                {...form.register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </FormField>
          </FormFieldWrapper>

          <Button type="submit" disabled={requestPasswordResetMutation.isPending} className="w-full">
            {requestPasswordResetMutation.isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </Container>
  );
}
