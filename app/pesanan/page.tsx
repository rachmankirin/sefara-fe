"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle2, Clock } from "lucide-react"

type OrderItem = { slug: string; name: string; price: number; image?: string; qty: number }
type Order = { id: string; createdAt: string; items: OrderItem[]; total: number; status?: string }

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gm_orders")
      let list = raw ? (JSON.parse(raw) as Order[]) : []

      if (list.length === 0) {
        list = [
          {
            id: "ORD-20250103-001",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            items: [
              {
                slug: "cleanser-gentle-gel",
                name: "Gentle Gel Cleanser",
                price: 89000,
                image: "/cleanser-gentle-gel.jpg",
                qty: 1,
              },
              {
                slug: "soothing-toner",
                name: "Soothing Toner",
                price: 79000,
                image: "/soothing-toner.jpg",
                qty: 2,
              },
            ],
            total: 247000,
          },
          {
            id: "ORD-20250102-001",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "shipped",
            items: [
              {
                slug: "niacinamide-serum",
                name: "Niacinamide Serum 10%",
                price: 129000,
                image: "/niacinamide-serum.jpg",
                qty: 1,
              },
              {
                slug: "hyaluronic-acid-serum",
                name: "Hyaluronic Acid Serum",
                price: 99000,
                image: "/hyaluronic-acid-serum.jpg",
                qty: 1,
              },
            ],
            total: 228000,
          },
          {
            id: "ORD-20250101-001",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            status: "processing",
            items: [
              {
                slug: "ceramide-cream",
                name: "Ceramide Cream",
                price: 149000,
                image: "/ceramide-cream.png",
                qty: 1,
              },
              {
                slug: "sunscreen-spf50",
                name: "Sunscreen SPF 50",
                price: 119000,
                image: "/sunscreen-spf50.png",
                qty: 1,
              },
            ],
            total: 268000,
          },
        ]
      }

      const ordersWithStatus = list.map((o) => ({ ...o, status: o.status || "processing" }))
      setOrders(ordersWithStatus)
    } catch {
      setOrders([])
    }
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "processing":
        return {
          icon: Clock,
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

      {orders.length === 0 ? (
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
