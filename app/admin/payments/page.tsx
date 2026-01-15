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

interface Payment {
  Payment_ID: number
  Rental_ID: number
  Amount: number
  PaymentDate: string
  PaymentMethod: string
  Status: string
  Rental?: {
    Rental_ID: number
    Status: string
    TotalAmount: number
    Customer?: {
      Customer_ID: number
      Customer_Name: string
      Email: string
    } | null
    Vehicle?: {
      Vehicle_ID: number
      Brand: string
      Model: string
      PlateNo: string
      Status: string
    } | null
  } | null
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [statusDraft, setStatusDraft] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setError("")
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
        setStatusDraft((prev) => {
          const next = { ...prev }
          data.forEach((payment: Payment) => {
            if (!next[payment.Payment_ID]) next[payment.Payment_ID] = payment.Status
          })
          return next
        })
      } else {
        throw new Error("Failed to fetch payments")
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async (paymentId: number) => {
    try {
      const nextStatus = statusDraft[paymentId]
      if (!nextStatus) return

      setUpdatingId(paymentId)
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: nextStatus }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to update payment")
      }

      await fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment")
    } finally {
      setUpdatingId(null)
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
                <h1 className="text-2xl font-extrabold text-black">Payment Management</h1>
                <p className="mt-1 text-sm text-neutral-600">View all payment transactions</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchPayments}
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

            <Card className="rounded-2xl border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-black">Payments ({payments.length})</CardTitle>
              </CardHeader>

              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-neutral-500">No payments found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">ID</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Rental ID</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Amount</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Method</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.Payment_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-4 px-4 text-sm font-semibold text-black">#{payment.Payment_ID}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">#{payment.Rental_ID}</td>
                            <td className="py-4 px-4 text-sm font-semibold text-black">₱{payment.Amount.toFixed(2)}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                            <td className="py-4 px-4 text-sm text-neutral-600">{payment.PaymentMethod}</td>
                            <td className="py-4 px-4">
                              <Badge
                                className={
                                  payment.Status === "Paid"
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                    : payment.Status === "Failed" || payment.Status === "Refunded"
                                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {payment.Status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={statusDraft[payment.Payment_ID] || payment.Status}
                                  onChange={(e) =>
                                    setStatusDraft((prev) => ({
                                      ...prev,
                                      [payment.Payment_ID]: e.target.value,
                                    }))
                                  }
                                  className="h-9 rounded-xl border border-neutral-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Failed">Failed</option>
                                  <option value="Refunded">Refunded</option>
                                </select>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdatePayment(payment.Payment_ID)}
                                  disabled={updatingId === payment.Payment_ID}
                                  className="h-9 rounded-xl bg-black text-white hover:bg-black/90"
                                >
                                  {updatingId === payment.Payment_ID ? "Saving" : "Update"}
                                </Button>
                              </div>
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
    </div>
  )
}
