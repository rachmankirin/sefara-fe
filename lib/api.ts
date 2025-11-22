// #command: Flip this to true to use your Laravel API instead of local Next.js routes.
const USE_LARAVEL = true

// #command: Set this ENV in Vars when using Laravel; e.g. https://api.yoursite.com
const LARAVEL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// #command: When not using Laravel, we use internal Next route handlers
const NEXT_BASE = typeof window !== "undefined" ? "" : ""

// Common fetcher
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = USE_LARAVEL ? LARAVEL_BASE : NEXT_BASE
  const url = `${base}${path}`
  const res = await fetch(url, {
    // #command: If your Laravel API requires auth header, add it here
    // headers: { Authorization: `Bearer ${token}` },
    ...init,
    // #command: If Laravel requires CORS, ensure mode: 'cors'
    // mode: 'cors'
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

// Types (kept loose to match your current lib/data.ts structure)
// #command: If your Laravel API uses different property names, reflect it here.
export interface Product {
  id: string
  slug: string
  name: string
  brand?: string
  category?: string
  price?: number
  image?: string
  // #command: extend with any fields coming from Laravel (stock, attributes, etc.)
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

export interface ProductsQuery {
  q?: string
  category?: string
  brand?: string
  sort?: "price-asc" | "price-desc" | "skin-asc" | "skin-desc"
  page?: number
  perPage?: number
}

// Utility for building query strings
function qs(params: Record<string, any>) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v))
  })
  const s = p.toString()
  return s ? `?${s}` : ""
}

// PRODUCTS
export async function getProducts(params: ProductsQuery = {}): Promise<PagedResult<Product>> {
  // #command: If using Laravel, map to your Laravel endpoint and query names
  // e.g. '/api/products?search=...'
  const path = USE_LARAVEL
    ? `/api/products${qs({
        search: params.q,
        category: params.category,
        brand: params.brand,
        sort: params.sort,
        page: params.page,
        per_page: params.perPage,
      })}`
    : `/api/products${qs(params)}`
  return apiFetch<PagedResult<Product>>(path)
}

// Single product
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // #command: If Laravel uses '/api/products/{slug}', adjust below
  const path = USE_LARAVEL ? `/api/products/${slug}` : `/api/products/${slug}`
  return apiFetch<Product | null>(path)
}

// BRANDS
export async function getBrands(): Promise<string[]> {
  // #command: If Laravel uses '/api/brands', adjust below
  const path = USE_LARAVEL ? `/api/brands` : `/api/brands`
  return apiFetch<string[]>(path)
}

export async function getBrandProducts(brand: string, params: ProductsQuery = {}) {
  // #command: If Laravel uses '/api/brands/{brand}/products' adjust below and param names
  const path = USE_LARAVEL
    ? `/api/brands/${encodeURIComponent(brand)}/products${qs({
        search: params.q,
        category: params.category,
        sort: params.sort,
        page: params.page,
        per_page: params.perPage,
      })}`
    : `/api/brands/${encodeURIComponent(brand)}/products${qs(params)}`
  return apiFetch<PagedResult<Product>>(path)
}

// REVIEWS (optional stubs to align future Laravel endpoints)
// #command: Wire these when your Laravel API is ready; keep the shapes consistent.
export interface Review {
  id: string
  productSlug: string
  user: string
  rating: number
  source: "online" | "offline"
  comment: string
  createdAt: string
}

export async function getProductReviews(slug: string): Promise<Review[]> {
  const path = USE_LARAVEL ? `/api/products/${slug}/reviews` : `/api/products/${slug}/reviews`
  return apiFetch<Review[]>(path)
}

export async function postProductReview(slug: string, body: Omit<Review, "id" | "createdAt" | "productSlug">) {
  const path = USE_LARAVEL ? `/api/products/${slug}/reviews` : `/api/products/${slug}/reviews`
  return apiFetch<Review>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

// SWR keys (handy for pages)
// #command: You can reuse these keys for useSWR/React Query.
export const keys = {
  products: (p: ProductsQuery = {}) => `/api/products${qs(p)}`,
  product: (slug: string) => `/api/products/${slug}`,
  brands: () => `/api/brands`,
  brandProducts: (brand: string, p: ProductsQuery = {}) => `/api/brands/${encodeURIComponent(brand)}/products${qs(p)}`,
}
