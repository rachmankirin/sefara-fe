"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Star, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"
const BACKEND_URL = "https://be.sefara.my.id"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching products, categories, and brands from API...")
        
        // Fetch products, categories, and brands concurrently
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/brands`)
        ])

        // Handle products response
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          console.log("[v0] Products API response:", productsData)
          const productsArray = productsData.data || productsData
          setProducts(Array.isArray(productsArray) ? productsArray : [])
        } else {
          console.error("[v0] Failed to fetch products:", productsRes.status)
          setProducts([])
        }

        // Handle categories response
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          console.log("[v0] Categories API response:", categoriesData)
          const categoriesArray = categoriesData.data || categoriesData
          setCategories(Array.isArray(categoriesArray) ? categoriesArray : [])
        } else {
          console.error("[v0] Failed to fetch categories:", categoriesRes.status)
          setCategories([])
        }

        // Handle brands response
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json()
          console.log("[v0] Brands API response:", brandsData)
          const brandsArray = brandsData.data || brandsData
          setBrands(Array.isArray(brandsArray) ? brandsArray : [])
        } else {
          console.error("[v0] Failed to fetch brands:", brandsRes.status)
          setBrands([])
        }

      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setProducts([])
        setCategories([])
        setBrands([])
      } finally {
        setLoading(false)
        setCategoriesLoading(false)
        setBrandsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap())
    }

    carouselApi.on("select", onSelect)
    onSelect()

    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  // Auto-slide carousel
  useEffect(() => {
    if (!carouselApi) return

    const interval = setInterval(() => {
      carouselApi.scrollNext()
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [carouselApi])

  const getItemScale = useCallback(
    (index: number) => {
      if (hoveredIndex === index) return "scale-105"
      const distance = Math.abs(index - selectedIndex)
      if (distance === 0) return "scale-100"
      if (distance === 1) return "scale-95"
      return "scale-75"
    },
    [selectedIndex, hoveredIndex],
  )

  const getItemOpacity = useCallback(
    (index: number) => {
      if (hoveredIndex === index) return "opacity-100"
      const distance = Math.abs(index - selectedIndex)
      if (distance === 0) return "opacity-100"
      if (distance === 1) return "opacity-80"
      return "opacity-60"
    },
    [selectedIndex, hoveredIndex],
  )

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg"
    if (imageUrl.startsWith("http")) return imageUrl
    return `${BACKEND_URL}${imageUrl}`
  }

  // Get product images for carousel (first 6 products with images)
  const carouselImages = products
    .filter(product => product.image_url || product.image)
    .slice(0, 6)
    .map(product => ({
      src: getImageUrl(product.image_url || product.image),
      alt: product.name,
      productSlug: product.slug
    }))

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

  return (
    <div className="animate-fade-in">
      {/* Hero Section with Animation */}
      <section className="bg-primary text-primary-foreground overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="space-y-4 md:col-span-2 animate-slide-in-left text-center md:text-left">
              <p className="text-xs md:text-sm uppercase tracking-wide opacity-80 animate-pulse">Skincare Indonesia</p>
              <h1 className="text-3xl md:text-5xl font-semibold text-balance animate-fade-in-up leading-tight">
                Temukan skincare yang cocok untuk kulit kamu.
              </h1>
              <p className="text-sm md:text-base text-pretty opacity-90 animate-fade-in-up delay-300 max-w-md mx-auto md:mx-0">
                Sefara memudahkan kamu mencari produk dari berbagai kategori. Isi profil kulit untuk skor kecocokan
                personal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in-up delay-500 pt-2">
                <Link
                  href="/produk"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:scale-105 transform transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  Jelajahi Produk <ArrowRight className="h-4 w-4 animate-bounce-x" />
                </Link>
                <Link
                  href="/brand-list"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm font-medium hover:scale-105 transform transition-all duration-300 hover:bg-foreground/10 active:scale-95"
                >
                  Semua Brand
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-border bg-card/50 h-56 md:h-80 animate-slide-in-right mt-4 md:mt-0">
              <img
                src="/images/skincare-hero.jpg"
                alt="Ilustrasi produk skincare"
                className="w-full h-full object-cover hover:scale-110 transform transition duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-6xl px-4 relative z-10 -mt-12 md:-mt-20 pb-12">
        <h3 className="text-xl font-semibold mb-4 animate-fade-in">Produk Pilihan</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-8 opacity-70 animate-fade-in">Belum ada produk tersedia</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {products.slice(0, 4).map((p, index) => (
              <Link
                key={p.id || p.slug}
                href={`/produk/${p.slug}`}
                className="rounded-xl border border-border bg-card p-3 md:p-4 hover:bg-muted transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-3 group relative">
                  <img 
                    src={getImageUrl(p.image_url || p.image)} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transform transition duration-500"
                  />
                  {/* Mobile quick add button could go here */}
                </div>
                <div className="flex flex-col justify-between flex-grow gap-2">
                  <div>
                    <p className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.category?.name || p.categoryLabel || "Produk"}</p>
                  </div>
                  <p className="font-semibold text-primary text-sm md:text-base">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Gallery Carousel Section with Auto-slide - Using Product Images from API */}
      <section className="py-12 bg-gradient-to-b from-transparent to-muted/30">
        <div className="mx-auto max-w-6xl px-4 mb-6">
          <h3 className="text-xl font-semibold animate-fade-in">Galeri Produk</h3>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : carouselImages.length === 0 ? (
          <p className="text-center py-8 opacity-70 animate-fade-in">Belum ada gambar produk tersedia</p>
        ) : (
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
                  <Link href={`/produk/${image.productSlug}`}>
                    <div
                      className={`transition-all duration-500 ease-out ${getItemScale(index)} ${getItemOpacity(index)} cursor-pointer group`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="rounded-xl overflow-hidden border border-border bg-card shadow-lg group-hover:shadow-2xl transition-all duration-500">
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transform transition duration-700"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end">
                          <div className="p-4 text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <p className="font-semibold">{image.alt}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 hover:scale-110 transform transition-all" />
            <CarouselNext className="right-4 hover:scale-110 transform transition-all" />
          </Carousel>
        )}
      </section>

      {/* Dynamic Categories Section */}
      {/* Dynamic Categories Section - Flashy Version */}
<section className="mx-auto max-w-6xl px-4 py-12">
  <div className="rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-500 group p-8 relative overflow-hidden">
    {/* Background decorative elements */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full translate-y-16 -translate-x-16"></div>
    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
    
    {/* Header */}
    <div className="text-center mb-8 relative z-10">
      <Badge className="mb-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 px-4 py-1.5 hover:scale-105 transform transition-all duration-300">
        ✨ Kategori Unggulan
      </Badge>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3 group-hover:scale-105 transform transition-transform duration-300">
        Jelajahi Kategori
      </h2>
      <p className="text-lg opacity-80 max-w-2xl mx-auto">
        Temukan produk skincare perfect match berdasarkan kategori favoritmu
      </p>
    </div>

    {categoriesLoading ? (
      <div className="flex justify-center items-center py-12">
        <div className="flex space-x-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse"
              style={{ animationDelay: `${n * 100}ms` }}
            ></div>
          ))}
        </div>
      </div>
    ) : categories.length === 0 ? (
      <div className="text-center py-12 opacity-70 animate-fade-in relative z-10">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <p>Belum ada kategori tersedia</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 relative z-10">
        {categories.slice(0, 6).map((category, index) => {
          const colors = [
            "from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border-blue-200/50",
            "from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 hover:to-rose-600/30 border-pink-200/50",
            "from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 border-green-200/50",
            "from-orange-500/20 to-red-600/20 hover:from-orange-500/30 hover:to-red-600/30 border-orange-200/50",
            "from-purple-500/20 to-indigo-600/20 hover:from-purple-500/30 hover:to-indigo-600/30 border-purple-200/50",
            "from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border-cyan-200/50",
          ]
          const icons = ["💆‍♀️", "✨", "🌟", "💫", "🎯", "❤️"]
          const colorClass = colors[index % colors.length]
          const icon = icons[index % icons.length]

          return (
            <Link
              key={category.slug || category.id}
              href={`/produk?kategori=${encodeURIComponent(category.slug || category.name)}`}
              className={`group relative rounded-2xl bg-gradient-to-br ${colorClass} border-2 backdrop-blur-sm p-3 md:p-4 text-center hover:scale-105 md:hover:scale-110 transform transition-all duration-500 hover:shadow-2xl animate-fade-in-up hover:z-20 active:scale-95`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all duration-500"></div>
              
              {/* Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 group-hover:rotate-12 transform transition-all duration-500">
                <span className="text-lg md:text-xl">{icon}</span>
              </div>
              
              {/* Category Name */}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-xs md:text-sm leading-tight mb-1 md:mb-2 line-clamp-2">
                {category.name}
              </h3>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Link>
          )
        })}
      </div>
    )}

    {/* View All Button */}
    <div className="text-center mt-8 relative z-10">
      <Link
        href="/produk"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 text-sm md:text-base hover:scale-105 transform transition-all duration-300 hover:shadow-xl group active:scale-95"
      >
        <span className="font-semibold">Lihat Semua Kategori</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    {/* Floating particles */}
    <div className="absolute top-4 left-8 w-2 h-2 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
    <div className="absolute top-12 right-12 w-1 h-1 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
    <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
    <div className="absolute bottom-16 right-8 w-1 h-1 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
  </div>
</section>

      {/* Skin Care Routine Section - Full size image on left */}
      <section className="py-12">
        <div className="rounded-none md:rounded-xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-500 group relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="grid md:grid-cols-5 gap-0 items-stretch relative z-10">
            {/* Full size image on the left - takes 3/5 of the space */}
            <div className="md:col-span-3 h-96 md:h-[500px] overflow-hidden relative">
              <img
                src="/images/skincareroutine.png"
                alt="Skin care routine steps"
                className="w-full h-full object-cover group-hover:scale-105 transform transition duration-700"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:hidden"></div>
              <div className="absolute bottom-4 left-4 md:hidden">
                <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm">
                  ✨ Personal Routine
                </Badge>
              </div>
            </div>
            
            {/* Text and button on the right - takes 2/5 of the space */}
            <div className="md:col-span-2 p-8 space-y-6 animate-fade-in flex flex-col justify-center bg-gradient-to-br from-background to-muted/30">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 backdrop-blur-sm">
                  🎯 Personalized
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Rutinitas Skincare yang Tepat
                </h3>
                <p className="opacity-80 mb-6 text-lg leading-relaxed">
                  Temukan panduan lengkap untuk merawat kulit sesuai jenis dan kebutuhan Anda. 
                  Dari basic routine hingga advanced treatment, kami bantu Anda mencapai kulit sehat dan glowing.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm opacity-80">Custom routine berdasarkan jenis kulit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm opacity-80">Step-by-step panduan aplikasi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm opacity-80">Rekomendasi produk terbaik</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm opacity-80">Tips dan trick profesional</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/rutinku"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 hover:scale-105 transform transition-all duration-300 hover:shadow-2xl group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                  <Star className="h-5 w-5 animate-pulse" />
                  <span className="font-semibold text-lg">Buat Rutinitas Kamu</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/tutorial"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-transparent text-foreground px-6 py-4 hover:scale-105 transform transition-all duration-300 hover:bg-primary/5 hover:border-primary/50 group"
                >
                  <span className="font-medium">Pelajari Tutorial</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Stats */}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands Section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-500 group">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                Brand Populer
              </h3>
              <p className="text-sm opacity-70 mt-2">
                Temukan brand skincare terbaik dengan produk-produk berkualitas
              </p>
            </div>
            <Link
              href="/brand-list"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 hover:scale-105 transform transition-all duration-300 hover:shadow-lg group"
            >
              Lihat Semua Brand
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {brandsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : brands.length === 0 ? (
            <p className="text-center py-12 opacity-70 animate-fade-in">Belum ada brand tersedia</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {brands.slice(0, 6).map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/brand-list/${slugify(brand.name)}`}
                  className="group"
                >
                  <Card className="aspect-square bg-muted/50 hover:bg-card transition-all duration-300 border border-border hover:shadow-xl rounded-2xl overflow-hidden group-hover:scale-105 active:scale-95">
                    <CardContent className="p-0 h-full flex flex-col items-center justify-center relative">
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient(index)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      
                      {/* Brand Logo */}
                      <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-2xl shadow-lg border border-border overflow-hidden p-2 md:p-3 z-10">
                        <img
                          src={getImageUrl(brand.logo_url) || "/placeholder.svg"}
                          alt={`${brand.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Brand Name */}
                      <div className="mt-3 md:mt-4 text-center z-10 px-2 w-full">
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-xs md:text-base truncate w-full">
                          {brand.name}
                        </h4>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] md:text-xs text-gray-600">
                            {getProductCount(brand)} Produk
                          </span>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-2xl"></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>

      {/* Footer Section */}
      <footer className="bg-primary text-primary-foreground py-12 mt-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sefara</h3>
              <p className="text-sm opacity-80">
                Platform terpercaya untuk menemukan produk skincare yang cocok untuk kulit Indonesia.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                  <span className="sr-only">Facebook</span>
                  {/* Add social media icons here */}
                </a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                  <span className="sr-only">Twitter</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tautan Cepat</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/produk" className="opacity-70 hover:opacity-100 transition-opacity">
                    Semua Produk
                  </Link>
                </li>
                <li>
                  <Link href="/produk" className="opacity-70 hover:opacity-100 transition-opacity">
                    Kategori
                  </Link>
                </li>
                <li>
                  <Link href="/brand-list" className="opacity-70 hover:opacity-100 transition-opacity">
                    Semua Brand
                  </Link>
                </li>
                <li>
                  <Link href="/tutorial" className="opacity-70 hover:opacity-100 transition-opacity">
                    Skin Care Routine
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bantuan</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    Kontak Kami
                  </Link>
                </li>
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="" className="opacity-70 hover:opacity-100 transition-opacity">
                    Kebijakan Pengembalian
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()} Sefara. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            33% { 
              transform: translateY(-10px) rotate(120deg); 
            }
            66% { 
              transform: translateY(-5px) rotate(240deg); 
            }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shine {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
        .animate-shine {
            animation: shine 3s infinite;
          }
        @keyframes fade-in-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>
    </div>
  )
}