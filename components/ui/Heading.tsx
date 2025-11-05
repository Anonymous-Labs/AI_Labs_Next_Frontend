import { cn } from "@/lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel;
  as?: keyof JSX.IntrinsicElements;
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
  muted?: boolean;
};

const sizeMap: Record<HeadingLevel, string> = {
  1: "scroll-m-20 text-4xl md:text-5xl/tight tracking-tight",
  2: "scroll-m-20 text-3xl md:text-4xl/tight tracking-tight",
  3: "scroll-m-20 text-2xl md:text-3xl tracking-tight",
  4: "scroll-m-20 text-xl md:text-2xl",
  5: "text-lg md:text-xl",
  6: "text-base md:text-lg",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

export function Heading({ level = 2, as, className, weight = "semibold", align = "left", muted = false, ...props }: HeadingProps) {
  const Tag = (as ?? (`h${level}` as keyof JSX.IntrinsicElements)) as any;
  return (
    <Tag
      className={cn(
        sizeMap[level],
        weightMap[weight],
        align === "center" && "text-center",
        align === "right" && "text-right",
        muted ? "text-muted-foreground" : "text-foreground",
        className
      )}
      {...props}
    />
  );
}

export default Heading;
