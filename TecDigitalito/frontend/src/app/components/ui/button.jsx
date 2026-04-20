import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"
import { Spinner } from "./spinner"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] active:brightness-95 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-border bg-background hover:bg-muted/50 hover:text-foreground hover:border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-5",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-3.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 rounded-xl px-8 text-base",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={loading || disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Spinner size={size === "lg" ? "lg" : "default"} variant={variant === "default" || variant === "secondary" || variant === "destructive" ? "white" : "default"} />
        </div>
      ) : null}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
    </Comp>
  );
}

export { Button, buttonVariants }
