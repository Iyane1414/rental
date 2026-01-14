"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface ReportData {
  totalRevenue: string
  averageRevenue: string
  totalRentals: number
  activeRentals: number
  completedRentals: number
  cancelledRentals: number
  pendingPaymentRentals: number
  topVehicles: Array<{
    Vehicle_Brand: string
    Vehicle_Model: string
    rentalCount: number
  }>
  topCustomers: Array<{
    Customer_Name: string
    rentalCount: number
  }>
  staffPerformance: Array<{
    Username: string
    rentalCount: number
    revenueHandled: string
  }>
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  )
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchReports()
  }, [dateFrom, dateTo])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/admin/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`
      )
      if (!res.ok) throw new Error("Failed to fetch reports")
      const data = await res.json()
      setReports(data)
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Business metrics and performance insights</p>
        </div>

        {/* Date Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <label className="text-sm font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{reports?.totalRevenue}</div>
              <p className="text-xs text-gray-500 mt-2">Period: {dateFrom} to {dateTo}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Revenue per Rental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{reports?.averageRevenue}</div>
              <p className="text-xs text-gray-500 mt-2">Based on completed payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Rental Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rental Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reports?.totalRentals}</div>
              <div className="text-xs text-gray-600">Total Rentals</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{reports?.pendingPaymentRentals}</div>
              <div className="text-xs text-gray-600">Pending Payment</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reports?.activeRentals}</div>
              <div className="text-xs text-gray-600">Active/Ongoing</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{reports?.completedRentals}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{reports?.cancelledRentals}</div>
              <div className="text-xs text-gray-600">Cancelled</div>
            </div>
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 10 Most Rented Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {reports?.topVehicles && reports.topVehicles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Rentals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.topVehicles.map((vehicle, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {vehicle.Vehicle_Brand} {vehicle.Vehicle_Model}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{vehicle.rentalCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 10 Most Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {reports?.topCustomers && reports.topCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Rentals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.topCustomers.map((customer, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{customer.Customer_Name}</td>
                        <td className="py-3 px-4 text-sm">{customer.rentalCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Performance (Accountability)</CardTitle>
          </CardHeader>
          <CardContent>
            {reports?.staffPerformance && reports.staffPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">Staff Member</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Rentals Processed</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Revenue Handled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.staffPerformance.map((staff, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{staff.Username}</td>
                        <td className="py-3 px-4 text-sm">{staff.rentalCount}</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ₱{parseFloat(staff.revenueHandled).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No staff data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
