"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log("[v0] Login form submitted")
      await login({ email, password })
      console.log("[v0] Login successful, redirecting...")
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push("/profil")
    } catch (err: any) {
      console.error("[v0] Login error:", err)
      setError(err.message || "Login gagal. Periksa email dan password Anda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-border p-6 bg-card">
        <h1 className="text-xl font-semibold mb-2">Masuk</h1>
        <p className="text-sm opacity-80 mb-6">Masuk ke akun Anda</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/signup" className="underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
