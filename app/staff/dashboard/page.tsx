"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

import { LayoutDashboard, Receipt, Car, Users, CreditCard, LogOut } from "lucide-react"

interface Rental {
  Rental_ID: number
  Customer_Name: string
  Vehicle_Brand: string
  Vehicle_Model: string
  PlateNo: string
  Status: string
  StartDate: string
  EndDate: string
  TotalAmount: string
}

function formatDate(d: string) {
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString()
}

function StatusBadge({ status }: { status: string }) {
  const cls = (() => {
    const s = status.toLowerCase()
    if (s.includes("ongoing")) return "border-yellow-500/25 bg-yellow-500/15 text-yellow-800"
    if (s.includes("pending")) return "border-red-500/25 bg-red-500/10 text-red-700"
    if (s.includes("completed") || s.includes("returned"))
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-800"
    if (s.includes("cancel")) return "border-red-500/25 bg-red-500/10 text-red-700"
    return "border-neutral-300 bg-white text-neutral-700"
  })()

  return <Badge className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{status}</Badge>
}

export default function StaffRentals() {
  const pathname = usePathname()
  const router = useRouter()

  const [rentals, setRentals] = useState<Rental[]>([])
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

  const statusOptions = useMemo(
    () => [
      { label: "All Rentals", value: "all" },
      { label: "Pending Payment", value: "Pending Payment" },
      { label: "Ongoing", value: "Ongoing" },
      { label: "Completed", value: "Completed" },
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
    fetchRentals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      setError("")
      const url =
        statusFilter === "all"
          ? "/api/staff/rentals"
          : `/api/staff/rentals?status=${encodeURIComponent(statusFilter)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch rentals")
      const data = await res.json()
      setRentals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
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
              <h1 className="text-xl font-extrabold tracking-tight">Rental Management</h1>
              <p className="text-sm text-neutral-600">Manage all customer rentals and their status</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchRentals}
                variant="outline"
                className="rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
              >
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
            <h1 className="text-2xl font-extrabold tracking-tight">Rental Management</h1>
            <p className="mt-1 text-sm text-neutral-600">Manage all customer rentals and their status</p>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const active = statusFilter === option.value
              return (
                <Button
                  key={option.value}
                  variant={active ? "default" : "outline"}
                  onClick={() => setStatusFilter(option.value)}
                  className={
                    active
                      ? "rounded-xl bg-black text-white hover:bg-black/90"
                      : "rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
                  }
                >
                  {option.label}
                </Button>
              )
            })}
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6 text-red-700">{error}</CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-black">Rentals ({rentals.length})</CardTitle>
            </CardHeader>

            <CardContent>
              {rentals.length === 0 ? (
                <p className="text-neutral-500">No rentals found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left">
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          ID
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Customer
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Vehicle
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Plate
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Dates
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Amount
                        </th>
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Status
                        </th>
                        <th className="py-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rentals.map((r) => (
                        <tr key={r.Rental_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 pr-4 text-sm font-semibold text-black">#{r.Rental_ID}</td>
                          <td className="py-4 pr-4 text-sm text-black">{r.Customer_Name}</td>
                          <td className="py-4 pr-4 text-sm text-black">
                            {r.Vehicle_Brand} {r.Vehicle_Model}
                          </td>
                          <td className="py-4 pr-4 text-sm text-neutral-600">{r.PlateNo}</td>
                          <td className="py-4 pr-4 text-sm text-neutral-600">
                            {formatDate(r.StartDate)} – {formatDate(r.EndDate)}
                          </td>
                          <td className="py-4 pr-4 text-sm font-semibold text-black">
                            ₱{Number.parseFloat(r.TotalAmount || "0").toFixed(2)}
                          </td>
                          <td className="py-4 pr-4">
                            <StatusBadge status={r.Status} />
                          </td>
                          <td className="py-4">
                            <Link href={`/staff/rentals/${r.Rental_ID}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
                              >
                                Manage
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
