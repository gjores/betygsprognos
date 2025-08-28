"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
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
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const isFocusedView = ["/students/f150", "/students/svenska", "/students/matematik"].some(p => pathname.startsWith(p))
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [])
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
            <div className="relative" ref={menuRef}>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "text-sm font-medium px-3 py-2 rounded-md inline-flex items-center gap-1 hover:bg-gray-100",
                      isFocusedView && "bg-gray-100 text-gray-900"
                    )}
                  >
                    Fokuserade vyer
                    <svg width="10" height="10" viewBox="0 0 20 20" aria-hidden className="opacity-70"><path d="M5 7l5 5 5-5H5z" fill="currentColor"/></svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Fokuserade vyer</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/students/f150">Elever (F &gt; 150p)</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/students/svenska">Svenska/SVA (F)</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/students/matematik">Matematik 1 (F)</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <NavLink href="/huvudman">Huvudman</NavLink>
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
