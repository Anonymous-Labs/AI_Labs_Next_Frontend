"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="md" className="py-20">
          <div className="space-y-4 text-center">
            <Heading level={1}>Something went wrong</Heading>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 rounded-md border bg-muted p-4 text-left">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 overflow-auto text-xs">{this.state.error.message}</pre>
              </details>
            )}
            <Button onClick={() => window.location.reload()}>Refresh page</Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

