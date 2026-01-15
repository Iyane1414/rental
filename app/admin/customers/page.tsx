"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw } from "lucide-react"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  Email: string
  ContactNo: string
  LicenseNo: string
  Address: string
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
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
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1">
          {/* Top bar */}
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
              <div>
                <h1 className="text-2xl font-extrabold text-black">Customer Management</h1>
                <p className="mt-1 text-sm text-neutral-600">View all customer information</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchCustomers}
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
            <Card className="rounded-2xl border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-black">Customers ({customers.length})</CardTitle>
              </CardHeader>

              <CardContent>
                {customers.length === 0 ? (
                  <p className="text-neutral-500">No customers found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Email</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Phone</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">License No</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.Customer_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-4 px-4 text-sm font-semibold text-black">{customer.Customer_Name}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{customer.Email}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{customer.ContactNo}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{customer.LicenseNo}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{customer.Address}</td>
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
    </div>
  )
}
