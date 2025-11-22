// Admin Middleware - Authorization and protection utilities
import { type NextRequest, NextResponse } from "next/server"

export interface AdminAuthContext {
  isAdmin: boolean
  userId?: string
  token?: string
}

export function withAdminAuth(handler: (req: NextRequest, context: AdminAuthContext) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      // In production, verify JWT token here
      // For now, we'll check if token exists
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const context: AdminAuthContext = {
        isAdmin: true,
        token,
      }

      return handler(req, context)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }
}

// Check if user is admin (client-side)
export function isAdminUser(userRole?: string): boolean {
  return userRole === "admin"
}

// Get admin token from localStorage
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("glowmall:token")
}

// Verify admin access
export function verifyAdminAccess(userRole?: string): boolean {
  return isAdminUser(userRole)
}
