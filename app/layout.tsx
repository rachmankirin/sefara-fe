import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-context"
import { Suspense } from "react"
import { LayoutContent } from "@/components/layout-content"

export const metadata: Metadata = {
  title: "SEFARA",
  description: "Your trusted skincare marketplace",
  generator: "maman",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutContent>{children}</LayoutContent>
            <Analytics />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
