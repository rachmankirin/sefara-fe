"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"

const API_BASE = "http://localhost:8000/api"

async function fetcher(url: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("gm_token") : null
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function CheckoutPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [shippingData, setShippingData] = useState({
    recipient_name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("gm_user") : null
    if (!userRaw) {
      try {
        localStorage.setItem("gm_post_login_redirect", "/checkout")
      } catch (e) {}
      router.push("/login")
      return
    }
    try {
      const user = JSON.parse(userRaw)
      setUserId(user.id)
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  const { data: cartData } = useSWR(userId ? `${API_BASE}/carts?user_id=${userId}` : null, fetcher)

  const cart = cartData?.data || []
  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const shippingCost = 15000 // Mock shipping cost
  const total = subtotal + shippingCost

  async function finalizeOrder() {
    if (!userId || cart.length === 0) {
      alert("Cart is empty")
      return
    }

    try {
      const token = localStorage.getItem("gm_token")
      const orderData = {
        user_id: userId,
        items: cart.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.postal_code}`,
        recipient_name: shippingData.recipient_name,
        recipient_phone: shippingData.phone,
        notes: shippingData.notes,
        status: "pending",
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) throw new Error("Failed to create order")

      // Clear cart after successful order
      for (const item of cart) {
        await fetch(`${API_BASE}/carts/${item.id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      }

      router.push("/transaksi")
    } catch (e) {
      console.error("finalizeOrder error:", e)
      alert("Failed to create order")
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-pretty">Checkout</h1>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-medium mb-4">Detail Pengiriman</h2>
          <form className="grid gap-4">
            <div className="grid gap-1">
              <label className="text-sm">Nama Penerima</label>
              <input
                className="h-10 rounded-md border border-border bg-background px-3"
                placeholder="Nama lengkap"
                value={shippingData.recipient_name}
                onChange={(e) => setShippingData({ ...shippingData, recipient_name: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Alamat</label>
              <textarea
                className="min-h-24 rounded-md border border-border bg-background px-3 py-2"
                placeholder="Alamat lengkap, RT/RW, Kelurahan, Kecamatan"
                value={shippingData.address}
                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-1 md:grid-cols-2">
              <div>
                <label className="text-sm">Kota/Kabupaten</label>
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3"
                  placeholder="Kota"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm">Kode Pos</label>
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3"
                  placeholder="12345"
                  value={shippingData.postal_code}
                  onChange={(e) => setShippingData({ ...shippingData, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1 md:grid-cols-2">
              <div>
                <label className="text-sm">Nomor Telepon</label>
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3"
                  placeholder="08xxxx"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm">Catatan Kurir (opsional)</label>
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3"
                  placeholder="Contoh: Titip di satpam"
                  value={shippingData.notes}
                  onChange={(e) => setShippingData({ ...shippingData, notes: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-medium mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ongkos Kirim</span>
              <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <button
              onClick={finalizeOrder}
              disabled={cart.length === 0}
              className="h-10 rounded-md bg-primary text-primary-foreground text-center leading-10 disabled:opacity-50"
            >
              Selesaikan Pesanan
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pastikan data pengiriman sudah benar sebelum melanjutkan.
          </p>
        </aside>
      </section>
    </main>
  )
}
