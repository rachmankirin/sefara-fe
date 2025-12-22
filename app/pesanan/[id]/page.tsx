"use client"

import Link from "next/link"
import { useEffect, useState, use } from "react"
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Mail, XCircle } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { useAuth } from "@/components/auth/auth-context"
import Script from "next/script"

const API_BASE = "https://be.sefara.my.id/api"

type OrderItem = { slug: string; name: string; price: number; image?: string; qty: number }
type Order = {
  id: string
  createdAt: string
  items: OrderItem[]
  total: number
  status?: string
  shippingCost?: number
  shippingCourier?: string
  shippingService?: string
  shippingAddress?: string
  snapToken?: string
}

type CheckoutItemApi = {
  id: number
  product_id?: number
  product?: {
    id: number
    slug?: string
    name?: string
    image?: string
    image_url?: string
  } | null
  quantity?: number
  qty?: number
  unit_price?: number | string
  price?: number | string
  subtotal?: number | string
}

type CheckoutApi = {
  id: number
  created_at?: string
  createdAt?: string
  status?: string
  subtotal?: number | string
  shipping_cost?: number | string
  shipping_courier?: string
  shipping_service?: string
  shipping_address?: string
  total_amount?: number | string
  total?: number | string
  grand_total?: number | string
  snap_token?: string
  items?: CheckoutItemApi[]
}

function extractCheckoutDetail(json: unknown): CheckoutApi | null {
  if (!json || typeof json !== "object") return null
  const obj: any = json

  // Our backend currently returns: { data: <checkout> }
  if (obj.data && typeof obj.data === "object") return obj.data as CheckoutApi

  // Sometimes backend might return checkout directly
  if (typeof obj.id === "number") return obj as CheckoutApi

  return null
}

function pick<T>(...values: Array<T | undefined | null>): T | undefined {
  return values.find((v) => v !== undefined && v !== null)
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function mapCheckoutStatus(status?: string): "pending" | "processing" | "shipped" | "delivered" | "cancelled" {
  const s = (status || "pending").toLowerCase()
  if (["delivered", "completed", "done", "received"].includes(s)) return "delivered"
  if (["shipped", "shipping", "sent"].includes(s)) return "shipped"
  if (["processing", "process"].includes(s)) return "processing"
  if (["cancelled", "canceled", "void", "expired"].includes(s)) return "cancelled"
  return "pending"
}

function mapCheckoutToOrder(checkout: CheckoutApi): Order {
  const items = (checkout.items || []).map((it) => {
    const slug = pick(it.product?.slug, String(it.product_id || "")) || ""
    return {
      slug,
      name: pick(it.product?.name, "Produk") || "Produk",
      price: toNumber(pick(it.unit_price, it.price, 0), 0),
      image: pick(it.product?.image_url, it.product?.image),
      qty: toNumber(pick(it.quantity, it.qty, 1), 1),
    }
  })

  const total = toNumber(pick(checkout.total_amount, checkout.grand_total, checkout.total, 0), 0)
  const createdAt = pick(checkout.created_at, checkout.createdAt) || new Date().toISOString()

  return {
    id: String(checkout.id),
    createdAt,
    items,
    total,
    status: mapCheckoutStatus(checkout.status),
    shippingCost: toNumber(checkout.shipping_cost, 0),
    shippingCourier: checkout.shipping_courier,
    shippingService: checkout.shipping_service,
    shippingAddress: checkout.shipping_address,
    snapToken: checkout.snap_token,
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiCall } = useApi()
  const { user, token } = useAuth()
  const [isSnapLoaded, setIsSnapLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiCall(`/checkouts/${encodeURIComponent(orderId)}`)
        if (!res.ok) {
          const text = await res.text()
          // If 403/404, treat as not found (or unauthorized)
          if (res.status === 403 || res.status === 404) {
            if (mounted) setOrder(null)
            return
          }
          throw new Error(text || `HTTP ${res.status}`)
        }

        const json = (await res.json()) as unknown
        const checkout = extractCheckoutDetail(json)
        if (!checkout) {
          if (mounted) setOrder(null)
          return
        }

        const mapped = mapCheckoutToOrder(checkout)
        if (mounted) setOrder(mapped)
      } catch (e: any) {
        if (mounted) {
          setOrder(null)
          setError(e?.message || "Gagal memuat detail pesanan")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [orderId])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Menunggu",
          color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          borderColor: "border-gray-200 dark:border-gray-700",
        }
      case "processing":
        return {
          icon: Package,
          label: "Diproses",
          color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      case "shipped":
        return {
          icon: Truck,
          label: "Dikirim",
          color: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400",
          borderColor: "border-orange-200 dark:border-orange-800",
        }
      case "delivered":
        return {
          icon: CheckCircle2,
          label: "Terima",
          color: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400",
          borderColor: "border-green-200 dark:border-green-800",
        }
      case "cancelled":
        return {
          icon: XCircle,
          label: "Dibatalkan",
          color: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400",
          borderColor: "border-red-200 dark:border-red-800",
        }
      default:
        return {
          icon: Package,
          label: "Pesanan",
          color: "bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400",
          borderColor: "border-gray-200 dark:border-gray-800",
        }
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return
    
    const action = newStatus === "cancelled" ? "membatalkan" : "menyelesaikan"
    if (!confirm(`Apakah Anda yakin ingin ${action} pesanan ini?`)) return

    try {
      const res = await apiCall(`/checkouts/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOrder({ ...order, status: newStatus as any })
        alert("Status pesanan berhasil diperbarui!")
      } else {
        alert("Gagal memperbarui status pesanan.")
      }
    } catch (e) {
      console.error(e)
      alert("Terjadi kesalahan saat memperbarui status.")
    }
  }

  const handlePayment = () => {
    if (!order?.snapToken) {
      alert("Token pembayaran tidak ditemukan.")
      return
    }

    if (!isSnapLoaded && (!window || !(window as any).snap)) {
      alert("Sistem pembayaran belum siap. Tunggu sebentar.")
      return
    }

    ;(window as any).snap.pay(order.snapToken, {
      onSuccess: async function (result: any) {
        console.log("Payment success", result)
        
        // Sync status with backend immediately
        try {
          await fetch(`${API_BASE}/payments/${order.id}/sync`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          // Reload order details
          window.location.reload()
        } catch (e) {
          console.error("Failed to sync status", e)
        }
      },
      onPending: function (result: any) {
        console.log("Payment pending", result)
        window.location.reload()
      },
      onError: function (result: any) {
        console.error("Payment error", result)
        alert("Terjadi kesalahan saat memproses pembayaran.")
      },
      onClose: function () {
        // user closed the popup, do nothing
      },
    })
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-muted-foreground">Memuat...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">{error ? error : "Pesanan tidak ditemukan"}</p>
          {!error && <p className="text-xs text-muted-foreground mt-2">Pastikan Anda sudah login.</p>}
          <Link
            href="/pesanan"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground"
          >
            Kembali ke Pesanan
          </Link>
        </div>
      </main>
    )
  }

  const statusInfo = getStatusInfo(order.status || "processing")
  const StatusIcon = statusInfo.icon

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-Ohk1pccsXPbjPbRO"
        onLoad={() => setIsSnapLoaded(true)}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/pesanan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        <div />
      </div>

      {/* Order Status Card */}
      <div className={`rounded-xl border ${statusInfo.borderColor} bg-card p-6 space-y-4`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{order.id}</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{statusInfo.label}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total Pesanan</p>
            <p className="text-3xl font-bold">Rp {order.total.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs font-semibold text-muted-foreground mb-4">STATUS PENGIRIMAN</p>
          <div className="space-y-3">
            {/* Processing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "bg-blue-500" : "bg-gray-300"}`}
                />
                {(order.status === "shipped" || order.status === "delivered") && (
                  <div className="w-0.5 h-8 bg-blue-500 my-1" />
                )}
              </div>
              <div className="pb-4">
                <p className="font-medium text-sm">Pesanan Diproses</p>
                <p className="text-xs text-muted-foreground">Kami sedang menyiapkan pesanan Anda</p>
              </div>
            </div>

            {/* Shipped */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${order.status === "shipped" || order.status === "delivered" ? "bg-orange-500" : "bg-gray-300"}`}
                />
                {order.status === "delivered" && <div className="w-0.5 h-8 bg-orange-500 my-1" />}
              </div>
              <div className="pb-4">
                <p className="font-medium text-sm">Dalam Pengiriman</p>
                <p className="text-xs text-muted-foreground">Pesanan sedang dalam perjalanan</p>
              </div>
            </div>

            {/* Delivered */}
            <div className="flex gap-4">
              <div
                className={`h-4 w-4 rounded-full ${order.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`}
              />
              <div>
                <p className="font-medium text-sm">Telah Diterima</p>
                <p className="text-xs text-muted-foreground">Pesanan telah sampai ke tangan Anda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Produk Pesanan</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.slug}
              className="flex items-center gap-4 rounded-lg border border-border/40 p-4 hover:bg-muted/50 transition"
            >
              <Link href={`/produk/${item.slug}`}>
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-20 w-20 rounded-md object-cover border border-border/40 cursor-pointer hover:opacity-80"
                />
              </Link>
              <div className="flex-1">
                <Link href={`/produk/${item.slug}`}>
                  <p className="font-medium cursor-pointer hover:opacity-70">{item.name}</p>
                </Link>
                <p className="text-sm text-muted-foreground">Jumlah: {item.qty}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rp {(item.price * item.qty).toLocaleString("id-ID")}</p>
                <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}/item</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 flex justify-between">
          <p className="font-semibold">Total</p>
          <p className="font-bold text-lg">Rp {order.total.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Alamat Pengiriman</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">
                {order.shippingAddress || user?.address || "-"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm">{user?.phone || "-"}</p>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm">{user?.email || "-"}</p>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Info Pengiriman</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Metode Pengiriman</p>
            <p className="font-medium">
              {order.shippingCourier ? order.shippingCourier.toUpperCase() : "-"}
              {order.shippingService ? ` • ${order.shippingService}` : ""}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Biaya Ongkir</p>
            <p className="font-medium">Rp {(order.shippingCost || 0).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status !== "processing" && (
        <div className="flex gap-3 sticky bottom-4">
          {order.status === "pending" && (
            <>
              <button
                onClick={handlePayment}
                className="flex-1 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Bayar Sekarang
              </button>
              <button
                onClick={() => handleUpdateStatus("cancelled")}
                className="flex-1 px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition"
              >
                Batalkan Pesanan
              </button>
            </>
          )}

          {order.status === "shipped" && (
            <button
              onClick={() => handleUpdateStatus("delivered")}
              className="flex-1 px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
            >
              Tandai Sebagai Diterima
            </button>
          )}

          {order.status === "delivered" && (
            <button
              disabled
              className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800"
            >
              ✓ Sudah Diterima
            </button>
          )}

          {order.status === "cancelled" && (
            <button
              disabled
              className="flex-1 px-6 py-3 rounded-lg font-medium bg-red-100 text-red-500 cursor-not-allowed dark:bg-red-900/20"
            >
              Pesanan Dibatalkan
            </button>
          )}
        </div>
      )}
    </main>
  )
}
