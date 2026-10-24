import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { useState } from "react"
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
import { AuthSearch } from "./sign-in"

export const Route = createFileRoute("/sign-up")({
  validateSearch: AuthSearch,
  beforeLoad: async ({ search }) => {
    const { user, methods } = await getSessionFn()
    if (user) throw redirect({ href: safeRedirect(search.redirect) })
    return { methods }
  },
  loader: ({ context }) => context.methods,
  head: () => ({ meta: [{ title: "Create your account · Festly" }] }),
  component: SignUp,
})

function SignUp() {
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
    const { error: failure } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
      // Where the "confirm your email" link lands.
      callbackURL: next,
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
      errorCallbackURL: `/sign-up?redirect=${encodeURIComponent(next)}`,
    })
    if (failure) {
      setPending(null)
      setError(authErrorMessage(failure))
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to design and preview. Your drafts are saved to your account."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/sign-in"
            search={{ redirect: target }}
            className="text-gold-soft underline-offset-4 hover:underline"
          >
            Sign in
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
          id="name"
          name="name"
          label="Your name"
          autoComplete="name"
          required
          maxLength={80}
        />
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
          autoComplete="new-password"
          minLength={8}
          required
          hint="At least 8 characters."
        />
        <FormError message={error} />
        <SubmitButton
          pending={pending === "email"}
          pendingLabel="Creating your account…"
        >
          Create account
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
