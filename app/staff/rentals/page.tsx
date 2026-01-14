"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

interface Rental {
  Rental_ID: number
  Customer_Name: string
  Vehicle_Brand: string
  Vehicle_Model: string
  PlateNo: string
  Status: string
  StartDate: string
  EndDate: string
  TotalAmount: string
}

export default function StaffRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchRentals()
  }, [statusFilter])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const url = statusFilter === "all" ? "/api/staff/rentals" : `/api/staff/rentals?status=${statusFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch rentals")
      const data = await res.json()
      setRentals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending Payment":
        return "secondary"
      case "Ongoing":
        return "default"
      case "Completed":
        return "outline"
      case "Cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const statusOptions = [
    { label: "All Rentals", value: "all" },
    { label: "Pending Payment", value: "Pending Payment" },
    { label: "Ongoing", value: "Ongoing" },
    { label: "Completed", value: "Completed" },
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
          <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-600 mt-2">Manage all customer rentals and their status</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "default" : "outline"}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rentals ({rentals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rentals.length === 0 ? (
              <p className="text-gray-500">No rentals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Plate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Dates</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map((rental) => (
                      <tr key={rental.Rental_ID} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">#{rental.Rental_ID}</td>
                        <td className="py-3 px-4 text-sm">{rental.Customer_Name}</td>
                        <td className="py-3 px-4 text-sm">
                          {rental.Vehicle_Brand} {rental.Vehicle_Model}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{rental.PlateNo}</td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <div>{new Date(rental.StartDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">to</div>
                            <div>{new Date(rental.EndDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">₱{parseFloat(rental.TotalAmount).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(rental.Status)}>{rental.Status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/staff/rentals/${rental.Rental_ID}`}>
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          </Link>
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
