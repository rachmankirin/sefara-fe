"use client"

import React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Review = {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

const keyFor = (slug: string) => `glowmall:reviews:${slug}`

const fetcher = (slug: string) => {
  try {
    const raw = localStorage.getItem(keyFor(slug))
    return raw ? (JSON.parse(raw) as Review[]) : []
  } catch {
    return [] as Review[]
  }
}

function save(slug: string, data: Review[]) {
  localStorage.setItem(keyFor(slug), JSON.stringify(data))
}

export function Reviews({ slug }: { slug: string }) {
  const { data, mutate } = useSWR<Review[]>(["reviews", slug], () => fetcher(slug), { fallbackData: [] })
  const [name, setName] = React.useState("")
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const r: Review = {
      id: crypto.randomUUID(),
      name: name || "Pengguna",
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date().toISOString(),
    }
    const next = [r, ...(data || [])]
    save(slug, next)
    mutate(next, false)
    setName("")
    setRating(5)
    setComment("")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ulasan</h3>
      <form onSubmit={onSubmit} className="grid gap-3">
        <Input placeholder="Nama (opsional)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Rating</label>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number.parseInt(e.target.value || "0", 10))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">1-5</span>
        </div>
        <Textarea
          placeholder="Tulis ulasan kamu..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <Button type="submit">Kirim Ulasan</Button>
      </form>

      <div className="divide-y border rounded-md">
        {(data || []).length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Belum ada ulasan.</div>
        ) : (
          (data || []).map((r) => (
            <div key={r.id} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.name}</div>
                <div className="text-sm">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
              <p className="text-sm">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
