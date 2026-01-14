"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/admin/dashboard-layout"

interface Payment {
  Payment_ID: number
  Rental_ID: number
  Amount: number
  PaymentDate: string
  PaymentMethod: string
  Status: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Payments</h1>

        <div className="overflow-x-auto">
          <Card>
            <table className="w-full">
              <thead className="bg-muted-bg border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rental ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.Payment_ID} className="hover:bg-muted-bg">
                    <td className="px-6 py-3 text-sm font-semibold">#{payment.Payment_ID}</td>
                    <td className="px-6 py-3 text-sm">#{payment.Rental_ID}</td>
                    <td className="px-6 py-3 text-sm font-semibold">PHP {payment.Amount.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm">{payment.PaymentMethod}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          payment.Status === "Paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                        }`}
                      >
                        {payment.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
