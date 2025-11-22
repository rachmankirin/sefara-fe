"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <>
      {!isAdminRoute && <SiteHeader />}
      <main className="min-h-dvh">{children}</main>
    </>
  )
}
