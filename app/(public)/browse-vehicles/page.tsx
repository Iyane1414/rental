"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  Status: string
  DailyRate: number
  Year: number
  Seats: number
  Category: string
  HasAC: boolean
  Location: string
}

export default function BrowseVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("popular")
  const [location, setLocation] = useState("Mumbai")
  const [destination, setDestination] = useState("Goa")
  const [date, setDate] = useState("2025-01-16")
  const [time, setTime] = useState("03:00 AM")
  const [lookingFor, setLookingFor] = useState("4 seat")
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    seats: null as number | null,
    category: "all",
    hasAC: false,
  })
  const [popularFilters, setPopularFilters] = useState({
    ac: false,
    newCar: false,
    nonStop: false,
  })

  useEffect(() => {
    fetchVehicles()
  }, [filters, sortBy, date])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("priceMin", filters.priceMin.toString())
      params.append("priceMax", filters.priceMax.toString())
      params.append("sortBy", sortBy)
      
      if (filters.seats !== null) {
        params.append("seats", filters.seats.toString())
      }
      if (filters.category !== "all") {
        params.append("category", filters.category)
      }
      if (filters.hasAC) {
        params.append("hasAC", "true")
      }
      if (date) {
        params.append("startDate", date)
        // Add default end date (7 days later)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 7)
        params.append("endDate", endDate.toISOString().split("T")[0])
      }

      const response = await fetch(`/api/public/vehicles?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
        setFilteredVehicles(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading vehicles...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Sidebar */}
      <aside className="fixed left-0 top-0 w-16 h-screen bg-blue-600 flex flex-col items-center py-4 gap-6 z-40">
        <button className="text-white hover:bg-blue-700 p-3 rounded transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <button className="text-white hover:bg-blue-700 p-3 rounded transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zm4.4 0h8.2v1.9H8.3z" />
          </svg>
        </button>
        <button className="text-white hover:bg-blue-700 p-3 rounded transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>
        <button className="text-white hover:bg-blue-700 p-3 rounded transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
        </button>
        <div className="mt-auto flex flex-col gap-3">
          <button className="bg-red-600 text-white rounded-full p-3 hover:bg-red-700 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-16">
        {/* Top Header with Search */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-3 flex justify-between items-center">
            <div className="flex gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button className="text-gray-700 hover:text-gray-900">Become a Partner</button>
              <span className="text-gray-400">|</span>
              <button className="text-gray-700 hover:text-gray-900">Mansourul Haque</button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">From</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">To</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors">
                Search Cars
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex gap-6 p-6">
          {/* Right Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-gray-900">Filters</h3>

              {/* Price Range */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price</h4>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>${filters.priceMin}</span>
                  <span>${filters.priceMax}</span>
                </div>
                <div className="w-full h-12 bg-gray-100 rounded mt-2"></div>
              </div>

              {/* Seats */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-900 block mb-3">Seats</label>
                <div className="relative">
                  <select
                    value={filters.seats || ""}
                    onChange={(e) => setFilters({ ...filters, seats: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                  >
                    <option value="">Any</option>
                    <option value="4">4 Seat</option>
                    <option value="5">5 Seat</option>
                    <option value="7">7 Seat</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="text-sm font-semibold text-gray-900 block mb-3">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                  >
                    <option value="all">All</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Popular Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Popular Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasAC}
                      onChange={(e) => setFilters({ ...filters, hasAC: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">AC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={popularFilters.newCar}
                      onChange={(e) => setPopularFilters({ ...popularFilters, newCar: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Newer Cars (2022+)</span>
                  </label>
                </div>
              </div>

              <button className="w-full text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                More
              </button>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1">
            {/* Header with Sort */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Available Vehicles</h2>
                <p className="text-sm text-gray-600">Total {filteredVehicles.length} result</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("cheapest")}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    sortBy === "cheapest"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cheapest
                </button>
                <button
                  onClick={() => setSortBy("best")}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    sortBy === "best"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Best
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    sortBy === "newest"
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Newest
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <div key={vehicle.Vehicle_ID} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer flex gap-4">
                    {/* Vehicle Image */}
                    <Link href={`/book-vehicle/${vehicle.Vehicle_ID}`} className="w-40 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={`/.jpg?height=128&width=160&query=${vehicle.Brand} ${vehicle.Model} ${vehicle.Year}`}
                        alt={`${vehicle.Brand} ${vehicle.Model}`}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Vehicle Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900">
                          {vehicle.Brand} {vehicle.Model}
                        </h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold flex-shrink-0">
                          {vehicle.Category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{vehicle.Year} • {vehicle.Location}</p>

                      {/* Features Icons */}
                      <div className="flex gap-4 text-xs text-gray-600">
                        {vehicle.HasAC && <span className="flex items-center gap-1">❄️ AC</span>}
                        <span className="flex items-center gap-1">👥 {vehicle.Seats} Seat</span>
                      </div>
                    </div>

                    {/* Price and Buttons */}
                    <div className="flex-shrink-0 text-right flex flex-col items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${vehicle.DailyRate}</p>
                        <p className="text-xs text-gray-600">/day</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Link href={`/book-vehicle/${vehicle.Vehicle_ID}`}>
                          <Button className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 text-xs px-3 py-1">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/book-vehicle/${vehicle.Vehicle_ID}`}>
                          <Button
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1"
                          >
                            BOOK NOW
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No vehicles match your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
