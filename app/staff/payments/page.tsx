"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LayoutDashboard, Receipt, Car, Users, CreditCard, LogOut, RefreshCw } from "lucide-react"

interface Payment {
  Payment_ID: number
  Rental_ID: number
  Customer_Name: string
  Vehicle_Info: string
  Amount: string
  PaymentDate: string
  PaymentMethod: string
  Status: string
}

interface PendingRental {
  Rental_ID: number
  Customer_Name: string
  Vehicle_Info: string
  TotalAmount: string
}

export default function StaffPayments() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingRentals, setPendingRentals] = useState<PendingRental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [selectedRental, setSelectedRental] = useState<PendingRental | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [success, setSuccess] = useState("")

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
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const paymentsRes = await fetch("/api/staff/payments")
      if (!paymentsRes.ok) throw new Error("Failed to fetch payments")
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData)

      const pendingRes = await fetch("/api/staff/payments/pending")
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingRentals(pendingData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedRental) return

    try {
      setRecordingPayment(true)
      const res = await fetch("/api/staff/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Rental_ID: selectedRental.Rental_ID,
          Amount: selectedRental.TotalAmount,
          PaymentMethod: paymentMethod,
          PaymentDate: new Date().toISOString().split("T")[0],
        }),
      })

      if (!res.ok) throw new Error("Failed to record payment")

      setSuccess("Payment recorded successfully!")
      setSelectedRental(null)
      fetchPayments()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRecordingPayment(false)
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
              <h1 className="text-xl font-extrabold tracking-tight">Payment Management</h1>
              <p className="text-sm text-neutral-600">Record and view payments for rentals</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchPayments}
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
            <h1 className="text-2xl font-extrabold tracking-tight">Payment Management</h1>
            <p className="mt-1 text-sm text-neutral-600">Record and view payments for rentals</p>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6 text-red-700">{error}</CardContent>
            </Card>
          )}

          {success && (
            <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6 text-emerald-700">{success}</CardContent>
            </Card>
          )}

          {/* Pending Rentals */}
          {pendingRentals.length > 0 && (
            <Card className="mb-8 rounded-2xl border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-black">Pending Payments ({pendingRentals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRentals.map((rental) => (
                    <div
                      key={rental.Rental_ID}
                      className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                    >
                      <div>
                        <div className="font-semibold text-black">{rental.Customer_Name}</div>
                        <div className="text-sm text-neutral-600">{rental.Vehicle_Info}</div>
                        <div className="text-lg font-bold mt-2 text-black">₱{parseFloat(rental.TotalAmount).toFixed(2)}</div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedRental(rental)}
                            className="rounded-xl bg-black text-white hover:bg-black/90"
                          >
                            Record Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                          </DialogHeader>
                          {selectedRental?.Rental_ID === rental.Rental_ID && (
                            <div className="space-y-4">
                              <div className="bg-neutral-50 p-3 rounded-xl">
                                <div className="text-sm text-neutral-600">Customer</div>
                                <div className="font-semibold text-black">{selectedRental.Customer_Name}</div>
                                <div className="text-sm text-neutral-600 mt-3">Amount</div>
                                <div className="text-2xl font-bold text-black">
                                  ₱{parseFloat(selectedRental.TotalAmount).toFixed(2)}
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-semibold text-neutral-700">Payment Method</label>
                                <select
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                  className="w-full mt-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                                >
                                  <option>Cash</option>
                                  <option>Credit Card</option>
                                  <option>Debit Card</option>
                                  <option>Bank Transfer</option>
                                </select>
                              </div>

                              <Button
                                onClick={handleRecordPayment}
                                disabled={recordingPayment}
                                className="w-full rounded-xl bg-black text-white hover:bg-black/90"
                              >
                                {recordingPayment ? "Recording..." : "Confirm Payment"}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card className="rounded-2xl border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-black">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-neutral-500">No payments recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Customer</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Vehicle</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Method</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.Payment_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 px-4 text-sm font-semibold text-black">#{payment.Payment_ID}</td>
                          <td className="py-4 px-4 text-sm text-black">{payment.Customer_Name}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{payment.Vehicle_Info}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-black">₱{parseFloat(payment.Amount).toFixed(2)}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{payment.PaymentMethod}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <Badge className={payment.Status === "Completed" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-100"}>
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
        </div>
      </main>
    </div>
  )
}
