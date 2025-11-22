"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, AlertCircle, Sun, Moon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const ROUTINE_CATEGORIES = [
  { value: "cleanser", label: "Cleanser" },
  { value: "toner", label: "Toner" },
  { value: "serum", label: "Serum" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "sunscreen", label: "Sunscreen" },
]

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number
  name: string
  slug: string
  description: string
  category: ProductCategory
  image_path?: string
  image_url?: string
}

type RoutineProduct = {
  id: string
  product_id: string
  step_order: number
  note?: string
  product: Product
}

type Routine = {
  id: string
  user_id: string
  type: "morning" | "night"
  products: RoutineProduct[]
}

export default function RutinkuPage() {
  const router = useRouter()
  const { user, loading: authLoading, token } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRoutineType, setSelectedRoutineType] = useState<"morning" | "night">("morning")
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [note, setNote] = useState("")

  // Fetch user routines
  useEffect(() => {
    const fetchRoutines = async () => {
      if (!user || !token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE}/routines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setRoutines(data)
        }
      } catch (error) {
        console.error("Error fetching routines:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchRoutines()
    }
  }, [user, token, authLoading])

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/products`)
        if (response.ok) {
          const data = await response.json()
          const productsData = Array.isArray(data) ? data : (data.data || [])
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  const getRoutineProducts = (routineType: "morning" | "night"): RoutineProduct[] => {
    const routine = routines.find(r => r.type === routineType);
    return routine ? routine.products.sort((a, b) => a.step_order - b.step_order) : []
  }

  const getMissingCategories = (routineType: "morning" | "night") => {
    const routine = routines.find(r => r.type === routineType)
    if (!routine) return ROUTINE_CATEGORIES
    
    const usedCategories = routine.products.map(item => item.product.category.name)
    return ROUTINE_CATEGORIES.filter(cat => !usedCategories.includes(cat.value))
  }

  const handleAddProduct = async () => {
    if (!user || !token || !selectedProductId) return

    try {
      const response = await fetch(`${API_BASE}/routines/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          note: note,
          type: selectedRoutineType,
        }),
      })

      if (response.ok) {
        // Refresh routines to get updated data
        const routinesResponse = await fetch(`${API_BASE}/routines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (routinesResponse.ok) {
          const updatedRoutines = await routinesResponse.json()
          setRoutines(updatedRoutines)
        }
        
        setIsAddDialogOpen(false)
        setSelectedProductId("")
        setNote("")
        setSelectedRoutineType("morning")
      } else {
        console.error("Failed to add product to routine")
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const handleRemoveProduct = async (routineProductId: string) => {
    if (!user || !token) return

    try {
      const response = await fetch(`${API_BASE}/routine-products/${routineProductId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Refresh routines to get updated data
        const routinesResponse = await fetch(`${API_BASE}/routines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (routinesResponse.ok) {
          const updatedRoutines = await routinesResponse.json()
          setRoutines(updatedRoutines)
        }
      } else {
        console.error("Failed to remove product from routine")
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error removing product:", error)
    }
  }

  const handleUpdateNote = async (routineProductId: string, newNote: string) => {
    if (!user || !token) return

    try {
      const response = await fetch(`${API_BASE}/routine-products/${routineProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: newNote,
        }),
      })

      if (response.ok) {
        // Update the note in the routines state
        setRoutines(prev => prev.map(routine => ({
          ...routine,
          products: routine.products.map(product => 
            product.id === routineProductId 
              ? { ...product, note: newNote }
              : product
          )
        })))
      }
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const getImageUrl = (product: Product): string => {
  const imagePath = product.image_url || product.image_path;
  
  if (!imagePath) return "/placeholder.svg?height=100&width=100";
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Handle Laravel storage paths
  if (imagePath.startsWith("public/")) {
    return `http://localhost:8000/storage/${imagePath.replace("public/", "")}`;
  }
  
  if (imagePath.startsWith("/storage/")) {
    return `http://localhost:8000${imagePath}`;
  }
  
  return imagePath;
}

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center">Memuat rutinitas...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Masuk untuk Melihat Rutinitas</h2>
            <p className="text-muted-foreground mb-6">
              Silakan masuk ke akun Anda untuk membuat dan mengelola rutinitas perawatan kulit pribadi Anda.
            </p>
            <Button onClick={() => router.push("/login?redirect=/rutinku")}>Masuk Sekarang</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const morningProducts = getRoutineProducts("morning")
  const nightProducts = getRoutineProducts("night")
  const missingMorningCategories = getMissingCategories("morning")
  const missingNightCategories = getMissingCategories("night")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rutinitas Kulitku</h1>
        <p className="text-muted-foreground">Atur rutinitas perawatan kulit pagi dan malam kamu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning Routine */}
        <Card className="border-amber-100">
          <CardHeader className="bg-amber-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-600" />
              Rutinitas Pagi
              {missingMorningCategories.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {missingMorningCategories.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {missingMorningCategories.length > 0 && (
              <div className="p-4 border-b bg-amber-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Kategori yang belum ditambahkan:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {missingMorningCategories.map((cat) => (
                        <Badge key={cat.value} variant="outline" className="text-xs">
                          {cat.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              {morningProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada produk di rutinitas pagi</p>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedRoutineType("morning")
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                </div>
              ) : (
                <>
                  {morningProducts.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <img 
                            src={getImageUrl(item.product)} 
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.product.category.name}
                            </Badge>
                            {item.note && (
                              <p className="text-xs text-muted-foreground mt-2">{item.note}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 flex-shrink-0 ml-2"
                            onClick={() => handleRemoveProduct(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setSelectedRoutineType("morning")
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk Lainnya
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Night Routine */}
        <Card className="border-indigo-100">
          <CardHeader className="bg-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-600" />
              Rutinitas Malam
              {missingNightCategories.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {missingNightCategories.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {missingNightCategories.length > 0 && (
              <div className="p-4 border-b bg-indigo-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900 mb-1">
                      Kategori yang belum ditambahkan:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {missingNightCategories.map((cat) => (
                        <Badge key={cat.value} variant="outline" className="text-xs">
                          {cat.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              {nightProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada produk di rutinitas malam</p>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedRoutineType("night")
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                </div>
              ) : (
                <>
                  {nightProducts.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <img 
                            src={getImageUrl(item.product)} 
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.product.category.name}
                            </Badge>
                            {item.note && (
                              <p className="text-xs text-muted-foreground mt-2">{item.note}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 flex-shrink-0 ml-2"
                            onClick={() => handleRemoveProduct(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setSelectedRoutineType("night")
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk Lainnya
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tambah Produk ke Rutinitas {selectedRoutineType === "morning" ? "Pagi" : "Malam"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pilih Produk</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(p => {
                      const currentRoutineProducts = selectedRoutineType === "morning" ? morningProducts : nightProducts
                      return !currentRoutineProducts.some(rp => rp.product_id === p.id.toString())
                    })
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        <div className="flex items-center gap-2">
                          {(product.image_url || product.image_path) && (
                            <img 
                                src={getImageUrl(product)} 
                                alt={product.name}
                                className="w-6 h-6 rounded object-cover"
                            />
                            )}
                          <span>{product.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catatan (Opsional)</Label>
              <Textarea 
                placeholder="Tambahkan catatan tentang penggunaan produk..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button onClick={handleAddProduct} className="w-full" disabled={!selectedProductId}>
              Tambah ke Rutinitas {selectedRoutineType === "morning" ? "Pagi" : "Malam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}