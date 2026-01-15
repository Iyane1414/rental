"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RentalDetail {
  Rental_ID: number
  TotalAmount: number
  Status: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string

  const [rental, setRental] = useState<RentalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchRental()
  }, [rentalId])

  const fetchRental = async () => {
    try {
      setError("")
      const response = await fetch(`/api/public/rentals/${rentalId}`)
      if (response.ok) {
        const data = await response.json()
        setRental(data)
      } else {
        throw new Error("Failed to load rental")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load rental")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError("")

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
        return
      }

      const message = await response.text()
      throw new Error(message || "Payment failed")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute inset-0 yolo-animated-bg opacity-100" />
          <div className="absolute inset-0 opacity-[0.14]">
            <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
          </div>
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
            <p className="text-sm text-white/80">Loading payment details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!rental) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute inset-0 yolo-animated-bg opacity-100" />
          <div className="absolute inset-0 opacity-[0.14]">
            <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
          </div>
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
            <p className="text-sm text-white/80">Rental not found.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 yolo-animated-bg opacity-100" />
        <div className="absolute inset-0 opacity-[0.14]">
          <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
        </div>
        <div className="absolute left-1/2 top-[-240px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={140} height={48} priority className="h-10 w-auto object-contain" />
        </Link>
        <Link href="/browse-vehicles">
          <Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10">
            Browse
          </Button>
        </Link>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />

          <h1 className="text-3xl font-extrabold">Payment</h1>
          <p className="mt-2 text-white/70">Complete your payment to confirm the booking.</p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-extrabold text-white">Payment Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Rental ID</span>
                  <span className="font-semibold text-white">#{rental.Rental_ID}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Amount</span>
                  <span className="text-2xl font-extrabold text-white">PHP {rental.TotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="text-sm font-semibold text-yellow-200">{rental.Status}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white px-3 text-sm text-black outline-none focus:border-yellow-500/50"
                >
                  <option className="text-black">Cash</option>
                  <option className="text-black">Credit Card</option>
                  <option className="text-black">GCash</option>
                  <option className="text-black">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">Payment Date</label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="h-12 rounded-2xl border-white/15 bg-white/10 text-white focus-visible:ring-yellow-500/60"
                  required
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={processing}
                className="h-12 w-full rounded-2xl bg-white text-black hover:bg-white/90"
              >
                {processing ? "Processing..." : "Confirm Payment"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  )
}
