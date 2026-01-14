"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AlertCircle, AlertTriangle, MapPin, Users, Wind, Zap } from "lucide-react"

type Vehicle = {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  DailyRate: number | string
  Year: number
  Seats: number
  Category: string
  HasAC: boolean
  Location: string
  Status: string
}

type ErrorType = null | "not_found" | "server_error"
type ErrorState = { type: ErrorType; message: string }

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined) return "0.00"
  const n = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(n)) return "0.00"
  return n.toFixed(2)
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isNaN(n) ? 0 : n
}

export default function BookVehiclePage() {
  const router = useRouter()
  const params = useParams()

  const vehicleIdRaw = params?.id
  const vehicleId =
    typeof vehicleIdRaw === "string"
      ? vehicleIdRaw
      : Array.isArray(vehicleIdRaw)
        ? vehicleIdRaw[0]
        : ""

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ✅ IMPORTANT: explicit type so TS never becomes "never"
  const [error, setError] = useState<ErrorState>({ type: null, message: "" })

  const [pickupLocation, setPickupLocation] = useState("")

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    licenseNo: "",
    startDate: "",
    endDate: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { totalDays, totalAmount } = useMemo(() => {
    if (!vehicle || !formData.startDate || !formData.endDate) {
      return { totalDays: 0, totalAmount: 0 }
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { totalDays: 0, totalAmount: 0 }
    }

    if (end <= start) {
      return { totalDays: 0, totalAmount: 0 }
    }

    const msPerDay = 1000 * 60 * 60 * 24
    const days = Math.ceil((end.getTime() - start.getTime()) / msPerDay) + 1
    const safeDays = days > 0 ? days : 0

    const dailyRate = toNumber(vehicle.DailyRate)
    const amount = safeDays > 0 ? safeDays * dailyRate : 0

    return { totalDays: safeDays, totalAmount: amount }
  }, [formData.startDate, formData.endDate, vehicle])

  async function fetchVehicle() {
    try {
      setLoading(true)
      setError({ type: null, message: "" })

      if (!vehicleId) {
        setVehicle(null)
        setError({ type: "not_found", message: "Missing vehicle ID in the URL." })
        return
      }

      const res = await fetch(`/api/public/vehicles/${vehicleId}`, { method: "GET" })

      if (res.status === 404) {
        setVehicle(null)
        setError({ type: "not_found", message: "The vehicle you're looking for is no longer available." })
        return
      }

      if (!res.ok) {
        setVehicle(null)
        setError({ type: "server_error", message: "Failed to load vehicle details. Please try again later." })
        return
      }

      const data = (await res.json()) as Vehicle
      setVehicle(data)
      setPickupLocation(data?.Location ?? "")
    } catch (e) {
      console.error("Error fetching vehicle:", e)
      setVehicle(null)
      setError({ type: "server_error", message: "An error occurred while loading the vehicle. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  function validateForm(): boolean {
    const errors: Record<string, string> = {}

    if (!formData.customerName.trim()) errors.customerName = "Full name is required"

    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format"

    if (!formData.phone.trim()) errors.phone = "Phone number is required"
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, "")))
      errors.phone = "Phone number must be at least 10 digits"

    if (!formData.licenseNo.trim()) errors.licenseNo = "License number is required"

    if (!formData.startDate) errors.startDate = "Start date is required"
    if (!formData.endDate) errors.endDate = "End date is required"

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        errors.endDate = "End date must be after start date"
      }
    }

    if (!pickupLocation.trim()) errors.pickupLocation = "Pick-up location is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!vehicle) return
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError({ type: null, message: "" })

      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          vehicleId: Number(vehicle.Vehicle_ID),
          totalAmount,
          pickupLocation,
        }),
      })

      if (!res.ok) {
        let msg = "Booking failed. Please try again."
        try {
          const errJson = await res.json()
          msg = errJson?.error || errJson?.message || msg
        } catch {
          const txt = await res.text()
          if (txt) msg = txt
        }
        setError({ type: "server_error", message: msg })
        return
      }

      const data = await res.json()
      const rentalId = data?.rentalId ?? data?.Rental_ID ?? data?.id
      if (!rentalId) {
        setError({ type: "server_error", message: "Booking succeeded but no rentalId was returned by the server." })
        return
      }

      router.push(`/payment/${rentalId}`)
    } catch (e) {
      console.error("Error booking vehicle:", e)
      setError({ type: "server_error", message: "An error occurred while processing your booking. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  // ===== THEMED SHELL (same vibe as login page) =====
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background (same as login page) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 yolo-animated-bg opacity-100" />

        {/* cars background */}
        <div className="absolute inset-0 opacity-[0.14]">
          <Image
            src="/cars.png"
            alt=""
            fill
            priority
            className="object-cover grayscale contrast-125 blur-[1px]"
          />
        </div>

        {/* spotlights + fade */}
        <div className="absolute left-1/2 top-[-240px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Top bar */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={140} height={48} priority className="h-10 w-auto object-contain" />
        </Link>


      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white/80" />
              </div>
              <p className="text-white/70">Loading vehicle details...</p>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && (error.type === "not_found" || !vehicle) && (
          <div className="mx-auto mt-10 max-w-xl">
            <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-yellow-300" />
              <h2 className="text-2xl font-extrabold">Vehicle Not Found</h2>
              <p className="mt-2 text-white/70">{error.message || "Vehicle not found."}</p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push("/browse-vehicles")}
                  className="h-12 rounded-2xl bg-white text-black hover:bg-white/90"
                >
                  Browse Other Vehicles
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Server error */}
        {!loading && error.type === "server_error" && (
          <div className="mx-auto mt-10 max-w-xl">
            <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />
              <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-yellow-300" />
              <h2 className="text-2xl font-extrabold">Something Went Wrong</h2>
              <p className="mt-2 text-white/70">{error.message}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={fetchVehicle} className="h-12 rounded-2xl bg-white text-black hover:bg-white/90">
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/browse-vehicles")}
                  variant="outline"
                  className="h-12 rounded-2xl border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  Browse Vehicles
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Main UI */}
        {!loading && vehicle && error.type === null && (
          <>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="mb-3 px-0 text-white/70 hover:bg-transparent hover:text-white"
                >
                  ← Back
                </Button>

                <h1 className="text-3xl font-extrabold sm:text-4xl">
                  Book {vehicle.Brand} {vehicle.Model}
                </h1>
                <p className="mt-2 text-white/70">
                  Year: {vehicle.Year} • Plate: {vehicle.PlateNo}
                </p>
              </div>

              <Link href="/browse-vehicles">
                <Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10">
                  Back to Browse
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* LEFT: Vehicle details */}
              <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl lg:col-span-1">
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />
                <h2 className="relative text-lg font-extrabold text-white">Vehicle Details</h2>

                <div className="relative mt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/60">Category</p>
                      <p className="mt-1 font-bold">{vehicle.Category}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-yellow-300" />
                        <p className="text-xs text-white/60">Seats</p>
                      </div>
                      <p className="mt-1 font-bold">{vehicle.Seats}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-300" />
                      <p className="text-xs text-white/60">Location</p>
                    </div>
                    <p className="mt-1 font-semibold text-white/90">{vehicle.Location}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Wind className={`h-4 w-4 ${vehicle.HasAC ? "text-yellow-300" : "text-white/40"}`} />
                      <p className="text-sm font-semibold text-white/90">
                        {vehicle.HasAC ? "Air Conditioning" : "No AC"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-5">
                    <p className="text-xs font-semibold text-yellow-300">Daily Rate</p>
                    <p className="mt-2 text-3xl font-extrabold text-white">₱{formatCurrency(vehicle.DailyRate)}</p>
                    <p className="mt-1 text-xs text-white/60">per day</p>
                  </div>
                </div>
              </Card>

              {/* RIGHT: Booking form */}
              <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl lg:col-span-2 sm:p-8">
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />

                <h2 className="relative text-2xl font-extrabold text-white">Booking Details</h2>

                <form onSubmit={handleBooking} className="relative mt-6 space-y-6">
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white/90">
                      <Zap className="h-4 w-4 text-yellow-300" />
                      Your Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white/80">Full Name *</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.customerName}
                          onChange={(e) => {
                            setFormData((p) => ({ ...p, customerName: e.target.value }))
                            if (formErrors.customerName) setFormErrors((p) => ({ ...p, customerName: "" }))
                          }}
                          className={[
                            "h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60",
                            formErrors.customerName ? "border-red-500/70" : "",
                          ].join(" ")}
                        />
                        {formErrors.customerName && <p className="mt-1 text-sm text-red-200">{formErrors.customerName}</p>}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/80">Email *</label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, email: e.target.value }))
                              if (formErrors.email) setFormErrors((p) => ({ ...p, email: "" }))
                            }}
                            className={[
                              "h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60",
                              formErrors.email ? "border-red-500/70" : "",
                            ].join(" ")}
                          />
                          {formErrors.email && <p className="mt-1 text-sm text-red-200">{formErrors.email}</p>}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/80">Phone *</label>
                          <Input
                            placeholder="+63 9XX XXX XXXX"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, phone: e.target.value }))
                              if (formErrors.phone) setFormErrors((p) => ({ ...p, phone: "" }))
                            }}
                            className={[
                              "h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60",
                              formErrors.phone ? "border-red-500/70" : "",
                            ].join(" ")}
                          />
                          {formErrors.phone && <p className="mt-1 text-sm text-red-200">{formErrors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white/80">Driver License No. *</label>
                        <Input
                          placeholder="D1-23-456789-7"
                          value={formData.licenseNo}
                          onChange={(e) => {
                            setFormData((p) => ({ ...p, licenseNo: e.target.value }))
                            if (formErrors.licenseNo) setFormErrors((p) => ({ ...p, licenseNo: "" }))
                          }}
                          className={[
                            "h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60",
                            formErrors.licenseNo ? "border-red-500/70" : "",
                          ].join(" ")}
                        />
                        {formErrors.licenseNo && <p className="mt-1 text-sm text-red-200">{formErrors.licenseNo}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-base font-bold text-white/90">Rental Period</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/80">Start Date *</label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, startDate: e.target.value }))
                              if (formErrors.startDate) setFormErrors((p) => ({ ...p, startDate: "" }))
                            }}
                            className={[
                              "h-12 rounded-2xl border-white/15 bg-white/10 text-white focus-visible:ring-yellow-500/60",
                              formErrors.startDate ? "border-red-500/70" : "",
                            ].join(" ")}
                          />
                          {formErrors.startDate && <p className="mt-1 text-sm text-red-200">{formErrors.startDate}</p>}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white/80">End Date *</label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => {
                              setFormData((p) => ({ ...p, endDate: e.target.value }))
                              if (formErrors.endDate) setFormErrors((p) => ({ ...p, endDate: "" }))
                            }}
                            className={[
                              "h-12 rounded-2xl border-white/15 bg-white/10 text-white focus-visible:ring-yellow-500/60",
                              formErrors.endDate ? "border-red-500/70" : "",
                            ].join(" ")}
                          />
                          {formErrors.endDate && <p className="mt-1 text-sm text-red-200">{formErrors.endDate}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white/80">Pick-up Location *</label>
                        <Input
                          placeholder="Pickup location"
                          value={pickupLocation}
                          onChange={(e) => {
                            setPickupLocation(e.target.value)
                            if (formErrors.pickupLocation) setFormErrors((p) => ({ ...p, pickupLocation: "" }))
                          }}
                          className={[
                            "h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60",
                            formErrors.pickupLocation ? "border-red-500/70" : "",
                          ].join(" ")}
                        />
                        {formErrors.pickupLocation && (
                          <p className="mt-1 text-sm text-red-200">{formErrors.pickupLocation}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  {totalDays > 0 && (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="space-y-3 text-sm text-white/80">
                        <div className="flex items-center justify-between">
                          <span>Daily Rate</span>
                          <span className="font-semibold text-white">₱{formatCurrency(vehicle.DailyRate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Number of Days</span>
                          <span className="font-semibold text-white">
                            {totalDays} {totalDays === 1 ? "day" : "days"}
                          </span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                          <span className="text-base font-extrabold text-white">Total Amount</span>
                          <span className="text-2xl font-extrabold text-yellow-200">₱{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline server error (✅ TS safe now) */}
                  {error.type === "server_error" && error.message && (
                    <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-2xl bg-white text-black hover:bg-white/90"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Processing...
                      </span>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
