"use client"
import { cn } from "@/lib/utils"

export function MatchScoreCircle({
  score,
  size = 72,
  className,
  label = "Kecocokan",
}: {
  score: number
  size?: number
  className?: string
  label?: string
}) {
  const colorClass =
    score <= 40 ? "bg-red-500" : score <= 60 ? "bg-orange-500" : score <= 85 ? "bg-green-500" : "bg-blue-500"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        aria-label={`${label}: ${score} dari 100`}
        role="img"
        className={cn("rounded-full text-white flex items-center justify-center font-semibold", colorClass)}
        style={{ width: size, height: size }}
      >
        {score}
      </div>
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">1-100 (lebih tinggi lebih cocok)</div>
      </div>
    </div>
  )
}
