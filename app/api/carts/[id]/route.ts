import { type NextRequest, NextResponse } from "next/server"

// Mock database
let cartsDB: any[] = [
  { id: "1", userId: "1", productId: "1", quantity: 2 },
  { id: "2", userId: "1", productId: "2", quantity: 1 },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const cart = cartsDB.find((c) => c.id === id)

  if (!cart) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
  }

  return NextResponse.json(cart)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const cartIndex = cartsDB.findIndex((c) => c.id === id)

  if (cartIndex === -1) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
  }

  cartsDB[cartIndex] = { ...cartsDB[cartIndex], ...body }
  return NextResponse.json(cartsDB[cartIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  cartsDB = cartsDB.filter((c) => c.id !== id)
  return NextResponse.json({ success: true })
}
