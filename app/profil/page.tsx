"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilPage() {
  const router = useRouter()
  const { user, loading, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAdditional, setIsEditingAdditional] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)
  const [savingAdditional, setSavingAdditional] = useState(false)
  
  // Additional profile fields
  const [additionalData, setAdditionalData] = useState({
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    skin_type: "",
    sensitivity: "",
    skin_goals: ""
  })

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setAdditionalData({
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
        skin_type: user.skin_type || "",
        sensitivity: user.sensitivity || "",
        skin_goals: user.skin_goals || ""
      })
    }
  }, [user])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-center">Memuat profil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-xl border border-border p-6 bg-card">
          <h1 className="text-xl font-semibold mb-3">Profil</h1>
          <p className="opacity-80 mb-6">Kamu belum masuk.</p>
          <Button onClick={() => router.push("/login")}>Masuk</Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ name })
      setIsEditing(false)
      alert("Profil berhasil diperbarui!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Gagal memperbarui profil")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAdditional = async () => {
    setSavingAdditional(true)
    try {
      await updateProfile(additionalData)
      setIsEditingAdditional(false)
      alert("Data tambahan berhasil diperbarui!")
    } catch (error) {
      console.error("Error updating additional profile:", error)
      alert("Gagal memperbarui data tambahan")
    } finally {
      setSavingAdditional(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleAdditionalChange = (field: string, value: string) => {
    setAdditionalData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const skinTypes = [
    { value: "kering", label: "Kering" },
    { value: "normal", label: "Normal" },
    { value: "kombinasi", label: "Kombinasi" },
    { value: "berminyak", label: "Berminyak" }
  ]

  const sensitivityLevels = [
    { value: "rendah", label: "Rendah" },
    { value: "sedang", label: "Sedang" },
    { value: "tinggi", label: "Tinggi" }
  ]

  const skinGoals = [
    { value: "hidrasi", label: "Hidrasi" },
    { value: "mencerahkan", label: "Mencerahkan" },
    { value: "anti jerawat", label: "Anti Jerawat" },
    { value: "anti aging", label: "Anti Aging" }
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      {/* Profile Info Card */}
      <div className="rounded-xl border border-border p-6 bg-card">
        <h1 className="text-2xl font-semibold mb-6">Profil Saya</h1>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1" />
          </div>

          <div>
            <Label htmlFor="name">Nama</Label>
            {isEditing ? (
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="mt-1" 
              />
            ) : (
              <Input id="name" value={user.name || "-"} disabled className="mt-1" />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Batal
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profil</Button>
            )}
          </div>
        </div>
      </div>

      {/* Additional Profile Information Card */}
      <div className="rounded-xl border border-border p-6 bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Informasi Tambahan</h2>
          {!isEditingAdditional && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingAdditional(true)}
            >
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              {isEditingAdditional ? (
                <Input
                  id="phone"
                  value={additionalData.phone}
                  onChange={(e) => handleAdditionalChange("phone", e.target.value)}
                  className="mt-1"
                  placeholder="Contoh: 081234567890"
                />
              ) : (
                <Input 
                  id="phone" 
                  value={additionalData.phone || "-"} 
                  disabled 
                  className="mt-1" 
                />
              )}
            </div>

            <div>
              <Label htmlFor="postal_code">Kode Pos</Label>
              {isEditingAdditional ? (
                <Input
                  id="postal_code"
                  value={additionalData.postal_code}
                  onChange={(e) => handleAdditionalChange("postal_code", e.target.value)}
                  className="mt-1"
                  placeholder="Contoh: 12345"
                />
              ) : (
                <Input 
                  id="postal_code" 
                  value={additionalData.postal_code || "-"} 
                  disabled 
                  className="mt-1" 
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Alamat</Label>
            {isEditingAdditional ? (
              <Input
                id="address"
                value={additionalData.address}
                onChange={(e) => handleAdditionalChange("address", e.target.value)}
                className="mt-1"
                placeholder="Masukkan alamat lengkap"
              />
            ) : (
              <Input 
                id="address" 
                value={additionalData.address || "-"} 
                disabled 
                className="mt-1" 
              />
            )}
          </div>

          <div>
            <Label htmlFor="city">Kota</Label>
            {isEditingAdditional ? (
              <Input
                id="city"
                value={additionalData.city}
                onChange={(e) => handleAdditionalChange("city", e.target.value)}
                className="mt-1"
                placeholder="Contoh: Jakarta Selatan"
              />
            ) : (
              <Input 
                id="city" 
                value={additionalData.city || "-"} 
                disabled 
                className="mt-1" 
              />
            )}
          </div>

          {/* Action Buttons */}
          {isEditingAdditional && (
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveAdditional} 
                disabled={savingAdditional}
              >
                {savingAdditional ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingAdditional(false)}
              >
                Batal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Skin Profile Card */}
      <div className="rounded-xl border border-border p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Profil Kulit</h2>
        <p className="text-sm opacity-70 mb-4">
          Atur profil kulit kamu untuk mendapatkan rekomendasi produk yang lebih akurat
        </p>
        <Button onClick={() => router.push("/profil-kulit")} variant="outline">
          Kelola Profil Kulit
        </Button>
      </div>

      {/* Orders Card */}
      <div className="rounded-xl border border-border p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Pesanan Saya</h2>
        <p className="text-sm opacity-70 mb-4">Lihat riwayat pesanan dan lacak pengiriman</p>
        <Button onClick={() => router.push("/pesanan")} variant="outline">
          Lihat Pesanan
        </Button>
      </div>

      {/* Logout */}
      <div className="pt-4">
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          Keluar
        </Button>
      </div>
    </div>
  )
}