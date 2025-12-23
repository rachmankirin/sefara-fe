"use client"

import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Script from "next/script"

const API_BASE = "https://be.sefara.my.id/api"

export default function KeranjangPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  }

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  
  // Shipping states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedCourier, setSelectedCourier] = useState("")
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [showShippingSection, setShowShippingSection] = useState(false)
  const [userAddress, setUserAddress] = useState<any>(null)
  const [isSnapLoaded, setIsSnapLoaded] = useState(false)

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem("gm_post_login_redirect", "/keranjang")
      } catch (e) {}
      router.push("/login")
    } else if (user && token) {
      fetchUserAddress(user.id, token)
    }
  }, [user, token, router])

  const fetchUserAddress = async (currentUserId: string, authToken: string) => {
    try {
      const addressResp = await fetch(`${API_BASE}/user-address/${currentUserId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (addressResp.ok) {
        const addressData = await addressResp.json()
        if (addressData.data) {
          setUserAddress(addressData.data)
          // Pre-fill shipping form
          setSelectedProvince(addressData.data.province_id)
          // Cities and districts will be loaded by useEffects
        }
      }
    } catch (e) {
      console.error("Could not fetch user address", e)
    }
  }

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        if (!token) {
          console.error("No token found")
          return
        }

        const response = await fetch(`${API_BASE}/rajaongkir`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          // Handle Laravel Resource response format - data is in the 'data' property
          setProvinces(data.data || [])
        } else {
          console.error("Failed to load provinces:", response.status)
          if (response.status === 401) {
            // Token might be expired, redirect to login
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Failed to load provinces", error)
      }
    }

    if (user) {
      loadProvinces()
    }
  }, [user, token, router])

  const { data: cartData, error, mutate } = useSWR(user ? `${API_BASE}/cart` : null, fetcher)

  const cartItems = cartData?.data?.items || []

  async function removeItem(cartItemId: string) {
    try {
      await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      mutate()
    } catch (e) {
      console.error("Failed to remove item", e)
    }
  }

  async function updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(cartItemId))
    
    try {
      const response = await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quantity")
      }

      mutate()
    } catch (e) {
      console.error("Failed to update quantity", e)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(cartItemId)
        return newSet
      })
    }
  }

  function increaseQuantity(cartItemId: string, currentQuantity: number) {
    updateQuantity(cartItemId, currentQuantity + 1)
  }

  function decreaseQuantity(cartItemId: string, currentQuantity: number) {
    if (currentQuantity <= 1) {
      removeItem(cartItemId)
      return
    }
    updateQuantity(cartItemId, currentQuantity - 1)
  }

  // Load cities when province is selected
  useEffect(() => {
    // Clear dependent fields when province changes
    setCities([])
    setDistricts([])
    setSelectedCity("")
    setSelectedDistrict("")
    setShippingCosts([])
    setSelectedShipping(null)
    setShowShippingSection(false)

    const loadCities = async () => {
      if (!selectedProvince) {
        return
      }

      try {
        if (!token) {
          console.error("No token found")
          return
        }

        const response = await fetch(`${API_BASE}/cities/${selectedProvince}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          const loadedCities = data.data || []
          setCities(loadedCities)
          // If user address is available, pre-select city
          if (userAddress && loadedCities.some((c: City) => c.id === userAddress.city_id)) {
            setSelectedCity(userAddress.city_id)
          }
        } else {
          console.error("Failed to load cities:", response.status)
          setCities([])
        }
      } catch (error) {
        console.error("Failed to load cities", error)
        setCities([])
      }
    }

    loadCities()
  }, [selectedProvince, userAddress, token])

  // Load districts when city is selected
  useEffect(() => {
    // Clear dependent fields when city changes
    setDistricts([])
    setSelectedDistrict("")
    setShippingCosts([])
    setSelectedShipping(null)
    setShowShippingSection(false)

    const loadDistricts = async () => {
      if (!selectedCity) {
        return
      }

      try {
        if (!token) {
          console.error("No token found")
          return
        }

        const response = await fetch(`${API_BASE}/districts/${selectedCity}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          const loadedDistricts = data.data || []
          setDistricts(loadedDistricts)
          // If user address is available, pre-select district
          if (userAddress && loadedDistricts.some((d: District) => d.id === userAddress.district_id)) {
            setSelectedDistrict(userAddress.district_id)
          }
        } else {
          console.error("Failed to load districts:", response.status)
          setDistricts([])
        }
      } catch (error) {
        console.error("Failed to load districts", error)
        setDistricts([])
      }
    }

    loadDistricts()
  }, [selectedCity, userAddress, token])

 async function calculateShipping() {
  if (!selectedDistrict || !selectedCourier || cartItems.length === 0) {
    alert("Harap lengkapi semua data terlebih dahulu!")
    return
  }

  setIsLoadingShipping(true)
  setShippingCosts([])

  try {
    if (!token) {
      alert("Silakan login terlebih dahulu")
      router.push("/login")
      return
    }

    console.log("Frontend cart items:", cartItems)

    const response = await fetch(`${API_BASE}/check-ongkir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        district_id: selectedDistrict,
        courier: selectedCourier,
      }),
    })

    console.log("Response status:", response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log("Full API response:", data)
      
      // FIX: Properly handle the response structure
      if (data.data && Array.isArray(data.data)) {
        console.log("Received shipping options:", data.data);
        setShippingCosts(data.data);
      } else {
        console.warn("No data array found in response")
        setShippingCosts([])
      }
      
      setShowShippingSection(true)
    } else {
      const errorText = await response.text()
      console.error("Failed to calculate shipping:", response.status, errorText)
      
      // Try to parse error response for better message
      try {
        const errorData = JSON.parse(errorText)
        alert(`Error: ${errorData.message || 'Gagal menghitung ongkir'}`)
      } catch {
        alert("Terjadi kesalahan saat menghitung ongkir. Coba lagi.")
      }
    }
  } catch (error) {
    console.error("Failed to calculate shipping", error)
    alert("Terjadi kesalahan saat menghitung ongkir. Coba lagi.")
  } finally {
    setIsLoadingShipping(false)
  }
}

  const total = cartData?.data?.total ? parseFloat(cartData.data.total) : 0
  const cartId = cartData?.data?.id
  const [selectedShipping, setSelectedShipping] = useState<ShippingCost | null>(null)
  const grandTotal = total + (selectedShipping?.cost || 0)

  async function handleCheckout() {
    if (!cartItems || cartItems.length === 0) return
    if (!user || !token) {
      try {
        localStorage.setItem("gm_post_login_redirect", "/keranjang")
      } catch (e) {}
      router.push("/login")
      return
    }

    if (!cartId) {
      alert("Keranjang tidak valid. Muat ulang halaman.")
      return
    }

    if (!selectedShipping) {
      alert("Silakan pilih layanan pengiriman terlebih dahulu.")
      return
    }

    try {
      // 1) Create checkout record in backend
      const checkoutRes = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: cartId,
          shipping_cost: selectedShipping.cost,
          shipping_courier: selectedCourier,
          shipping_service: selectedShipping.service,
          shipping_address:
            user?.address ||
            `${selectedDistrict || ""}, ${selectedCity || ""}, ${selectedProvince || ""}`,
        }),
      })

      if (!checkoutRes.ok) {
        const text = await checkoutRes.text()
        console.error("Checkout failed", checkoutRes.status, text)
        alert("Gagal membuat checkout. Coba lagi.")
        return
      }

      const checkoutJson = await checkoutRes.json()
      console.log("Checkout Response:", checkoutJson) // Debug log

      const checkoutData = checkoutJson.data
      const snapToken = checkoutJson.snap_token

      if (!snapToken) {
        console.error("Snap token missing in response", checkoutJson)
        alert("Gagal mendapatkan token pembayaran.")
        return
      }

      if (!isSnapLoaded) {
        console.warn("Snap.js not loaded yet")
        // Try to check if window.snap exists anyway
        if (typeof window !== "undefined" && (window as any).snap) {
           console.log("Snap found on window even if onLoad didn't fire")
        } else {
           alert("Sistem pembayaran belum siap. Tunggu sebentar dan coba lagi.")
           return
        }
      }

      if (typeof window === "undefined" || !(window as any).snap) {
        console.error("Snap.js object not found on window")
        alert("Library pembayaran tidak ditemukan. Refresh halaman.")
        return
      }

      console.log("Opening Snap with token:", snapToken)

      // 3) Open Midtrans Snap popup
      ;(window as any).snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          console.log("Payment success", result)
          
          // Sync status with backend immediately
          try {
            console.log("Syncing status with backend...")
            const syncRes = await fetch(`${API_BASE}/payments/${checkoutData.id}/sync`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            const syncData = await syncRes.json()
            console.log("Sync result:", syncData)
          } catch (e) {
            console.error("Failed to sync status", e)
          }

          mutate() // refresh cart
          router.push("/pesanan")
        },
        onPending: function (result: any) {
          console.log("Payment pending", result)
          router.push("/pesanan")
        },
        onError: function (result: any) {
          console.error("Payment error", result)
          alert("Terjadi kesalahan saat memproses pembayaran.")
        },
        onClose: function () {
          // user closed the popup, do nothing
        },
      })
    } catch (e) {
      console.error("Checkout/Midtrans error", e)
      alert("Terjadi kesalahan saat memproses checkout.")
    }
  }

  if (error) return <div className="mx-auto max-w-6xl px-4 py-8">Error loading cart</div>
  if (!cartData) return <div className="mx-auto max-w-6xl px-4 py-8">Loading...</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-Ohk1pccsXPbjPbRO"
        onLoad={() => {
          console.log("Snap.js loaded")
          setIsSnapLoaded(true)
        }}
      />
      <h1 className="text-2xl font-semibold mb-6">Keranjang</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Keranjang Anda kosong</div>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center rounded-lg bg-primary text-primary-foreground px-5 py-2 font-medium hover:opacity-90"
          >
            Belanja Sekarang
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {cartItems.map((item: any) => {
              const imageUrl = item.product?.image_url
                ? item.product.image_url.startsWith("http")
                  ? item.product.image_url
                  : `https://be.sefara.my.id${item.product.image_url}`
                : "/placeholder.svg"

              const isUpdating = updatingItems.has(item.id)

              return (
                <div key={item.id} className="rounded-lg border border-border p-4 flex items-center gap-4">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    className="h-20 w-20 rounded-md border border-border object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">{item.product?.name || "Unknown Product"}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Rp {item.price ? parseFloat(item.price).toLocaleString("id-ID") : "0"} per item
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 mr-2">Quantity:</span>
                        <button
                          onClick={() => decreaseQuantity(item.id, item.quantity || 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className={`w-8 text-center ${isUpdating ? "opacity-50" : ""}`}>
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id, item.quantity || 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                        >
                          +
                        </button>
                        {isUpdating && (
                          <span className="text-xs text-gray-500 ml-2">Updating...</span>
                        )}
                      </div>
                      
                      <div className="text-sm font-semibold">
                        Subtotal: Rp {item.subtotal ? item.subtotal.toLocaleString("id-ID") : "0"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isUpdating}
                    className="text-sm rounded-lg border border-red-300 text-red-600 px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>
              )
            })}
          </div>

          {/* Shipping Calculator Section */}
          <div className="bg-white p-6 rounded-xl border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Kalkulator Ongkos Kirim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Province Selection */}
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi Tujuan
                </label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value)
                    setUserAddress(null) // Clear pre-filled address when user manually changes selection
                  }}
                  className="w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {provinces.length === 0 && user && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data provinsi...</p>
                )}
              </div>

              {/* City Selection */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Kota / Kabupaten Tujuan
                </label>
                <select
                  id="city"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setUserAddress(null) // Clear pre-filled address
                  }}
                  disabled={!selectedProvince || cities.length === 0}
                  className="w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Kota / Kabupaten --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {selectedProvince && cities.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data kota...</p>
                )}
              </div>

              {/* District Selection */}
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan Tujuan
                </label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value)
                    setUserAddress(null) // Clear pre-filled address
                  }}
                  disabled={!selectedCity || districts.length === 0}
                  className="w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {selectedCity && districts.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Memuat data kecamatan...</p>
                )}
              </div>

              {/* Weight Information */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Berat Barang (gram)
                </label>
                <input
                  type="text"
                  id="weight"
                  value="Dihitung otomatis oleh sistem"
                  disabled
                  className="w-full pl-3 pr-3 py-2 text-base bg-gray-100 border border-gray-300 sm:text-sm rounded-md cursor-not-allowed"
                />
              </div>
            </div>

            {/* Courier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kurir
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { value: "jnt", label: "J&T" },
                  { value: "jne", label: "JNE" },
                  { value: "pos", label: "POS Indonesia" },
                  { value: "tiki", label: "Tiki" },
                  { value: "lion", label: "Lion Parcel" },
                ].map((courier) => (
                  <div key={courier.value} className="flex items-center">
                    <input
                      type="radio"
                      name="courier"
                      id={`courier-${courier.value}`}
                      value={courier.value}
                      checked={selectedCourier === courier.value}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor={`courier-${courier.value}`} className="ml-2 block text-sm text-gray-900">
                      {courier.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center mb-4 flex-col items-center">
              <button
                onClick={calculateShipping}
                disabled={isLoadingShipping || !selectedDistrict || !selectedCourier}
                className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingShipping ? "Menghitung..." : "Hitung Ongkos Kirim"}
              </button>
              {isLoadingShipping && (
                <div className="loader mt-4 border-4 border-gray-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin"></div>
              )}
            </div>

            {/* Shipping Results */}
            {showShippingSection && shippingCosts.length > 0 && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                Pilih Layanan Pengiriman
              </h3>
              <div className="space-y-3">
                {shippingCosts.map((costItem, index) => (
                  <div
                    key={`${costItem.service}-${index}`}
                    onClick={() => setSelectedShipping(costItem)}
                    className={`flex justify-between items-center p-3 bg-white rounded-xl shadow border cursor-pointer transition-all ${
                      selectedShipping?.service === costItem.service && 
                      selectedShipping.description === costItem.description 
                        ? 'border-blue-500 ring-2 ring-blue-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {costItem.service} - {costItem.description}
                      </span>
                      <span className="text-xs text-gray-500">
                        Estimasi: {costItem.etd} • {costItem.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      Rp {costItem.cost?.toLocaleString("id-ID") || "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

            {showShippingSection && shippingCosts.length === 0 && !isLoadingShipping && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-700">Tidak ada layanan pengiriman yang tersedia untuk kombinasi ini.</p>
              </div>
            )}
          </div>
          
          {/* Totals Section */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-gray-50">
              <div className="font-medium text-lg">Subtotal Produk</div>
              <div className="text-xl font-semibold">Rp {total.toLocaleString("id-ID")}</div>
            </div>

            {selectedShipping && (
              <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-blue-50">
                <div className="font-medium text-lg">Ongkos Kirim ({selectedShipping.service})</div>
                <div className="text-xl font-semibold">Rp {selectedShipping.cost.toLocaleString("id-ID")}</div>
              </div>
            )}

            <div className="rounded-xl border border-border p-6 flex items-center justify-between bg-green-50">
              <div className="font-medium text-lg">Total</div>
              <div className="text-xl font-semibold">Rp {grandTotal.toLocaleString("id-ID")}</div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || updatingItems.size > 0 || (shippingCosts.length > 0 && !selectedShipping)}
              className="inline-flex items-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium disabled:opacity-50 hover:opacity-90 text-lg"
            >
              {updatingItems.size > 0 ? "Updating..." : "Lanjut ke Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}