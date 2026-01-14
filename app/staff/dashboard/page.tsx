"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

interface DashboardStats {
  pendingPayments: number
  ongoingRentals: number
  availableVehicles: number
  rentalsEndingToday: number
}

interface RecentRental {
  Rental_ID: number
  Customer_Name: string
  Vehicle_Brand: string
  Vehicle_Model: string
  Status: string
  StartDate: string
  EndDate: string
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const statsRes = await fetch("/api/staff/dashboard/stats")
      if (!statsRes.ok) throw new Error("Failed to fetch stats")
      const statsData = await statsRes.json()
      setStats(statsData)

      const rentalsRes = await fetch("/api/staff/rentals?limit=5")
      if (!rentalsRes.ok) throw new Error("Failed to fetch rentals")
      const rentalsData = await rentalsRes.json()
      setRecentRentals(rentalsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage rentals, payments, and vehicles</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingPayments || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Require action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ongoing Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.ongoingRentals || 0}</div>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.availableVehicles || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ending Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.rentalsEndingToday || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Return expected</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rentals */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Rentals</CardTitle>
              <Link href="/staff/rentals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentRentals.length === 0 ? (
              <p className="text-gray-500">No rentals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-medium">Customer</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Vehicle</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Dates</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Status</th>
                      <th className="text-left py-2 px-4 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRentals.map((rental) => (
                      <tr key={rental.Rental_ID} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{rental.Customer_Name}</td>
                        <td className="py-3 px-4 text-sm">
                          {rental.Vehicle_Brand} {rental.Vehicle_Model}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(rental.StartDate).toLocaleDateString()} -{" "}
                          {new Date(rental.EndDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              rental.Status === "Ongoing"
                                ? "default"
                                : rental.Status === "Pending Payment"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {rental.Status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/staff/rentals/${rental.Rental_ID}`}>
                            <Button variant="ghost" size="sm">
                              View
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/staff/rentals">
            <Button className="w-full">Manage Rentals</Button>
          </Link>
          <Link href="/staff/payments">
            <Button className="w-full">Process Payment</Button>
          </Link>
          <Link href="/staff/vehicles">
            <Button className="w-full">View Vehicles</Button>
          </Link>
          <Link href="/staff/customers">
            <Button className="w-full">Customers</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
