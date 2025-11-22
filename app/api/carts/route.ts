import { type NextRequest, NextResponse } from "next/server"

// Mock database for carts
const cartsDB: any[] = [
  { id: "1", userId: "1", productId: "1", quantity: 2, productName: "Gentle Gel Cleanser", price: 69000 },
  { id: "2", userId: "1", productId: "2", quantity: 1, productName: "Niacinamide Serum", price: 119000 },
  { id: "3", userId: "2", productId: "3", quantity: 1, productName: "Hyaluronic Boost Serum", price: 129000 },
]

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (userId) {
    const userCarts = cartsDB.filter((c) => c.userId === userId)
    return NextResponse.json(userCarts)
  }

  return NextResponse.json(cartsDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newCart = {
    id: Date.now().toString(),
    userId: body.userId,
    productId: body.productId,
    quantity: body.quantity || 1,
    productName: body.productName,
    price: body.price,
  }
  cartsDB.push(newCart)
  return NextResponse.json(newCart, { status: 201 })
}
