"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw, Search } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  ImageUrl?: string | null
  Status: string
  DailyRate: number
  Year: number
  Seats: number
  Category: string
  HasAC: boolean
  Location: string
}

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const nav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Rentals", href: "/admin/rentals", icon: ClipboardList },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Vehicles", href: "/admin/vehicles", icon: Car },
    { label: "Customers", href: "/admin/customers", icon: Users },
  ]

  const isActive = (href: string) => pathname?.startsWith(href)

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {}
    router.push("/login")
  }

  return (
    <aside className="w-[240px] shrink-0 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="px-6 pt-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-10 w-auto object-contain" />
          </Link>

          <div className="mt-6 text-xs font-semibold tracking-widest text-neutral-500">ADMIN PORTAL</div>
        </div>

        <nav className="mt-4 space-y-2 px-3">
          {nav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                    active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-black",
                  ].join(" ")}
                >
                  <Icon className={active ? "h-4 w-4 text-yellow-400" : "h-4 w-4 text-neutral-500"} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-3 pb-6 pt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <p className="mt-3 px-1 text-xs text-neutral-400">Ac {new Date().getFullYear()} YOLO Car Rental</p>
        </div>
      </div>
    </aside>
  )
}

const statusStyles: Record<string, string> = {
  Available: "bg-green-100 text-green-800",
  Rented: "bg-blue-100 text-blue-800",
  Reserved: "bg-yellow-100 text-yellow-800",
  Maintenance: "bg-red-100 text-red-800",
  Decommissioned: "bg-red-100 text-red-800",
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "rented" | "unavailable">("all")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [formError, setFormError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    Brand: "",
    Model: "",
    PlateNo: "",
    ImageUrl: "",
    Status: "Available",
    DailyRate: "",
    Year: "",
    Seats: "",
    Category: "Sedan",
    HasAC: true,
    Location: "",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/admin/vehicles")
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      if (statusFilter === "available" && vehicle.Status !== "Available") return false
      if (statusFilter === "rented" && vehicle.Status !== "Rented") return false
      if (
        statusFilter === "unavailable" &&
        !["Maintenance", "Decommissioned", "Reserved"].includes(vehicle.Status)
      ) {
        return false
      }
      if (!normalized) return true
      return (
        vehicle.Brand.toLowerCase().includes(normalized) ||
        vehicle.Model.toLowerCase().includes(normalized) ||
        vehicle.PlateNo.toLowerCase().includes(normalized) ||
        vehicle.Location.toLowerCase().includes(normalized) ||
        vehicle.Category.toLowerCase().includes(normalized)
      )
    })
  }, [vehicles, statusFilter, searchQuery])

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.Vehicle_ID === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  )

  const uploadVehicleImage = async (file: File) => {
    const data = new FormData()
    data.append("file", file)

    const response = await fetch("/api/admin/vehicles/upload", {
      method: "POST",
      body: data,
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || "Failed to upload image")
    }

    const payload = await response.json()
    if (!payload?.url) {
      throw new Error("Upload did not return a URL")
    }

    return payload.url as string
  }

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setFormError("")
      const isEditing = editingVehicleId !== null
      const endpoint = isEditing ? `/api/admin/vehicles/${editingVehicleId}` : "/api/admin/vehicles"
      const method = isEditing ? "PATCH" : "POST"
      let imageUrl = formData.ImageUrl

      if (imageFile) {
        setImageUploading(true)
        try {
          imageUrl = await uploadVehicleImage(imageFile)
        } finally {
          setImageUploading(false)
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ImageUrl: imageUrl }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.message || payload?.error || "Failed to save vehicle"
        throw new Error(message)
      }

      await fetchVehicles()
      setShowForm(false)
      setEditingVehicleId(null)
      setImageFile(null)
      setFormData({
        Brand: "",
        Model: "",
        PlateNo: "",
        ImageUrl: "",
        Status: "Available",
        DailyRate: "",
        Year: "",
        Seats: "",
        Category: "Sedan",
        HasAC: true,
        Location: "",
      })
    } catch (error) {
      console.error("Error saving vehicle:", error)
      setFormError(error instanceof Error ? error.message : "Failed to save vehicle")
    }
  }

  const handleStartAdd = () => {
    setEditingVehicleId(null)
    setShowForm(true)
    setImageFile(null)
    setFormError("")
    setSelectedVehicleId(null)
    setFormData({
      Brand: "",
      Model: "",
      PlateNo: "",
      ImageUrl: "",
      Status: "Available",
      DailyRate: "",
      Year: "",
      Seats: "",
      Category: "Sedan",
      HasAC: true,
      Location: "",
    })
  }

  const handleStartEdit = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.Vehicle_ID)
    setShowForm(true)
    setImageFile(null)
    setFormError("")
    setSelectedVehicleId(vehicle.Vehicle_ID)
    setFormData({
      Brand: vehicle.Brand ?? "",
      Model: vehicle.Model ?? "",
      PlateNo: vehicle.PlateNo ?? "",
      ImageUrl: vehicle.ImageUrl ?? "",
      Status: vehicle.Status ?? "Available",
      DailyRate: vehicle.DailyRate?.toString() ?? "",
      Year: vehicle.Year?.toString() ?? "",
      Seats: vehicle.Seats?.toString() ?? "",
      Category: vehicle.Category ?? "Sedan",
      HasAC: Boolean(vehicle.HasAC),
      Location: vehicle.Location ?? "",
    })
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.Vehicle_ID)
    setShowForm(false)
    setEditingVehicleId(null)
    setFormError("")
    setImageFile(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1">
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <h1 className="text-lg font-extrabold text-black">Vehicle Management</h1>
                <p className="mt-1 text-xs text-neutral-500">Manage inventory and availability</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search vehicles..."
                    className="h-9 rounded-xl border-neutral-200 pl-9 text-sm"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (showForm) {
                      setShowForm(false)
                      setEditingVehicleId(null)
                      setImageFile(null)
                      setFormError("")
                    } else {
                      handleStartAdd()
                    }
                  }}
                  className="h-9 rounded-xl bg-black text-white hover:bg-black/90"
                >
                  {showForm ? "Cancel" : "Add Vehicle"}
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchVehicles}
                  className="h-9 w-9 rounded-xl border-neutral-200 bg-white p-0 hover:bg-neutral-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "available", label: "Available" },
                { key: "rented", label: "Ongoing/Rented" },
                { key: "unavailable", label: "Unavailable/Maintenance" },
              ].map((item) => (
                <Button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key as typeof statusFilter)}
                  variant={statusFilter === item.key ? "default" : "outline"}
                  className={[
                    "h-8 rounded-xl px-3 text-xs",
                    statusFilter === item.key
                      ? "bg-black text-white hover:bg-black/90"
                      : "border-neutral-200 bg-white hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <Card className="rounded-2xl border-neutral-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-extrabold text-black">
                    Vehicles ({filteredVehicles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-500">
                          <th className="py-3 px-4 text-left font-semibold">Vehicle</th>
                          <th className="py-3 px-4 text-left font-semibold">Category</th>
                          <th className="py-3 px-4 text-left font-semibold">Seats</th>
                          <th className="py-3 px-4 text-left font-semibold">Status</th>
                          <th className="py-3 px-4 text-left font-semibold">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.map((vehicle) => (
                          <tr
                            key={vehicle.Vehicle_ID}
                            onClick={() => handleSelectVehicle(vehicle)}
                            className={[
                              "border-b border-neutral-100 cursor-pointer transition-colors",
                              selectedVehicleId === vehicle.Vehicle_ID ? "bg-neutral-100" : "hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold text-black">
                                {vehicle.Brand} {vehicle.Model}
                              </div>
                              <div className="mt-1 text-xs text-neutral-500">{vehicle.PlateNo}</div>
                            </td>
                            <td className="py-3 px-4 text-neutral-700">{vehicle.Category}</td>
                            <td className="py-3 px-4 text-neutral-700">{vehicle.Seats}</td>
                            <td className="py-3 px-4">
                              <span
                                className={[
                                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                                  statusStyles[vehicle.Status] || "bg-neutral-100 text-neutral-700",
                                ].join(" ")}
                              >
                                {vehicle.Status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-black">PHP {vehicle.DailyRate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-black">
                    {showForm ? (editingVehicleId ? "Edit Vehicle" : "Add Vehicle") : "Vehicle Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </div>
                  )}

                  {showForm ? (
                    <form onSubmit={handleSaveVehicle} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          placeholder="Brand"
                          value={formData.Brand}
                          onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
                          className="rounded-xl border-neutral-200"
                          required
                        />
                        <Input
                          placeholder="Model"
                          value={formData.Model}
                          onChange={(e) => setFormData({ ...formData, Model: e.target.value })}
                          className="rounded-xl border-neutral-200"
                          required
                        />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-neutral-600">Car Image (optional)</p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                            className="rounded-xl border-neutral-200"
                          />
                          {imageFile && <p className="text-xs text-neutral-500">Selected: {imageFile.name}</p>}
                          {!imageFile && formData.ImageUrl && (
                            <p className="text-xs text-neutral-500">Current image saved</p>
                          )}
                        </div>
                        <Input
                          placeholder="Plate No"
                          value={formData.PlateNo}
                          onChange={(e) => setFormData({ ...formData, PlateNo: e.target.value })}
                          className="rounded-xl border-neutral-200"
                          required
                        />
                        <Input
                          placeholder="Location"
                          value={formData.Location}
                          onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                          className="rounded-xl border-neutral-200"
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Year"
                            type="number"
                            value={formData.Year}
                            onChange={(e) => setFormData({ ...formData, Year: e.target.value })}
                            className="rounded-xl border-neutral-200"
                            required
                          />
                          <Input
                            placeholder="Seats"
                            type="number"
                            value={formData.Seats}
                            onChange={(e) => setFormData({ ...formData, Seats: e.target.value })}
                            className="rounded-xl border-neutral-200"
                            required
                          />
                        </div>
                        <Input
                          placeholder="Daily Rate"
                          type="number"
                          step="0.01"
                          value={formData.DailyRate}
                          onChange={(e) => setFormData({ ...formData, DailyRate: e.target.value })}
                          className="rounded-xl border-neutral-200"
                          required
                        />
                        <div className="grid grid-cols-1 gap-4">
                          <select
                            value={formData.Category}
                            onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
                          >
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Van</option>
                            <option>Truck</option>
                          </select>
                          <select
                            value={formData.Status}
                            onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
                          >
                            <option>Available</option>
                            <option>Rented</option>
                            <option>Maintenance</option>
                            <option>Reserved</option>
                            <option>Decommissioned</option>
                          </select>
                          <select
                            value={formData.HasAC ? "true" : "false"}
                            onChange={(e) => setFormData({ ...formData, HasAC: e.target.value === "true" })}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
                          >
                            <option value="true">With AC</option>
                            <option value="false">No AC</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={imageUploading}
                        className="w-full rounded-xl bg-black text-white hover:bg-black/90 disabled:opacity-60"
                      >
                        {imageUploading ? "Uploading..." : editingVehicleId ? "Save Changes" : "Add Vehicle"}
                      </Button>
                    </form>
                  ) : (
                    <>
                      {!selectedVehicle && (
                        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                          Select a vehicle to view details or click Add Vehicle to create a new one.
                        </div>
                      )}

                      {selectedVehicle && (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Vehicle</p>
                                <p className="mt-2 text-lg font-extrabold text-black">
                                  {selectedVehicle.Brand} {selectedVehicle.Model}
                                </p>
                                <p className="text-sm text-neutral-600">{selectedVehicle.PlateNo}</p>
                              </div>
                              {selectedVehicle.ImageUrl && (
                                <div className="h-14 w-20 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                                  <img
                                    src={selectedVehicle.ImageUrl}
                                    alt={`${selectedVehicle.Brand} ${selectedVehicle.Model}`}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-neutral-700">
                            <div>
                              <span className="font-semibold text-black">Category:</span> {selectedVehicle.Category}
                            </div>
                            <div>
                              <span className="font-semibold text-black">Seats:</span> {selectedVehicle.Seats}
                            </div>
                            <div>
                              <span className="font-semibold text-black">Location:</span> {selectedVehicle.Location}
                            </div>
                            <div>
                              <span className="font-semibold text-black">AC:</span>{" "}
                              {selectedVehicle.HasAC ? "Yes" : "No"}
                            </div>
                            <div>
                              <span className="font-semibold text-black">Daily Rate:</span>{" "}
                              PHP {selectedVehicle.DailyRate.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-semibold text-black">Status:</span> {selectedVehicle.Status}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleStartEdit(selectedVehicle)}
                            variant="outline"
                            className="w-full rounded-xl border-neutral-200 bg-white text-black hover:bg-neutral-100 hover:text-black"
                          >
                            Edit Vehicle
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
