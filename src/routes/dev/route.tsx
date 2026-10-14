import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { publicEnv } from "@/env.public"

// Everything under /dev/* is a developer playground. It 404s in production
// builds unless VITE_ENABLE_DEV_ROUTES=true.
export const Route = createFileRoute("/dev")({
  beforeLoad: () => {
    if (import.meta.env.PROD && !publicEnv.VITE_ENABLE_DEV_ROUTES) {
      throw notFound()
    }
  },
  component: () => <Outlet />,
})
