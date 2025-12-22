"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

type Review = {
  id: number
  user_id: number
  product_id: number
  rating: number
  comment: string
  created_at: string
  user: {
    id: number
    name: string
    avatar?: string
  }
}

type ReviewsResponse = {
  data: Review[]
  average_rating: number
  total_reviews: number
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export function ProductReviews({ productId, slug }: { productId: number; slug: string }) {
  const { data, error, mutate } = useSWR<ReviewsResponse>(
    productId ? `${API_BASE}/products/${productId}/reviews` : null,
    fetcher
  )
  
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)

  const reviews = data?.data || []
  const avg = data?.average_rating || 0
  const total = data?.total_reviews || 0

  const userReview = useMemo(() => {
    if (!user) return null
    return reviews.find((r) => Number(r.user_id) === Number(user.id))
  }, [reviews, user])

  useEffect(() => {
    if (editingReviewId && userReview) {
      setRating(userReview.rating)
      setComment(userReview.comment)
    } else if (!editingReviewId) {
      setRating(5)
      setComment("")
    }
  }, [editingReviewId, userReview])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !token) return

    setIsSubmitting(true)
    try {
      const url = editingReviewId 
        ? `${API_BASE}/reviews/${editingReviewId}`
        : `${API_BASE}/reviews`
      
      const method = editingReviewId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          comment,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Failed to submit review")
      }

      toast({
        title: "Berhasil",
        description: editingReviewId ? "Ulasan berhasil diperbarui." : "Ulasan Anda telah dikirim.",
      })

      setEditingReviewId(null)
      setComment("")
      setRating(5)
      mutate() // Refresh reviews
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(reviewId: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return

    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to delete review")

      toast({
        title: "Berhasil",
        description: "Ulasan berhasil dihapus.",
      })
      
      if (editingReviewId === reviewId) {
        setEditingReviewId(null)
      }
      mutate()
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Ulasan ({total})</CardTitle>
          <div className="text-sm text-muted-foreground">Rata-rata: {Number(avg).toFixed(1)}/5</div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.user?.name || "Pengguna"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{r.rating}/5</span>
                      {user && Number(user.id) === Number(r.user_id) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingReviewId(r.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.comment}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("id-ID")}
                    </p>
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
            ) : (userReview && !editingReviewId) ? (
              <div className="p-4 rounded-lg border border-border bg-muted">
                <p className="text-sm mb-2">Anda sudah memberikan ulasan untuk produk ini.</p>
                <Button variant="outline" size="sm" onClick={() => setEditingReviewId(userReview.id)}>
                  Edit Ulasan
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-lg ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  {editingReviewId && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingReviewId(null)}
                    >
                      Batal
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">
                    {editingReviewId ? "Edit Ulasan" : "Ulasan"}
                  </label>
                  <Textarea
                    placeholder="Tulis ulasan kamu..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Mengirim..." : (editingReviewId ? "Simpan Perubahan" : "Kirim Ulasan")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
