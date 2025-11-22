export type MatchProfile = {
  skinType: "kering" | "normal" | "kombinasi" | "berminyak"
  sensitivity: "rendah" | "sedang" | "tinggi"
  goals: string[]
}

export function computeMatchScore(product: any, profile?: MatchProfile | null): number | null {
  if (!profile) return null

  let score = 0
  let possible = 0

  // Skin type compatibility
  possible += 40
  if (product.suitableSkinTypes?.includes(profile.skinType)) score += 32
  else if (product.suitableSkinTypes) score += 12 // partial

  // Sensitivity consideration
  possible += 20
  if (profile.sensitivity === "tinggi") {
    // penalize if contains potential irritants (AHA/BHA/retinol)
    const irritants = ["AHA", "BHA", "retinol"]
    const hasIrritant = product.tags?.some((t: string) => irritants.includes(t.toUpperCase()))
    score += hasIrritant ? 5 : 18
  } else {
    score += 15
  }

  // Goal matching (hydrates/brightening/acne/anti-aging)
  possible += 30
  const goalMap: Record<string, string[]> = {
    hidrasi: ["HYALURONIC ACID", "GLYCERIN", "CERAMIDE", "PANTHENOL"],
    mencerahkan: ["NIACINAMIDE", "VITAMIN C", "ALPHA ARBUTIN"],
    "anti-jerawat": ["SALICYLIC ACID", "BHA", "TEA TREE", "AZELAIC ACID"],
    "anti-aging": ["RETINOL", "PEPTIDES", "CERAMIDE"],
  }
  let goalHits = 0
  for (const g of profile.goals || []) {
    const expect = goalMap[g] || []
    if (product.tags?.some((t: string) => expect.includes(t.toUpperCase()))) goalHits++
  }
  score += Math.min(goalHits * 10, 30)

  // Category soft weight
  possible += 10
  if (profile?.goals?.includes("anti-jerawat") && product?.category === "cleanser") score += 6
  else score += 4

  return Math.max(0, Math.min(100, Math.round((score / possible) * 100)))
}
