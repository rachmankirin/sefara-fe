// Admin Controller - Centralized admin operations
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

export interface AdminStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  recentOrders: any[]
  lowStockProducts: any[]
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  price: number
  category: string
  brand?: string
  stock: number
  image?: string
  description?: string
}

export interface AdminOrder {
  id: string
  userId: string
  total: number
  status: string
  createdAt: string
  items: any[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

// Fetch dashboard statistics
export async function getDashboardStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/products`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch stats")
  // Return mock stats for now - implement proper stats endpoint in Laravel
  return {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  }
}

// Product Management
export async function getAdminProducts(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.search) query.set("search", params.search)

  const res = await fetch(`${API_BASE}/products?${query}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function createAdminProduct(data: Partial<AdminProduct>) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create product")
  return res.json()
}

export async function updateAdminProduct(id: string, data: Partial<AdminProduct>) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update product")
  return res.json()
}

export async function deleteAdminProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete product")
  return res.json()
}

// Order Management
export async function getAdminOrders(params?: { page?: number; limit?: number; status?: string }) {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.status) query.set("status", params.status)

  const res = await fetch(`${API_BASE}/orders?${query}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch orders")
  return res.json()
}

export async function updateAdminOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Failed to update order")
  return res.json()
}

export async function deleteAdminOrder(id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete order")
  return res.json()
}

// User Management
export async function getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.search) query.set("search", params.search)

  const res = await fetch(`${API_BASE}/users?${query}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function deleteAdminUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete user")
  return res.json()
}

// Brand Management
export async function getAdminBrands() {
  const res = await fetch(`${API_BASE}/brands`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch brands")
  return res.json()
}

export async function createAdminBrand(data: { name: string; slug: string; description?: string; logo_url?: string }) {
  const res = await fetch(`${API_BASE}/brands`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create brand")
  return res.json()
}

export async function updateAdminBrand(
  id: string,
  data: Partial<{ name: string; slug: string; description: string; logo_url: string }>,
) {
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update brand")
  return res.json()
}

export async function deleteAdminBrand(id: string) {
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete brand")
  return res.json()
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("glowmall:token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
