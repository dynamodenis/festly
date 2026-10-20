import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { BrandLink } from "@/components/brand/ButtonLink"

// Absolute paths so the same nav works on every page, not just "/".
export const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/templates", label: "Templates" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

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
        <BrandLink to="/templates" variant="outline" size="md">
          Get started
        </BrandLink>
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
