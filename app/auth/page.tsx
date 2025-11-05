"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import { useSignIn, useSignUp, useVerifyOtp, useResendOtp } from "@/api/hooks/use-auth";
import {
  signInSchema,
  signUpSchema,
  verifyOtpSchema,
  type SignInInput,
  type SignUpInput,
  type VerifyOtpInput,
} from "@/lib/validations/auth";
import { getErrorMessage } from "@/lib/utils/error-handler";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, FormFieldWrapper } from "@/components/ui/form";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, pendingEmail, setPendingEmail, clearPendingEmail } = useAuthStore();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", first_name: "", last_name: "" },
  });

  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [step, setStep] = React.useState<"form" | "otp">("form");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const onSignIn = async (data: SignInInput) => {
    try {
      await signInMutation.mutateAsync(data);
      const hasToken = typeof window !== "undefined" && localStorage.getItem("access_token");
      if (!hasToken && (pendingEmail || signInMutation.data?.requires_otp)) {
        setPendingEmail(data.email);
        setStep("otp");
      } else if (hasToken) {
        router.replace("/");
      }
    } catch (error) {
      // Error handled by mutation
      console.error("Sign in error:", error);
    }
  };

  const onSignUp = async (data: SignUpInput) => {
    try {
      await signUpMutation.mutateAsync(data);
      setPendingEmail(data.email);
      setStep("otp");
    } catch (error) {
      // Error handled by mutation
      console.error("Sign up error:", error);
    }
  };

  const onVerifyOtp = async (data: VerifyOtpInput) => {
    try {
      await verifyOtpMutation.mutateAsync(data);
      router.replace("/");
    } catch (error) {
      // Error handled by mutation
      console.error("OTP verification error:", error);
    }
  };

  const onResendOtp = async () => {
    try {
      await resendOtpMutation.mutateAsync({ email: pendingEmail || undefined });
    } catch (error) {
      // Error handled by mutation
      console.error("Resend OTP error:", error);
    }
  };

  const switchMode = () => {
    const newMode = mode === "signin" ? "signup" : "signin";
    setMode(newMode);
    signInForm.reset();
    signUpForm.reset();
  };

  const error =
    signInMutation.error || signUpMutation.error || verifyOtpMutation.error || resendOtpMutation.error;
  const isLoading =
    signInMutation.isPending || signUpMutation.isPending || verifyOtpMutation.isPending || resendOtpMutation.isPending;

  if (step === "otp") {
    return (
      <Container size="sm" className="py-10">
        <div className="mb-6 flex items-center justify-between">
          <Heading level={2}>Verify OTP</Heading>
          <Link href="/reset-password" className="text-sm text-muted-foreground hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
          <FormField
            name="otp"
            label="Enter the 6-digit OTP"
            description={`Sent to ${pendingEmail || signInForm.getValues("email") || signUpForm.getValues("email")}`}
            error={otpForm.formState.errors.otp?.message}
          >
            <Input
              {...otpForm.register("otp")}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              className="text-center tracking-widest text-lg"
              autoComplete="one-time-code"
            />
          </FormField>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying…" : "Verify"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onResendOtp} disabled={resendOtpMutation.isPending}>
              Resend OTP
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep("form")} className="ml-auto">
              Back
            </Button>
          </div>
        </form>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={2}>{mode === "signin" ? "Sign in" : "Create account"}</Heading>
        <Link href="/reset-password" className="text-sm text-muted-foreground hover:underline">
          Forgot password?
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {mode === "signin" ? (
        <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
          <FormFieldWrapper>
            <FormField
              name="email"
              label="Email"
              required
              error={signInForm.formState.errors.email?.message}
            >
              <Input
                {...signInForm.register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </FormField>

            <FormField
              name="password"
              label="Password"
              required
              error={signInForm.formState.errors.password?.message}
            >
              <Input
                {...signInForm.register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </FormField>
          </FormFieldWrapper>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Button type="button" variant="link" onClick={switchMode}>
              Sign up
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
          <FormFieldWrapper>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="first_name"
                label="First name"
                required
                error={signUpForm.formState.errors.first_name?.message}
              >
                <Input
                  {...signUpForm.register("first_name")}
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                />
              </FormField>

              <FormField
                name="last_name"
                label="Last name"
                required
                error={signUpForm.formState.errors.last_name?.message}
              >
                <Input
                  {...signUpForm.register("last_name")}
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </FormField>
            </div>

            <FormField
              name="email"
              label="Email"
              required
              error={signUpForm.formState.errors.email?.message}
            >
              <Input
                {...signUpForm.register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </FormField>

            <FormField
              name="password"
              label="Password"
              required
              description="Must be at least 8 characters"
              error={signUpForm.formState.errors.password?.message}
            >
              <Input
                {...signUpForm.register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormField>
          </FormFieldWrapper>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account…" : "Sign up"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Have an account?{" "}
            <Button type="button" variant="link" onClick={switchMode}>
              Sign in
            </Button>
          </div>
        </form>
      )}
    </Container>
  );
}
