"use client"

import Link from "next/link"
import { MatchScoreCircle } from "@/components/match-score"
import { useAuth } from "./auth/auth-context"

// Define the proper TypeScript interface for the product data
interface Product {
  id: number
  name: string
  slug: string
  price: number
  description: string
  image_url: string
  // Simplified brand/category for this component's purpose
  brand: { name: string }
  category: { name: string }
  match_score?: string | number | null
  match_explanation?: string[]
}

type ProductMatchPanelProps = {
  product: Product | null
}

export function ProductMatchPanel({ product }: ProductMatchPanelProps) {
  const { user, loading: authLoading } = useAuth()

  // If no product data is available, don't render the panel
  if (!product) {
    return null
  }

  const score = product.match_score ? Number(product.match_score) : null
  const explanation = product.match_explanation || []
  const isProfileComplete = !!user?.skin_type

  return (
    <div className="rounded-xl border border-border p-4 bg-muted/50">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">Skor Kecocokan</div>
        {user && (
          <Link href="/profil-kulit" className="text-sm underline">
            Ubah profil
          </Link>
        )}
      </div>
      {authLoading ? (
        <div className="text-sm opacity-80">Menganalisis kecocokan...</div>
      ) : user ? (
        isProfileComplete && typeof score === "number" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <MatchScoreCircle score={Math.round(score)} />
              <div className="text-sm">
                <div className="font-medium">{Math.round(score)}% cocok</div>
                <div className="text-muted-foreground">Semakin tinggi semakin cocok</div>
              </div>
            </div>
            {explanation.length > 0 && (
              <ul className="text-sm space-y-1 list-disc pl-5">
                {explanation.map((line: string, index: number) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="text-sm opacity-80">
            Lengkapi{" "}
            <Link href="/profil-kulit" className="underline">
              profil kulit
            </Link>{" "}
            Anda untuk melihat skor personal.
          </div>
        )
      ) : (
        <div className="text-sm opacity-80">
          <Link href="/login" className="underline">
            Masuk
          </Link>{" "}
          untuk melihat skor kecocokan.
        </div>
      )}
    </div>
  )
}