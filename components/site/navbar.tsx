"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md",
        active && "bg-gray-100 text-gray-900"
      )}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold text-gray-900">
            Betygsprognos
          </Link>
          <nav className="hidden gap-1 md:flex">
            <NavLink href="/">Översikt</NavLink>
            <NavLink href="/students">Elever</NavLink>
            <NavLink href="/import">Import</NavLink>
            <NavLink href="/demo">Demodata</NavLink>
            <NavLink href="/students/f150">Elever (F &gt; 150p)</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/import" className={cn(buttonVariants({ variant: "default", size: "default" }))}>
            Importera
          </Link>
        </div>
      </div>
    </header>
  )
}
