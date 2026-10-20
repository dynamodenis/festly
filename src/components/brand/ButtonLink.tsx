import { createLink } from "@tanstack/react-router"
import { cva } from "class-variance-authority"
import { ArrowRight } from "lucide-react"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** The only button styles on the marketing site. Same font, radius and hover everywhere. */
export const brandButton = cva(
  "group inline-flex items-center justify-center gap-2 rounded-full font-sans text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 focus-visible:ring-2 focus-visible:ring-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-ink shadow-[0_10px_40px_-12px_rgba(201,160,90,0.7)] hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-[0_16px_50px_-12px_rgba(230,203,149,0.8)]",
        outline:
          "border border-gold/40 text-gold-soft hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-ink",
      },
      size: {
        md: "h-10 px-5",
        lg: "h-13 px-8",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  }
)

type ButtonLinkProps = React.ComponentProps<"a"> &
  VariantProps<typeof brandButton> & { arrow?: boolean }

export function ButtonLink({
  variant,
  size,
  arrow = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={cn(brandButton({ variant, size }), className)} {...props}>
      {children}
      {arrow && (
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </a>
  )
}

/**
 * Router-aware version of ButtonLink for internal routes: typed `to`/`params`
 * and preloading on hover, same styles.
 */
export const BrandLink = createLink(ButtonLink)
