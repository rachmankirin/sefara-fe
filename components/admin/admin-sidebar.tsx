"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Users, ShoppingCart, Tag, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Tag, label: "Brands", href: "/admin/brands" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="w-64 bg-muted/50 border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full gap-2 justify-start bg-transparent"
          onClick={() => {
            logout()
            window.location.href = "/admin"
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
