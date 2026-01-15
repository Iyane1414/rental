"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw } from "lucide-react"

interface DashboardStats {
  pendingPayments: number
  activeRentals: number
  availableVehicles: number
  completedToday: number
}

interface RecentRental {
  Rental_ID: number
  Status: string
  StartDate: string
  EndDate: string
  Customer: {
    Customer_Name: string
  }
  Vehicle: {
    Brand: string
    Model: string
  }
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
      <div className="flex h-full flex-col p-6">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-10 w-auto object-contain" />
        </Link>

        <div className="mt-6 text-xs font-semibold tracking-widest text-neutral-500">ADMIN PORTAL</div>

        {/* Nav */}
        <nav className="mt-4 space-y-2">
          {nav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-black text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-black",
                  ].join(" ")}
                >
                  <Icon className={active ? "h-4 w-4 text-yellow-400" : "h-4 w-4 text-neutral-500"} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <p className="mt-3 text-xs text-neutral-400">© {new Date().getFullYear()} YOLO Car Rental</p>
        </div>
      </div>
    </aside>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      const statsRes = await fetch("/api/admin/stats")
      if (!statsRes.ok) throw new Error("Failed to fetch stats")
      const statsData = await statsRes.json()
      setStats(statsData)

      const rentalsRes = await fetch("/api/admin/rentals")
      if (!rentalsRes.ok) throw new Error("Failed to fetch rentals")
      const rentalsData = await rentalsRes.json()
      setRecentRentals((rentalsData || []).slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

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

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
              <div>
                <h1 className="text-2xl font-extrabold text-black">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-neutral-600">Monitor operations and manage rentals</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchDashboardData}
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

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { title: "Pending Payments", value: stats?.pendingPayments ?? 0, sub: "Require action" },
                { title: "Active Rentals", value: stats?.activeRentals ?? 0, sub: "In progress" },
                { title: "Available Vehicles", value: stats?.availableVehicles ?? 0, sub: "Ready to rent" },
                { title: "Completed Today", value: stats?.completedToday ?? 0, sub: "Finished rentals" },
              ].map((item) => (
                <Card key={item.title} className="rounded-2xl border-neutral-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-neutral-700">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-extrabold text-black">{item.value}</div>
                      <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">{item.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Rentals */}
            <Card className="mt-8 rounded-2xl border-neutral-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-extrabold text-black">Recent Rentals</CardTitle>
                  <Link href="/admin/rentals">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-neutral-200 bg-white hover:bg-neutral-100"
                    >
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent>
                {recentRentals.length === 0 ? (
                  <p className="text-neutral-500">No rentals found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">
                            CUSTOMER
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">
                            VEHICLE
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">
                            DATES
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">
                            STATUS
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-bold tracking-widest text-neutral-500">
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRentals.map((rental) => (
                          <tr key={rental.Rental_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-4 px-4 text-sm font-semibold text-black">
                              {rental.Customer?.Customer_Name || "Unknown"}
                            </td>
                            <td className="py-4 px-4 text-sm text-neutral-800">
                              {rental.Vehicle?.Brand || "Unknown"} {rental.Vehicle?.Model || ""}
                            </td>
                            <td className="py-4 px-4 text-sm text-neutral-600">
                              {new Date(rental.StartDate).toLocaleDateString()} –{" "}
                              {new Date(rental.EndDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={
                                  rental.Status === "Ongoing"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-100"
                                }
                              >
                                {rental.Status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Link href="/admin/rentals">
                                <Button variant="ghost" size="sm" className="rounded-xl">
                                  View
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

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Link href="/admin/rentals">
                <Button className="w-full rounded-xl bg-black text-white hover:bg-black/90">Manage Rentals</Button>
              </Link>
              <Link href="/admin/payments">
                <Button className="w-full rounded-xl bg-black text-white hover:bg-black/90">Process Payment</Button>
              </Link>
              <Link href="/admin/vehicles">
                <Button className="w-full rounded-xl bg-black text-white hover:bg-black/90">View Vehicles</Button>
              </Link>
              <Link href="/admin/customers">
                <Button className="w-full rounded-xl bg-black text-white hover:bg-black/90">Customers</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
