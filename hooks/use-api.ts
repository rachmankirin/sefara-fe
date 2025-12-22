"use client"

import { useAuth } from "@/components/auth/auth-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be.sefara.my.id/api"

export function useApi() {
  const { token } = useAuth()

  const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    return response
  }

  return { apiCall, API_BASE_URL }
}
