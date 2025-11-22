"use client"

import Link from "next/link"
import { useEffect, useState, use } from "react"
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Mail } from "lucide-react"

type OrderItem = { slug: string; name: string; price: number; image?: string; qty: number }
type Order = { id: string; createdAt: string; items: OrderItem[]; total: number; status?: string }

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gm_orders")
      const list: Order[] = raw ? JSON.parse(raw) : getDummyOrders()
      const found = list.find((o) => o.id === orderId)
      setOrder(found || null)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const getDummyOrders = (): Order[] => [
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

  const handleFinishOrder = () => {
    if (!order) return
    const updated = { ...order, status: "delivered" as const }
    setOrder(updated)
    alert("Pesanan ditandai sebagai diterima!")
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
          <p className="text-muted-foreground">Pesanan tidak ditemukan</p>
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
              <p className="font-medium">Jl. Merdeka No. 123</p>
              <p className="text-muted-foreground">Jakarta Selatan, 12345</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm">+62 821-1234-5678</p>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm">user@example.com</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-4">
        <button
          onClick={handleFinishOrder}
          disabled={order.status === "delivered"}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
            order.status === "delivered"
              ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {order.status === "delivered" ? "✓ Sudah Diterima" : "Tandai Sebagai Diterima"}
        </button>
        <button className="flex-1 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
          Lacak Pesanan
        </button>
      </div>
    </main>
  )
}
