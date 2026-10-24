import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useState, type ComponentProps, type ReactNode } from "react"
import { brandButton } from "@/components/brand/ButtonLink"
import { Logo } from "@/components/landing/Nav"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Sign-in, sign-up and password pages: one card on the espresso + gold
 * marketing background. `theme-festly` maps shadcn inputs to the brand.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="theme-festly grain flex min-h-svh flex-col items-center justify-center bg-ink px-4 py-10 text-cream">
      <main
        id="main"
        className="w-full max-w-sm rounded-2xl border border-gold/15 bg-[#1a120c]/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] sm:p-8"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="font-display text-3xl text-cream">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-6 flex flex-col gap-5">{children}</div>
      </main>
      {/* Lines up with the card's edges: way out on the left, the page's
          own link on the right. */}
      <div className="mt-6 flex w-full max-w-sm flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-sm transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-gold-soft focus-visible:outline-none"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to website
        </a>
        {footer && <p>{footer}</p>}
      </div>
    </div>
  )
}

/**
 * Label + input + optional hint, wired for screen readers. Password fields
 * get a show/hide toggle.
 */
export function AuthField({
  id,
  label,
  hint,
  aside,
  type,
  ...props
}: ComponentProps<"input"> & {
  id: string
  label: string
  hint?: string
  aside?: ReactNode
}) {
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === "password"
  const input = (
    <Input
      id={id}
      type={isPassword && revealed ? "text" : type}
      aria-describedby={hint ? `${id}-hint` : undefined}
      className={cn("h-11 text-base", isPassword && "pr-11")}
      {...props}
    />
  )
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      {isPassword ? (
        <div className="relative">
          {input}
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-gold-soft focus-visible:outline-none"
          >
            {revealed ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        input
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean
  children: ReactNode
  pendingLabel: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        brandButton({ size: "lg" }),
        "w-full disabled:cursor-wait disabled:opacity-80"
      )}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/** Announced error line under a form. */
export function FormError({ message }: { message: string | null }) {
  return (
    <p role="alert" className="min-h-5 text-sm text-destructive">
      {message}
    </p>
  )
}

export function GoogleButton({
  onClick,
  pending,
}: {
  onClick: () => void
  pending: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-gold/30 bg-cream text-sm font-medium text-ink transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none disabled:opacity-70"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
        />
      </svg>
      Continue with Google
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-gold/15" />
      or
      <span className="h-px flex-1 bg-gold/15" />
    </div>
  )
}

/** Better Auth error codes → what people should read. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password do not match.",
  USER_ALREADY_EXISTS:
    "An account with this email already exists. Sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "An account with this email already exists. Sign in instead.",
  PASSWORD_TOO_SHORT: "Use at least 8 characters.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_TOKEN:
    "This link has expired or was already used. Request a new one.",
  TOO_MANY_REQUESTS: "Too many attempts. Wait a minute and try again.",
}

export function authErrorMessage(
  error: { code?: string; message?: string; status?: number } | null
): string {
  if (!error) return "Something went wrong. Please try again."
  if (error.status === 429) return MESSAGES.TOO_MANY_REQUESTS
  return (
    (error.code && MESSAGES[error.code]) ||
    error.message ||
    "Something went wrong. Please try again."
  )
}
