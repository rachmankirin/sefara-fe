import { type NextRequest, NextResponse } from "next/server"

// Mock database for users
const usersDB: any[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "John Doe",
    skinType: "kombinasi",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "jane@example.com",
    name: "Jane Smith",
    skinType: "kering",
    createdAt: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(usersDB)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newUser = {
    id: Date.now().toString(),
    email: body.email,
    name: body.name,
    skinType: body.skinType || "",
    createdAt: new Date().toISOString(),
  }
  usersDB.push(newUser)
  return NextResponse.json(newUser, { status: 201 })
}
