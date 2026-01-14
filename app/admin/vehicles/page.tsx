"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/admin/dashboard-layout"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Status: string
  DailyRate: number
  Year: number
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    Brand: "",
    Model: "",
    PlateNo: "",
    Status: "Available",
    DailyRate: "",
    Year: "",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/admin/vehicles")
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchVehicles()
        setShowForm(false)
        setFormData({
          Brand: "",
          Model: "",
          PlateNo: "",
          Status: "Available",
          DailyRate: "",
          Year: "",
        })
      }
    } catch (error) {
      console.error("Error adding vehicle:", error)
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
          <h1 className="text-4xl font-bold">Vehicles</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-white hover:bg-primary-dark">
            {showForm ? "Cancel" : "Add Vehicle"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6">
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Brand"
                  value={formData.Brand}
                  onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
                  required
                />
                <Input
                  placeholder="Model"
                  value={formData.Model}
                  onChange={(e) => setFormData({ ...formData, Model: e.target.value })}
                  required
                />
                <Input
                  placeholder="Plate No"
                  value={formData.PlateNo}
                  onChange={(e) => setFormData({ ...formData, PlateNo: e.target.value })}
                  required
                />
                <Input
                  placeholder="Year"
                  type="number"
                  value={formData.Year}
                  onChange={(e) => setFormData({ ...formData, Year: e.target.value })}
                  required
                />
                <Input
                  placeholder="Daily Rate"
                  type="number"
                  step="0.01"
                  value={formData.DailyRate}
                  onChange={(e) => setFormData({ ...formData, DailyRate: e.target.value })}
                  required
                />
                <select
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                  className="border border-border rounded px-3 py-2"
                >
                  <option>Available</option>
                  <option>Rented</option>
                  <option>Maintenance</option>
                  <option>Reserved</option>
                  <option>Decommissioned</option>
                </select>
              </div>
              <Button type="submit" className="bg-success text-white hover:bg-green-700">
                Add Vehicle
              </Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.Vehicle_ID} className="p-6">
              <h3 className="text-lg font-bold mb-2">
                {vehicle.Brand} {vehicle.Model}
              </h3>
              <div className="space-y-1 text-sm text-muted">
                <p>
                  <span className="font-semibold">Plate:</span> {vehicle.PlateNo}
                </p>
                <p>
                  <span className="font-semibold">Year:</span> {vehicle.Year}
                </p>
                <p>
                  <span className="font-semibold">Daily Rate:</span> PHP {vehicle.DailyRate}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {vehicle.Status}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
