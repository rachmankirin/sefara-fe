"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trash2, Edit2, Filter } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  userId: string
  status: string
  total: number
  createdAt?: string
  items?: number
  customerName?: string
  email?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : ""
      const token = localStorage.getItem("glowmall:token")
      const res = await fetch(`${API_BASE}/checkouts${query}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json()
      // Handle Laravel pagination: { data: { data: [...] } }
      const rawData = json.data?.data || json.data || []
      const list = Array.isArray(rawData) ? rawData : []
      
      const mapped = list.map((item: any) => ({
        id: String(item.id),
        userId: String(item.user_id),
        status: item.status,
        total: Number(item.total_amount || item.total || 0),
        createdAt: item.created_at,
        items: item.items?.length || 0,
        customerName: item.user?.name || "Unknown",
        email: item.user?.email || "-",
      }))
      setOrders(mapped)
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setPageLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string) => {
    if (!newStatus) return
    try {
      const token = localStorage.getItem("glowmall:token")
      const res = await fetch(`${API_BASE}/checkouts/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setEditingOrder(null)
        setNewStatus("")
        fetchOrders()
      }
    } catch (err) {
      console.error("Error updating order:", err)
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPageLoading(true)
              }}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {pageLoading ? (
            <p className="text-muted-foreground">Memuat...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">Belum ada pesanan</p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">Pesanan #{order.id}</h3>
                      {order.customerName && (
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} ({order.email})
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">User ID: {order.userId}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {editingOrder === order.id ? (
                          <div className="flex gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="px-2 py-1 border border-input rounded text-sm bg-background"
                            >
                              <option value="">Pilih Status</option>
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Button size="sm" onClick={() => handleUpdateStatus(order.id)} className="h-8">
                              Simpan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingOrder(null)}
                              className="h-8 bg-transparent"
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-sm font-medium">Rp {order.total.toLocaleString("id-ID")}</p>
                          </>
                        )}
                      </div>
                      {order.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingOrder(order.id)
                          setNewStatus(order.status)
                        }}
                        className="gap-2 bg-transparent"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>

                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
