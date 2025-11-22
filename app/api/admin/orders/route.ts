import { type NextRequest, NextResponse } from "next/server"

const orders: any[] = [
  {
    id: "ORD001",
    userId: "1",
    status: "pending",
    total: 138000,
    createdAt: new Date().toISOString(),
    items: 2,
    customerName: "John Doe",
    email: "john@example.com",
  },
  {
    id: "ORD002",
    userId: "2",
    status: "completed",
    total: 119000,
    createdAt: new Date().toISOString(),
    items: 1,
    customerName: "Jane Smith",
    email: "jane@example.com",
  },
  {
    id: "ORD003",
    userId: "3",
    status: "shipped",
    total: 250000,
    createdAt: new Date().toISOString(),
    items: 3,
    customerName: "Bob Wilson",
    email: "bob@example.com",
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || ""

  try {
    let filtered = orders.slice()

    if (status) {
      filtered = filtered.filter((o) => o.status === status)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
