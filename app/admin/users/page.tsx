"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

export default function UsersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("glowmall:token")
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      console.log("[v0] Users API response:", data)
      setUsers(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("[v0] Error fetching users:", err)
      alert("Gagal mengambil pengguna dari server")
    } finally {
      setPageLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      fetchUsers()
      alert("Pengguna berhasil dihapus")
    } catch (err) {
      console.error("[v0] Error deleting user:", err)
      alert("Gagal menghapus pengguna")
    }
  }

  if (loading || !user || user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Manajemen Pengguna</h1>

        <div className="space-y-4">
          {pageLoading ? (
            <p className="text-muted-foreground">Memuat...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Belum ada pengguna</p>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{user.name || "Tanpa Nama"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Bergabung: {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
