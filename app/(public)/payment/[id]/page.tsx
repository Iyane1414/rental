"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RentalDetail {
  Rental_ID: number
  TotalAmount: number
  PaymentMethod?: string
  Status: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string

  const [rental, setRental] = useState<RentalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchRental()
  }, [rentalId])

  const fetchRental = async () => {
    try {
      const response = await fetch(`/api/public/rentals/${rentalId}`)
      if (response.ok) {
        const data = await response.json()
        setRental(data)
      }
    } catch (error) {
      console.error("Error fetching rental:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const response = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId: Number.parseInt(rentalId),
          amount: rental?.TotalAmount,
          ...formData,
        }),
      })

      if (response.ok) {
        router.push(`/payment-success/${rentalId}`)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!rental) return <div className="p-8">Rental not found</div>

  return (
    <div className="min-h-screen bg-muted-bg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">Payment Summary</h2>

          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex justify-between mb-4">
              <span className="text-muted">Rental ID:</span>
              <span className="font-semibold">#{rentalId}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">PHP {rental.TotalAmount.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full border border-border rounded px-3 py-2"
              >
                <option>Cash</option>
                <option>Credit Card</option>
                <option>GCash</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Payment Date</label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div className="bg-success/10 border border-success/20 rounded p-4">
              <p className="text-sm text-muted">By clicking confirm, you agree to the rental terms and conditions.</p>
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-primary text-white hover:bg-primary-dark py-3 text-lg font-semibold"
            >
              {processing ? "Processing..." : "Confirm Payment"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
