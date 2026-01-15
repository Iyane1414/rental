"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Status: string
  DailyRate: number
  Year: number
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
    <aside className="w-[280px] shrink-0 border-r border-neutral-200 bg-white">
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

          <p className="mt-3 px-1 text-xs text-neutral-400">© {new Date().getFullYear()} YOLO Car Rental</p>
        </div>
      </div>
    </aside>
  )
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    Brand: "",
    Model: "",
    PlateNo: "",
    Status: "Available",
    DailyRate: "",
    Year: "",
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

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchVehicles()
        setShowForm(false)
        setFormData({
          Brand: "",
          Model: "",
          PlateNo: "",
          Status: "Available",
          DailyRate: "",
          Year: "",
        })
      }
    } catch (error) {
      console.error("Error adding vehicle:", error)
    }
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
          {/* Top bar */}
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
              <div>
                <h1 className="text-2xl font-extrabold text-black">Vehicle Management</h1>
                <p className="mt-1 text-sm text-neutral-600">Add and manage vehicle inventory</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="rounded-xl bg-black text-white hover:bg-black/90"
                >
                  {showForm ? "Cancel" : "Add Vehicle"}
                </Button>

                <div className="h-10 w-px bg-neutral-200" />
                <div className="text-sm font-semibold text-neutral-700">Admin</div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-8 py-8">
            {showForm && (
              <Card className="mb-8 rounded-2xl border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-lg font-extrabold text-black">Add New Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                      <Input
                        placeholder="Plate No"
                        value={formData.PlateNo}
                        onChange={(e) => setFormData({ ...formData, PlateNo: e.target.value })}
                        className="rounded-xl border-neutral-200"
                        required
                      />
                      <Input
                        placeholder="Year"
                        type="number"
                        value={formData.Year}
                        onChange={(e) => setFormData({ ...formData, Year: e.target.value })}
                        className="rounded-xl border-neutral-200"
                        required
                      />
                      <Input
                        placeholder="Daily Rate"
                        type="number"
                        step="0.01"
                        value={formData.DailyRate}
                        onChange={(e) => setFormData({ ...formData, DailyRate: e.target.value })}
                        className="rounded-xl border-neutral-200"
                        required
                      />
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
                    </div>
                    <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
                      Add Vehicle
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-black">Vehicles ({vehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.Vehicle_ID}
                      className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                    >
                      <h3 className="text-lg font-extrabold mb-2 text-black">
                        {vehicle.Brand} {vehicle.Model}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-neutral-600">
                          <span className="font-semibold text-black">Plate:</span> {vehicle.PlateNo}
                        </p>
                        <p className="text-neutral-600">
                          <span className="font-semibold text-black">Year:</span> {vehicle.Year}
                        </p>
                        <p className="text-neutral-600">
                          <span className="font-semibold text-black">Daily Rate:</span> ₱{vehicle.DailyRate.toFixed(2)}
                        </p>
                        <p className="text-neutral-600">
                          <span className="font-semibold text-black">Status:</span> {vehicle.Status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
