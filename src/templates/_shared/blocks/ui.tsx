import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Buttons inside invitations follow the invitation palette, not the app theme. */
export const invButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-inv font-inv-body text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inv-bg focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-inv-primary text-inv-bg shadow-[0_10px_30px_-12px_var(--inv-primary)] hover:-translate-y-0.5 hover:opacity-90",
        outline:
          "border border-inv-primary/50 text-inv-primary hover:border-inv-primary hover:bg-inv-primary hover:text-inv-bg",
        ghost: "text-inv-fg hover:bg-inv-surface",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type InvButtonProps = ComponentProps<"button"> & VariantProps<typeof invButton>

export function InvButton({
  className,
  variant,
  size,
  type = "button",
  ...props
}: InvButtonProps) {
  return (
    <button
      type={type}
      className={cn(invButton({ variant, size }), className)}
      {...props}
    />
  )
}

type InvLinkProps = ComponentProps<"a"> & VariantProps<typeof invButton>

export function InvLink({
  className,
  variant,
  size,
  children,
  ...props
}: InvLinkProps) {
  return (
    <a className={cn(invButton({ variant, size }), className)} {...props}>
      {children}
    </a>
  )
}

export const inputClass =
  "w-full rounded-inv border border-inv-line bg-inv-bg px-4 py-3 font-inv-body text-base text-inv-fg placeholder:text-inv-muted focus-visible:border-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary/40 focus-visible:outline-none"

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs font-medium tracking-[0.3em] text-inv-primary uppercase",
        className
      )}
      {...props}
    />
  )
}
