"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"

const SKIN_TYPES = ["kering", "normal", "kombinasi", "berminyak"] as const
const SENSITIVITY_LEVELS = ["rendah", "sedang", "tinggi"] as const
const SKIN_GOALS = ["hidrasi", "mencerahkan", "anti jerawat", "anti aging"] as const

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [skinType, setSkinType] = useState<(typeof SKIN_TYPES)[number]>("normal")
  const [sensitivity, setSensitivity] = useState<(typeof SENSITIVITY_LEVELS)[number]>("sedang")
  const [goals, setGoals] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] === SIGNUP FORM SUBMITTED ===")

    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("Email dan password harus diisi")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    if (goals.length === 0) {
      setError("Pilih minimal satu tujuan perawatan kulit")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Form data:", { email, name, skinType, sensitivity, goals })

      await signup({
        email,
        password,
        name: name || email.split("@")[0],
        prefs: {
          skinType,
          sensitivity,
          concerns: goals as any[],
        },
      })

      console.log("[v0] Signup successful, waiting before redirect...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("[v0] Redirecting to home page...")
      router.push("/")
    } catch (err: any) {
      console.error("[v0] === SIGNUP FORM ERROR ===")
      console.error("[v0] Error:", err)
      setError(err.message || "Pendaftaran gagal. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Daftar Akun</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <Input placeholder="Nama (opsional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Kata Sandi (minimal 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <div className="space-y-2">
          <Label className="font-medium">Tipe Kulit</Label>
          <RadioGroup value={skinType} onValueChange={(v) => setSkinType(v as any)} className="grid grid-cols-2 gap-2">
            {SKIN_TYPES.map((t) => (
              <div key={t} className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem id={`st-${t}`} value={t} />
                <Label htmlFor={`st-${t}`} className="capitalize cursor-pointer">
                  {t}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Tingkat Sensitivitas</Label>
          <RadioGroup
            value={sensitivity}
            onValueChange={(v) => setSensitivity(v as any)}
            className="grid grid-cols-3 gap-2"
          >
            {SENSITIVITY_LEVELS.map((s) => (
              <div key={s} className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem id={`sens-${s}`} value={s} />
                <Label htmlFor={`sens-${s}`} className="capitalize cursor-pointer">
                  {s}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Tujuan Perawatan Kulit (opsional)</Label>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_GOALS.map((g) => (
              <label key={g} className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                <Checkbox checked={goals.includes(g)} onCheckedChange={() => toggleGoal(g)} />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Memproses..." : "Daftar"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Sudah punya akun?{" "}
          <Link className="underline hover:text-foreground" href="/login">
            Masuk
          </Link>
        </p>
      </form>
    </main>
  )
}
