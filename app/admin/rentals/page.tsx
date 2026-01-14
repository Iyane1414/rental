"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/admin/dashboard-layout"

interface Customer {
  customer_id: number
  customer_name: string
  email: string
}

interface Vehicle {
  vehicle_id: number
  brand: string
  model: string
  plate: string
}

interface Rental {
  rental_id: number
  Customer: Customer
  Vehicle: Vehicle
  rental_start_date: string
  rental_end_date: string
  return_date: string | null
 status: string
  total_amount: number
  User_ID: number | null
}

interface Staff {
  user_id: number
  username: string
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningRental, setAssigningRental] = useState<number | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<{ [key: number]: number }>({})
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRentals()
    fetchStaff()
  }, [])

  const fetchRentals = async () => {
    try {
      const response = await fetch("/api/admin/rentals")
      if (response.ok) {
        const data = await response.json()
        setRentals(data)
        setError("")
      }
    } catch (error) {
      console.error("Error fetching rentals:", error)
      setError("Failed to fetch rentals")
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        // Filter for staff only
        const staffUsers = data.filter((u: any) => u.Role === "Staff")
        setStaff(staffUsers.map((u: any) => ({ user_id: u.User_ID, username: u.Username })))
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
    }
  }

  const handleStatusUpdate = async (rentalId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchRentals()
        setError("")
      } else {
        setError("Failed to update rental status")
      }
    } catch (error) {
      console.error("Error updating rental:", error)
      setError("Error updating rental")
    }
  }

  const handleAssignStaff = async (rentalId: number, staffId: number) => {
    try {
      setAssigningRental(rentalId)
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ User_ID: staffId }),
      })

      if (response.ok) {
        fetchRentals()
        setSelectedStaff(prev => {
          const newState = { ...prev }
          delete newState[rentalId]
          return newState
        })
        setError("")
      } else {
        setError("Failed to assign staff")
      }
    } catch (error) {
      console.error("Error assigning staff:", error)
      setError("Error assigning staff member")
    } finally {
      setAssigningRental(null)
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Rentals Management</h1>
          <Button onClick={fetchRentals} variant="outline">Refresh</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <Card>
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Dates</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rentals.map((rental) => (
                  <tr key={rental.rental_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold">#{rental.rental_id}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="font-medium">{rental.Customer.customer_name}</div>
                      <div className="text-xs text-gray-500">{rental.Customer.email}</div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div>{rental.Vehicle.brand} {rental.Vehicle.model}</div>
                      <div className="text-xs text-gray-500">{rental.Vehicle.plate}</div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div>{new Date(rental.rental_start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(rental.rental_end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold">
                      PHP {(rental.total_amount || 0).toLocaleString('en-PH', {maximumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {selectedStaff[rental.rental_id] ? (
                        <div className="flex gap-2">
                          <select
                            value={selectedStaff[rental.rental_id]}
                            onChange={(e) => setSelectedStaff(prev => ({
                              ...prev,
                              [rental.rental_id]: Number(e.target.value)
                            }))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select Staff...</option>
                            {staff.map(s => (
                              <option key={s.user_id} value={s.user_id}>{s.username}</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleAssignStaff(rental.rental_id, selectedStaff[rental.rental_id])}
                            disabled={assigningRental === rental.rental_id || !selectedStaff[rental.rental_id]}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            {assigningRental === rental.rental_id ? "..." : "Assign"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStaff(prev => ({...prev, [rental.rental_id]: staff[0]?.user_id || 0}))}
                          className="text-xs"
                        >
                          {rental.User_ID ? `ID: ${rental.User_ID}` : "Assign Staff"}
                        </Button>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          rental.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : rental.status === "Ongoing"
                              ? "bg-blue-100 text-blue-800"
                              : rental.status === "Pending Payment"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <select
                        value={rental.status}
                        onChange={(e) => handleStatusUpdate(rental.rental_id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Rentals</h3>
            <p className="text-3xl font-bold text-blue-600">{rentals.length}</p>
          </Card>
          <Card className="p-6 bg-amber-50 border-amber-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Payment</h3>
            <p className="text-3xl font-bold text-amber-600">
              {rentals.filter(r => r.status === "Pending Payment").length}
            </p>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Ongoing</h3>
            <p className="text-3xl font-bold text-green-600">
              {rentals.filter(r => r.status === "Ongoing").length}
            </p>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Unassigned</h3>
            <p className="text-3xl font-bold text-purple-600">
              {rentals.filter(r => !r.User_ID).length}
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
