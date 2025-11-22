"use client"

import useSWR from "swr"
import { useEffect } from "react"

export function useSWRLocalStorage<T = any>(key: string, fallback: T) {
  const swr = useSWR<T>(key, {
    fallbackData: fallback,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    fetcher: async (k: string) => {
      if (typeof window === "undefined") return fallback
      const raw = localStorage.getItem(k)
      return raw ? (JSON.parse(raw) as T) : fallback
    },
  })

  // Revalidate when storage changes or a custom "{key}_updated" event fires
  useEffect(() => {
    if (typeof window === "undefined") return

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        swr.mutate()
      }
    }

    const onCustom = (e: Event) => {
      try {
        const detailKey = (e as CustomEvent)?.detail?.key
        if (!detailKey || detailKey === key) {
          swr.mutate()
        }
      } catch {
        swr.mutate()
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener(`${key}_updated`, onCustom)
    window.addEventListener("gm_global_updated", onCustom)
    window.addEventListener("gm_cart_updated", onCustom)
    window.addEventListener("gm_user_updated", onCustom)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(`${key}_updated`, onCustom)
      window.removeEventListener("gm_global_updated", onCustom)
      window.removeEventListener("gm_cart_updated", onCustom)
      window.removeEventListener("gm_user_updated", onCustom)
    }
  }, [key, swr])

  return swr
}

// Add alias export to match named import { useLocalSWR }
export function useLocalSWR<T = any>(key: string, fallback: T) {
  return useSWRLocalStorage<T>(key, fallback)
}
