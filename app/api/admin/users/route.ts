import { type NextRequest, NextResponse } from "next/server"

const users: any[] = [
  { id: "1", email: "user@example.com", name: "John Doe", role: "user", createdAt: new Date().toISOString() },
  { id: "2", email: "jane@example.com", name: "Jane Smith", role: "user", createdAt: new Date().toISOString() },
  { id: "3", email: "admin@glowmall.com", name: "Admin", role: "admin", createdAt: new Date().toISOString() },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""

  try {
    let filtered = users.slice()

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (u) => u.email.toLowerCase().includes(searchLower) || u.name.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
