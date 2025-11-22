import { type NextRequest, NextResponse } from "next/server"

// Mock database
let ordersDB: any[] = [
  { id: "ORD001", userId: "1", status: "pending", total: 188000 },
  { id: "ORD002", userId: "2", status: "completed", total: 129000 },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const order = ordersDB.find((o) => o.id === id)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const orderIndex = ordersDB.findIndex((o) => o.id === id)

  if (orderIndex === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  ordersDB[orderIndex] = { ...ordersDB[orderIndex], ...body }
  return NextResponse.json(ordersDB[orderIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  ordersDB = ordersDB.filter((o) => o.id !== id)
  return NextResponse.json({ success: true })
}
