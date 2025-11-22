import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with real database
const brands: any[] = [
  { id: "1", name: "Glow", slug: "glow", description: "Brand skincare premium" },
  { id: "2", name: "Radiant", slug: "radiant", description: "Produk kecantikan alami" },
]

export async function GET() {
  return NextResponse.json(brands)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newBrand = {
    id: Date.now().toString(),
    ...body,
  }
  brands.push(newBrand)
  return NextResponse.json(newBrand, { status: 201 })
}
