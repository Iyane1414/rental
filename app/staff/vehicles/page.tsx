"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Year: number
  Status: string
  DailyRate: string
}

export default function StaffVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchVehicles()
  }, [statusFilter])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const url = statusFilter === "all" ? "/api/staff/vehicles" : `/api/staff/vehicles?status=${statusFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch vehicles")
      const data = await res.json()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Available":
        return "default"
      case "Rented":
        return "secondary"
      case "Maintenance":
        return "destructive"
      default:
        return "outline"
    }
  }

  const statusOptions = [
    { label: "All Vehicles", value: "all" },
    { label: "Available", value: "Available" },
    { label: "Rented", value: "Rented" },
    { label: "Maintenance", value: "Maintenance" },
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inventory</h1>
          <p className="text-gray-600 mt-2">View vehicle status and availability</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Vehicles ({vehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-gray-500">No vehicles found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.Vehicle_ID}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          {vehicle.Brand} {vehicle.Model}
                        </h3>
                        <p className="text-sm text-gray-600">{vehicle.Year}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(vehicle.Status)}>
                        {vehicle.Status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-600">Plate Number</div>
                        <div className="font-mono font-bold text-lg">{vehicle.PlateNo}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600">Daily Rate</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₱{parseFloat(vehicle.DailyRate).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="text-xs text-gray-500">
                        Status last updated: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
