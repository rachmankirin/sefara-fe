import { type NextRequest, NextResponse } from "next/server"

// Mock database
let users: any[] = [
  { id: "1", email: "user@example.com", name: "John Doe", role: "user", createdAt: new Date().toISOString() },
  { id: "2", email: "jane@example.com", name: "Jane Smith", role: "user", createdAt: new Date().toISOString() },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const user = users.find((u) => u.id === id)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  users[userIndex] = { ...users[userIndex], ...body }
  return NextResponse.json(users[userIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  users = users.filter((u) => u.id !== id)
  return NextResponse.json({ success: true })
}
