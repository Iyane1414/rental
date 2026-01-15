"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw, Search } from "lucide-react"

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
  "Pending Payment": "bg-yellow-100 text-yellow-800",
  Ongoing: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"All" | "Pending Payment" | "Ongoing" | "Completed">("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null)
  const [statusDraft, setStatusDraft] = useState("")

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
    const normalized = searchQuery.trim().toLowerCase()
    return rentals.filter((rental) => {
      if (filter !== "All" && rental.Status !== filter) return false
      if (!normalized) return true
      const customerName = rental.Customer?.Customer_Name?.toLowerCase() || ""
      const customerEmail = rental.Customer?.Email?.toLowerCase() || ""
      const vehicleName = `${rental.Vehicle?.Brand || ""} ${rental.Vehicle?.Model || ""}`.toLowerCase()
      const plate = rental.Vehicle?.PlateNo?.toLowerCase() || ""
      return (
        customerName.includes(normalized) ||
        customerEmail.includes(normalized) ||
        vehicleName.includes(normalized) ||
        plate.includes(normalized) ||
        rental.Rental_ID.toString().includes(normalized)
      )
    })
  }, [rentals, filter, searchQuery])

  const stats = useMemo(() => {
    return {
      total: rentals.length,
      pending: rentals.filter((r) => r.Status === "Pending Payment").length,
      ongoing: rentals.filter((r) => r.Status === "Ongoing").length,
      completed: rentals.filter((r) => r.Status === "Completed").length,
    }
  }, [rentals])

  const selectedRental = useMemo(
    () => rentals.find((rental) => rental.Rental_ID === selectedRentalId) || null,
    [rentals, selectedRentalId]
  )

  useEffect(() => {
    if (!selectedRental) {
      setStatusDraft("")
      return
    }
    setStatusDraft(selectedRental.Status)
  }, [selectedRental])

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
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <h1 className="text-lg font-extrabold text-black">Rental Management</h1>
                <p className="mt-1 text-xs text-neutral-500">Track rentals, payments, and statuses</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search rentals..."
                    className="h-9 rounded-xl border-neutral-200 pl-9 text-sm"
                  />
                </div>
                <Link href="/browse-vehicles">
                  <Button className="h-9 rounded-xl bg-black text-white hover:bg-black/90">New Rental</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={fetchRentals}
                  className="h-9 w-9 rounded-xl border-neutral-200 bg-white p-0 hover:bg-neutral-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-6">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-700">{error}</CardContent>
              </Card>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {stats.total} rentals • {stats.pending} pending • {stats.ongoing} ongoing • {stats.completed} completed
              </div>
              <div className="flex flex-wrap gap-2">
                {(["All", "Pending Payment", "Ongoing", "Completed"] as const).map((t) => (
                  <Button
                    key={t}
                    onClick={() => setFilter(t)}
                    variant={filter === t ? "default" : "outline"}
                    className={[
                      "h-8 rounded-xl px-3 text-xs",
                      filter === t
                        ? "bg-black text-white hover:bg-black/90"
                        : "border-neutral-200 bg-white hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    {t === "All" ? "All Rentals" : t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="rounded-2xl border-neutral-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-extrabold text-black">Rentals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-500">
                          <th className="py-3 px-4 text-left font-semibold">Rental</th>
                          <th className="py-3 px-4 text-left font-semibold">Vehicle</th>
                          <th className="py-3 px-4 text-left font-semibold">Dates</th>
                          <th className="py-3 px-4 text-left font-semibold">Amount</th>
                          <th className="py-3 px-4 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRentals.map((rental) => (
                          <tr
                            key={rental.Rental_ID}
                            onClick={() => setSelectedRentalId(rental.Rental_ID)}
                            className={[
                              "border-b border-neutral-100 cursor-pointer transition-colors",
                              selectedRentalId === rental.Rental_ID ? "bg-neutral-100" : "hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold text-black">#{rental.Rental_ID}</div>
                              <div className="mt-1 text-xs text-neutral-500">
                                {rental.Customer?.Customer_Name || "Unknown"}
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                {rental.Customer?.Email || "No email"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-neutral-900">
                                {rental.Vehicle?.Brand} {rental.Vehicle?.Model}
                              </div>
                              <div className="mt-1 text-xs text-neutral-500">{rental.Vehicle?.PlateNo}</div>
                            </td>
                            <td className="py-3 px-4 text-xs text-neutral-600">
                              <div>{new Date(rental.StartDate).toLocaleDateString()}</div>
                              <div className="mt-1 text-neutral-400">{new Date(rental.EndDate).toLocaleDateString()}</div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-black">
                              PHP {(rental.TotalAmount || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusStyles[rental.Status] || "bg-neutral-100 text-neutral-700"}>
                                {rental.Status}
                              </Badge>
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

              <Card className="rounded-2xl border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-black">Rental Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedRental && (
                    <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                      Select a rental to view details and actions.
                    </div>
                  )}

                  {selectedRental && (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Rental</p>
                        <p className="mt-2 text-lg font-extrabold text-black">#{selectedRental.Rental_ID}</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(selectedRental.StartDate).toLocaleDateString()} -{" "}
                          {new Date(selectedRental.EndDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-neutral-700">
                        <div>
                          <span className="font-semibold text-black">Customer:</span>{" "}
                          {selectedRental.Customer?.Customer_Name || "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Email:</span>{" "}
                          {selectedRental.Customer?.Email || "No email"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Vehicle:</span>{" "}
                          {selectedRental.Vehicle
                            ? `${selectedRental.Vehicle.Brand} ${selectedRental.Vehicle.Model}`
                            : "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Plate:</span>{" "}
                          {selectedRental.Vehicle?.PlateNo || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Amount:</span>{" "}
                          PHP {(selectedRental.TotalAmount || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={statusDraft}
                            onChange={(event) => setStatusDraft(event.target.value)}
                            className="h-9 flex-1 rounded-xl border border-neutral-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
                          >
                            <option value="Pending Payment">Pending Payment</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedRental.Rental_ID, statusDraft)}
                            className="h-9 rounded-xl bg-black text-white hover:bg-black/90"
                          >
                            Update
                          </Button>
                        </div>
                      </div>
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
