"use client"

import { useState, useEffect, use } from "react"
import { notFound } from "next/navigation"
import { ProductMatchPanel } from "@/components/product-match-panel"
import { ProductReviews } from "@/components/product-reviews"
import { useLocalSWR } from "@/lib/swr-local"
import { Star, Truck, Shield, RotateCcw, ShoppingCart } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: reviews = [] } = useLocalSWR<any[]>(`gm_reviews_${slug}`, [])
  const { user, token } = useAuth()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  const getImageUrl = (product: any) => {
    if (product.image_url) {
      return product.image_url.startsWith("http") ? product.image_url : `https://be.sefara.my.id${product.image_url}`
    }
    if (product.image) {
      return product.image.startsWith("http") ? product.image : `https://be.sefara.my.id${product.image}`
    }
    return "/placeholder.svg"
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("[v0] === FETCHING PRODUCT ===")
        console.log("[v0] Slug:", slug)

        const headers: HeadersInit = {}
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        // Only fetch personalized data if the user exists and has a complete profile
        const isProfileComplete = user && user.skin_type
        const url = isProfileComplete
          ? `${API_BASE}/products/${slug}/${user.id}`
          : `${API_BASE}/products/${slug}`

        console.log(`[v0] Fetching from URL: ${url}`)
        const res = await fetch(url, { headers })
        console.log("[v0] Response status:", res.status)

        if (res.ok) {
          const data = await res.json()
          console.log("[v0] Product data:", data)
          
          // The API might return the product directly or nested under a 'data' key
          const productData = data.data || data
          setProduct(productData)
        } else {
          // Fallback to fetching all products if the specific slug fails
          console.log("[v0] Falling back to all products fetch")
          const allRes = await fetch(`${API_BASE}/products`)
          if (allRes.ok) {
            const allData = await allRes.json()
            const products = allData.data || allData
            const foundProduct = Array.isArray(products) 
              ? products.find((p: any) => p.slug === slug)
              : null
            setProduct(foundProduct)
          } else {
            setProduct(null)
          }
        }
      } catch (error) {
        console.error("[v0] Exception while fetching:", error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug, user, token])

  // Function to add item to cart via API
  const addToCart = async () => {
    if (!user || !token) {
      // Redirect to login if not authenticated
      localStorage.setItem("gm_post_login_redirect", window.location.pathname)
      window.location.href = "/login"
      return
    }

    setAddingToCart(true)
    try {
      const response = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Added to cart:", result)
        
        // Show success feedback
        const event = new CustomEvent("gm_show_toast", {
          detail: { message: "Produk berhasil ditambahkan ke keranjang!", type: "success" }
        })
        window.dispatchEvent(event)

        // Trigger cart update event for other components
        window.dispatchEvent(new CustomEvent("gm_cart_updated"))
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to add to cart:", errorData)
        
        // Show error feedback
        const event = new CustomEvent("gm_show_toast", {
          detail: { message: "Gagal menambahkan produk ke keranjang", type: "error" }
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error("[v0] Error adding to cart:", error)
      
      // Show error feedback
      const event = new CustomEvent("gm_show_toast", {
        detail: { message: "Terjadi kesalahan saat menambahkan ke keranjang", type: "error" }
      })
      window.dispatchEvent(event)
    } finally {
      setAddingToCart(false)
    }
  }

  // Function to handle buy now
  const buyNow = async () => {
    if (!user || !token) {
      localStorage.setItem("gm_post_login_redirect", `/checkout`)
      window.location.href = "/login"
      return
    }

    try {
      // First add to cart via API
      const response = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        // Redirect to checkout page
        window.location.href = "/checkout"
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to add to cart for buy now:", errorData)
        
        // Show error feedback
        const event = new CustomEvent("gm_show_toast", {
          detail: { message: "Gagal memproses pembelian", type: "error" }
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error("[v0] Error in buy now:", error)
      
      // Show error feedback
      const event = new CustomEvent("gm_show_toast", {
        detail: { message: "Terjadi kesalahan saat memproses pembelian", type: "error" }
      })
      window.dispatchEvent(event)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-xl aspect-square"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  const avgRating = Array.isArray(reviews) && reviews.length
  ? Number((reviews.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / reviews.length).toFixed(1))
  : Number(product.rating) || 0

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating) 
                ? "fill-yellow-400 text-yellow-400" 
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? "fill-yellow-400 text-yellow-400 fill-opacity-50"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const formatSkinTypes = (types: string[] | string) => {
    if (Array.isArray(types)) {
      return types.map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      ).join(", ")
    }
    return types
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Home</span>
        <span>/</span>
        <span>Products</span>
        <span>/</span>
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery - Single Image Only */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border overflow-hidden group bg-card hover:shadow-xl transition-all duration-300">
            <img
              src={getImageUrl(product)}
              alt={product.name}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.brand && (
                  <p className="text-lg text-gray-600 mt-1">by {product.brand.name}</p>
                )}
              </div>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(avgRating)}
                <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{reviews.length} ulasan</span>
              <span className="text-gray-500">•</span>
              <span className="text-green-600 font-medium">{product.stock || 50} tersedia</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                Rp {Number(product.price).toLocaleString("id-ID")}
              </span>
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm font-medium">
                Stok Tersedia
              </span>
            </div>
            <p className="text-gray-600 mt-2">Termasuk pajak dan gratis ongkir</p>
          </div>

          {/* Match Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <ProductMatchPanel product={product} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={buyNow}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Beli Sekarang
            </button>
            <button
              onClick={addToCart}
              disabled={addingToCart}
              className={`flex items-center gap-2 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-semibold transition-all ${
                addingToCart 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-blue-50"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {addingToCart ? "Menambah..." : "Keranjang"}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Gratis Ongkir</p>
              <p className="text-xs text-gray-600">Min. Rp 100.000</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">14 Hari</p>
              <p className="text-xs text-gray-600">Retur Gratis</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Garansi</p>
              <p className="text-xs text-gray-600">100% Original</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['Deskripsi', 'Bahan Aktif', 'Ulasan'].map((tab) => (
              <button
                key={tab}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* Description Section - Moved to main content area */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Deskripsi Produk</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Informasi Produk</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategori</span>
                    <span className="font-medium">{product.category?.name || product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium">{product.brand?.name || "Unknown"}</span>
                  </div>
                  {product.suitable_skin_types && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis Kulit</span>
                      <span className="font-medium text-right">
                        {formatSkinTypes(product.suitable_skin_types)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits moved here from separate section */}
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="mt-12 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Komposisi & Bahan Aktif</h3>
            
            {product.ingredients && product.ingredients.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {product.ingredients.map((ingredient: any, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
                      <h4 className="font-semibold text-blue-900 mb-2">{ingredient.name}</h4>
                      {ingredient.benefits && (
                        <p className="text-sm text-blue-700">{ingredient.benefits}</p>
                      )}
                      {ingredient.percentage && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-blue-600 mb-1">
                            <span>Konsentrasi</span>
                            <span>{ingredient.percentage}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${ingredient.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : product.tags ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-2 gap-4 p-6">
                  {product.tags.map((tag: any, index: number) => (
                    <div key={index} className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-800 font-semibold">{tag.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Informasi bahan aktif belum tersedia.</p>
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="mt-12">
            <ProductReviews productId={product.id} slug={product.slug} />
          </section>
        </div>
      </div>
    </div>
  )
}