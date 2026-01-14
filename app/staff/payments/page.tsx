"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingRentals, setPendingRentals] = useState<PendingRental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [selectedRental, setSelectedRental] = useState<PendingRental | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [success, setSuccess] = useState("")

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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Record and view payments for rentals</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6 text-green-700">{success}</CardContent>
          </Card>
        )}

        {/* Pending Rentals */}
        {pendingRentals.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-orange-700">Pending Payments ({pendingRentals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRentals.map((rental) => (
                  <div
                    key={rental.Rental_ID}
                    className="flex justify-between items-center p-4 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{rental.Customer_Name}</div>
                      <div className="text-sm text-gray-600">{rental.Vehicle_Info}</div>
                      <div className="text-lg font-bold mt-2">₱{parseFloat(rental.TotalAmount).toFixed(2)}</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedRental(rental)}
                          className="bg-orange-600 hover:bg-orange-700"
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
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">Customer</div>
                              <div className="font-medium">{selectedRental.Customer_Name}</div>
                              <div className="text-sm text-gray-600 mt-3">Amount</div>
                              <div className="text-2xl font-bold">
                                ₱{parseFloat(selectedRental.TotalAmount).toFixed(2)}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Payment Method</label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full mt-2 px-3 py-2 border rounded-lg"
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
                              className="w-full"
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
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.Payment_ID} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">#{payment.Payment_ID}</td>
                        <td className="py-3 px-4 text-sm">{payment.Customer_Name}</td>
                        <td className="py-3 px-4 text-sm">{payment.Vehicle_Info}</td>
                        <td className="py-3 px-4 text-sm font-medium">₱{parseFloat(payment.Amount).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm">{payment.PaymentMethod}</td>
                        <td className="py-3 px-4 text-sm">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Badge variant={payment.Status === "Completed" ? "default" : "secondary"}>
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
    </div>
  )
}
