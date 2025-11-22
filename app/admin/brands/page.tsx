"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Brand {
  id: string | number
  name: string
  slug: string
  description?: string
  logo_url?: string | { url: string }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function BrandsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [brands, setBrands] = useState<Brand[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [newBrand, setNewBrand] = useState({ name: "", slug: "", description: "" })
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("")

  const getAuthHeaders = (forFormData: boolean = false): Record<string, string> => {
    const token = localStorage.getItem("glowmall:token")
    const headers: Record<string, string> = {}

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    if (!forFormData) {
      headers["Content-Type"] = "application/json"
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
      fetchBrands()
    }
  }, [user])

  const fetchBrands = async () => {
    try {
      console.log("[v0] Fetching brands from Laravel API...")
      const res = await fetch(`${API_BASE}/brands`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setBrands(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error("[v0] Error fetching brands:", err)
      alert("Gagal mengambil brand dari server")
    } finally {
      setPageLoading(false)
    }
  }

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrand.name || !newBrand.slug) {
      alert("Nama dan slug brand harus diisi")
      return
    }

    try {
      let finalLogoUrl = editingId && !selectedLogo ? existingLogoUrl : ""

      if (selectedLogo) {
        console.log("Uploading logo to Supabase...")
        const fileName = `public/${Date.now()}-${selectedLogo.name}`
        const { error: uploadError } = await supabase.storage
          .from('brands') // Using a new bucket for brand logos
          .upload(fileName, selectedLogo)

        if (uploadError) {
          console.error('Supabase upload error:', uploadError)
          alert(`Gagal mengupload logo ke Supabase: ${uploadError.message}`)
          return
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('brands')
          .getPublicUrl(fileName)
          
        finalLogoUrl = publicUrlData.publicUrl
        console.log("Logo uploaded successfully. Public URL:", finalLogoUrl)
      }

      const payload = {
        ...newBrand,
        logo_url: finalLogoUrl,
      }

      const url = editingId ? `${API_BASE}/brands/${editingId}` : `${API_BASE}/brands`
      const method = editingId ? "PUT" : "POST"

      console.log("Sending payload to backend:", payload)

      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(false), // Use JSON headers
        body: JSON.stringify(payload),
      })

      console.log("Response status:", res.status, res.statusText)

      const responseText = await res.text()
      console.log("Raw response:", responseText.substring(0, 500))

      if (!res.ok) {
        console.error("=== BRAND SAVE ERROR ===")
        try {
          const errorJson = JSON.parse(responseText)
          alert(`Gagal menyimpan brand: ${errorJson.message || res.statusText}`)
        } catch {
          alert(`Gagal menyimpan brand: ${res.status} ${res.statusText}`)
        }
        return
      }

      // Reset form
      setNewBrand({ name: "", slug: "", description: "" })
      setSelectedLogo(null)
      setLogoPreview("")
      setExistingLogoUrl("")
      setEditingId(null)

      fetchBrands()
      alert(editingId ? "Brand berhasil diperbarui!" : "Brand berhasil ditambahkan!")
    } catch (err) {
      console.error("=== EXCEPTION ===")
      console.error("Error:", err)

      if (err instanceof TypeError && err.message.includes("fetch")) {
        alert("Gagal terhubung ke server. Pastikan Laravel backend berjalan di " + API_BASE)
      } else {
        alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }
  }

  const handleDeleteBrand = async (id: string | number) => {
    if (!confirm("Yakin ingin menghapus brand ini?")) return
    try {
      const res = await fetch(`${API_BASE}/brands/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      fetchBrands()
      alert("Brand berhasil dihapus")
    } catch (err) {
      console.error("[v0] Error deleting brand:", err)
      alert("Gagal menghapus brand")
    }
  }

  const handleEditBrand = (brand: Brand) => {
    setNewBrand({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
    })
    if (brand.logo_url) {
      const logoUrl = getImageUrl(brand.logo_url)
      setLogoPreview(logoUrl)
      setExistingLogoUrl(logoUrl)
    }
    setEditingId(brand.id)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB")
        return
      }

      setSelectedLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      console.log("[v0] Logo file selected:", file.name, file.type, file.size)
    }
  }

  const getImageUrl = (logoUrl?: string | { url: string }) => {
    if (!logoUrl) return "/placeholder.svg"
    const url = typeof logoUrl === "object" && "url" in logoUrl ? logoUrl.url : logoUrl
    
    // Handle both absolute and relative URLs
    if (url.startsWith("http")) return url
    if (url.startsWith("/storage")) return `http://localhost:8000${url}`
    return `http://localhost:8000/storage/${url}`
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">{editingId ? "Edit" : "Manajemen"} Brand</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Brand" : "Tambah Brand Baru"}</h2>
          <form onSubmit={handleAddBrand} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Nama Brand"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                required
              />
              <Input
                placeholder="Slug (contoh: loreal-paris)"
                value={newBrand.slug}
                onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                required
              />
              <Input
                placeholder="Deskripsi"
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Logo Brand</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                    className="cursor-pointer" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload logo brand (JPG, PNG, max 5MB)
                    {editingId && existingLogoUrl && " - Kosongkan jika tidak ingin mengubah logo"}
                  </p>
                </div>
                {(logoPreview || existingLogoUrl) && (
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-white">
                    <img
                      src={logoPreview || existingLogoUrl || "/placeholder.svg"}
                      alt="Logo Preview"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? "Perbarui Brand" : "Tambah Brand"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setNewBrand({ name: "", slug: "", description: "" })
                    setSelectedLogo(null)
                    setLogoPreview("")
                    setExistingLogoUrl("")
                  }}
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Daftar Brand</h2>
          {brands.length === 0 ? (
            <p className="text-muted-foreground">Belum ada brand</p>
          ) : (
            <div className="grid gap-4">
              {brands.map((brand) => (
                <Card key={brand.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {brand.logo_url && (
                      <div className="w-16 h-16 border rounded-md overflow-hidden flex-shrink-0 bg-white">
                        <img
                          src={getImageUrl(brand.logo_url) || "/placeholder.svg"}
                          alt={brand.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground">{brand.slug}</p>
                      {brand.description && <p className="text-sm mt-1">{brand.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}