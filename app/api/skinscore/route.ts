import { type NextRequest, NextResponse } from "next/server"

// Mock database for skin scores
const skinScoresDB: any[] = [
  { id: "1", userId: "1", productId: "1", score: 8.5, compatibility: "Sangat cocok" },
  { id: "2", userId: "1", productId: "2", score: 7.2, compatibility: "Cocok" },
  { id: "3", userId: "2", productId: "3", score: 9.1, compatibility: "Sangat cocok" },
]

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  const productId = request.nextUrl.searchParams.get("productId")

  let filtered = skinScoresDB

  if (userId) {
    filtered = filtered.filter((s) => s.userId === userId)
  }

  if (productId) {
    filtered = filtered.filter((s) => s.productId === productId)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newScore = {
    id: Date.now().toString(),
    userId: body.userId,
    productId: body.productId,
    score: body.score,
    compatibility: body.compatibility || "Netral",
  }
  skinScoresDB.push(newScore)
  return NextResponse.json(newScore, { status: 201 })
}
