import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import {
  AuthField,
  AuthShell,
  FormError,
  GoogleButton,
  OrDivider,
  SubmitButton,
  authErrorMessage,
} from "@/components/auth/AuthShell"
import { authClient, safeRedirect } from "@/lib/auth-client"
import { getSessionFn } from "@/server/auth/auth.functions"

export const AuthSearch = z.object({
  redirect: z.string().max(500).optional().catch(undefined),
})

export const Route = createFileRoute("/sign-in")({
  validateSearch: AuthSearch,
  beforeLoad: async ({ search }) => {
    const { user, methods } = await getSessionFn()
    if (user) throw redirect({ href: safeRedirect(search.redirect) })
    return { methods }
  },
  loader: ({ context }) => context.methods,
  head: () => ({ meta: [{ title: "Sign in · Festly" }] }),
  component: SignIn,
})

function SignIn() {
  const methods = Route.useLoaderData()
  const { redirect: target } = Route.useSearch()
  const router = useRouter()
  const next = safeRedirect(target)
  const [pending, setPending] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending("email")
    setError(null)
    const { error: failure } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })
    if (failure) {
      setPending(null)
      setError(authErrorMessage(failure))
      return
    }
    await router.invalidate()
    await router.navigate({ href: next })
  }

  const onGoogle = async () => {
    setPending("google")
    setError(null)
    const { error: failure } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: `/sign-in?redirect=${encodeURIComponent(next)}`,
    })
    // On success the browser is already leaving for Google.
    if (failure) {
      setPending(null)
      setError(authErrorMessage(failure))
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep working on your invitations."
      footer={
        <>
          New to Festly?{" "}
          <Link
            to="/sign-up"
            search={{ redirect: target }}
            className="text-gold-soft underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {methods.google && (
        <>
          <GoogleButton onClick={onGoogle} pending={pending !== null} />
          <OrDivider />
        </>
      )}
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
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          aside={
            <Link
              to="/forgot-password"
              className="text-xs text-gold-soft underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
        />
        <FormError message={error} />
        <SubmitButton pending={pending === "email"} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
