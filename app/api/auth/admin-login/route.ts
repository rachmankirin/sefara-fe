import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 })
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ message: errorData.message || "Invalid credentials" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      token: data.token,
      user: data.user,
      message: data.message || "Admin login successful",
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
