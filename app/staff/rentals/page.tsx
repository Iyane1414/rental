"use client"

import { useEffect, useMemo, useState } from "react"
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

function formatDate(d: string) {
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString()
}

function statusPill(status: string) {
  const base = "border px-2 py-1 text-xs font-semibold"
  if (status === "Pending Payment") return `${base} border-neutral-300 bg-neutral-100 text-neutral-800`
  if (status === "Ongoing") return `${base} border-yellow-500/30 bg-yellow-500/15 text-yellow-700`
  if (status === "Completed") return `${base} border-neutral-300 bg-white text-neutral-700`
  if (status === "Cancelled") return `${base} border-red-500/30 bg-red-500/10 text-red-700`
  return `${base} border-neutral-300 bg-white text-neutral-700`
}

export default function StaffRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchRentals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      setError("")
      const url = statusFilter === "all" ? "/api/staff/rentals" : `/api/staff/rentals?status=${encodeURIComponent(statusFilter)}`
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

  const statusOptions = useMemo(
    () => [
      { label: "All Rentals", value: "all" },
      { label: "Pending Payment", value: "Pending Payment" },
      { label: "Ongoing", value: "Ongoing" },
      { label: "Completed", value: "Completed" },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Rental Management</h1>
            <p className="mt-2 text-sm text-neutral-600">Manage all customer rentals and their status</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={fetchRentals} className="bg-black text-white hover:bg-black/90">
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const active = statusFilter === option.value
            return (
              <Button
                key={option.value}
                variant={active ? "default" : "outline"}
                onClick={() => setStatusFilter(option.value)}
                className={
                  active
                    ? "bg-black text-white hover:bg-black/90"
                    : "border-neutral-300 bg-white text-black hover:bg-neutral-50"
                }
              >
                {option.label}
              </Button>
            )
          })}
        </div>

        {error && (
          <Card className="mb-6 border border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-black">Rentals ({rentals.length})</CardTitle>
          </CardHeader>

          <CardContent>
            {rentals.length === 0 ? (
              <p className="text-neutral-500">No rentals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">ID</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Customer</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Vehicle</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Plate</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Dates</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Amount</th>
                      <th className="py-3 pr-4 text-left text-xs font-bold text-neutral-600">Status</th>
                      <th className="py-3 text-left text-xs font-bold text-neutral-600">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rentals.map((r) => (
                      <tr key={r.Rental_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-4 pr-4 text-sm font-semibold text-black">#{r.Rental_ID}</td>
                        <td className="py-4 pr-4 text-sm text-black">{r.Customer_Name}</td>
                        <td className="py-4 pr-4 text-sm text-black">
                          {r.Vehicle_Brand} {r.Vehicle_Model}
                        </td>
                        <td className="py-4 pr-4 text-sm text-neutral-600">{r.PlateNo}</td>
                        <td className="py-4 pr-4 text-sm text-neutral-600">
                          {formatDate(r.StartDate)} – {formatDate(r.EndDate)}
                        </td>
                        <td className="py-4 pr-4 text-sm font-semibold text-black">
                          ₱{parseFloat(r.TotalAmount).toFixed(2)}
                        </td>
                        <td className="py-4 pr-4">
                          <Badge className={statusPill(r.Status)}>{r.Status}</Badge>
                        </td>
                        <td className="py-4">
                          <Link href={`/staff/rentals/${r.Rental_ID}`}>
                            <Button variant="outline" size="sm" className="border-neutral-300 bg-white text-black hover:bg-neutral-50">
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

        <div className="mt-8">
          <Link href="/staff/dashboard">
            <Button variant="outline" className="border-neutral-300 bg-white text-black hover:bg-neutral-50">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
