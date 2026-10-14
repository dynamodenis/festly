import { Logo, NAV_LINKS } from "./Nav"

export function Footer() {
  return (
    <footer className="border-t border-gold/10 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
        <Logo />
        <ul className="flex flex-wrap items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-sand">
          © <span className="nums">{new Date().getFullYear()}</span> Festly
        </p>
      </div>
    </footer>
  )
}
