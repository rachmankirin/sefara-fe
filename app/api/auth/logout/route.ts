import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    return NextResponse.json({
      message: "Logout successful",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
