"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Settings, Lock, Bell, Palette } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== "admin") return null

  const settingsSections = [
    {
      icon: Lock,
      title: "Security",
      description: "Manage password and security settings",
      items: [
        { label: "Change Password", action: "change-password" },
        { label: "Two-Factor Authentication", action: "2fa" },
      ],
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure notification preferences",
      items: [
        { label: "Email Notifications", action: "email-notifications" },
        { label: "Order Alerts", action: "order-alerts" },
      ],
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize admin panel appearance",
      items: [
        { label: "Theme Settings", action: "theme" },
        { label: "Layout Preferences", action: "layout" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Admin Settings</h1>
        </div>

        <div className="grid gap-6">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-2 ml-16">
                  {section.items.map((item) => (
                    <Button key={item.action} variant="outline" className="w-full justify-start bg-transparent">
                      {item.label}
                    </Button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Admin Info */}
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Admin Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input value={user.email} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={user.name || "Admin"} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <Input value={user.role} disabled className="mt-1" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
