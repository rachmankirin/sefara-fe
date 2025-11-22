import { type NextRequest, NextResponse } from "next/server"

// Mock data for statistics
const mockStats = {
  totalProducts: 12,
  totalOrders: 45,
  totalUsers: 28,
  totalRevenue: 5250000,
  recentOrders: [
    { id: "ORD001", total: 250000, date: "2 jam lalu" },
    { id: "ORD002", total: 450000, date: "4 jam lalu" },
    { id: "ORD003", total: 180000, date: "6 jam lalu" },
    { id: "ORD004", total: 320000, date: "1 hari lalu" },
    { id: "ORD005", total: 520000, date: "2 hari lalu" },
  ],
  lowStockProducts: [
    { name: "Glow Bright Serum", stock: 5 },
    { name: "Pure Skin Hydra Serum", stock: 8 },
    { name: "Radiant Fresh Toner", stock: 3 },
  ],
}

export async function GET(req: NextRequest) {
  try {
    // In production, fetch real data from database
    return NextResponse.json(mockStats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
