import { type NextRequest, NextResponse } from "next/server"

// Mock database
const products: any[] = [
  {
    id: "1",
    name: "Gentle Gel Cleanser",
    slug: "gentle-gel-cleanser",
    price: 69000,
    category: "cleanser",
    brand: "Glow",
    description: "Pembersih lembut yang tidak mengeringkan kulit",
    ingredients: ["4"],
  },
  {
    id: "2",
    name: "Niacinamide Serum 10%",
    slug: "niacinamide-serum-10",
    price: 119000,
    category: "serum",
    brand: "Radiant",
    description: "Serum dengan 10% niacinamide untuk mengontrol sebum",
    ingredients: ["1"],
  },
]

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newProduct = {
    id: Date.now().toString(),
    name: body.name,
    slug: body.slug,
    price: body.price || 0,
    category: body.category,
    brand: body.brand || "",
    description: body.description || "",
    ingredients: body.ingredients || [],
  }
  products.push(newProduct)
  return NextResponse.json(newProduct, { status: 201 })
}
