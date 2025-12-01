"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim email reset.');
      }
      
      setSuccess(true)
      console.log("[v0] Reset email sent successfully:", data)
    } catch (err: any) {
      console.error("[v0] Forgot password error:", err)
      setError(err.message || "Gagal mengirim email reset. Coba lagi nanti.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-border p-6 bg-card">
        <h1 className="text-xl font-semibold mb-2">Lupa Password</h1>
        <p className="text-sm opacity-80 mb-6">
          Masukkan email Anda. Kami akan mengirim instruksi untuk reset password.
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <p className="text-sm">
                Email instruksi reset password telah dikirim ke <strong>{email}</strong>.
                Periksa inbox dan folder spam Anda.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Kembali ke Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                className="w-full"
              >
                Kirim ulang email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Instruksi Reset"}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}