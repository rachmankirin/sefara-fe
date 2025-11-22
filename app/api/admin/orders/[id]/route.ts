import { type NextRequest, NextResponse } from "next/server"

// Mock database
let orders: any[] = [
  { id: "ORD001", userId: "1", status: "pending", total: 138000, customerName: "John Doe", email: "john@example.com" },
  {
    id: "ORD002",
    userId: "2",
    status: "completed",
    total: 119000,
    customerName: "Jane Smith",
    email: "jane@example.com",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const orderIndex = orders.findIndex((o) => o.id === id)
  if (orderIndex === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  orders[orderIndex] = { ...orders[orderIndex], ...body }
  return NextResponse.json(orders[orderIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  orders = orders.filter((o) => o.id !== id)
  return NextResponse.json({ success: true })
}
