import { type NextRequest, NextResponse } from "next/server"

// Mock database for product-ingredient relationships
let productIngredientsDB: any[] = [
  { id: "1", productId: "1", ingredientId: "4", percentage: 5 },
  { id: "2", productId: "2", ingredientId: "1", percentage: 10 },
  { id: "3", productId: "3", ingredientId: "2", percentage: 1 },
  { id: "4", productId: "4", ingredientId: "3", percentage: 3 },
]

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  productIngredientsDB = productIngredientsDB.filter((pi) => pi.id !== id)
  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const index = productIngredientsDB.findIndex((pi) => pi.id === id)
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  productIngredientsDB[index] = { ...productIngredientsDB[index], ...body }
  return NextResponse.json(productIngredientsDB[index])
}
