import { type NextRequest, NextResponse } from "next/server"

// Mock database
let products: any[] = [
  {
    id: "1",
    name: "Gentle Gel Cleanser",
    slug: "gentle-gel-cleanser",
    price: 69000,
    category: "cleanser",
    brand: "Glow",
    stock: 50,
    description: "Pembersih lembut yang tidak mengeringkan kulit",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const product = products.find((p) => p.id === id)

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const productIndex = products.findIndex((p) => p.id === id)
  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  products[productIndex] = { ...products[productIndex], ...body }
  return NextResponse.json(products[productIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  products = products.filter((p) => p.id !== id)
  return NextResponse.json({ success: true })
}
