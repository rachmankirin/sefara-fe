import { type NextRequest, NextResponse } from "next/server"

// NOTE: For now, this returns an empty array. Wire to your local storage or data file as needed.
// #command: When moving to Laravel, point your frontend to your Laravel reviews endpoint and remove this.
export async function GET(_req: NextRequest, _ctx: { params: { slug: string } }) {
  return NextResponse.json([])
}

export async function POST(req: NextRequest, _ctx: { params: { slug: string } }) {
  const body = await req.json()
  // #command: Persist to your Laravel endpoint instead of returning echo data
  return NextResponse.json({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...body,
  })
}
