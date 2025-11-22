import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/data"
import { computeMatchScore } from "@/lib/match"

// Mock database for products
const productsDB = [...products]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const brand = searchParams.get("brand") || ""
  const sort = (searchParams.get("sort") || "") as "price-asc" | "price-desc" | "skin-asc" | "skin-desc" | ""
  const page = Number(searchParams.get("page") || "1")
  const perPage = Number(searchParams.get("perPage") || "12")

  // filter
  let list = productsDB.slice()
  if (q) {
    const ql = q.toLowerCase()
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(ql) ||
        p.brand?.toLowerCase().includes(ql) ||
        p.category?.toLowerCase().includes(ql),
    )
  }
  if (category) list = list.filter((p) => p.category === category)
  if (brand) list = list.filter((p) => p.brand === brand)

  // sort
  if (sort === "price-asc") list.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0))
  else if (sort === "price-desc") list.sort((a: any, b: any) => (b.price ?? 0) - (a.price ?? 0))
  else if (sort === "skin-asc" || sort === "skin-desc") {
    // Skin match is user-dependent; we default to descending using a naive 0 score.
    // Clients should ideally sort by skin score on the client with real user prefs.
    list.sort((a: any, b: any) => {
      const sa = computeMatchScore?.(a, null) ?? 0
      const sb = computeMatchScore?.(b, null) ?? 0
      return sort === "skin-asc" ? sa - sb : sb - sa
    })
  }

  const total = list.length
  const start = (page - 1) * perPage
  const items = list.slice(start, start + perPage)

  return NextResponse.json({
    items,
    total,
    page,
    perPage,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newProduct = {
    slug: body.slug,
    name: body.name,
    category: body.category,
    categoryLabel: body.categoryLabel || body.category,
    price: body.price || 0,
    image: body.image || "/placeholder.svg",
    brand: body.brand || "",
    tags: body.tags || [],
    suitableSkinTypes: body.suitableSkinTypes || [],
    benefits: body.benefits || [],
  }
  productsDB.push(newProduct)
  return NextResponse.json(newProduct, { status: 201 })
}
