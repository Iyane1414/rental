"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LayoutDashboard, Receipt, Car, Users, CreditCard, LogOut, RefreshCw } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Year: number
  Status: string
  DailyRate: string
}

export default function StaffVehicles() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const navItems = useMemo(
    () => [
      { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/staff/rentals", label: "Rentals", icon: Receipt },
      { href: "/staff/payments", label: "Payments", icon: CreditCard },
      { href: "/staff/vehicles", label: "Vehicles", icon: Car },
      { href: "/staff/customers", label: "Customers", icon: Users },
    ],
    []
  )

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {}
    router.push("/login")
  }

  useEffect(() => {
    fetchVehicles()
  }, [statusFilter])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const url = statusFilter === "all" ? "/api/staff/vehicles" : `/api/staff/vehicles?status=${statusFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch vehicles")
      const data = await res.json()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { label: "All Vehicles", value: "all" },
    { label: "Available", value: "Available" },
    { label: "Rented", value: "Rented" },
    { label: "Maintenance", value: "Maintenance" },
  ]

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "border-emerald-500/25 bg-emerald-500/15 text-emerald-800"
      case "Rented":
        return "border-yellow-500/25 bg-yellow-500/15 text-yellow-800"
      case "Maintenance":
        return "border-red-500/25 bg-red-500/10 text-red-700"
      default:
        return "border-neutral-300 bg-white text-neutral-700"
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-neutral-200 bg-white md:flex md:flex-col">
        <div className="flex items-center gap-3 px-6 py-5">
          <Image
            src="/logo.png"
            alt="YOLO"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs font-semibold tracking-widest text-neutral-500">STAFF PORTAL</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                <Icon className={active ? "h-4 w-4 text-yellow-400" : "h-4 w-4"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <div className="mt-3 px-1 text-[11px] text-neutral-500">© {new Date().getFullYear()} YOLO Car Rental</div>
        </div>
      </aside>

      {/* Main */}
      <main className="md:pl-72">
        {/* Topbar */}
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <Image
                src="/logo.png"
                alt="YOLO"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>

            <div className="hidden md:block">
              <h1 className="text-xl font-extrabold tracking-tight">Vehicle Inventory</h1>
              <p className="text-sm text-neutral-600">View vehicle status and availability</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchVehicles}
                variant="outline"
                className="rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="h-9 w-px bg-neutral-200" />
              <div className="hidden text-sm font-semibold text-neutral-700 sm:block">Staff</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Mobile title */}
          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-extrabold tracking-tight">Vehicle Inventory</h1>
            <p className="mt-1 text-sm text-neutral-600">View vehicle status and availability</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "default" : "outline"}
                onClick={() => setStatusFilter(option.value)}
                className={
                  statusFilter === option.value
                    ? "rounded-xl bg-black text-white hover:bg-black/90"
                    : "rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6 text-red-700">{error}</CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-black">Vehicles ({vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <p className="text-neutral-500">No vehicles found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.Vehicle_ID}
                      className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-black">
                            {vehicle.Brand} {vehicle.Model}
                          </h3>
                          <p className="text-sm text-neutral-600">{vehicle.Year}</p>
                        </div>
                        <Badge className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(vehicle.Status)}`}>
                          {vehicle.Status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-neutral-600">Plate Number</div>
                          <div className="font-mono font-bold text-lg text-black">{vehicle.PlateNo}</div>
                        </div>

                        <div>
                          <div className="text-xs text-neutral-600">Daily Rate</div>
                          <div className="text-2xl font-bold text-black">
                            ₱{parseFloat(vehicle.DailyRate).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <div className="text-xs text-neutral-500">
                          Status last updated: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
