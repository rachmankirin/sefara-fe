import { NextResponse } from "next/server"

// Mock database
const carts: any[] = [
  { id: "1", userId: "1", productId: "1", quantity: 2, productName: "Gentle Gel Cleanser", price: 69000 },
  { id: "2", userId: "2", productId: "2", quantity: 1, productName: "Niacinamide Serum", price: 119000 },
]

export async function GET() {
  return NextResponse.json(carts)
}
