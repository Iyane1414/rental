"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface RentalDetail {
  Rental_ID: number
  Customer_ID: number
  Customer_Name: string
  Customer_Email: string
  Customer_Phone: string
  Vehicle_ID: number
  Vehicle_Brand: string
  Vehicle_Model: string
  PlateNo: string
  VehicleStatus: string
  StartDate: string
  EndDate: string
  TotalAmount: string
  Status: string
  Payment_ID?: number
  Payment_Status?: string
}

export default function StaffRentalDetail() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string

  const [rental, setRental] = useState<RentalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchRentalDetail()
  }, [rentalId])

  const fetchRentalDetail = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/staff/rentals/${rentalId}`)
      if (!res.ok) throw new Error("Failed to fetch rental details")
      const data = await res.json()
      setRental(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/staff/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update rental status")
      setSuccess(`Rental status updated to ${newStatus}`)
      fetchRentalDetail()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">Rental not found</CardContent>
          </Card>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rental #{rental.Rental_ID}</h1>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="default" className="text-lg px-3 py-1">
              {rental.Status}
            </Badge>
            {rental.Payment_ID && (
              <Badge variant={rental.Payment_Status === "Completed" ? "default" : "secondary"}>
                Payment: {rental.Payment_Status}
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6 text-green-700">{success}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="text-lg font-medium">{rental.Customer_Name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-sm">{rental.Customer_Email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="text-sm">{rental.Customer_Phone}</div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Vehicle</div>
                <div className="text-lg font-medium">
                  {rental.Vehicle_Brand} {rental.Vehicle_Model}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Plate Number</div>
                <div className="text-sm font-mono">{rental.PlateNo}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Vehicle Status</div>
                <Badge>{rental.VehicleStatus}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rental Dates & Amount */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rental Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600">Start Date</div>
              <div className="text-lg font-medium">{new Date(rental.StartDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">End Date</div>
              <div className="text-lg font-medium">{new Date(rental.EndDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-lg font-medium">₱{parseFloat(rental.TotalAmount).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Status Workflow Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rental.Status === "Pending Payment" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-4">
                    This rental is awaiting payment. Once payment is confirmed, you can mark it as Ongoing.
                  </p>
                  <Button
                    onClick={() => handleStatusChange("Ongoing")}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    {actionLoading ? "Updating..." : "Mark as Ongoing"}
                  </Button>
                </div>
              )}

              {rental.Status === "Ongoing" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-4">Rental is in progress. Mark as completed when vehicle is returned.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full">Mark as Completed</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Complete Rental?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the rental as completed and make the vehicle available for other bookings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleStatusChange("Completed")}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Completing..." : "Complete Rental"}
                      </AlertDialogAction>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {(rental.Status === "Pending Payment" || rental.Status === "Ongoing") && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800 mb-4">Cancel this rental if needed.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Cancel Rental
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Rental?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The vehicle will be released for other bookings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleStatusChange("Cancelled")}
                        disabled={actionLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {actionLoading ? "Cancelling..." : "Confirm Cancel"}
                      </AlertDialogAction>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {rental.Status === "Completed" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">This rental has been completed.</p>
                </div>
              )}

              {rental.Status === "Cancelled" && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">This rental has been cancelled.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
