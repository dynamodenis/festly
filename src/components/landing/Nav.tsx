import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { BrandLink } from "@/components/brand/ButtonLink"
import { authClient } from "@/lib/auth-client"

// Absolute paths so the same nav works on every page, not just "/".
export const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/templates", label: "Templates" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  // Client-side: marketing pages stay static and never wait on the database.
  // Until it resolves (and on the server) the signed-out links show.
  const { data: session } = authClient.useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold/10 bg-ink/75 py-3 backdrop-blur-xl"
          : "py-6"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5">
          {session ? (
            <BrandLink to="/dashboard" variant="outline" size="md">
              My invitations
            </BrandLink>
          ) : (
            <>
              <Link to="/sign-in" className="hidden link sm:inline">
                Sign in
              </Link>
              <BrandLink to="/templates" variant="outline" size="md">
                Get started
              </BrandLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full border border-gold/40 font-display text-lg text-gold italic">
        f
      </span>
      <span className="font-display text-xl tracking-wide text-cream">
        Festly
      </span>
    </a>
  )
}
