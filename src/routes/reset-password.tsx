import { Link, createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import {
  AuthField,
  AuthShell,
  FormError,
  SubmitButton,
  authErrorMessage,
} from "@/components/auth/AuthShell"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/reset-password")({
  // Better Auth sends people here with ?token=… or, for a bad link, ?error=…
  validateSearch: z.object({
    token: z.string().max(200).optional().catch(undefined),
    error: z.string().max(60).optional().catch(undefined),
  }),
  head: () => ({ meta: [{ title: "Choose a new password · Festly" }] }),
  component: ResetPassword,
})

function ResetPassword() {
  const { token, error: linkError } = Route.useSearch()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token || linkError) {
    return (
      <AuthShell
        title="This link has expired"
        subtitle="Reset links work once and last one hour. Request a fresh one."
      >
        <Link
          to="/forgot-password"
          className="text-sm text-gold-soft underline-offset-4 hover:underline"
        >
          Send a new reset link
        </Link>
      </AuthShell>
    )
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password"))
    if (password !== String(form.get("confirm"))) {
      setError("The two passwords do not match.")
      return
    }
    setPending(true)
    setError(null)
    const { error: failure } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    if (failure) {
      setPending(false)
      setError(authErrorMessage(failure))
      return
    }
    await router.navigate({ to: "/sign-in" })
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="You will sign in with it from now on."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <AuthField
          id="password"
          name="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          minLength={8}
          required
          hint="At least 8 characters."
        />
        <AuthField
          id="confirm"
          name="confirm"
          type="password"
          label="Repeat it"
          autoComplete="new-password"
          required
        />
        <FormError message={error} />
        <SubmitButton pending={pending} pendingLabel="Saving…">
          Save password
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
