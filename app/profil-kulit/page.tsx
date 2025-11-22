"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

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

const skinGoalsOptions = [
  { value: "hidrasi", label: "Hidrasi" },
  { value: "mencerahkan", label: "Mencerahkan" },
  { value: "anti jerawat", label: "Anti Jerawat" },
  { value: "anti aging", label: "Anti Aging" }
]

export default function UpdateProfilKulitPage() {
  const router = useRouter()
  const { user, loading, updateProfile } = useAuth()

  const [skinData, setSkinData] = useState({
    skin_type: "",
    sensitivity: "",
    skin_goals: "" // This will be a comma-separated string
  })
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setSkinData({
        skin_type: user.skin_type || "",
        sensitivity: user.sensitivity || "",
        skin_goals: user.skin_goals || ""
      })
      
      // Initialize selected goals from user data
      if (user.skin_goals) {
        const goalsArray = typeof user.skin_goals === 'string' 
          ? user.skin_goals.split(',') 
          : user.skin_goals
        setSelectedGoals(goalsArray.filter(Boolean))
      }
    }
  }, [user])

  const handleSkinChange = (field: string, value: string) => {
    setSkinData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => {
      const newGoals = prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
      
      // Update skin_data with comma-separated string
      setSkinData(prevData => ({
        ...prevData,
        skin_goals: newGoals.join(',')
      }))
      
      return newGoals
    })
  }

  const handleSave = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu")
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      console.log("Data yang akan dikirim ke updateProfile:", skinData)
      console.log("Selected goals array:", selectedGoals)
      console.log("skin_goals field value:", skinData.skin_goals)
      
      await updateProfile(skinData)
      
      alert("Profil kulit berhasil diperbarui!")
      router.push("/profil")
    } catch (error) {
      console.error("Error updating skin profile:", error)
      alert("Gagal memperbarui profil kulit")
    } finally {
      setSaving(false)
    }
  }

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
          <h1 className="text-xl font-semibold mb-3">Profil Kulit</h1>
          <p className="opacity-80 mb-6">Kamu belum masuk.</p>
          <Button onClick={() => router.push("/login")}>Masuk</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Update Profil Kulit</h1>
        <p className="text-gray-600">Perbarui informasi profil kulit Anda</p>
      </div>

      {/* Skin Profile Card */}
      <div className="rounded-xl border border-border p-6 bg-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skin Type */}
          <div className="space-y-3">
            <Label htmlFor="skin_type" className="text-base font-medium">Jenis Kulit</Label>
            <Select
              value={skinData.skin_type}
              onValueChange={(value) => handleSkinChange("skin_type", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis kulit" />
              </SelectTrigger>
              <SelectContent>
                {skinTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sensitivity Level */}
          <div className="space-y-3">
            <Label htmlFor="sensitivity" className="text-base font-medium">Tingkat Sensitivitas</Label>
            <Select
              value={skinData.sensitivity}
              onValueChange={(value) => handleSkinChange("sensitivity", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih sensitivitas" />
              </SelectTrigger>
              <SelectContent>
                {sensitivityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skin Goals - Multiple Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Tujuan Perawatan Kulit</Label>
          <p className="text-sm text-gray-500 mb-3">Pilih satu atau lebih tujuan perawatan</p>
          <div className="grid grid-cols-2 gap-3">
            {skinGoalsOptions.map((goal) => (
              <div key={goal.value} className="flex items-center space-x-2">
                <Checkbox
                  id={goal.value}
                  checked={selectedGoals.includes(goal.value)}
                  onCheckedChange={() => handleGoalToggle(goal.value)}
                />
                <label
                  htmlFor={goal.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {goal.label}
                </label>
              </div>
            ))}
          </div>
          {selectedGoals.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              Tujuan terpilih: {selectedGoals.map(g => skinGoalsOptions.find(opt => opt.value === g)?.label).join(', ')}
            </p>
          )}
        </div>

        {/* Current Values Display */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Profil Saat Ini:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Jenis Kulit:</span>
              <p className="font-medium">{skinTypes.find(t => t.value === user.skin_type)?.label || "Belum diatur"}</p>
            </div>
            <div>
              <span className="text-blue-700">Sensitivitas:</span>
              <p className="font-medium">{sensitivityLevels.find(l => l.value === user.sensitivity)?.label || "Belum diatur"}</p>
            </div>
            <div>
              <span className="text-blue-700">Tujuan:</span>
              <p className="font-medium">
                {user.skin_goals 
                  ? (typeof user.skin_goals === 'string' 
                      ? user.skin_goals.split(',').map(g => skinGoalsOptions.find(opt => opt.value === g)?.label).join(', ')
                      : user.skin_goals.join(', '))
                  : "Belum diatur"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/profil")}
          >
            Kembali ke Profil
          </Button>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h3 className="font-medium text-green-900 mb-2">Mengapa Mengatur Profil Kulit?</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Dapat rekomendasi produk yang sesuai dengan jenis kulit Anda</li>
          <li>• Hindari produk yang tidak cocok dengan sensitivitas kulit</li>
          <li>• Fokus pada tujuan perawatan kulit yang ingin dicapai</li>
          <li>• Pengalaman belanja skincare yang lebih personal</li>
        </ul>
      </div>
      </div>
    </div>
  )
}