"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, AlertCircle, Sun, Moon, Droplets, Sparkles, Heart, Shield, ArrowLeft, CheckCircle, Search, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Input } from "@/components/ui/input"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

const MORNING_CATEGORIES = [
  { value: "cleanser", label: "Cleanser", icon: Droplets, color: "from-blue-100 to-cyan-100", iconColor: "text-blue-600" },
  { value: "toner", label: "Toner", icon: Droplets, color: "from-purple-100 to-pink-100", iconColor: "text-purple-600" },
  { value: "serum", label: "Serum", icon: Sparkles, color: "from-amber-100 to-orange-100", iconColor: "text-amber-600" },
  { value: "moisturizer", label: "Moisturizer", icon: Heart, color: "from-green-100 to-emerald-100", iconColor: "text-green-600" },
  { value: "sunscreen", label: "Sunscreen", icon: Shield, color: "from-red-100 to-yellow-100", iconColor: "text-red-600" },
]

const NIGHT_CATEGORIES = [
  { value: "cleanser", label: "Cleanser", icon: Droplets, color: "from-blue-100 to-cyan-100", iconColor: "text-blue-600" },
  { value: "toner", label: "Toner", icon: Droplets, color: "from-purple-100 to-pink-100", iconColor: "text-purple-600" },
  { value: "serum", label: "Serum", icon: Sparkles, color: "from-amber-100 to-orange-100", iconColor: "text-amber-600" },
  { value: "moisturizer", label: "Moisturizer", icon: Heart, color: "from-green-100 to-emerald-100", iconColor: "text-green-600" },
  // Note: Sunscreen removed from night routine
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

// Custom hook for intersection observer
function useOnScreen(ref: any, threshold = 0.1) {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [ref, threshold])

  return isIntersecting
}

// Animation components
function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isVisible = useOnScreen(ref)

  return (
    <section
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </section>
  )
}

function AnimatedItem({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null)
  const isVisible = useOnScreen(ref)

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-600 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
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
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)

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
    const categories = routineType === "morning" ? MORNING_CATEGORIES : NIGHT_CATEGORIES
    
    if (!routine) return categories
    
    const usedCategories = routine.products.map(item => item.product.category.name.toLowerCase())
    return categories.filter(cat => !usedCategories.includes(cat.value))
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
        setSearchQuery("")
        setSelectedCategory("")
        setIsEditMode(false)
        setEditingProductId(null)
      } else {
        console.error("Failed to add product to routine")
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!user || !token || !editingProductId) return

    try {
      const response = await fetch(`${API_BASE}/routine-products/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: note,
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
        setSearchQuery("")
        setSelectedCategory("")
        setIsEditMode(false)
        setEditingProductId(null)
      } else {
        const errorText = await response.text();
        console.error("Failed to update product:", { status: response.status, body: errorText });
      }
    } catch (error) {
      console.error("Error updating product:", error)
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

  const handleEditProduct = (product: RoutineProduct, routineType: "morning" | "night") => {
    setEditingProductId(product.id)
    setSelectedRoutineType(routineType)
    setNote(product.note || "")
    setSelectedProductId(product.product_id)
    setIsEditMode(true)
    setIsAddDialogOpen(true)
  }

  const getImageUrl = (product: Product): string => {
    const imagePath = product.image_url || product.image_path;
    
    if (!imagePath) return "/placeholder.svg?height=100&width=100";
    
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    if (imagePath.startsWith("public/")) {
      return `https://be.sefara.my.id/storage/${imagePath.replace("public/", "")}`;
    }
    
    if (imagePath.startsWith("/storage/")) {
      return `https://be.sefara.my.id${imagePath}`;
    }
    
    return imagePath;
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
                           product.category.name.toLowerCase() === selectedCategory.toLowerCase()
    
    const currentRoutineProducts = selectedRoutineType === "morning" 
      ? getRoutineProducts("morning") 
      : getRoutineProducts("night")
    
    // Don't show products that are already in the current routine (except when editing)
    const isAlreadyInRoutine = currentRoutineProducts.some(rp => 
      rp.product_id === product.id.toString() && 
      (!isEditMode || rp.id !== editingProductId)
    )
    
    return matchesSearch && matchesCategory && !isAlreadyInRoutine
  })

  // Function to render step card
  const renderStepCard = (stepNumber: number, category: any, product?: RoutineProduct, routineType: "morning" | "night" = "morning") => {
    const Icon = category.icon
    const hasProduct = !!product
    const isMorning = routineType === "morning"
    
    return (
      <AnimatedItem key={category.value} delay={stepNumber * 100}>
        <div 
          className={`animated-card relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md cursor-pointer group ${
            hasProduct ? 'border-gray-200 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600'
          }`}
          onMouseEnter={() => setActiveStep(stepNumber)}
          onMouseLeave={() => setActiveStep(null)}
        >
          <div className="flex items-start gap-4">
            <div className={`step-icon rounded-full w-12 h-12 flex items-center justify-center shrink-0 ${
              hasProduct ? `bg-gradient-to-br ${category.color}` : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {hasProduct ? (
                <CheckCircle className={`h-6 w-6 ${category.iconColor}`} />
              ) : (
                <Icon className={`h-6 w-6 ${category.iconColor}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  Step {stepNumber + 1}: {category.label}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hasProduct 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {hasProduct ? '✓ Ditambahkan' : 'Belum ditambahkan'}
                </span>
              </div>
              
              <div className="mb-4">
                {hasProduct ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={getImageUrl(product.product)} 
                          alt={product.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{product.product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.product.category.name}</p>
                        {product.note && (
                          <p className="text-sm text-muted-foreground mt-1 italic">"{product.note}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    Tambahkan {category.label.toLowerCase()} untuk melengkapi rutinitas {isMorning ? 'pagi' : 'malam'} Anda
                  </p>
                )}
              </div>
              
              <Button
                variant={hasProduct ? "destructive" : "default"}
                size="sm"
                className="w-full"
                onClick={(e) => {
                  if (hasProduct) {
                    e.stopPropagation()
                    handleRemoveProduct(product.id)
                  } else {
                    setSelectedRoutineType(routineType)
                    setSelectedProductId("")
                    setNote("")
                    setSearchQuery("")
                    setSelectedCategory(category.value)
                    setIsEditMode(false)
                    setEditingProductId(null)
                    setIsAddDialogOpen(true)
                  }
                }}
              >
                {hasProduct ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Produk
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambahkan {category.label}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Step number indicator */}
          <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            isMorning 
              ? 'bg-amber-500 text-white' 
              : 'bg-indigo-500 text-white'
          }`}>
            {stepNumber + 1}
          </div>
        </div>
      </AnimatedItem>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat rutinitas...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    )
  }

  const morningProducts = getRoutineProducts("morning")
  const nightProducts = getRoutineProducts("night")
  const morningCategories = MORNING_CATEGORIES
  const nightCategories = NIGHT_CATEGORIES

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition hover:translate-x-1 transform duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
              
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                {morningProducts.length + nightProducts.length} Produk
              </Badge>
            </div>
          </AnimatedSection>
          
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Rutinitas Kulitku
            </h1>
          </AnimatedSection>
          
          <AnimatedSection>
            <p className="text-lg md:text-xl opacity-90 text-pretty max-w-2xl">
              Kelola dan pantau rutinitas perawatan kulit pagi dan malam Anda. Lengkapi setiap langkah untuk hasil yang optimal!
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Progress Overview */}
      <AnimatedSection className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-amber-500 p-2">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Rutinitas Pagi</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Langkah terselesaikan</span>
                <span className="font-bold">{morningProducts.length}/{MORNING_CATEGORIES.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(morningProducts.length / MORNING_CATEGORIES.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-indigo-500 p-2">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Rutinitas Malam</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Langkah terselesaikan</span>
                <span className="font-bold">{nightProducts.length}/{NIGHT_CATEGORIES.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(nightProducts.length / NIGHT_CATEGORIES.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-green-500 p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Progress Total</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total langkah</span>
                <span className="font-bold">{(morningProducts.length + nightProducts.length)}/{MORNING_CATEGORIES.length + NIGHT_CATEGORIES.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((morningProducts.length + nightProducts.length) / (MORNING_CATEGORIES.length + NIGHT_CATEGORIES.length)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Morning Routine */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-12 md:py-16 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-amber-500 p-3 icon-bounce">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Rutinitas Pagi</h2>
                <p className="text-muted-foreground mt-2">
                  Awali hari dengan rutinitas yang tepat untuk kulit sehat dan terlindungi
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {morningCategories.map((category, index) => {
              const product = morningProducts.find(p => 
                p.product.category.name.toLowerCase() === category.value
              );
              return renderStepCard(index, category, product, "morning");
            })}
          </div>
        </div>
      </section>

      {/* Night Routine */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 py-12 md:py-16 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-indigo-500 p-3 icon-bounce">
                <Moon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Rutinitas Malam</h2>
                <p className="text-muted-foreground mt-2">
                  Regenerasi kulit saat tidur dengan rutinitas malam yang tepat
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {nightCategories.map((category, index) => {
              const product = nightProducts.find(p => 
                p.product.category.name.toLowerCase() === category.value
              );
              return renderStepCard(index, category, product, "night");
            })}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <AnimatedSection className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Tips Rutinitas Sehat</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Konsistensi",
              description: "Gunakan produk secara rutin minimal 4 minggu untuk hasil maksimal",
              icon: CheckCircle,
              color: "text-green-600 bg-green-100 dark:bg-green-900/20"
            },
            {
              title: "Urutan Tepat",
              description: "Ikuti urutan: cleanser → toner → serum → moisturizer → sunscreen",
              icon: Sparkles,
              color: "text-amber-600 bg-amber-100 dark:bg-amber-900/20"
            },
            {
              title: "Patch Test",
              description: "Selalu test produk baru di area kecil sebelum penggunaan penuh",
              icon: AlertCircle,
              color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
            },
            {
              title: "Sunscreen Pagi",
              description: "Sunscreen hanya untuk pagi, tidak perlu di malam hari",
              icon: Shield,
              color: "text-red-600 bg-red-100 dark:bg-red-900/20"
            }
          ].map((tip, index) => (
            <AnimatedItem key={index} delay={index * 100}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-full ${tip.color} flex items-center justify-center mb-4`}>
                  <tip.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                <p className="text-muted-foreground">{tip.description}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </AnimatedSection>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg p-6 sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRoutineType === "morning" ? (
                <Sun className="h-5 w-5 text-amber-600" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
              {isEditMode ? "Edit Catatan Produk" : "Tambah Produk ke Rutinitas"} {selectedRoutineType === "morning" ? "Pagi" : "Malam"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!isEditMode ? (
              <>
                {/* Search input */}
                <div className="space-y-2">
                  <Label>Cari Produk</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari produk atau kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Category filter */}
                <div className="space-y-2">
                  <Label>Filter berdasarkan Kategori</Label>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua kategori</SelectItem>
                      {selectedRoutineType === "morning" 
                        ? MORNING_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))
                        : NIGHT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* Product list */}
                <div className="space-y-2">
                  <Label>Pilih Produk</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Tidak ada produk ditemukan</p>
                        <p className="text-sm">Coba kata kunci lain atau kategori berbeda</p>
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                            selectedProductId === product.id.toString()
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setSelectedProductId(product.id.toString())}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={getImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium break-words">{product.name}</p>
                            <p className="text-sm text-muted-foreground break-words">{product.category.name}</p>
                          </div>
                          {selectedProductId === product.id.toString() && (
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Produk yang Dipilih</Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">
                    {products.find(p => p.id.toString() === selectedProductId)?.name || "Produk tidak ditemukan"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {products.find(p => p.id.toString() === selectedProductId)?.category.name}
                  </p>
                </div>
              </div>
            )}
            
            {/* Note input */}
            <div className="space-y-2">
              <Label>Catatan Penggunaan {isEditMode && "(Edit)"}</Label>
              <Textarea 
                placeholder="Contoh: 'Gunakan 2 tetes pada area T-zone' atau 'Aplikasikan sebelum moisturizer'"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Tambahkan petunjuk penggunaan khusus untuk produk ini
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setSelectedProductId("")
                  setNote("")
                  setSearchQuery("")
                  setSelectedCategory("")
                  setIsEditMode(false)
                  setEditingProductId(null)
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={isEditMode ? handleUpdateProduct : handleAddProduct}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                disabled={!isEditMode && !selectedProductId}
              >
                {isEditMode ? "Simpan Perubahan" : "Tambahkan ke Rutinitas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .icon-bounce:hover {
          animation: bounce 1s ease;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .step-icon:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        .animated-card {
          transition: all 0.3s ease;
        }

        .animated-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  )
}