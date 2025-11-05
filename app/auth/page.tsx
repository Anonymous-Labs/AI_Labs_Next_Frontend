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
import { AuthLayout } from "@/components/layout/AuthLayout";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      console.error("Sign in error:", error);
    }
  };

  const onSignUp = async (data: SignUpInput) => {
    try {
      await signUpMutation.mutateAsync(data);
      setPendingEmail(data.email);
      setStep("otp");
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const onVerifyOtp = async (data: VerifyOtpInput) => {
    try {
      await verifyOtpMutation.mutateAsync(data);
      router.replace("/");
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  const onResendOtp = async () => {
    try {
      await resendOtpMutation.mutateAsync({ email: pendingEmail || undefined });
    } catch (error) {
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <Heading level={2}>Verify your email</Heading>
                <p className="mt-2 text-sm text-muted-foreground">
                  We've sent a verification code to{" "}
                  <span className="font-medium text-foreground">
                    {pendingEmail || signInForm.getValues("email") || signUpForm.getValues("email")}
                  </span>
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{getErrorMessage(error)}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
                <FormField
                  name="otp"
                  label="Verification code"
                  required
                  error={otpForm.formState.errors.otp?.message}
                >
                  <Input
                    {...otpForm.register("otp")}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </FormField>

                <div className="space-y-3">
                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? "Verifying…" : "Verify email"}
                  </Button>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onResendOtp}
                      disabled={resendOtpMutation.isPending}
                    >
                      {resendOtpMutation.isPending ? "Sending…" : "Resend code"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setStep("form")}>
                      Back to sign in
                    </Button>
                  </div>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Didn't receive the code? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={onResendOtp}
                  className="font-medium text-primary hover:underline"
                >
                  request a new one
                </button>
                .
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
        <Container size="lg" className="w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Marketing content */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Build the future with{" "}
                    <span className="text-primary">AI-powered</span> tools
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Create intelligent applications with our comprehensive AI workspace. 
                    Collaborate, innovate, and scale your AI projects effortlessly.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Powerful AI Tools</h3>
                      <p className="text-sm text-muted-foreground">
                        Access cutting-edge AI models and tools to build next-generation applications.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Team Collaboration</h3>
                      <p className="text-sm text-muted-foreground">
                        Work seamlessly with your team using real-time collaboration features.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data is protected with bank-level encryption and security protocols.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="mb-8">
                  <Heading level={2} className="mb-2">
                    {mode === "signin" ? "Welcome back" : "Get started"}
                  </Heading>
                  <p className="text-sm text-muted-foreground">
                    {mode === "signin"
                      ? "Sign in to your account to continue"
                      : "Create your account to start building"}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{getErrorMessage(error)}</AlertDescription>
                  </Alert>
                )}

                {mode === "signin" ? (
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-6">
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
                          placeholder="name@example.com"
                          autoComplete="email"
                          className="h-11"
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
                          className="h-11"
                        />
                      </FormField>
                    </FormFieldWrapper>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-border" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <Link href="/reset-password" className="font-medium text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                      {isLoading ? "Signing in…" : "Sign in"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Button type="button" variant="link" onClick={switchMode} className="p-0 h-auto">
                        Sign up
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-6">
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
                            className="h-11"
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
                            className="h-11"
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
                          placeholder="name@example.com"
                          autoComplete="email"
                          className="h-11"
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
                          className="h-11"
                        />
                      </FormField>
                    </FormFieldWrapper>

                    <div className="rounded-lg bg-muted p-4">
                      <label className="flex items-start gap-3 text-sm">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-border" required />
                        <span className="text-muted-foreground">
                          I agree to the{" "}
                          <Link href="/terms" className="font-medium text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="font-medium text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                      {isLoading ? "Creating account…" : "Create account"}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Button type="button" variant="link" onClick={switchMode} className="p-0 h-auto">
                        Sign in
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </AuthLayout>
  );
}
