import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/data"

// Mock database
let productsDB = [...products]

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const item = productsDB.find((p) => p.slug === params.slug) || null

  if (!item) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(item)
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const body = await request.json()
  const productIndex = productsDB.findIndex((p) => p.slug === params.slug)

  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  productsDB[productIndex] = { ...productsDB[productIndex], ...body }
  return NextResponse.json(productsDB[productIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  const productIndex = productsDB.findIndex((p) => p.slug === params.slug)

  if (productIndex === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const deleted = productsDB[productIndex]
  productsDB = productsDB.filter((p) => p.slug !== params.slug)
  return NextResponse.json({ success: true, deleted })
}
