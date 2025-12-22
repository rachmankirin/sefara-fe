"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Sparkles, Star, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function BrandListPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [filteredBrands, setFilteredBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [totalProducts, setTotalProducts] = useState(0) // Add total products state

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API_BASE}/brands`)
        if (res.ok) {
          const data = await res.json()
          const brandsData = Array.isArray(data) ? data : data.data || []
          setBrands(brandsData)
          setFilteredBrands(brandsData)
          
          // Calculate total products count
          const total = brandsData.reduce((sum: number, brand: any) => {
            return sum + getProductCount(brand)
          }, 0)
          setTotalProducts(total)
        }
      } catch (error) {
        console.error("[v0] Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredBrands(filtered)
      
      // Recalculate total products for filtered brands
      const total = filtered.reduce((sum: number, brand: any) => {
        return sum + getProductCount(brand)
      }, 0)
      setTotalProducts(total)
    } else {
      setFilteredBrands(brands)
      // Reset to total products from all brands
      const total = brands.reduce((sum: number, brand: any) => {
        return sum + getProductCount(brand)
      }, 0)
      setTotalProducts(total)
    }
  }, [searchQuery, brands])

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg"
    return imageUrl.startsWith("http") ? imageUrl : `https://be.sefara.my.id${imageUrl}`
  }

  const getRandomGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-pink-500 to-rose-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-indigo-600",
      "from-cyan-500 to-blue-600",
    ]
    return gradients[index % gradients.length]
  }

  // Get product count for a brand
  const getProductCount = (brand: any) => {
    // Check if the API provides product count directly
    if (brand.products_count !== undefined) return brand.products_count
    if (brand.product_count !== undefined) return brand.product_count
    
    // If the API returns products array, use its length
    if (brand.products && Array.isArray(brand.products)) return brand.products.length
    
    // Default fallback
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-white text-white py-16 px-4 rounded-3xl mx-4 mt-6 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Brand Terlengkap</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
            Temukan Brand Favoritmu
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Jelajahi koleksi brand skincare terbaik dengan produk-produk berkualitas untuk perawatan kulitmu
          </p>
          
          {/* Total Products Count in Hero */}
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">
                {totalProducts.toLocaleString('id-ID')} Produk
              </span>
            </div>
            <div className="h-4 w-px bg-white/40"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-lg">
                {filteredBrands.length} Brand
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div className="mx-auto max-w-4xl px-4 -mt-8 relative z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Cari brand skincare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 text-lg rounded-2xl shadow-lg border-0 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Semua Brand
              <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700">
                {filteredBrands.length} brand
              </Badge>
            </h2>
            <p className="text-gray-600 mt-2">
              Total {totalProducts.toLocaleString('id-ID')} produk tersedia dari semua brand
            </p>
          </div>
        </div>

        {filteredBrands.length === 0 ? (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardContent>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Brand tidak ditemukan</h3>
              <p className="text-gray-600">Coba gunakan kata kunci pencarian yang berbeda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand, index) => (
              <Link
                key={brand.id}
                href={`/brand-list/${slugify(brand.name)}`}
                className="group"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group-hover:scale-105 group-hover:-translate-y-2">
                  <CardContent className="p-0">
                    {/* Brand Header with Gradient */}
                    <div className={`h-3 bg-gradient-to-r ${getRandomGradient(index)}`}></div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 flex-shrink-0 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-2">
                            <img
                              src={getImageUrl(brand.logo_url) || "/placeholder.svg"}
                              alt={`${brand.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                              {brand.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">
                                {getProductCount(brand).toLocaleString('id-ID')} produk
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      {brand.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {brand.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Skincare
                        </Badge>
                        <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          Lihat produk →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}