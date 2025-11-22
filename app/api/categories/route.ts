import { type NextRequest, NextResponse } from "next/server"
import { categories } from "@/lib/data"

// Mock database for categories
const categoriesDB = [...categories]

export async function GET() {
  return NextResponse.json(categoriesDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newCategory = {
    slug: body.slug,
    name: body.name,
  }
  categoriesDB.push(newCategory)
  return NextResponse.json(newCategory, { status: 201 })
}
