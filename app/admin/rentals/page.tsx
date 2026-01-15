"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw } from "lucide-react"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  Email: string
}

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Status: string
}

interface Rental {
  Rental_ID: number
  Customer: Customer | null
  Vehicle: Vehicle | null
  StartDate: string
  EndDate: string
  Status: string
  TotalAmount: number
  User_ID: number | null
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

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filter, setFilter] = useState<"All" | "Pending Payment" | "Ongoing" | "Completed">("All")

  useEffect(() => {
    fetchRentals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/admin/rentals")
      if (!response.ok) throw new Error("Failed to fetch rentals")
      const data = await response.json()
      setRentals(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch rentals")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (rentalId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update rental status")
      await fetchRentals()
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error updating rental")
    }
  }

  const filteredRentals = useMemo(() => {
    if (filter === "All") return rentals
    return rentals.filter((r) => r.Status === filter)
  }, [rentals, filter])

  const stats = useMemo(() => {
    return {
      total: rentals.length,
      pending: rentals.filter((r) => r.Status === "Pending Payment").length,
      ongoing: rentals.filter((r) => r.Status === "Ongoing").length,
      completed: rentals.filter((r) => r.Status === "Completed").length,
    }
  }, [rentals])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1">
          {/* Top bar */}
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
              <div>
                <h1 className="text-2xl font-extrabold text-black">Rental Management</h1>
                <p className="mt-1 text-sm text-neutral-600">Manage all customer rentals and their status</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchRentals}
                  variant="outline"
                  className="rounded-xl border-neutral-200 bg-white hover:bg-neutral-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>

                <div className="h-10 w-px bg-neutral-200" />
                <div className="text-sm font-semibold text-neutral-700">Admin</div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-8 py-8">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-700">{error}</CardContent>
              </Card>
            )}

            {/* Summary Stats (now matches dashboard style: neutral cards) */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { title: "Total Rentals", value: stats.total },
                { title: "Pending Payment", value: stats.pending },
                { title: "Ongoing", value: stats.ongoing },
                { title: "Completed", value: stats.completed },
              ].map((s) => (
                <Card key={s.title} className="rounded-2xl border-neutral-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-neutral-700">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold text-black">{s.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters (match the dashboard-ish pill buttons) */}
            <div className="mb-6 flex flex-wrap gap-2">
              {(["All", "Pending Payment", "Ongoing", "Completed"] as const).map((t) => (
                <Button
                  key={t}
                  onClick={() => setFilter(t)}
                  variant={filter === t ? "default" : "outline"}
                  className={[
                    "rounded-xl",
                    filter === t ? "bg-black text-white hover:bg-black/90" : "border-neutral-200 bg-white hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {t === "All" ? "All Rentals" : t}
                </Button>
              ))}
            </div>

            {/* Table */}
            <Card className="rounded-2xl border-neutral-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-extrabold text-black">Rentals ({filteredRentals.length})</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">CUSTOMER</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">VEHICLE</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">DATES</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">AMOUNT</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">STATUS</th>
                        <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRentals.map((rental) => (
                        <tr key={rental.Rental_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 px-4 text-sm font-semibold text-black">#{rental.Rental_ID}</td>

                          <td className="py-4 px-4 text-sm">
                            <div className="font-semibold text-black">{rental.Customer?.Customer_Name}</div>
                            <div className="mt-1 text-xs text-neutral-500">{rental.Customer?.Email}</div>
                          </td>

                          <td className="py-4 px-4 text-sm">
                            <div className="text-neutral-900">
                              {rental.Vehicle?.Brand} {rental.Vehicle?.Model}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500">{rental.Vehicle?.PlateNo}</div>
                          </td>

                          <td className="py-4 px-4 text-sm text-neutral-700">
                            <div>{new Date(rental.StartDate).toLocaleDateString()}</div>
                            <div className="mt-1 text-xs text-neutral-500">
                              {new Date(rental.EndDate).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-sm font-semibold text-black">
                            ₱{(rental.TotalAmount || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                          </td>

                          <td className="py-4 px-4">
                            <Badge
                              className={
                                rental.Status === "Pending Payment"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : rental.Status === "Ongoing"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    : rental.Status === "Completed"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-100"
                              }
                            >
                              {rental.Status}
                            </Badge>
                          </td>

                          <td className="py-4 px-4">
                            <select
                              value={rental.Status}
                              onChange={(e) => handleStatusUpdate(rental.Rental_ID, e.target.value)}
                              className="h-9 rounded-xl border border-neutral-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
                            >
                              <option value="Pending Payment">Pending Payment</option>
                              <option value="Ongoing">Ongoing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredRentals.length === 0 && (
                    <div className="py-10 text-center text-sm text-neutral-500">No rentals found.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
