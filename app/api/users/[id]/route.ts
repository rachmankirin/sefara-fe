import { type NextRequest, NextResponse } from "next/server"

// Mock database
let usersDB: any[] = [
  { id: "1", email: "user@example.com", name: "John Doe" },
  { id: "2", email: "jane@example.com", name: "Jane Smith" },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const user = usersDB.find((u) => u.id === id)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()
  const userIndex = usersDB.findIndex((u) => u.id === id)

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  usersDB[userIndex] = { ...usersDB[userIndex], ...body }
  return NextResponse.json(usersDB[userIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  usersDB = usersDB.filter((u) => u.id !== id)
  return NextResponse.json({ success: true })
}
