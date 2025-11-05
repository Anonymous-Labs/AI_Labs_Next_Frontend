import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof HTMLElementTagNameMap;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

export function Container({ as = "div", className, size = "lg", ...props }: ContainerProps) {
  const Component = as as any;
  const maxWidth =
    size === "sm" ? "max-w-screen-sm" :
    size === "md" ? "max-w-screen-md" :
    size === "lg" ? "max-w-screen-lg" :
    size === "xl" ? "max-w-screen-xl" :
    "max-w-none";

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 md:px-8", // gutters
        maxWidth,
        className
      )}
      {...props}
    />
  );
}

export default Container;
