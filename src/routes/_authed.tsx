import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { getSessionFn } from "@/server/auth/auth.functions"

/**
 * Pages that need an account (dashboard, editor). Signed-out visitors go to
 * sign-in and come back here afterwards. This is navigation UX only: every
 * server function checks the session itself.
 */
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const { user } = await getSessionFn()
    if (!user) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } })
    }
    return { user }
  },
  component: Outlet,
})
