import { type NextRequest, NextResponse } from "next/server"

// Mock database for product-ingredient relationships
const productIngredientsDB: any[] = [
  { id: "1", productId: "1", ingredientId: "4", percentage: 5 },
  { id: "2", productId: "2", ingredientId: "1", percentage: 10 },
  { id: "3", productId: "3", ingredientId: "2", percentage: 1 },
  { id: "4", productId: "4", ingredientId: "3", percentage: 3 },
]

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId")

  if (productId) {
    const filtered = productIngredientsDB.filter((pi) => pi.productId === productId)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(productIngredientsDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (Array.isArray(body)) {
    // Bulk create
    const newRelationships = body.map((item: any) => ({
      id: Date.now().toString() + Math.random(),
      productId: item.productId,
      ingredientId: item.ingredientId,
      percentage: item.percentage || 0,
    }))
    productIngredientsDB.push(...newRelationships)
    return NextResponse.json(newRelationships, { status: 201 })
  } else {
    // Single create
    const newProductIngredient = {
      id: Date.now().toString(),
      productId: body.productId,
      ingredientId: body.ingredientId,
      percentage: body.percentage || 0,
    }
    productIngredientsDB.push(newProductIngredient)
    return NextResponse.json(newProductIngredient, { status: 201 })
  }
}
