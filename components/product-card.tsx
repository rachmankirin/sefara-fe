"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { useLocalSWR } from "@/lib/swr-local" // read local reviews

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function ProductCard({
  product,
  match,
  matchScore,
}: {
  product: any
  match?: number | null
  matchScore?: number | null
}) {
  const { data: reviews = [] } = useLocalSWR<any[]>(`gm_reviews_${product.slug}`, [])
  const { user, token } = useAuth()
  const [addingToCart, setAddingToCart] = useState(false)

  const avg =
    Array.isArray(reviews) && reviews.length
      ? reviews.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / reviews.length
      : null

  const effectiveMatch = typeof match === "number" ? match : typeof matchScore === "number" ? matchScore : null

  const imageUrl = (() => {
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace("/api", "")
    const path = product.image_url || product.image
    if (!path) return "/placeholder.svg"
    if (path.startsWith("http")) return path
    // Handle Laravel's /storage path
    if (path.startsWith("/storage")) return `${API_BASE_URL}${path}`
    return `${API_BASE_URL}/storage/${path}`
  })()

  const addToCart = async () => {
    if (!user || !token) {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        window.dispatchEvent(
          new CustomEvent("gm_show_toast", {
            detail: { message: "Produk berhasil ditambahkan!", type: "success" },
          }),
        )
        window.dispatchEvent(new CustomEvent("gm_cart_updated"))
      } else {
        const errorData = await response.json()
        console.error("Failed to add to cart:", errorData)
        window.dispatchEvent(
          new CustomEvent("gm_show_toast", {
            detail: { message: "Gagal menambahkan produk.", type: "error" },
          }),
        )
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      window.dispatchEvent(
        new CustomEvent("gm_show_toast", {
          detail: { message: "Terjadi kesalahan.", type: "error" },
        }),
      )
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-sm transition flex flex-col">
      <Link href={`/produk/${product.slug}`} className="block">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-40 object-cover border-b border-border"
        />
        <div className="p-3">
          <div className="font-medium line-clamp-2 h-10">{product.name}</div>
          <div className="text-sm opacity-70">{product.category?.name || product.categoryLabel}</div>

          {avg !== null && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-yellow-500">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 0 0-1.175 0L6.408 16.5c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.773 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 0 0 .95-.69l1.275-3.293Z" />
              </svg>
              <span className="font-semibold">{avg.toFixed(1)}</span>
              <span className="opacity-70">({reviews.length})</span>
            </div>
          )}

          <div className="mt-1 font-semibold">Rp {product.price.toLocaleString("id-ID")}</div>
          {typeof effectiveMatch === "number" && effectiveMatch > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              Skor kecocokan: <span className="font-bold">{Math.round(effectiveMatch)}%</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 pt-0 mt-auto">
        <button
          onClick={addToCart}
          disabled={addingToCart}
          className="w-full rounded-full border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {addingToCart ? "Menambahkan..." : "Tambah ke Keranjang"}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
