import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/data"
import { computeMatchScore } from "@/lib/match"

export async function GET(req: NextRequest, { params }: { params: { brand: string } }) {
  const { searchParams } = new URL(req.url)
  const brand = decodeURIComponent(params.brand)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const sort = (searchParams.get("sort") || "") as "price-asc" | "price-desc" | "skin-asc" | "skin-desc" | ""
  const page = Number(searchParams.get("page") || "1")
  const perPage = Number(searchParams.get("perPage") || "12")

  let list = products.filter((p) => p.brand === brand)

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

  if (sort === "price-asc") list.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0))
  else if (sort === "price-desc") list.sort((a: any, b: any) => (b.price ?? 0) - (a.price ?? 0))
  else if (sort === "skin-asc" || sort === "skin-desc") {
    list.sort((a: any, b: any) => {
      const sa = computeMatchScore?.(a, null) ?? 0
      const sb = computeMatchScore?.(b, null) ?? 0
      return sort === "skin-asc" ? sa - sb : sb - sa
    })
  }

  const total = list.length
  const start = (page - 1) * perPage
  const items = list.slice(start, start + perPage)

  return NextResponse.json({ items, total, page, perPage })
}
