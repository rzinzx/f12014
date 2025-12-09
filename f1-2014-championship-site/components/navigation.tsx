"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/drivers", label: "Pilotos" },
    { href: "/teams", label: "Equipes" },
    { href: "/races", label: "Corridas" },
    { href: "/points", label: "Pontuação" },
    { href: "/penalties", label: "Punições" },
  ]

  return (
    <nav className="bg-primary text-primary-foreground border-b-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-3xl font-bold tracking-wider">F1 2014</div>
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold transition-all ${
                pathname === link.href ? "text-secondary" : "text-primary-foreground hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
