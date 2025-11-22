export type ProductLike = {
  tags?: string[]
  category?: string
}

type ScoreColor = "red" | "orange" | "green" | "blue"

export function computeMatchScore(
  userPrefs: { skinType?: string; concerns?: string[] } | undefined,
  product: ProductLike,
): { score: number; color: ScoreColor; reasons: string[] } {
  if (!userPrefs) return { score: 50, color: "orange", reasons: ["Lengkapi profil kulit untuk hasil lebih akurat."] }

  let score = 50
  const reasons: string[] = []
  const tags = new Set((product.tags || []).map((t) => t.toLowerCase()))

  // Skin type signals
  const st = (userPrefs.skinType || "").toLowerCase()
  if (st) {
    if (tags.has(`${st}-friendly`) || tags.has(`${st}-safe`)) {
      score += 20
      reasons.push(`Cocok untuk kulit ${st}`)
    } else if (tags.has(`${st}-avoid`)) {
      score -= 25
      reasons.push(`Kurang cocok untuk kulit ${st}`)
    }
  }

  // Concerns mapping
  for (const c of userPrefs.concerns || []) {
    const key = c.toLowerCase()
    if (tags.has(`targets-${key}`) || tags.has(key)) {
      score += 10
      reasons.push(`Menargetkan concern: ${c}`)
    }
  }

  score = Math.max(1, Math.min(100, score))

  let color: ScoreColor = "orange"
  if (score <= 40) color = "red"
  else if (score <= 60) color = "orange"
  else if (score <= 85) color = "green"
  else color = "blue"

  return { score, color, reasons }
}
