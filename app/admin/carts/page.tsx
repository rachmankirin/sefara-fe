"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  productName?: string
  price?: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function CartsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [carts, setCarts] = useState<CartItem[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCarts()
    }
  }, [user])

  const fetchCarts = async () => {
    try {
      const token = localStorage.getItem("glowmall:token")
      const res = await fetch(`${API_BASE}/cart`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      setCarts(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("Error fetching carts:", err)
    } finally {
      setPageLoading(false)
    }
  }

  const handleDeleteCart = async (id: string) => {
    if (!confirm("Yakin ingin menghapus item keranjang ini?")) return
    try {
      const token = localStorage.getItem("glowmall:token")
      const res = await fetch(`${API_BASE}/cart/items/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (res.ok) fetchCarts()
    } catch (err) {
      console.error("Error deleting cart:", err)
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

        <h1 className="text-3xl font-bold mb-8">Manajemen Keranjang</h1>

        <div className="space-y-4">
          {pageLoading ? (
            <p className="text-muted-foreground">Memuat...</p>
          ) : carts.length === 0 ? (
            <p className="text-muted-foreground">Belum ada item keranjang</p>
          ) : (
            <div className="grid gap-4">
              {carts.map((cart) => (
                <Card key={cart.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{cart.productName || "Produk"}</h3>
                    <p className="text-sm text-muted-foreground">User ID: {cart.userId}</p>
                    <p className="text-sm">Jumlah: {cart.quantity}</p>
                    {cart.price && <p className="text-sm font-medium">Rp {cart.price.toLocaleString("id-ID")}</p>}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCart(cart.id)} className="gap-2">
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
