"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { AlertCircle, MapPin, Users, Wind, Zap, AlertTriangle } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  DailyRate: number
  Year: number
  Seats: number
  Category: string
  HasAC: boolean
  Location: string
  Status: string
}

interface ErrorState {
  type: "not_found" | "server_error" | null
  message: string
}

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  if (value === null || value === undefined) return "0.00"
  const num = typeof value === "number" ? value : Number(value)
  return isNaN(num) ? "0.00" : num.toFixed(2)
}

export default function BookVehiclePage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
  const [totalDays, setTotalDays] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchVehicle()
  }, [vehicleId])

  useEffect(() => {
    if (formData.startDate && formData.endDate && vehicle) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      // Validate dates
      if (end <= start) {
        setTotalDays(0)
        setTotalAmount(0)
        return
      }

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      setTotalDays(days > 0 ? days : 0)
      
      const dailyRate = typeof vehicle.DailyRate === "number" ? vehicle.DailyRate : Number(vehicle.DailyRate)
      setTotalAmount(days > 0 ? days * dailyRate : 0)
    }
  }, [formData.startDate, formData.endDate, vehicle])

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      setError({ type: null, message: "" })
      
      const response = await fetch(`/api/public/vehicles/${vehicleId}`)
      
      if (response.status === 404) {
        setError({ 
          type: "not_found", 
          message: "The vehicle you're looking for is no longer available." 
        })
        setVehicle(null)
        return
      }
      
      if (!response.ok) {
        setError({ 
          type: "server_error", 
          message: "Failed to load vehicle details. Please try again later." 
        })
        setVehicle(null)
        return
      }

      const data = await response.json()
      setVehicle(data)
      setPickupLocation(data.Location || "")
    } catch (err) {
      console.error("Error fetching vehicle:", err)
      setError({ 
        type: "server_error", 
        message: "An error occurred while loading the vehicle. Please try again." 
      })
      setVehicle(null)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.customerName.trim()) errors.customerName = "Full name is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format"
    if (!formData.phone.trim()) errors.phone = "Phone number is required"
    if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ""))) errors.phone = "Phone number must be at least 10 digits"
    if (!formData.licenseNo.trim()) errors.licenseNo = "License number is required"
    if (!formData.startDate) errors.startDate = "Start date is required"
    if (!formData.endDate) errors.endDate = "End date is required"
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end <= start) errors.endDate = "End date must be after start date"
    }
    if (!pickupLocation) errors.pickupLocation = "Pick-up location is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      const response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          vehicleId: Number.parseInt(vehicleId),
          totalAmount,
          pickupLocation,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/payment/${data.rentalId}`)
      } else {
        const errorData = await response.json()
        setError({
          type: "server_error",
          message: errorData.message || "Booking failed. Please try again."
        })
      }
    } catch (err) {
      console.error("Error booking vehicle:", err)
      setError({
        type: "server_error",
        message: "An error occurred while processing your booking. Please try again."
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading vehicle details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 404 Error State
  if (error.type === "not_found" || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="p-12 text-center border-red-200 bg-red-50">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button 
              onClick={() => router.push("/browse-vehicles")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Other Vehicles
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Server Error State
  if (error.type === "server_error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="p-12 text-center border-amber-200 bg-amber-50">
            <AlertTriangle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => fetchVehicle()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => router.push("/browse-vehicles")}
                variant="outline"
              >
                Browse Vehicles
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">
            Book {vehicle.Brand} {vehicle.Model}
          </h1>
          <p className="text-gray-600 mt-2">Year: {vehicle.Year} • Plate: {vehicle.PlateNo}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Details - Left Column */}
          <div className="lg:col-span-1">
            {/* Main Details Card */}
            <Card className="p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Vehicle Details</h2>
              
              <div className="space-y-5">
                {/* Category & Seats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-lg text-gray-900">{vehicle.Category}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Seats</p>
                      <p className="font-semibold text-lg text-gray-900">{vehicle.Seats}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{vehicle.Location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {vehicle.HasAC ? (
                      <>
                        <Wind className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Air Conditioning</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">No AC</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Daily Rate */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <p className="text-sm font-medium text-blue-100 mb-2">Daily Rate</p>
                  <p className="text-3xl font-bold">₱{formatCurrency(vehicle.DailyRate)}</p>
                  <p className="text-xs text-blue-100 mt-2">per day</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Form - Right Column */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Booking Details</h2>
              
              <form onSubmit={handleBooking} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Your Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.customerName}
                        onChange={(e) => {
                          setFormData({ ...formData, customerName: e.target.value })
                          if (formErrors.customerName) setFormErrors({ ...formErrors, customerName: "" })
                        }}
                        className={formErrors.customerName ? "border-red-500" : ""}
                      />
                      {formErrors.customerName && <p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (formErrors.email) setFormErrors({ ...formErrors, email: "" })
                          }}
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                        <Input
                          placeholder="+63 9XX XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value })
                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" })
                          }}
                          className={formErrors.phone ? "border-red-500" : ""}
                        />
                        {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Driver's License No. *</label>
                      <Input
                        placeholder="D1-23-456789-7"
                        value={formData.licenseNo}
                        onChange={(e) => {
                          setFormData({ ...formData, licenseNo: e.target.value })
                          if (formErrors.licenseNo) setFormErrors({ ...formErrors, licenseNo: "" })
                        }}
                        className={formErrors.licenseNo ? "border-red-500" : ""}
                      />
                      {formErrors.licenseNo && <p className="text-red-500 text-sm mt-1">{formErrors.licenseNo}</p>}
                    </div>
                  </div>
                </div>

                {/* Rental Dates & Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => {
                            setFormData({ ...formData, startDate: e.target.value })
                            if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: "" })
                          }}
                          className={formErrors.startDate ? "border-red-500" : ""}
                        />
                        {formErrors.startDate && <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => {
                            setFormData({ ...formData, endDate: e.target.value })
                            if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: "" })
                          }}
                          className={formErrors.endDate ? "border-red-500" : ""}
                        />
                        {formErrors.endDate && <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pick-up Location *</label>
                      <Input
                        placeholder="Pickup location"
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value)
                          if (formErrors.pickupLocation) setFormErrors({ ...formErrors, pickupLocation: "" })
                        }}
                        className={formErrors.pickupLocation ? "border-red-500" : ""}
                      />
                      {formErrors.pickupLocation && <p className="text-red-500 text-sm mt-1">{formErrors.pickupLocation}</p>}
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                {totalDays > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Daily Rate:</span>
                        <span className="font-semibold text-gray-900">₱{formatCurrency(vehicle.DailyRate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Number of Days:</span>
                        <span className="font-semibold text-gray-900">{totalDays} {totalDays === 1 ? "day" : "days"}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">₱{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-lg"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
