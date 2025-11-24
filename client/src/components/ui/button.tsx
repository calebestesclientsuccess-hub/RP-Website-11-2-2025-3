import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
    " hover-elevate active-elevate-2 transition-all duration-200 hover:translate-y-[-2px] hover:scale-[1.01] active:translate-y-0 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-cta-primary text-cta-primary-foreground border-[var(--cta-primary-border)] shadow-sm hover:brightness-95 active:brightness-90",
        primary:
          "bg-cta-primary text-cta-primary-foreground border-[var(--cta-primary-border)] shadow-sm hover:brightness-95 active:brightness-90",
        secondary:
          "bg-cta-secondary text-cta-secondary-foreground border-[var(--cta-secondary-border)] shadow-xs hover:bg-cta-secondary/90 active:bg-cta-secondary/80",
        tertiary:
          "bg-cta-tertiary text-cta-tertiary-foreground border-[var(--cta-tertiary-border)] shadow-xs hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground border-[var(--destructive-border)] hover:brightness-95 active:brightness-90",
        outline:
          // Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color.
          "border border-[var(--button-outline)] bg-transparent text-foreground shadow-xs active:shadow-none",
        // Add a transparent border so that when someone toggles a border on later, it doesn't shift layout/size.
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted/60 active:bg-muted/40",
        link:
          "border border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
      },
      // Heights are set as "min" heights, because sometimes Ai will place large amount of content
      // inside buttons. With a min-height they will look appropriate with small amounts of content,
      // but will expand to fit large amounts of content.
      size: {
        default: "min-h-11 px-4 py-2 md:min-h-9", // 44px on mobile, 36px on desktop
        sm: "min-h-11 rounded-md px-3 text-xs md:min-h-8", // 44px on mobile, 32px on desktop
        lg: "min-h-11 rounded-md px-8 md:min-h-10", // 44px on mobile, 40px on desktop
        icon: "h-11 w-11 md:h-9 md:w-9", // 44px on mobile, 36px on desktop
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const explicitPriority = (props as { "data-priority"?: string })["data-priority"]
    const derivedPriority =
      explicitPriority ??
      (variant === "secondary"
        ? "secondary"
        : variant === "primary" || variant === "default" || variant === undefined
          ? "primary"
          : undefined)

    return (
      <Comp
        data-priority={derivedPriority}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
