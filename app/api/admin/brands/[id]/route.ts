import { type NextRequest, NextResponse } from "next/server"

// Mock database
let brands: any[] = [
  { id: "1", name: "Glow", slug: "glow", description: "Brand skincare premium", logo_url: "/glow-official-logo.jpg" },
  { id: "2", name: "Radiant", slug: "radiant", description: "Produk kecantikan alami", logo_url: "/radiant-logo.jpg" },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const brand = brands.find((b) => b.id === id)

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  return NextResponse.json(brand)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const brandIndex = brands.findIndex((b) => b.id === id)
  if (brandIndex === -1) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  brands[brandIndex] = { ...brands[brandIndex], ...body }
  return NextResponse.json(brands[brandIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  brands = brands.filter((b) => b.id !== id)
  return NextResponse.json({ success: true })
}
