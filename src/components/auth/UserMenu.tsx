import { Link, useRouteContext, useRouter } from "@tanstack/react-router"
import { LayoutGrid, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"

/** Account button for signed-in pages (anything under the `_authed` layout). */
export function UserMenu() {
  const { user } = useRouteContext({ from: "/_authed" })
  const router = useRouter()
  const label = user.name?.trim() || user.email
  const initial = label.charAt(0).toUpperCase()

  const signOut = async () => {
    await authClient.signOut()
    await router.invalidate()
    await router.navigate({ to: "/" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account: ${label}`}
        className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/40 bg-secondary text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          initial
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          {user.name && <span className="truncate">{user.name}</span>}
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutGrid aria-hidden="true" />
            My invitations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
