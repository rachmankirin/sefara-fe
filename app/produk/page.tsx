"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { useAuth } from "@/components/auth/auth-context"
import { computeMatchScore } from "@/lib/match"
import { Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type SortKey = "relevan" | "harga-asc" | "harga-desc" | "skor-desc" | "skor-asc"
const PER_PAGE = 12
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

// Helper function to parse JSON fields
const parseJsonField = (field: any): string[] => {
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.warn('Failed to parse JSON field:', field)
      return []
    }
  }
  return []
}

export default function ProdukPage() {
  const router = useRouter()
  const params = useSearchParams()
  const openSearch = params.get("openSearch") === "1"
  const kategoriParam = params.get("kategori") || "semua"
  const qParam = params.get("q") || ""
  const sortParam = (params.get("sort") as SortKey) || "relevan"
  const pageParam = Math.max(1, Number(params.get("page") || 1))

  const inputRef = useRef<HTMLInputElement>(null)
  const { user, token } = useAuth()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [skinScore, setSkinScore] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<any>[] = [
          fetch(`${API_BASE}/products`), 
          fetch(`${API_BASE}/categories`)
        ]

        if (user && token) {
          promises.push(
            fetch(`${API_BASE}/skinscore`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          )
        }

        const responses = await Promise.all(promises)

        const [productsRes, categoriesRes, skinScoreRes] = responses

        if (productsRes.ok) {
          const productsData = await productsRes.json()
          console.log("Products data:", productsData)
          
          let productsArray = []
          if (Array.isArray(productsData)) {
            productsArray = productsData
          } else if (productsData.data && Array.isArray(productsData.data)) {
            productsArray = productsData.data
          } else {
            productsArray = []
          }

          // Parse JSON fields for each product
          const parsedProducts = productsArray.map((product: any) => ({
            ...product,
            suitable_skin_types: parseJsonField(product.suitable_skin_types),
            target_skin_goals: parseJsonField(product.target_skin_goals),
            ingredients_to_avoid: parseJsonField(product.ingredients_to_avoid),
          }))

          setProducts(parsedProducts)
        } else {
          console.error("Failed to fetch products:", productsRes.status)
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          console.log("Categories data:", categoriesData)
          
          let categoriesArray = []
          if (Array.isArray(categoriesData)) {
            categoriesArray = categoriesData
          } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
            categoriesArray = categoriesData.data
          } else {
            categoriesArray = []
          }
          
          setCategories(categoriesArray)
        } else {
          console.error("Failed to fetch categories:", categoriesRes.status)
        }

        if (skinScoreRes && skinScoreRes.ok) {
          const skinScoreData = await skinScoreRes.json()
          const score = skinScoreData.data || skinScoreData
          setSkinScore({
            skinType: score.skin_type,
            goals: score.skin_goals ? score.skin_goals.split(",") : [],
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, token])

  const kategoriList = [{ slug: "semua", name: "Semua" }, ...categories]

  const filtered = useMemo(() => {
    let list = products
    if (kategoriParam !== "semua") {
      list = list.filter((p) => {
        // Handle category as both string and object
        if (typeof p.category === "object" && p.category !== null) {
          return p.category.slug === kategoriParam || p.category.name === kategoriParam
        }
        return p.category === kategoriParam || p.category_id?.toString() === kategoriParam
      })
    }
    if (qParam) {
      const q = qParam.toLowerCase()
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase()
        const description = (p.description || "").toLowerCase()
        
        // Handle brand as both string and object
        const brandName =
          typeof p.brand === "object" && p.brand !== null
            ? (p.brand.name || "").toLowerCase()
            : (p.brand || "").toLowerCase()

        // Search in ingredients
        const ingredients = p.ingredients || []
        const ingredientNames = ingredients
          .map((ing: any) => (ing.name || "").toLowerCase())
          .join(" ")

        return (
          name.includes(q) || 
          description.includes(q) || 
          brandName.includes(q) ||
          ingredientNames.includes(q)
        )
      })
    }
    return list
  }, [products, kategoriParam, qParam])

  const withMatch = useMemo(() => {
    return filtered.map((p) => {
      const match = computeMatchScore(p, skinScore || undefined)
      return { p, match }
    })
  }, [filtered, skinScore])

  const sorted = useMemo(() => {
    const arr = [...withMatch]
    if (sortParam === "harga-asc") {
      arr.sort((a, b) => (a.p.price || 0) - (b.p.price || 0))
    } else if (sortParam === "harga-desc") {
      arr.sort((a, b) => (b.p.price || 0) - (a.p.price || 0))
    } else if (sortParam === "skor-desc") {
      arr.sort((a, b) => (b.match ?? -1) - (a.match ?? -1))
    } else if (sortParam === "skor-asc") {
      arr.sort((a, b) => (a.match ?? 101) - (b.match ?? 101))
    }
    return arr
  }, [withMatch, sortParam])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const page = Math.min(pageParam, totalPages)
  const start = (page - 1) * PER_PAGE
  const current = sorted.slice(start, start + PER_PAGE)

  function onSearchChange(v: string) {
    const sp = new URLSearchParams(params as any)
    if (v) sp.set("q", v)
    else sp.delete("q")
    sp.delete("page")
    router.push(`/produk?${sp.toString()}`)
  }

  function onPickKategori(slug: string) {
    const sp = new URLSearchParams(params as any)
    if (slug && slug !== "semua") sp.set("kategori", slug)
    else sp.delete("kategori")
    sp.delete("page")
    router.push(`/produk?${sp.toString()}`)
  }

  function onPickSort(sort: SortKey) {
    const sp = new URLSearchParams(params as any)
    if (sort && sort !== "relevan") sp.set("sort", sort)
    else sp.delete("sort")
    sp.delete("page")
    router.push(`/produk?${sp.toString()}`)
  }

  function goPage(n: number) {
    const sp = new URLSearchParams(params as any)
    sp.set("page", String(Math.max(1, n)))
    router.push(`/produk?${sp.toString()}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center">Memuat produk...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-full border border-border bg-card p-1 flex items-center gap-2 shadow-sm sticky top-[72px] z-40">
        <Search className="h-5 w-5 mx-2 opacity-70" />
        <input
          ref={inputRef}
          defaultValue={qParam}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari produk, bahan, atau nama brand"
          className="flex-1 bg-transparent outline-none text-sm"
          aria-label="Pencarian produk"
        />
        <select
          aria-label="Urutkan"
          value={sortParam}
          onChange={(e) => onPickSort(e.target.value as SortKey)}
          className="text-xs rounded-full border border-border bg-background px-2 py-1 mr-1"
        >
          <option value="relevan">Relevan</option>
          <option value="harga-asc">Harga termurah</option>
          <option value="harga-desc">Harga termahal</option>
        </select>

        <Link
          href="/profil-kulit"
          className="rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-primary hover:text-primary-foreground transition inline-flex items-center gap-1"
        >
          <SlidersHorizontal className="h-4 w-4" /> Profil Kulit
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {kategoriList.map((k) => (
          <button
            key={k.slug}
            onClick={() => onPickKategori(k.slug)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:bg-muted transition",
              kategoriParam === k.slug && "bg-primary text-primary-foreground border-transparent",
            )}
          >
            {k.name}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm opacity-70">{total} produk ditemukan</div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {current.map(({ p, match }) => (
          <ProductCard 
            key={`${p.id}-${p.slug}`} 
            product={p} 
            match={match} 
          />
        ))}
      </div>

      {total === 0 && <p className="mt-12 text-center opacity-70">Tidak ada produk yang cocok dengan pencarian.</p>}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 1}
            className="rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label="Halaman sebelumnya"
          >
            Sebelumnya
          </button>
          <span className="text-sm">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => goPage(page + 1)}
            disabled={page === totalPages}
            className="rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            aria-label="Halaman berikutnya"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}