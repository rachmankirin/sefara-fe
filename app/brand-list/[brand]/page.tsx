"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

interface Product {
  id: string | number
  name: string
  slug: string
  price: number
  image_url?: string
  description?: string
  brand?: { id: number; name: string } | string
  brand_id?: number
  category?: string
}

interface Brand {
  id: number
  name: string
  description?: string
  logo_url?: string
  products: Product[]
}

const PER_PAGE = 12

export default function BrandProductsPage({ params }: { params: { brand: string } }) {
  const { brand: brandSlug } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "relevan"
  const pageParam = Number(searchParams.get("page") || "1")
  const pageInitial = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const [brand, setBrand] = useState<Brand | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(pageInitial)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching brand with slug:", brandSlug)

        const brandRes = await fetch(`https://be.sefara.my.id/api/brands/slug/${brandSlug}`)

        if (!brandRes.ok) {
          console.error("[v0] Brand fetch failed:", brandRes.status)
          setLoading(false)
          return
        }

        const brandData = await brandRes.json()
        console.log("[v0] Brand API response:", brandData)

        // Handle response structure: { data: { id, name, slug, products: [...] } }
        const brandInfo = brandData.data || brandData

        if (brandInfo) {
          setBrand({
            id: brandInfo.id,
            name: brandInfo.name,
            description: brandInfo.description,
            logo_url: brandInfo.logo_url,
            products: brandInfo.products || [],
          })

          const products = (brandInfo.products || []).map((p: Product) => ({
            ...p,
            slug: p.slug || slugify(p.name),
            // Convert price from string to number
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            // Ensure image_url is properly handled
            image_url: p.image_url || null,
          }))
          console.log("[v0] Products from brand API:", products.length)
          console.log("[v0] Sample product with image:", products[0])
          console.log("[v0] Product image URL:", products[0]?.image_url)
          setAllProducts(products)
        }
      } catch (error) {
        console.error("[v0] Error fetching brand and products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [brandSlug])

  // Categories within brand
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map((p) => p.category || "Lainnya"))).sort()
  }, [allProducts])

  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  // Filter + search + category
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim()
    return allProducts.filter((p) => {
      const inCat = selectedCat ? (p.category || "Lainnya") === selectedCat : true
      const brandName = typeof p.brand === "object" && p.brand !== null ? p.brand.name : p.brand || ""
      const inText = !term || p.name?.toLowerCase().includes(term) || brandName.toLowerCase().includes(term)
      return inCat && inText
    })
  }, [allProducts, q, selectedCat])

  // Sorting
  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sort) {
      case "harga-asc":
        list.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "harga-desc":
        list.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "nama-asc":
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "nama-desc":
        list.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // relevan: by name
        list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [filtered, sort])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * PER_PAGE
  const current = sorted.slice(start, start + PER_PAGE)

  function updateParam(name: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) sp.set(name, value)
    else sp.delete(name)
    if (name !== "page") sp.set("page", "1")
    router.push(`?${sp.toString()}`)
    if (name === "page") setPage(Number(value) || 1)
    else setPage(1)
  }

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg"
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) return imageUrl
    
    // If it starts with /storage/, construct the full URL
    if (imageUrl.startsWith("/storage/")) {
      return `https://be.sefara.my.id${imageUrl}`
    }
    
    // For any other relative paths, prepend the API base URL
    return `https://be.sefara.my.id${imageUrl}`
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center">Memuat...</p>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/brand-list" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Brand
        </Link>
        <p className="text-center text-muted-foreground">Brand tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/brand-list" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Brand
      </Link>

      {/* Hero */}
      <section className="rounded-xl bg-gradient-to-r from-primary to-primary/60 relative overflow-hidden mb-6">
        <div className="relative z-10 p-6 text-primary-foreground">
          <div className="flex items-center gap-6">
            {brand.logo_url && (
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                <img
                  src={getImageUrl(brand.logo_url) || "/placeholder.svg"}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{brand.name}</h1>
              {brand.description && <p className="opacity-90 mt-1">{brand.description}</p>}
              <p className="mt-2 opacity-75">{allProducts.length} produk tersedia</p>
            </div>
          </div>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70 z-0" />
      </section>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Cari produk di brand ini..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            aria-label="Cari produk di brand ini"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Urutkan</label>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-2 text-sm"
            aria-label="Urutkan produk"
          >
            <option value="relevan">Relevan</option>
            <option value="nama-asc">Nama A-Z</option>
            <option value="nama-desc">Nama Z-A</option>
            <option value="harga-asc">Harga Termurah</option>
            <option value="harga-desc">Harga Termahal</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-3 py-1 rounded-full border border-border text-sm ${!selectedCat ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            Semua Kategori
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c === selectedCat ? null : c)}
              className={`px-3 py-1 rounded-full border border-border text-sm ${selectedCat === c ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Result meta */}
      <div className="text-sm opacity-70 mb-4">
        Menampilkan {current.length} dari {sorted.length} produk {selectedCat ? `dalam kategori "${selectedCat}"` : ""}.
      </div>

      {/* Grid */}
      {current.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {current.map((product) => (
            <Link key={product.id} href={`/produk/${product.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        console.error(`Failed to load image: ${product.image_url}`)
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                      onLoad={() => console.log(`Successfully loaded: ${getImageUrl(product.image_url)}`)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-gray-600 text-lg">📷</span>
                        </div>
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-lg font-bold text-primary">Rp {product.price.toLocaleString("id-ID")}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => updateParam("page", String(safePage - 1))}
            className="px-3 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            ‹ Sebelumnya
          </button>
          <div className="text-sm">
            Halaman {safePage} dari {totalPages}
          </div>
          <button
            disabled={safePage >= totalPages}
            onClick={() => updateParam("page", String(safePage + 1))}
            className="px-3 py-2 rounded-md border border-border disabled:opacity-50 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Berikutnya ›
          </button>
        </div>
      )}
    </div>
  )
}