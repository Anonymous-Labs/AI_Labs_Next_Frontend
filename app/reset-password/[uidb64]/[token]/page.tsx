"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/api/hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
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
      // Error handled by mutation
      console.error("Password reset error:", error);
    }
  };

  if (success) {
    return (
      <Container size="sm" className="py-10">
        <Alert className="mb-4">
          <AlertDescription>Password updated successfully. Redirecting to sign in…</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={2}>Set a new password</Heading>
        <Link href="/auth" className="text-sm text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </div>

      {(resetPasswordMutation.error || form.formState.errors.root) && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {getErrorMessage(resetPasswordMutation.error) || form.formState.errors.root?.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            />
          </FormField>
        </FormFieldWrapper>

        <Button type="submit" disabled={resetPasswordMutation.isPending} className="w-full">
          {resetPasswordMutation.isPending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </Container>
  );
}
