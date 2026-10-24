import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import {
  AuthField,
  AuthShell,
  FormError,
  SubmitButton,
  authErrorMessage,
} from "@/components/auth/AuthShell"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password · Festly" }] }),
  component: ForgotPassword,
})

function ForgotPassword() {
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get("email")).trim()
    setPending(true)
    setError(null)
    const { error: failure } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })
    setPending(false)
    // Same message whether or not the address has an account, so this page
    // cannot be used to find out who is registered.
    if (failure && failure.status === 429) setError(authErrorMessage(failure))
    else setSentTo(email)
  }

  const back = (
    <Link
      to="/sign-in"
      className="text-gold-soft underline-offset-4 hover:underline"
    >
      Back to sign in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`If ${sentTo} has a Festly account, a link to choose a new password is on its way. It expires in one hour.`}
        footer={back}
      >
        <p className="text-sm text-muted-foreground">
          Nothing arrived? Check spam, or{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-gold-soft underline-offset-4 hover:underline"
          >
            try another address
          </button>
          .
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      footer={back}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          required
        />
        <FormError message={error} />
        <SubmitButton pending={pending} pendingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
