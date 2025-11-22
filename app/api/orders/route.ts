import { type NextRequest, NextResponse } from "next/server"

// Mock database for orders
const ordersDB: any[] = [
  {
    id: "ORD001",
    userId: "1",
    status: "pending",
    total: 188000,
    items: 2,
    createdAt: new Date().toISOString(),
    shippingAddress: "Jl. Contoh No. 123",
  },
  {
    id: "ORD002",
    userId: "2",
    status: "completed",
    total: 129000,
    items: 1,
    createdAt: new Date().toISOString(),
    shippingAddress: "Jl. Alamat No. 456",
  },
]

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  const status = request.nextUrl.searchParams.get("status")

  let filtered = ordersDB

  if (userId) {
    filtered = filtered.filter((o) => o.userId === userId)
  }

  if (status) {
    filtered = filtered.filter((o) => o.status === status)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newOrder = {
    id: `ORD${Date.now()}`,
    userId: body.userId,
    status: "pending",
    total: body.total,
    items: body.items || 0,
    createdAt: new Date().toISOString(),
    shippingAddress: body.shippingAddress || "",
  }
  ordersDB.push(newOrder)
  return NextResponse.json(newOrder, { status: 201 })
}
