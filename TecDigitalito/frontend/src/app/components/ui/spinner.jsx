import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { cva } from "class-variance-authority"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        default: "size-4",
        sm: "size-3",
        lg: "size-6",
        xl: "size-8",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
        white: "text-white",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    }
  }
)

function Spinner({
  className,
  size,
  variant,
  ...props
}) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props} />
  );
}

export { Spinner, spinnerVariants }
