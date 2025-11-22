"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Edit2, X } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string | number
  name: string
  slug: string
  price: number
  category: string | { id?: string | number; name: string; slug: string; description?: string }
  brand?: string | { id?: string | number; name: string; slug: string; description?: string }
  image_url?: string
  description?: string
  ingredients?: Array<{
    id: number
    name: string
    benefits: string
    percentage?: number
  }>
  stock?: number
  rating?: number
  suitable_skin_types?: string[] | string
  target_skin_goals?: string[] | string
  ingredients_to_avoid?: string[] | string
  fragrance_free?: boolean
  alcohol_free?: boolean
  consistency?: string
  category_id?: number
  brand_id?: number
}

interface Category {
  id?: string | number
  slug: string
  name: string
}

interface Brand {
  id?: string | number
  slug: string
  name: string
}

interface Ingredient {
  id: string | number
  name: string
  slug: string
  benefits: string
}

// Fix API base URL - ensure it doesn't have trailing slash
const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : "http://localhost:8000/api"

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

export default function ProductsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    price: 0,
    category_id: "",
    brand_id: "",
    description: "",
    ingredients: [] as number[],
    stock: 0,
    suitable_skin_types: [] as string[],
    target_skin_goals: [] as string[],
    ingredients_to_avoid: [] as string[],
    fragrance_free: false,
    alcohol_free: false,
    consistency: "",
  })
  const [ingredientInput, setIngredientInput] = useState("")
  const [newIngredientName, setNewIngredientName] = useState("")
  const [newIngredientBenefits, setNewIngredientBenefits] = useState("")
  const [creatingIngredient, setCreatingIngredient] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  // Skin types and goals options
  const skinTypes = ["kering", "normal", "berminyak", "kombinasi", "sensitif", "all"]
  const skinGoals = ["hidrasi", "mencerahkan", "anti-jerawat", "anti-penuaan", "menenangkan", "mengurangi_kemerahan", "brightening", "anti-aging"]
  const consistencies = ["cream", "gel", "lotion", "serum", "oil"]
  const commonIngredientsToAvoid = ["fragrance", "alcohol", "paraben", "sulfate", "silicone"]

  const getAuthHeaders = () => {
    const token = localStorage.getItem("glowmall:token")
    const headers: Record<string, string> = {}
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    
    return headers
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts()
      fetchCategories()
      fetchBrands()
      fetchIngredients()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      console.log("[FIXED] Fetching products from:", `${API_BASE}/products`)
      const res = await fetch(`${API_BASE}/products`, {
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin")
          return
        }
        const errorText = await res.text()
        console.error("[FIXED] API Error:", res.status, errorText)
        throw new Error(`API error: ${res.status}`)
      }
      
      const data = await res.json()
      console.log("[FIXED] Products fetched successfully:", data)
      
      let productsData = []
      if (Array.isArray(data)) {
        productsData = data
      } else if (data.data) {
        productsData = Array.isArray(data.data) ? data.data : [data.data]
      } else if (data.products) {
        productsData = Array.isArray(data.products) ? data.products : [data.products]
      }
      
      // Parse JSON strings back to arrays
      const parsedProducts = productsData.map(product => ({
        ...product,
        suitable_skin_types: parseJsonField(product.suitable_skin_types),
        target_skin_goals: parseJsonField(product.target_skin_goals),
        ingredients_to_avoid: parseJsonField(product.ingredients_to_avoid),
      }))
      
      setProducts(parsedProducts)
      
    } catch (err) {
      console.error("[FIXED] Network error fetching products:", err)
      alert("Gagal terhubung ke server. Pastikan backend Laravel berjalan di " + API_BASE)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/brands`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setBrands(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("Error fetching brands:", err)
    }
  }

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API_BASE}/ingredients`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setIngredients(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("Error fetching ingredients:", err)
    }
  }

  const handleCreateIngredient = async () => {
    if (!newIngredientName.trim()) {
      alert("Nama bahan harus diisi")
      return
    }

    setCreatingIngredient(true)
    try {
      const res = await fetch(`${API_BASE}/ingredients`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newIngredientName,
          benefits: newIngredientBenefits,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Ingredient creation failed:", errorText)
        throw new Error(`API error: ${res.status}`)
      }

      const responseData = await res.json()
      const newIngredient = responseData.data || responseData

      setIngredients([...ingredients, newIngredient])
      setNewIngredientName("")
      setNewIngredientBenefits("")
      alert("Bahan berhasil dibuat! ID: " + newIngredient.id)
    } catch (err) {
      console.error("Error creating ingredient:", err)
      alert("Gagal membuat bahan: " + err)
    } finally {
      setCreatingIngredient(false)
    }
  }

const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitLoading(true)

  if (!newProduct.name || !newProduct.slug || !newProduct.category_id) {
    alert("Nama, slug, dan kategori harus diisi")
    setSubmitLoading(false)
    return
  }

  try {
    console.log("=== PRODUCT SAVE START ===")
    
    // Prepare product data - ensure proper data types
    const productData: any = {
      name: newProduct.name,
      slug: newProduct.slug,
      price: parseFloat(newProduct.price.toString()),
      category_id: parseInt(newProduct.category_id),
      description: newProduct.description || "",
      stock: parseInt(newProduct.stock.toString()) || 0,
      suitable_skin_types: newProduct.suitable_skin_types,
      target_skin_goals: newProduct.target_skin_goals,
      ingredients_to_avoid: newProduct.ingredients_to_avoid,
      fragrance_free: newProduct.fragrance_free,
      alcohol_free: newProduct.alcohol_free,
      ingredients: newProduct.ingredients,
    }

    // Add optional fields
    if (newProduct.brand_id) {
      productData.brand_id = parseInt(newProduct.brand_id)
    }
    if (newProduct.consistency) {
      productData.consistency = newProduct.consistency
    }

    const token = localStorage.getItem("glowmall:token")
    const url = editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products`
    
    // --- SUPABASE IMAGE UPLOAD ---
    let finalImageUrl = editingId && !selectedImage ? imagePreview : ''

    if (selectedImage) {
      // Manually set the session for the Supabase client using the token
      const token = localStorage.getItem("glowmall:token")
      if (!token) {
        alert("Sesi otentikasi tidak ditemukan. Silakan login kembali.")
        setSubmitLoading(false)
        return
      }
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: token, // Using the same token for both is fine for this purpose
      })

      console.log("Uploading image to Supabase...")
      const fileName = `public/${Date.now()}-${selectedImage.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products') // Make sure this bucket exists and has public access
        .upload(fileName, selectedImage)

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        alert(`Gagal mengupload gambar ke Supabase: ${uploadError.message}`)
        setSubmitLoading(false)
        return
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)
        
      finalImageUrl = publicUrlData.publicUrl
      console.log("Image uploaded successfully. Public URL:", finalImageUrl)
    }
    // --- END SUPABASE UPLOAD ---

    const payload = {
      ...productData,
      image_url: finalImageUrl, // Add the image URL to the payload
      fragrance_free: Boolean(productData.fragrance_free),
      alcohol_free: Boolean(productData.alcohol_free),
    }

    console.log("Sending JSON payload to backend:", payload)
      
    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      
      let errorMessage = `Gagal menyimpan produk: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.message) {
          errorMessage = errorJson.message
        }
        if (errorJson.errors) {
          // Show validation errors
          const errorDetails = Object.values(errorJson.errors).flat().join(', ')
          errorMessage += `\n\nDetail: ${errorDetails}`
        }
      } catch (e) {
        // Not JSON, use text as is
      }
      
      alert(errorMessage)
      return
    }

    const responseData = await response.json()
    console.log("Success! Response:", responseData)

    // Reset form
    setNewProduct({
      name: "",
      slug: "",
      price: 0,
      category_id: "",
      brand_id: "",
      description: "",
      ingredients: [],
      stock: 0,
      suitable_skin_types: [],
      target_skin_goals: [],
      ingredients_to_avoid: [],
      fragrance_free: false,
      alcohol_free: false,
      consistency: "",
    })
    setIngredientInput("")
    setSelectedImage(null)
    setImagePreview("")
    setEditingId(null)

    // Refresh the products list
    await fetchProducts()
    alert(editingId ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!")
    
  } catch (err) {
    console.error("Network exception:", err)
    alert(`Network error: ${err instanceof Error ? err.message : "Tidak dapat terhubung ke server"}`)
  } finally {
    setSubmitLoading(false)
  }
}

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      fetchProducts()
      alert("Produk berhasil dihapus")
    } catch (err) {
      console.error("Error deleting product:", err)
      alert("Gagal menghapus produk")
    }
  }

  const handleEditProduct = (product: Product) => {
    // Extract ingredient IDs from the product
    const ingredientIds = product.ingredients ? product.ingredients.map(ing => ing.id) : []

    setNewProduct({
      name: product.name,
      slug: product.slug,
      price: product.price,
      category_id: product.category_id?.toString() || "",
      brand_id: product.brand_id?.toString() || "",
      description: product.description || "",
      ingredients: ingredientIds,
      stock: product.stock || 0,
      suitable_skin_types: parseJsonField(product.suitable_skin_types),
      target_skin_goals: parseJsonField(product.target_skin_goals),
      ingredients_to_avoid: parseJsonField(product.ingredients_to_avoid),
      fragrance_free: product.fragrance_free || false,
      alcohol_free: product.alcohol_free || false,
      consistency: product.consistency || "",
    })
    setIngredientInput(ingredientIds.join(", "))
    if (product.image_url) {
      setImagePreview(product.image_url)
    }
    setEditingId(product.id)
  }

  const handleIngredientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIngredientInput(value)
    
    // Parse comma-separated ingredient IDs
    const ingredientIds = value
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .map(id => parseInt(id))
      .filter(id => !isNaN(id))
    
    setNewProduct(prev => ({ ...prev, ingredients: ingredientIds }))
  }

  const toggleArrayItem = (array: string[], item: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.")
        e.target.value = ""
        return
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        alert("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.")
        e.target.value = ""
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  // Test API connection
  const testConnection = async () => {
    try {
      console.log("Testing connection to:", API_BASE)
      const res = await fetch(`${API_BASE}/products`)
      if (res.ok) {
        alert(`✅ Berhasil terhubung ke ${API_BASE}`)
      } else {
        alert(`❌ Gagal terhubung: ${res.status} ${res.statusText}`)
      }
    } catch (err) {
      alert(`❌ Network Error: ${err instanceof Error ? err.message : 'Tidak dapat terhubung'}`)
    }
  }

  if (loading || !user || user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
          <Button variant="outline" onClick={testConnection} size="sm">
            Test Koneksi API
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">{editingId ? "Edit" : "Manajemen"} Produk</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nama Produk"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <Input
                placeholder="Slug"
                value={newProduct.slug}
                onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Harga"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                required
              />
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={newProduct.brand_id}
                onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Pilih Brand (Opsional)</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Stok"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                required
              />
            </div>

            <textarea
              placeholder="Deskripsi Produk"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
            />

            {/* Image Upload */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Gambar Produk</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                  <p className="text-xs text-muted-foreground mt-1">Upload gambar produk (JPG, PNG, WebP, max 5MB)</p>
                </div>
                {imagePreview && (
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Hapus gambar"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ingredients IDs (pisahkan dengan koma)
              </label>
              <Input
                placeholder="Contoh: 1, 5, 12, 25"
                value={ingredientInput}
                onChange={handleIngredientInputChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan ID bahan yang sudah ada, pisahkan dengan koma. {newProduct.ingredients.length} ingredients dipilih.
              </p>
              {newProduct.ingredients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newProduct.ingredients.map((id) => {
                    const ing = ingredients.find((i) => i.id === id)
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-sm"
                      >
                        {ing ? `${ing.name} (ID: ${id})` : `ID: ${id}`}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Skin Types */}
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Kulit yang Cocok</label>
              <div className="flex flex-wrap gap-2">
                {skinTypes.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleArrayItem(newProduct.suitable_skin_types, type, (value) => setNewProduct({...newProduct, suitable_skin_types: value}))}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      newProduct.suitable_skin_types.includes(type)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Goals */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Skin Goals</label>
              <div className="flex flex-wrap gap-2">
                {skinGoals.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleArrayItem(newProduct.target_skin_goals, goal, (value) => setNewProduct({...newProduct, target_skin_goals: value}))}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      newProduct.target_skin_goals.includes(goal)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input"
                    }`}
                  >
                    {goal.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients to Avoid */}
            <div>
              <label className="block text-sm font-medium mb-2">Ingredients to Avoid</label>
              <div className="flex flex-wrap gap-2">
                {commonIngredientsToAvoid.map((ingredient) => (
                  <button
                    type="button"
                    key={ingredient}
                    onClick={() => toggleArrayItem(newProduct.ingredients_to_avoid, ingredient, (value) => setNewProduct({...newProduct, ingredients_to_avoid: value}))}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      newProduct.ingredients_to_avoid.includes(ingredient)
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-background border-input"
                    }`}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>

            {/* Free From & Consistency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fragrance_free"
                  checked={newProduct.fragrance_free}
                  onChange={(e) => setNewProduct({ ...newProduct, fragrance_free: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="fragrance_free" className="text-sm">Fragrance Free</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="alcohol_free"
                  checked={newProduct.alcohol_free}
                  onChange={(e) => setNewProduct({ ...newProduct, alcohol_free: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="alcohol_free" className="text-sm">Alcohol Free</label>
              </div>
              <select
                value={newProduct.consistency}
                onChange={(e) => setNewProduct({ ...newProduct, consistency: e.target.value })}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Pilih Konsistensi</option>
                {consistencies.map((consistency) => (
                  <option key={consistency} value={consistency}>
                    {consistency}
                  </option>
                ))}
              </select>
            </div>

            {/* New Ingredient Creation */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Buat Bahan Baru</label>
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Nama Bahan (contoh: Vitamin C)"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                />
                <Input
                  placeholder="Manfaat (contoh: Mencerahkan kulit)"
                  value={newIngredientBenefits}
                  onChange={(e) => setNewIngredientBenefits(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateIngredient}
                  disabled={creatingIngredient || !newIngredientName.trim()}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  {creatingIngredient ? "Membuat..." : "Buat Bahan"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gap-2" disabled={submitLoading}>
                <Plus className="h-4 w-4" />
                {submitLoading ? "Menyimpan..." : editingId ? "Perbarui Produk" : "Tambah Produk"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setNewProduct({
                      name: "",
                      slug: "",
                      price: 0,
                      category_id: "",
                      brand_id: "",
                      description: "",
                      ingredients: [],
                      stock: 0,
                      suitable_skin_types: [],
                      target_skin_goals: [],
                      ingredients_to_avoid: [],
                      fragrance_free: false,
                      alcohol_free: false,
                      consistency: "",
                    })
                    setIngredientInput("")
                    setSelectedImage(null)
                    setImagePreview("")
                  }}
                  className="bg-transparent"
                  disabled={submitLoading}
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Products List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Daftar Produk</h2>
          {pageLoading ? (
            <p className="text-muted-foreground">Memuat...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">Belum ada produk</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                // Parse JSON fields for display
                const suitableSkinTypes = parseJsonField(product.suitable_skin_types)
                const targetSkinGoals = parseJsonField(product.target_skin_goals)
                const ingredientsToAvoid = parseJsonField(product.ingredients_to_avoid)

                return (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {product.image_url && (
                        <div className="w-20 h-20 border rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {typeof product.category === "object" ? product.category.name : product.category} • Rp{" "}
                          {product.price.toLocaleString("id-ID")}
                        </p>
                        {product.brand && (
                          <p className="text-sm">
                            Brand: {typeof product.brand === "object" ? product.brand.name : product.brand}
                          </p>
                        )}
                        {product.stock !== undefined && <p className="text-sm">Stok: {product.stock}</p>}
                        {product.consistency && <p className="text-sm">Konsistensi: {product.consistency}</p>}
                        {product.fragrance_free && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Fragrance Free</span>}
                        {product.alcohol_free && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Alcohol Free</span>}
                        
                        {product.description && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{product.description}</p>
                        )}
                        
                        {/* Skin Types */}
                        {suitableSkinTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs font-medium">Cocok untuk:</span>
                            {suitableSkinTypes.map((type, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Skin Goals */}
                        {targetSkinGoals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs font-medium">Target:</span>
                            {targetSkinGoals.map((goal, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {goal}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ingredients */}
                        {product.ingredients && product.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs font-medium">Ingredients:</span>
                            {product.ingredients.map((ingredient, idx) => (
                              <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                {ingredient.name} (ID: {ingredient.id})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="gap-2 bg-transparent"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}