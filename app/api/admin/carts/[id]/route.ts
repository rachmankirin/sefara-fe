import { type NextRequest, NextResponse } from "next/server"

// Mock database
let carts: any[] = [
  { id: "1", userId: "1", productId: "1", quantity: 2 },
  { id: "2", userId: "2", productId: "2", quantity: 1 },
]

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  carts = carts.filter((c) => c.id !== id)
  return NextResponse.json({ success: true })
}
