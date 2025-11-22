"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Tag,
  LogOut,
  TrendingUp,
  Eye,
  DollarSign,
  AlertCircle,
} from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  recentOrders: any[]
  lowStockProducts: any[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardStats()
    }
  }, [user])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("glowmall:token")
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // You may need to create a custom stats endpoint in Laravel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/products`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }),
      ])

      let totalProducts = 0
      let totalOrders = 0
      let totalUsers = 0
      let totalRevenue = 0
      let recentOrders: any[] = []
      let lowStockProducts: any[] = []

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        const products = Array.isArray(productsData) ? productsData : productsData.data || []
        totalProducts = products.length
        lowStockProducts = products.filter((p: any) => (p.stock || 0) < 10)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const orders = Array.isArray(ordersData) ? ordersData : ordersData.data || []
        totalOrders = orders.length
        recentOrders = orders.slice(0, 5)
        totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const users = Array.isArray(usersData) ? usersData : usersData.data || []
        totalUsers = users.length
      }

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
        lowStockProducts,
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  if (loading || !user || user.role !== "admin") return null

  const menuItems = [
    { icon: Tag, label: "Brand", href: "/admin/brands", color: "bg-blue-500/10 text-blue-600" },
    { icon: Package, label: "Produk", href: "/admin/products", color: "bg-purple-500/10 text-purple-600" },
    { icon: Users, label: "Pengguna", href: "/admin/users", color: "bg-green-500/10 text-green-600" },
    { icon: ShoppingCart, label: "Keranjang", href: "/admin/carts", color: "bg-orange-500/10 text-orange-600" },
    { icon: ShoppingCart, label: "Pesanan", href: "/admin/orders", color: "bg-red-500/10 text-red-600" },
  ]

  const statCards = [
    { label: "Total Produk", value: stats.totalProducts, icon: Package, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingCart, color: "bg-purple-500/10 text-purple-600" },
    { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "bg-green-500/10 text-green-600" },
    {
      label: "Total Pendapatan",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Kelola brand, produk, pengguna, dan pesanan</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Management Menu */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Manajemen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Kelola {item.label.toLowerCase()}</p>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pesanan Terbaru
            </h3>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <p className="font-semibold">Rp {order.total?.toLocaleString("id-ID") || 0}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada pesanan</p>
            )}
          </Card>

          {/* Low Stock Alert */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Produk Stok Rendah
            </h3>
            {stats.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Stok: {product.stock}</p>
                    </div>
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Semua produk memiliki stok yang cukup</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
