"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface AdminStatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

export function AdminStatsCard({ label, value, icon: Icon, color, trend }: AdminStatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend.direction === "up" ? "+" : "-"}
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}
