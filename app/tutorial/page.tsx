"use client"

import Link from "next/link"
import { ArrowLeft, Sun, Moon, Droplets, Sparkles, Shield, Heart, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useState } from 'react'

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
function AnimatedSection({ children, className = "" }) {
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

function AnimatedItem({ children, className = "", delay = 0 }) {
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

// Product Popover Component
// Product Popover Component
// Product Popover Component
// Product Popover Component
function ProductPopover({ 
  isVisible, 
  position, 
  products, 
  onClose,
  stepIndex // Add stepIndex to determine position
}: {
  isVisible: boolean
  position: 'left' | 'right'
  products: Array<{ name: string; brand: string; rating: string; image?: string }>
  onClose: () => void
  stepIndex: number // Add this prop
}) {
  if (!isVisible) return null

  // First 4 steps (0-3) use top positioning, last step (8) uses bottom positioning
  const verticalPosition = stepIndex <= 3 ? 'top-1' : 'bottom-1'

  return (
    <div className={`
      absolute ${verticalPosition} z-50 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6
      transform transition-all duration-300 ease-out
      ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      ${position === 'left' ? 'right-full mr-6' : 'left-full ml-6'}
    `}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-xl text-gray-900 dark:text-white">Top Korean Products</h4>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sparkles className="h-8 w-8 text-pink-500 dark:text-pink-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">{product.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.brand}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full font-medium">
                  {product.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Korean products data by category (updated without prices and with image support)
const koreanProducts = {
  cleanser: [
    { 
      name: "Soonjung 6.5 Whip Cleanser", 
      brand: "Etude House", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/soojung.webp"
    },
    { 
      name: "Madagascar Centella Ampoule Foam", 
      brand: "Skin1004", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/centella.png"
    },
    { 
      name: "Low pH Good Morning Gel", 
      brand: "COSRX", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/cosrx.jpeg"
    }
  ],
  toner: [
    { 
      name: "Heartleaf 77% Toner", 
      brand: "Anua", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/anuatoner.png"
    },
    { 
      name: "1025 Dokdo Toner", 
      brand: "Round Lab", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/dokdotoner.png"
    },
    { 
      name: "AHA/BHA Clarifying Toner", 
      brand: "COSRX", 
      rating: "⭐ 4.6",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/cosrxtoner.jpg"
    }
  ],
  serum: [
    { 
      name: "Azelaic Acid 10 Hyaluron Redness Soothing Serum", 
      brand: "Anua", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/anuaserum.webp"
    },
    { 
      name: "Rice 7 Ceramide Hydrating Barrier Serum", 
      brand: "Anua", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/anuaniacinamide.jpeg"
    },
    { 
      name: "Dive-in Low-Molecular Hyaluronic Acid Serum", 
      brand: "Torriden", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/torridenserum.png"
    }
  ],
  moisturizer: [
    { 
      name: "Oat-In Calming Gel Cream", 
      brand: "Purito", 
      rating: "⭐ 4.6",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/puritooat.jpg"
    },
    { 
      name: "Poremizing Light Gel Cream", 
      brand: "Skin1004", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/skin1004moist.png"
    },
    { 
      name: "Dive-In Hyaluronic Acid Soothing Cream", 
      brand: "Torriden", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/torridenmoist.webp"
    }
  ],
  sunscreen: [
    { 
      name: "Relief Sun Rice + Probiotics", 
      brand: "Beauty of Joseon", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/bojss.webp"
    },
    { 
      name: "Madagascar Centella Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++", 
      brand: "Skin1004", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/skin1004ss.png"
    },
    { 
      name: "Hyaluronic Acid Watery Sun Gel SPF 50+ PA++++", 
      brand: "Isntree", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/isntreess.webp"
    }
  ],
  doubleCleanse: [
    { 
      name: "Madagascar Centella Light Cleansing Oil", 
      brand: "Skin1004", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/skin1004oil.jpeg"
    },
    { 
      name: "Heartleaf Pore Control Cleansing Oil", 
      brand: "Anua", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/anuaoil.png"
    },
    { 
      name: "Low pH Niacinamide Micellar Cleansing Water", 
      brand: "Cosrx", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/cosrxmicellar.png"
    }
  ],
  treatment: [
    { 
      name: "AHA 7 Whitehead Power Liquid", 
      brand: "COSRX", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/cosrxpower.webp"
    },
    { 
      name: "BHA Blackhead Power Liquid", 
      brand: "COSRX", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/cosrxbha.webp"
    },
    { 
      name: "Retinol 0.2% Serum", 
      brand: "Manyo", 
      rating: "⭐ 4.6",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/manyo.png"
    }
  ],
  nightCream: [
    { 
      name: "Revive Cream Ginseng + Retinal", 
      brand: "Beauty of Joseon", 
      rating: "⭐ 4.8",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=150&h=150&fit=crop"
    },
    { 
      name: "Vitamin Sleeping Mask", 
      brand: "Laneige", 
      rating: "⭐ 4.9",
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=150&h=150&fit=crop"
    },
    { 
      name: "Cica Sleeping Mask", 
      brand: "COSRX", 
      rating: "⭐ 4.7",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&h=150&fit=crop"
    }
  ],
  nightMoisturizer: [
    { 
      name: "345 Relief Cream", 
      brand: "Dr. Althea", 
      rating: "⭐ 4.8",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/345.webp"
    },
    { 
      name: "Hyaluronic Acid Aqua Gel Cream", 
      brand: "Isntree", 
      rating: "⭐ 4.9",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/isntreemoist.webp"
    },
    { 
      name: "Mighty Bamboo Panthenol Cream", 
      brand: "Purito", 
      rating: "⭐ 4.7",
      image: "https://drcqiugdaqqfhqchlwgq.supabase.co/storage/v1/object/public/Foto-foto%20Sefara/foto-foto%20frontend/puritobamboo.png"
    }
  ]
}

export default function TutorialPage() {
  const heroRef = useRef(null)
  const [activePopover, setActivePopover] = useState<number | null>(null)

  useEffect(() => {
    const cards = document.querySelectorAll('.animated-card')
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px) scale(1.02)'
      })
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0px) scale(1)'
      })
    })

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', () => {})
        card.removeEventListener('mouseleave', () => {})
      })
    }
  }, [])

  const getPopoverPosition = (index: number): 'left' | 'right' => {
    return index % 2 === 0 ? 'right' : 'left'
  }

  const getProductsForStep = (stepIndex: number) => {
    const productMap = {
      0: koreanProducts.cleanser,        // Morning Step 1 - Cleanser
      1: koreanProducts.toner,           // Morning Step 2 - Toner
      2: koreanProducts.serum,           // Morning Step 3 - Serum
      3: koreanProducts.moisturizer,     // Morning Step 4 - Moisturizer
      4: koreanProducts.sunscreen,       // Morning Step 5 - Sunscreen
      5: koreanProducts.doubleCleanse,   // Evening Step 1 - Double Cleansing
      6: koreanProducts.toner,           // Evening Step 2 - Toner
      7: koreanProducts.treatment,       // Evening Step 3 - Treatment Serum
      8: koreanProducts.nightMoisturizer // Evening Step 4 - Night Moisturizer
    }
    return productMap[stepIndex as keyof typeof productMap] || koreanProducts.cleanser
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden"
      >
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-fade-in-up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition mb-6 hover:translate-x-1 transform duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Panduan Lengkap Skincare Routine
          </h1>
          
          <p 
            className="text-lg md:text-xl opacity-90 text-pretty max-w-2xl animate-fade-in-up"
            style={{animationDelay: '0.2s'}}
          >
            Pelajari langkah-langkah penting dalam rutinitas perawatan kulit yang efektif untuk kulit sehat dan
            bercahaya.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <AnimatedSection className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed opacity-80">
            Rutinitas skincare yang baik adalah kunci untuk mendapatkan kulit sehat dan bercahaya. Tidak perlu ribet
            atau menggunakan banyak produk - yang penting adalah konsistensi dan memahami kebutuhan kulit kamu.
          </p>
        </div>
      </AnimatedSection>

      {/* Morning Routine */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-12 md:py-16 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4">
          <AnimatedItem>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-amber-500 p-3 icon-bounce">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Rutinitas Pagi</h2>
            </div>
          </AnimatedItem>

          <div className="space-y-6">
            {/* Step 1 */}
            <AnimatedItem delay={0}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(0)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Cleanser (Pembersih Wajah)</h3>
                      <p className="opacity-80 mb-3">
                        Bersihkan wajah dengan cleanser yang lembut untuk mengangkat kotoran dan minyak yang menumpuk saat
                        tidur. Gunakan air hangat dan pijat lembut dengan gerakan memutar.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover-scale">
                        <Droplets className="h-4 w-4" />
                        <span>Produk: Gentle Cleanser</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 0}
                  position={getPopoverPosition(0)}
                  products={getProductsForStep(0)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={0}
                />
              </div>
            </AnimatedItem>

            {/* Step 2 */}
            <AnimatedItem delay={100}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(1)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Toner</h3>
                      <p className="opacity-80 mb-3">
                        Aplikasikan toner untuk menyeimbangkan pH kulit dan mempersiapkan kulit untuk menyerap produk
                        selanjutnya. Tepuk-tepuk lembut dengan tangan atau gunakan kapas.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover-scale">
                        <Droplets className="h-4 w-4" />
                        <span>Produk: Hydrating Toner</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 1}
                  position={getPopoverPosition(1)}
                  products={getProductsForStep(1)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={1}
                />
              </div>
            </AnimatedItem>

            {/* Step 3 */}
            <AnimatedItem delay={200}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(2)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Serum</h3>
                      <p className="opacity-80 mb-3">
                        Gunakan serum dengan bahan aktif seperti Vitamin C untuk mencerahkan dan melindungi kulit dari
                        radikal bebas. Aplikasikan 2-3 tetes dan tepuk lembut hingga meresap.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover-scale">
                        <Sparkles className="h-4 w-4" />
                        <span>Produk: Vitamin C Serum</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 2}
                  position={getPopoverPosition(2)}
                  products={getProductsForStep(2)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={2}
                />
              </div>
            </AnimatedItem>

            {/* Conditional Step - Oily Skin */}
            <AnimatedItem delay={300}>
              <div className="animated-card bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-blue-200 dark:border-blue-900 transition-all duration-300 hover:shadow-md pulse-gentle">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">Untuk Kulit Berminyak</h3>
                    <p className="opacity-80 mb-3 text-blue-800 dark:text-blue-200">
                      Jika kulit kamu cenderung berminyak, kamu bisa melewati moisturizer di pagi hari dan langsung menggunakan sunscreen yang memiliki tekstur lightweight.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300 hover-scale">
                      <Sparkles className="h-4 w-4" />
                      <span>Tips: Gunakan gel-based sunscreen</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            {/* Step 4 */}
            <AnimatedItem delay={400}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(3)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Moisturizer</h3>
                      <p className="opacity-80 mb-3">
                        Kunci kelembapan dengan moisturizer yang sesuai dengan jenis kulit kamu. Aplikasikan dengan gerakan
                        memutar dari dalam ke luar wajah.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover-scale">
                        <Heart className="h-4 w-4" />
                        <span>Produk: Lightweight Moisturizer</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 3}
                  position={getPopoverPosition(3)}
                  products={getProductsForStep(3)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={4}
                />
              </div>
            </AnimatedItem>

            {/* Step 5 - Sunscreen */}
            <AnimatedItem delay={500}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(4)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-amber-700 dark:text-amber-300">5</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Sunscreen (Paling Penting!)</h3>
                      <p className="opacity-80 mb-3">
                        Langkah terakhir dan TERPENTING! Aplikasikan sunscreen SPF 30+ setiap pagi, bahkan saat mendung.
                        Gunakan 2 jari penuh untuk wajah dan leher, re-apply setiap 2-3 jam.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full hover-scale sunscreen-glow">
                        <Shield className="h-4 w-4" />
                        <span>Produk: Sunscreen SPF 50</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 4}
                  position={getPopoverPosition(4)}
                  products={getProductsForStep(4)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={5}
                />
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Evening Routine */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 py-12 md:py-16 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4">
          <AnimatedItem>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-indigo-500 p-3 icon-bounce">
                <Moon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Rutinitas Malam</h2>
            </div>
          </AnimatedItem>

          <div className="space-y-6">
            {/* Step 1 */}
            <AnimatedItem delay={0}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-indigo-200 dark:border-indigo-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(5)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Double Cleansing</h3>
                      <p className="opacity-80 mb-3">
                        Pertama, gunakan cleansing oil/balm untuk membersihkan makeup dan sunscreen. Lalu, lanjutkan dengan
                        water-based cleanser untuk membersihkan sisa kotoran dan minyak.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover-scale">
                        <Droplets className="h-4 w-4" />
                        <span>Produk: Cleansing Oil + Gentle Cleanser</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 5}
                  position={getPopoverPosition(5)}
                  products={getProductsForStep(5)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={0}
                />
              </div>
            </AnimatedItem>

            {/* Step 2 */}
            <AnimatedItem delay={100}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-indigo-200 dark:border-indigo-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(6)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Toner</h3>
                      <p className="opacity-80 mb-3">
                        Sama seperti pagi, gunakan toner untuk menyeimbangkan pH kulit setelah cleansing. Pilih toner yang
                        menenangkan untuk malam hari.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover-scale">
                        <Droplets className="h-4 w-4" />
                        <span>Produk: Soothing Toner</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 6}
                  position={getPopoverPosition(6)}
                  products={getProductsForStep(6)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={0}
                />
              </div>
            </AnimatedItem>

            {/* Step 3 */}
            <AnimatedItem delay={200}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-indigo-200 dark:border-indigo-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(7)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Treatment Serum</h3>
                      <p className="opacity-80 mb-3">
                        Malam adalah waktu terbaik untuk menggunakan treatment serum dengan bahan aktif seperti Niacinamide,
                        Retinol, atau AHA/BHA. Mulai perlahan jika baru pertama kali.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover-scale">
                        <Sparkles className="h-4 w-4" />
                        <span>Produk: Niacinamide Serum</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 7}
                  position={getPopoverPosition(7)}
                  products={getProductsForStep(7)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={0}
                />
              </div>
            </AnimatedItem>

            {/* Conditional Step - Dry Skin */}
            <AnimatedItem delay={300}>
              <div className="animated-card bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-orange-200 dark:border-orange-900 transition-all duration-300 hover:shadow-md pulse-gentle">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-orange-700 dark:text-orange-300">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-orange-900 dark:text-orange-100">Untuk Kulit Kering</h3>
                    <p className="opacity-80 mb-3 text-orange-800 dark:text-orange-200">
                      Jika kulit kamu cenderung kering, tambahkan facial oil atau sleeping mask setelah moisturizer untuk memberikan kelembapan ekstra.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full text-orange-700 dark:text-orange-300 hover-scale">
                      <Heart className="h-4 w-4" />
                      <span>Tips: Gunakan hyaluronic acid serum</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            {/* Step 4 - Night Moisturizer */}
            <AnimatedItem delay={400}>
              <div className="relative">
                <div 
                  className="animated-card bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-indigo-200 dark:border-indigo-900 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onMouseEnter={() => setActivePopover(8)}
                  onMouseLeave={() => setActivePopover(null)}
                >
                  <div className="flex items-start gap-4">
                    <div className="step-icon rounded-full bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Night Cream / Sleeping Mask</h3>
                      <p className="opacity-80 mb-3">
                        Gunakan night cream yang lebih kaya atau sleeping mask untuk memberikan kelembapan ekstra saat kulit beregenerasi di
                        malam hari. Aplikasikan 2-3x seminggu untuk hasil optimal.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover-scale">
                        <Heart className="h-4 w-4" />
                        <span>Produk: Rich Night Cream / Sleeping Mask</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ProductPopover
                  isVisible={activePopover === 8}
                  position={getPopoverPosition(8)}
                  products={getProductsForStep(8)}
                  onClose={() => setActivePopover(null)}
                  stepIndex={8}
                />
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <AnimatedSection className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Tips Penting</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Konsistensi adalah Kunci",
              content: "Hasil skincare tidak instan. Berikan waktu minimal 4-6 minggu untuk melihat perubahan nyata pada kulit kamu."
            },
            {
              title: "Less is More",
              content: "Tidak perlu menggunakan banyak produk sekaligus. Fokus pada produk-produk dasar yang sesuai dengan kebutuhan kulit."
            },
            {
              title: "Patch Test",
              content: "Selalu lakukan patch test untuk produk baru di belakang telinga atau rahang selama 24-48 jam sebelum aplikasi penuh."
            },
            {
              title: "Sunscreen Wajib!",
              content: "Sunscreen adalah langkah paling penting dalam skincare. Tanpa sunscreen, treatment lain jadi kurang efektif."
            }
          ].map((tip, index) => (
            <AnimatedItem key={index} delay={index * 100}>
              <div className="animated-card bg-card rounded-xl p-6 border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-3">{tip.title}</h3>
                <p className="opacity-80">{tip.content}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <AnimatedItem>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Memulai Skincare Routine Kamu?</h2>
          </AnimatedItem>
          <AnimatedItem delay={100}>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Temukan produk yang tepat untuk jenis kulit kamu di Sefara
            </p>
          </AnimatedItem>
          <AnimatedItem delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/produk"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3 font-medium hover:opacity-90 transition hover-scale"
              >
                Belanja Produk Skincare
              </Link>
              <Link
                href="/profil-kulit"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 font-medium hover:bg-primary-foreground/10 transition hover-scale"
              >
                Isi Profil Kulit
              </Link>
            </div>
          </AnimatedItem>
        </div>
      </section>

      <style jsx>{`
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

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            background-color: #FEF3C7;
          }
          50% {
            background-color: #FDE68A;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .icon-bounce:hover {
          animation: bounce 1s ease;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .pulse-gentle {
          animation: pulse 3s ease-in-out infinite;
        }

        .sunscreen-glow {
          animation: glow 2s ease-in-out infinite;
        }


        .step-icon:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  )
}