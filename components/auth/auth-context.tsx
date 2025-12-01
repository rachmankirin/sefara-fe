"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type SkinType = "kering" | "normal" | "kombinasi" | "berminyak"
export type SensitivityLevel = "rendah" | "sedang" | "tinggi"
export type SkinGoal = "hidrasi" | "mencerahkan" | "anti jerawat" | "anti aging"
export type UserRole = "user" | "admin"

export type SkinPreferences = {
  skinType: SkinType
  sensitivity: SensitivityLevel
  concerns: SkinGoal[]
}

export type User = {
  id: string
  email: string
  name?: string
  role: UserRole
  prefs?: SkinPreferences
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  skin_type?: string
  sensitivity?: string
  skin_goals?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  token: string | null
  signup: (data: { email: string; password: string; name?: string; prefs: SkinPreferences }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<{ 
    name: string; 
    prefs: SkinPreferences;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    skin_type?: string;
    sensitivity?: string;
    skin_goals?: string;
  }>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_TOKEN_KEY = "glowmall:token"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY)
        console.log("[v0] Auth init - saved token:", savedToken ? "exists" : "none")
        if (savedToken) {
          setToken(savedToken)
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              Accept: "application/json",
            },
          })
          if (response.ok) {
            const userData = await response.json()
            console.log("[v0] Auth init - user data:", userData)
            
            const userResponse = userData.data || userData.user || userData
            setUser({
              id: userResponse.id?.toString() || "1",
              email: userResponse.email,
              name: userResponse.name,
              role: userResponse.role || "user",
              phone: userResponse.phone,
              address: userResponse.address,
              city: userResponse.city,
              postal_code: userResponse.postal_code,
              skin_type: userResponse.skin_type,
              sensitivity: userResponse.sensitivity,
              skin_goals: userResponse.skin_goals,
              prefs: {
                skinType: userResponse.skin_type || "normal",
                sensitivity: userResponse.sensitivity || "sedang",
                concerns: userResponse.skin_goals 
                  ? (typeof userResponse.skin_goals === 'string' 
                      ? userResponse.skin_goals.split(',') as SkinGoal[]
                      : userResponse.skin_goals)
                  : []
              }
            })
          } else {
            console.log("[v0] Auth init - token invalid, clearing")
            localStorage.removeItem(AUTH_TOKEN_KEY)
            setToken(null)
          }
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  useEffect(() => {
    if (!loading) {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY)
      }
    }
  }, [token, loading])

  const api = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      token,
      signup: async ({ email, password, name, prefs }) => {
        try {
          console.log("[v0] === SIGNUP STARTING ===")
          console.log("[v0] Signup data:", { email, name, prefs })

          const requestBody = {
            email,
            password,
            name: name || email.split("@")[0],
            role: "user",
            skin_type: prefs.skinType,
            sensitivity: prefs.sensitivity,
            skin_goals: prefs.concerns,
          }

          console.log("[v0] Request body:", requestBody)
          console.log("[v0] API URL:", `${API_BASE_URL}/auth/signup`)

          const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          console.log("[v0] Signup response status:", response.status)

          const responseText = await response.text()
          console.log("[v0] Signup response text:", responseText)

          if (!response.ok) {
            console.error("[v0] Signup failed with status:", response.status)
            let errorMessage = "Signup failed"
            try {
              const error = JSON.parse(responseText)
              errorMessage = error.message || error.error || errorMessage
              console.error("[v0] Parsed error:", error)
            } catch (e) {
              console.error("[v0] Could not parse error response")
            }
            throw new Error(errorMessage)
          }

          let data
          try {
            data = JSON.parse(responseText)
            console.log("[v0] Parsed signup response:", data)
          } catch (e) {
            console.error("[v0] Could not parse success response")
            throw new Error("Invalid response from server")
          }

          const authToken = data.access_token
          const userData = data.user

          console.log("[v0] Extracted token:", authToken ? "exists" : "missing")
          console.log("[v0] Extracted user:", userData)

          if (!authToken) {
            console.error("[v0] No token in response:", data)
            throw new Error("No authentication token received from server")
          }

          if (!userData) {
            console.error("[v0] No user data in response:", data)
            throw new Error("No user data received from server")
          }

          console.log("[v0] Setting token and user...")
          setToken(authToken)
          const newUser = {
            id: userData.id?.toString() || "1",
            email: userData.email || email,
            name: userData.name || name,
            role: userData.role || "user",
            phone: userData.phone,
            address: userData.address,
            city: userData.city,
            postal_code: userData.postal_code,
            skin_type: userData.skin_type,
            sensitivity: userData.sensitivity,
            skin_goals: userData.skin_goals,
            prefs,
          }

          setUser(newUser)
          
          console.log("[v0] === SIGNUP COMPLETE ===")
        } catch (error) {
          console.error("[v0] === SIGNUP EXCEPTION ===")
          console.error("[v0] Error:", error)
          throw error
        }
      },
      login: async ({ email, password }) => {
        console.log("[v0] Login starting...")
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        console.log("[v0] Login response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Login error response:", errorText)
          try {
            const error = JSON.parse(errorText)
            throw new Error(error.message || "Login failed")
          } catch {
            throw new Error("Login failed")
          }
        }

        const data = await response.json()
        console.log("[v0] Login success, data:", data)

        const authToken = data.access_token
        const userData = data.user

        if (!authToken) {
          throw new Error("No token received from server")
        }

        setToken(authToken)
        const loggedInUser = {
          id: userData.id?.toString(),
          email: userData.email,
          name: userData.name,
          role: userData.role || "user",
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postal_code: userData.postal_code,
          skin_type: userData.skin_type,
          sensitivity: userData.sensitivity,
          skin_goals: userData.skin_goals,
          prefs: {
            skinType: userData.skin_type || "normal",
            sensitivity: userData.sensitivity || "sedang",
            concerns: userData.skin_goals 
              ? (typeof userData.skin_goals === 'string' 
                  ? userData.skin_goals.split(',') as SkinGoal[]
                  : userData.skin_goals)
              : []
          }
        }

        setUser(loggedInUser)
        console.log("[v0] Login complete - token and user set")
      },
      adminLogin: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Admin login failed")
        }

        const data = await response.json()
        setToken(data.access_token)
        const adminUser = {
          id: data.user.id?.toString(),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          phone: data.user.phone,
          address: data.user.address,
          city: data.user.city,
          postal_code: data.user.postal_code,
          skin_type: data.user.skin_type,
          sensitivity: data.user.sensitivity,
          skin_goals: data.user.skin_goals,
          prefs: {
            skinType: data.user.skin_type || "normal",
            sensitivity: data.user.sensitivity || "sedang",
            concerns: data.user.skin_goals 
              ? (typeof data.user.skin_goals === 'string' 
                  ? data.user.skin_goals.split(',') as SkinGoal[]
                  : data.user.skin_goals)
              : []
          }
        }

        setUser(adminUser)
      },
      logout: async () => {
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            })
          } catch (error) {
            console.error("Logout error:", error)
          }
        }
        setUser(null)
        setToken(null)
      },
      updateProfile: async (data) => {
      if (!user || !token) return

      try {
        // Prepare the request body with all possible fields
        const requestBody: any = {}

        // Add fields only if they are provided
        if (data.name !== undefined) requestBody.name = data.name
        if (data.phone !== undefined) requestBody.phone = data.phone
        if (data.address !== undefined) requestBody.address = data.address
        if (data.city !== undefined) requestBody.city = data.city
        if (data.postal_code !== undefined) requestBody.postal_code = data.postal_code
        if (data.skin_type !== undefined) requestBody.skin_type = data.skin_type
        if (data.sensitivity !== undefined) requestBody.sensitivity = data.sensitivity
        
        // Handle skin_goals - convert array to string for Laravel
        if (data.skin_goals !== undefined) {
          requestBody.skin_goals = Array.isArray(data.skin_goals) 
            ? data.skin_goals.join(',') 
            : data.skin_goals
        }

        // Handle backward compatibility with prefs object
        if (data.prefs) {
          requestBody.skin_type = data.prefs.skinType
          requestBody.sensitivity = data.prefs.sensitivity || "sedang"
          // Convert concerns array to string for Laravel
          requestBody.skin_goals = Array.isArray(data.prefs.concerns) 
            ? data.prefs.concerns.join(',') 
            : data.prefs.concerns
        }

        console.log("[v0] Update profile request body:", requestBody)

        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          const responseData = await response.json()
          const updatedUser = responseData.data || responseData.user || responseData
          
          console.log("[v0] Update profile response:", updatedUser)
          
          setUser({
            ...user,
            name: updatedUser.name || user.name,
            phone: updatedUser.phone !== undefined ? updatedUser.phone : user.phone,
            address: updatedUser.address !== undefined ? updatedUser.address : user.address,
            city: updatedUser.city !== undefined ? updatedUser.city : user.city,
            postal_code: updatedUser.postal_code !== undefined ? updatedUser.postal_code : user.postal_code,
            skin_type: updatedUser.skin_type !== undefined ? updatedUser.skin_type : user.skin_type,
            sensitivity: updatedUser.sensitivity !== undefined ? updatedUser.sensitivity : user.sensitivity,
            skin_goals: updatedUser.skin_goals !== undefined ? updatedUser.skin_goals : user.skin_goals,
            prefs: {
              skinType: updatedUser.skin_type || user.prefs?.skinType || "normal",
              sensitivity: updatedUser.sensitivity || user.prefs?.sensitivity || "sedang",
              concerns: Array.isArray(updatedUser.skin_goals) 
                ? updatedUser.skin_goals 
                : (updatedUser.skin_goals ? updatedUser.skin_goals.split(',') : user.prefs?.concerns || [])
            }
          })
        } else {
          const errorText = await response.text()
          console.error("[v0] Update profile error response:", errorText)
          let errorMessage = "Failed to update profile"
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            // Ignore JSON parse error
          }
          throw new Error(errorMessage)
        }
      } catch (error) {
        console.error("Update profile error:", error)
        throw error
      }
    },
    }),
    [user, loading, token],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}