"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Get token and email from URL on component mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get('token')
      const emailParam = urlParams.get('email')
      
      console.log("[ResetPassword] Token from URL:", tokenParam)
      console.log("[ResetPassword] Email from URL:", emailParam)
      
      setToken(tokenParam)
      setEmail(emailParam)
      
      // Validate token exists
      if (!tokenParam || !emailParam) {
        setError("Link reset password tidak valid. Token atau email tidak ditemukan.")
        setIsValidToken(false)
      } else {
        // In a real app, you could optionally validate the token with your backend first
        // For now, we'll assume it's valid if both parameters exist
        setIsValidToken(true)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!password || !confirmPassword) {
      setError("Harap isi semua field.")
      return
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.")
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }

    if (!token || !email) {
      setError("Token atau email tidak valid.")
      return
    }

    setLoading(true)

    try {
      console.log("[ResetPassword] Resetting password for:", email)
      console.log("[ResetPassword] Using token:", token)
      
      // Call Laravel API endpoint
      const response = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          email: email,
          password: password,
          password_confirmation: confirmPassword
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle validation errors from Laravel
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.message || 'Reset password gagal')
      }

      setSuccess(true)
      console.log("[ResetPassword] Password reset successful:", data)
      
      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        router.push("/login")
      }, 5000)
    } catch (err: any) {
      console.error("[ResetPassword] Reset password error:", err)
      
      // Handle specific error cases
      if (err.message.includes('token')) {
        setError("Token tidak valid atau telah kadaluarsa. Silakan minta link reset baru.")
      } else if (err.message.includes('email')) {
        setError("Email tidak ditemukan.")
      } else {
        setError(err.message || "Gagal reset password. Silakan coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-border p-6 bg-card">
          <h1 className="text-xl font-semibold mb-2">Reset Password</h1>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Memvalidasi link reset password...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-border p-6 bg-card">
          <h1 className="text-xl font-semibold mb-2">Link Tidak Valid</h1>
          <div className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <p className="text-sm">
                {error || "Link reset password tidak valid atau telah kadaluarsa."}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full"
              >
                Minta Link Reset Baru
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Kembali ke Login
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Pastikan Anda menggunakan link yang tepat dari email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-border p-6 bg-card">
        <h1 className="text-xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm opacity-80 mb-6">
          Buat password baru untuk akun Anda.
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <div className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Password berhasil direset!</p>
                  <p className="text-sm mt-1">
                    Anda sekarang bisa login dengan password baru. 
                    Anda akan dialihkan ke halaman login dalam 5 detik.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Masuk Sekarang
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setPassword("")
                  setConfirmPassword("")
                }}
                className="w-full"
              >
                Reset Password Lainnya
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {email && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm">
                  Reset password untuk: <strong>{email}</strong>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password Baru</label>
              <Input
                type="password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !token || !email}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : "Reset Password"}
            </Button>

            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground block"
                >
                  ← Kembali ke Login
                </Link>
                <p className="text-xs text-muted-foreground">
                  Masih mengalami masalah?{" "}
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Minta link reset baru
                  </Link>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}