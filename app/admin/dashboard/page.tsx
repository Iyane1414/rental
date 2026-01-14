"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/admin/dashboard-layout"

interface DashboardStats {
  activeRentals: number
  availableVehicles: number
  pendingPayments: number
  totalRevenue: number
  completedToday: number
  vehiclesInMaintenance: number
  staffCount: number
  pendingPaymentCount: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    activeRentals: 0,
    availableVehicles: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    completedToday: 0,
    vehiclesInMaintenance: 0,
    staffCount: 0,
    pendingPaymentCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch dashboard stats
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <Button onClick={fetchStats} variant="outline">Refresh Stats</Button>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200 hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Rentals</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.activeRentals}</p>
            <p className="text-xs text-gray-500 mt-2">Currently ongoing</p>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200 hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Available Vehicles</h3>
            <p className="text-4xl font-bold text-green-600">{stats.availableVehicles}</p>
            <p className="text-xs text-gray-500 mt-2">Ready to rent</p>
          </Card>

          <Card className="p-6 bg-amber-50 border-amber-200 hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Payments</h3>
            <p className="text-4xl font-bold text-amber-600">{stats.pendingPayments}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting payment</p>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200 hover:shadow-lg transition">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">PHP {(stats.totalRevenue || 0).toLocaleString('en-PH', {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500 mt-2">All payments</p>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-indigo-50 border-indigo-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Staff Members</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.staffCount}</p>
            <Link href="/admin/users">
              <p className="text-xs text-indigo-600 hover:underline mt-2 cursor-pointer">Manage Staff →</p>
            </Link>
          </Card>

          <Card className="p-6 bg-orange-50 border-orange-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">In Maintenance</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.vehiclesInMaintenance}</p>
            <p className="text-xs text-gray-500 mt-2">Unavailable vehicles</p>
          </Card>

          <Card className="p-6 bg-teal-50 border-teal-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Completed Today</h3>
            <p className="text-3xl font-bold text-teal-600">{stats.completedToday}</p>
            <p className="text-xs text-gray-500 mt-2">Returned rentals</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-gray-50 border-gray-200">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/rentals">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Create Rental
              </Button>
            </Link>
            <Link href="/admin/rentals">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                View All Rentals
              </Button>
            </Link>
            <Link href="/admin/vehicles">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Manage Fleet
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                View Reports
              </Button>
            </Link>
          </div>
        </Card>

        {/* Staff Overview */}
        <Card className="p-6 bg-white border-gray-200">
          <h2 className="text-xl font-semibold text-foreground mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Staff Members Online</span>
              <span className="font-semibold text-gray-800">{stats.staffCount} members</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Fleet Utilization</span>
              <span className="font-semibold text-gray-800">
                {stats.activeRentals + stats.availableVehicles + stats.vehiclesInMaintenance > 0
                  ? Math.round((stats.activeRentals / (stats.activeRentals + stats.availableVehicles + stats.vehiclesInMaintenance)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Collection Rate</span>
              <span className="font-semibold text-gray-800">
                {stats.activeRentals + stats.pendingPayments > 0
                  ? Math.round((stats.activeRentals / (stats.activeRentals + stats.pendingPayments)) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
