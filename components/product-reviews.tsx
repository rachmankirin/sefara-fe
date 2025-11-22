"use client"

import type React from "react"
import { useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSWRLocalStorage } from "@/lib/swr-local"

type Review = {
  id: string
  author: string
  rating: number // 1-5
  comment: string
  createdAt: string
  source: "online" | "offline"
}

const keyFor = (slug: string) => `gm_reviews:${slug}`

const fetcher = (key: string) => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Review[]) : []
  } catch {
    return []
  }
}

export function ProductReviews({ slug }: { slug: string }) {
  const { data: reviews = [] } = useSWR<Review[]>(keyFor(slug), fetcher)
  const { data: user } = useSWRLocalStorage<any>("gm_user", null)

  const [author, setAuthor] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [source, setSource] = useState<"online" | "offline">("online")

  const avg = useMemo(() => {
    if (!reviews.length) return 0
    return Math.round((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) * 10) / 10
  }, [reviews])

  function addReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const key = keyFor(slug)
    const next: Review = {
      id: `${Date.now()}`,
      author: author || user?.name || user?.fullName || user?.username || user?.email || "Pengguna",
      rating,
      comment,
      createdAt: new Date().toISOString(),
      source,
    }
    const curr = fetcher(key) as Review[]
    const updated = [next, ...curr]
    localStorage.setItem(key, JSON.stringify(updated))
    mutate(key, updated, { revalidate: false })
    setAuthor("")
    setRating(5)
    setComment("")
    setSource("online")
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Ulasan ({reviews.length})</CardTitle>
          <div className="text-sm text-muted-foreground">Rata-rata: {avg || 0}/5</div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.author}</span>
                    <span className="text-sm text-muted-foreground">{r.rating}/5</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.comment}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("id-ID")}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted">
                      {r.source === "online" ? "Online" : "Offline Store"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            {!user ? (
              <div className="p-4 rounded-lg border border-border bg-muted">
                <p className="text-sm">
                  Silakan{" "}
                  <a href="/login" className="underline">
                    masuk
                  </a>{" "}
                  untuk menulis ulasan.
                </p>
              </div>
            ) : (
              <form onSubmit={addReview} className="grid gap-3">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Nama (opsional)</label>
                  <Input placeholder="Nama" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Rating</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Sumber Pembelian</label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="src"
                        value="online"
                        checked={source === "online"}
                        onChange={() => setSource("online")}
                      />
                      Online
                    </label>
                    <label className="inline-flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="src"
                        value="offline"
                        checked={source === "offline"}
                        onChange={() => setSource("offline")}
                      />
                      Offline Store
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Ulasan</label>
                  <Textarea
                    placeholder="Tulis ulasan kamu..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Kirim Ulasan</Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
