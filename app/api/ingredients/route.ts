import { type NextRequest, NextResponse } from "next/server"

let ingredientIdCounter = 5

// Mock database for ingredients
const ingredientsDB: any[] = [
  { id: "1", name: "Niacinamide", slug: "niacinamide", benefits: "Mengontrol sebum dan mencerahkan" },
  { id: "2", name: "Hyaluronic Acid", slug: "hyaluronic-acid", benefits: "Hidrasi intens" },
  { id: "3", name: "Ceramide", slug: "ceramide", benefits: "Memperkuat skin barrier" },
  { id: "4", name: "Glycerin", slug: "glycerin", benefits: "Melembapkan kulit" },
  { id: "5", name: "Centella", slug: "centella", benefits: "Menenangkan kulit" },
]

export async function GET() {
  return NextResponse.json(ingredientsDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  ingredientIdCounter++
  const newIngredient = {
    id: ingredientIdCounter.toString(),
    name: body.name,
    slug: body.slug,
    benefits: body.benefits || "",
  }
  ingredientsDB.push(newIngredient)
  return NextResponse.json(newIngredient, { status: 201 })
}
