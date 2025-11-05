/**
 * Form components for use with react-hook-form and zod
 */

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

export function FormField({
  name,
  label,
  required,
  error,
  description,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface FormFieldWrapperProps {
  children: React.ReactNode;
}

export function FormFieldWrapper({ children }: FormFieldWrapperProps) {
  return <div className="space-y-4">{children}</div>;
}

