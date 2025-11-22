"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, LogIn, Search, Store } from "lucide-react"
import { useSWRLocalStorage } from "@/lib/swr-local"
import { useAuth } from "@/components/auth/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function SiteHeader() {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const { data: cart } = useSWRLocalStorage("gm_cart", [] as any[])
  const [isCartAnimating, setIsCartAnimating] = useState(false)

  console.log("[v0] Header render - user:", user, "loading:", loading)

  const handleLogout = async () => {
    try {
      console.log("[v0] Logout clicked")
      await logout()
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const handleCartClick = () => {
    setIsCartAnimating(true)
    // Navigate to cart page
    router.push("/keranjang")
    // Reset animation after it completes
    setTimeout(() => setIsCartAnimating(false), 600)
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/95 text-primary-foreground border-b border-primary/30 shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        {/* Larger Logo with subtle animation */}
        <Link 
          href="/" 
          aria-label="Beranda" 
          className="shrink-0 rounded-full p-1.5 hover:scale-105 transition-transform duration-200 bg-background/10 hover:bg-background/20 backdrop-blur-sm"
        >
          <img
            src="/images/design-mode/1.png"
            alt="Logo Beranda"
            className="h-12 w-12 rounded-full ring-2 ring-primary-foreground/20 shadow-md"
          />
        </Link>

        {/* Enhanced Search Bar */}
        <button
          aria-label="Cari produk skincare"
          onClick={() => router.push("/produk?openSearch=1")}
          className="flex-1 rounded-full px-5 py-3 bg-background/95 text-foreground border-2 border-background/30 shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3 hover:border-background/50 focus:border-background/70"
        >
          <Search className="h-5 w-5 opacity-80" />
          <span className="text-sm opacity-80 font-medium">Cari produk skincare...</span>
        </button>

        {/* Brand Link with enhanced styling */}
        <Link
          href="/brand-list"
          className="rounded-full px-4 py-2.5 hover:bg-background/20 transition-all duration-200 inline-flex items-center gap-2 border border-transparent hover:border-background/30"
          aria-label="Daftar Brand"
        >
          <Store className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Brand</span>
        </Link>

        {/* Cart with animation effects */}
        <button 
          onClick={handleCartClick}
          className={`relative rounded-full p-2.5 transition-all duration-300 border border-transparent hover:border-background/30 group ${
            isCartAnimating 
              ? "animate-cart-bounce bg-background/30 scale-110" 
              : "hover:bg-background/20"
          }`}
          aria-label="Keranjang"
        >
          {/* Cart icon with multiple animation states */}
          <ShoppingCart className={`h-5 w-5 transition-all duration-300 ${
            isCartAnimating 
              ? "scale-125 -rotate-12" 
              : "group-hover:scale-110"
          }`} />
          
          {/* Subtle pulse effect when cart has items */}
          {cart && cart.length > 0 && (
            <>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-accent/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
              
              {/* Subtle dot indicator */}
              <div className="absolute -top-1 -right-1">
                <div className="relative">
                  {/* Outer pulse ring */}
                  <div className="absolute -inset-1 rounded-full bg-accent/40 animate-ping" />
                  {/* Inner dot */}
                  <div className="relative h-2 w-2 rounded-full bg-accent shadow-sm" />
                </div>
              </div>
            </>
          )}
        </button>

        {loading ? (
          <div className="rounded-full p-2.5">
            <div className="h-8 w-8 animate-pulse bg-background/30 rounded-full" />
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="rounded-full p-1.5 hover:bg-background/20 transition-all duration-200 border border-transparent hover:border-background/30" 
                aria-label="Profil"
              >
                {(() => {
                  const display: string = user?.name || user?.email || "Profil"
                  const initial = (display || "P").trim().charAt(0)?.toUpperCase() || "P"
                  return (
                    <div
                      className="h-8 w-8 rounded-full grid place-items-center font-bold bg-background text-foreground ring-2 ring-primary-foreground/30 shadow-md text-sm"
                      aria-hidden
                    >
                      {initial}
                    </div>
                  )
                })()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-2 border-border shadow-xl">
              <DropdownMenuItem onClick={() => router.push("/profil")} className="cursor-pointer py-2.5">
                Edit Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/pesanan")} className="cursor-pointer py-2.5">
                Pesanan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-destructive focus:text-destructive">
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="rounded-full p-2.5 hover:bg-background/20 transition-all duration-200 inline-flex items-center gap-2 border border-transparent hover:border-background/30"
            aria-label="Masuk"
          >
            <LogIn className="h-5 w-5" />
          </Link>
        )}
      </div>

      <style jsx>{`
        @keyframes cart-bounce {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1) rotate(5deg); }
          50% { transform: scale(1.15) rotate(-5deg); }
          75% { transform: scale(1.1) rotate(2deg); }
        }
        .animate-cart-bounce {
          animation: cart-bounce 0.6s ease-in-out;
        }
      `}</style>
    </header>
  )
}