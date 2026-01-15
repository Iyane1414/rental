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
  Paid: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed: "bg-red-100 text-red-800",
  Refunded: "bg-red-100 text-red-800",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
  const [statusDraft, setStatusDraft] = useState("")

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

  const handleUpdatePayment = async (paymentId: number, nextStatus: string) => {
    try {
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

  const filteredPayments = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return payments
    return payments.filter((payment) => {
      const customerName = payment.Rental?.Customer?.Customer_Name?.toLowerCase() || ""
      const customerEmail = payment.Rental?.Customer?.Email?.toLowerCase() || ""
      const vehicleName = `${payment.Rental?.Vehicle?.Brand || ""} ${payment.Rental?.Vehicle?.Model || ""}`.toLowerCase()
      const plate = payment.Rental?.Vehicle?.PlateNo?.toLowerCase() || ""
      return (
        payment.Payment_ID.toString().includes(normalized) ||
        payment.Rental_ID.toString().includes(normalized) ||
        customerName.includes(normalized) ||
        customerEmail.includes(normalized) ||
        vehicleName.includes(normalized) ||
        plate.includes(normalized) ||
        payment.PaymentMethod.toLowerCase().includes(normalized)
      )
    })
  }, [payments, searchQuery])

  const stats = useMemo(() => {
    return {
      total: payments.length,
      pending: payments.filter((p) => p.Status === "Pending").length,
      paid: payments.filter((p) => p.Status === "Paid").length,
      failed: payments.filter((p) => p.Status === "Failed").length,
    }
  }, [payments])

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.Payment_ID === selectedPaymentId) || null,
    [payments, selectedPaymentId]
  )

  useEffect(() => {
    if (!selectedPayment) {
      setStatusDraft("")
      return
    }
    setStatusDraft(selectedPayment.Status)
  }, [selectedPayment])

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
                <h1 className="text-lg font-extrabold text-black">Payment Management</h1>
                <p className="mt-1 text-xs text-neutral-500">Monitor transactions and payment status</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search payments..."
                    className="h-9 rounded-xl border-neutral-200 pl-9 text-sm"
                  />
                </div>
                <Link href="/admin/reports">
                  <Button className="h-9 rounded-xl bg-black text-white hover:bg-black/90">Reconcile</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={fetchPayments}
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

            <div className="mb-4 text-xs text-neutral-500">
              {stats.total} payments • {stats.pending} pending • {stats.paid} paid • {stats.failed} failed
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="rounded-2xl border-neutral-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-extrabold text-black">Payments</CardTitle>
                </CardHeader>

                <CardContent>
                  {filteredPayments.length === 0 ? (
                    <p className="text-neutral-500">No payments found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-500">
                            <th className="py-3 px-4 text-left font-semibold">Payment</th>
                            <th className="py-3 px-4 text-left font-semibold">Rental</th>
                            <th className="py-3 px-4 text-left font-semibold">Method / Date</th>
                            <th className="py-3 px-4 text-left font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map((payment) => (
                            <tr
                              key={payment.Payment_ID}
                              onClick={() => setSelectedPaymentId(payment.Payment_ID)}
                              className={[
                                "border-b border-neutral-100 cursor-pointer transition-colors",
                                selectedPaymentId === payment.Payment_ID ? "bg-neutral-100" : "hover:bg-neutral-50",
                              ].join(" ")}
                            >
                              <td className="py-3 px-4">
                                <div className="font-semibold text-black">#{payment.Payment_ID}</div>
                                <div className="mt-1 text-xs text-neutral-500">PHP {payment.Amount.toFixed(2)}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-neutral-900">#{payment.Rental_ID}</div>
                                <div className="mt-1 text-xs text-neutral-500">
                                  {payment.Rental?.Customer?.Customer_Name || "Unknown"}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs text-neutral-600">
                                <div>{payment.PaymentMethod}</div>
                                <div className="mt-1 text-neutral-400">
                                  {new Date(payment.PaymentDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={statusStyles[payment.Status] || "bg-neutral-100 text-neutral-700"}>
                                  {payment.Status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-black">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedPayment && (
                    <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                      Select a payment to view details and update status.
                    </div>
                  )}

                  {selectedPayment && (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Payment</p>
                        <p className="mt-2 text-lg font-extrabold text-black">#{selectedPayment.Payment_ID}</p>
                        <p className="text-sm text-neutral-600">
                          PHP {selectedPayment.Amount.toFixed(2)} - {selectedPayment.PaymentMethod}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-neutral-700">
                        <div>
                          <span className="font-semibold text-black">Rental:</span> #{selectedPayment.Rental_ID}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Customer:</span>{" "}
                          {selectedPayment.Rental?.Customer?.Customer_Name || "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Email:</span>{" "}
                          {selectedPayment.Rental?.Customer?.Email || "No email"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Vehicle:</span>{" "}
                          {selectedPayment.Rental?.Vehicle
                            ? `${selectedPayment.Rental.Vehicle.Brand} ${selectedPayment.Rental.Vehicle.Model}`
                            : "Unknown"}
                        </div>
                        <div>
                          <span className="font-semibold text-black">Plate:</span>{" "}
                          {selectedPayment.Rental?.Vehicle?.PlateNo || "N/A"}
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
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePayment(selectedPayment.Payment_ID, statusDraft)}
                            disabled={updatingId === selectedPayment.Payment_ID}
                            className="h-9 rounded-xl bg-black text-white hover:bg-black/90"
                          >
                            {updatingId === selectedPayment.Payment_ID ? "Saving" : "Update"}
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
