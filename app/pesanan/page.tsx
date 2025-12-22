"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useApi } from "@/hooks/use-api"

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
  total_amount?: number | string
  total?: number | string
  grand_total?: number | string
  items?: CheckoutItemApi[]
}

type PaginatedLaravel<T> = {
  data: T[]
  current_page?: number
  per_page?: number
  total?: number
}

function extractCheckoutList(json: unknown): CheckoutApi[] {
  if (Array.isArray(json)) return json as CheckoutApi[]

  if (json && typeof json === "object") {
    const obj: any = json

    // Our backend currently returns: { data: <paginator> }
    const maybePaginator = obj.data
    if (Array.isArray(maybePaginator)) return maybePaginator as CheckoutApi[]
    if (maybePaginator && typeof maybePaginator === "object" && Array.isArray(maybePaginator.data)) {
      return maybePaginator.data as CheckoutApi[]
    }

    // Fallbacks for common wrappers
    if (Array.isArray(obj.checkouts)) return obj.checkouts as CheckoutApi[]
    if (obj.checkouts && typeof obj.checkouts === "object" && Array.isArray(obj.checkouts.data)) {
      return obj.checkouts.data as CheckoutApi[]
    }
  }

  return []
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
  // Backend status might be: 'pending', 'paid', 'processing', 'shipped', 'delivered', etc.
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
  }
}

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiCall } = useApi()

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiCall(`/checkouts`)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }

        const json = (await res.json()) as unknown
        const rows = extractCheckoutList(json)
        const mapped = rows.map(mapCheckoutToOrder)

        if (mounted) setOrders(mapped)
      } catch (e: any) {
        if (mounted) {
          setOrders([])
          setError(e?.message || "Gagal memuat pesanan")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pesanan Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Lacak semua pembelian produk skincare Anda</p>
        </div>
        <Link href="/produk" className="text-sm px-4 py-2 rounded-full border border-border hover:bg-muted transition">
          Belanja lagi
        </Link>
      </header>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Memuat pesanan...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Pastikan Anda sudah login.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">Belum ada pesanan. Mulai belanja sekarang.</p>
          <Link
            href="/produk"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground"
          >
            Lihat Produk
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const statusInfo = getStatusInfo(o.status || "processing")
            const StatusIcon = statusInfo.icon
            return (
              <div
                key={o.id}
                className={`rounded-xl border ${statusInfo.borderColor} bg-card p-6 space-y-4 hover:shadow-md transition`}
              >
                {/* Order Header */}
                <Link href={`/pesanan/${o.id}`}>
                  <div className="flex items-start justify-between flex-wrap gap-3 cursor-pointer hover:opacity-70">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{o.id}</h3>
                        <div
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(o.createdAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Pengiriman: {o.shippingCourier ? o.shippingCourier.toUpperCase() : "-"}
                        {o.shippingService ? ` • ${o.shippingService}` : ""}
                        {" "}• Ongkir: Rp {(o.shippingCost || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">Rp {o.total.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </Link>

                {/* Items */}
                <div className="grid gap-3 border-t border-border pt-4">
                  {o.items.map((it) => (
                    <Link
                      key={it.slug}
                      href={`/produk/${it.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted/50 transition"
                    >
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.name}
                        className="h-16 w-16 rounded-md object-cover border border-border/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{it.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {it.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">Rp {(it.price * it.qty).toLocaleString("id-ID")}</p>
                        <p className="text-xs text-muted-foreground">Rp {it.price.toLocaleString("id-ID")}/item</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Order Timeline */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">RIWAYAT STATUS</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${o.status === "processing" || o.status === "shipped" || o.status === "delivered" ? "bg-blue-500" : "bg-gray-300"}`}
                    />
                    <span className="text-xs">Pesanan diproses</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`h-3 w-3 rounded-full ${o.status === "shipped" || o.status === "delivered" ? "bg-orange-500" : "bg-gray-300"}`}
                    />
                    <span className="text-xs">Dalam pengiriman</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`h-3 w-3 rounded-full ${o.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className="text-xs">Telah diterima</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
