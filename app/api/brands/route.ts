import { type NextRequest, NextResponse } from "next/server"

// Mock database for brands
const brandsDB: any[] = [
  { id: "1", name: "Glow", slug: "glow", description: "Brand skincare premium" },
  { id: "2", name: "Radiant", slug: "radiant", description: "Produk kecantikan alami" },
  { id: "3", name: "Pure Skin", slug: "pure-skin", description: "Skincare murni dan alami" },
]

export async function GET(_req: NextRequest) {
  // Return all brands from database
  return NextResponse.json(brandsDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newBrand = {
    id: Date.now().toString(),
    name: body.name,
    slug: body.slug,
    description: body.description || "",
  }
  brandsDB.push(newBrand)
  return NextResponse.json(newBrand, { status: 201 })
}
