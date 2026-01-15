"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ChevronDown, Filter, Search } from "lucide-react"

interface Vehicle {
  Vehicle_ID: number
  Brand: string
  Model: string
  PlateNo: string
  ImageUrl?: string | null
  Status: string
  DailyRate: number
  Year: number
  Seats: number
  Category: string
  HasAC: boolean
  Location: string
}

function getVehicleImage(brand: string, imageUrl?: string | null) {
  const trimmed = (imageUrl || "").trim()
  if (trimmed) return trimmed
  const b = (brand || "").toLowerCase()
  if (b.includes("honda")) return "/honda.png"
  if (b.includes("toyota")) return "/toyota.png"
  if (b.includes("mitsubishi")) return "/mitsubishi.png"
  if (b.includes("nissan")) return "/nissan.png"
  if (b.includes("ford")) return "/ford.png"
  return "/car-bg.png"
}

export default function BrowseVehiclesPage() {
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 10000 })
  const [boundsInitialized, setBoundsInitialized] = useState(false)

  const [sortBy, setSortBy] = useState<"popular" | "cheapest" | "best" | "newest">("popular")
  const [searchQuery, setSearchQuery] = useState("")
  const [fetching, setFetching] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null)

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    seats: null as number | null,
    category: "all",
    hasAC: false,
  })

  useEffect(() => {
    fetchVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy])

  useEffect(() => {
    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVehicles = async () => {
    let isInitialLoad = false
    try {
      isInitialLoad = !hasLoaded
      if (isInitialLoad) {
        setLoading(true)
      } else {
        setFetching(true)
      }

      const params = new URLSearchParams()
      params.append("priceMin", filters.priceMin.toString())
      params.append("priceMax", filters.priceMax.toString())
      params.append("sortBy", sortBy)

      if (filters.seats !== null) params.append("seats", filters.seats.toString())
      if (filters.category !== "all") params.append("category", filters.category)
      if (filters.hasAC) params.append("hasAC", "true")

      const response = await fetch(`/api/public/vehicles?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const list = Array.isArray(data) ? data : []
        setFilteredVehicles(list)
        setHasLoaded(true)
      } else {
        setFilteredVehicles([])
        setHasLoaded(true)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setFilteredVehicles([])
    } finally {
      setHasLoaded(true)
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setFetching(false)
      }
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/public/vehicles")
      if (!response.ok) {
        setAllVehicles([])
        return
      }
      const data = await response.json()
      setAllVehicles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching filter options:", error)
      setAllVehicles([])
    }
  }

  useEffect(() => {
    if (!allVehicles.length) return
    const rates = allVehicles
      .map((vehicle) => Number(vehicle.DailyRate))
      .filter((value) => Number.isFinite(value))
    if (!rates.length) return

    const min = Math.min(...rates)
    const max = Math.max(...rates)
    setPriceBounds({ min, max })

    if (!boundsInitialized) {
      setFilters((prev) => ({
        ...prev,
        priceMin: min,
        priceMax: max,
      }))
      setBoundsInitialized(true)
    }
  }, [allVehicles, boundsInitialized])

  const seatOptions = useMemo(() => {
    const counts = new Map<number, number>()
    allVehicles.forEach((vehicle) => {
      const seats = Number(vehicle.Seats)
      if (!Number.isFinite(seats)) return
      counts.set(seats, (counts.get(seats) || 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => a[0] - b[0])
  }, [allVehicles])

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()
    allVehicles.forEach((vehicle) => {
      const category = (vehicle.Category || "").trim()
      if (!category) return
      counts.set(category, (counts.get(category) || 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [allVehicles])

  const showAcFilter = useMemo(() => {
    if (!allVehicles.length) return false
    const hasTrue = allVehicles.some((vehicle) => vehicle.HasAC)
    const hasFalse = allVehicles.some((vehicle) => !vehicle.HasAC)
    return hasTrue && hasFalse
  }, [allVehicles])

  const visibleVehicles = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return filteredVehicles
    return filteredVehicles.filter((vehicle) => {
      const brand = vehicle.Brand?.toLowerCase() || ""
      const model = vehicle.Model?.toLowerCase() || ""
      const plate = vehicle.PlateNo?.toLowerCase() || ""
      const category = vehicle.Category?.toLowerCase() || ""
      const location = vehicle.Location?.toLowerCase() || ""
      return (
        brand.includes(normalized) ||
        model.includes(normalized) ||
        plate.includes(normalized) ||
        category.includes(normalized) ||
        location.includes(normalized)
      )
    })
  }, [filteredVehicles, searchQuery])

  const openDetails = (vehicle: Vehicle) => {
    setDetailsVehicle(vehicle)
    setDetailsOpen(true)
  }

  useEffect(() => {
    if (!showAcFilter && filters.hasAC) {
      setFilters((prev) => ({ ...prev, hasAC: false }))
    }
  }, [showAcFilter, filters.hasAC])

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute inset-0 yolo-animated-bg opacity-100" />
          <div className="absolute inset-0 opacity-[0.10]">
            <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
          </div>
          <div className="absolute left-1/2 top-[-240px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-180px] top-[-160px] h-[480px] w-[480px] rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
            <p className="text-sm text-white/80">Loading vehicles...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background (same vibe as login page) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 yolo-animated-bg opacity-100" />

        {/* Use cars.png as requested */}
        <div className="absolute inset-0 opacity-[0.12]">
          <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
        </div>

        <div className="absolute left-1/2 top-[-240px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-180px] top-[-160px] h-[480px] w-[480px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Top header (matches Home/Login theme) */}
      <header className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-10 w-auto object-contain" priority />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button className="bg-white text-black hover:bg-white/90">Home</Button>
            </Link>
          </div>
        </div>

        {/* Search bar row (clean + glass) */}
        <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-3 rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="mb-1 block text-[11px] font-semibold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" /> Car Search
                </span>
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand or model"
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Filters (left) */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-yellow-300" />
                  <h3 className="text-base font-extrabold">Filters</h3>
                </div>

                <button
                  onClick={() =>
                    setFilters({
                      priceMin: priceBounds.min,
                      priceMax: priceBounds.max,
                      seats: null,
                      category: "all",
                      hasAC: false,
                    })
                  }
                  className="text-xs font-semibold text-white/70 hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* Price */}
              <div className="mb-6 border-b border-white/10 pb-6">
                <p className="mb-3 text-sm font-semibold text-white/85">Price range</p>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                  className="w-full accent-yellow-500"
                />
                <div className="mt-2 flex justify-between text-xs text-white/70">
                  <span>PHP {filters.priceMin}</span>
                  <span>PHP {filters.priceMax}</span>
                </div>
              </div>

              {/* Seats */}
              <div className="mb-6 border-b border-white/10 pb-6">
                <label className="mb-3 block text-sm font-semibold text-white/85">Seats</label>
                <div className="relative">
                  <select
                    value={filters.seats ?? ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        seats: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="h-11 w-full appearance-none rounded-2xl border border-white/15 bg-white/10 px-3 pr-10 text-sm text-white outline-none focus:border-yellow-500/50"
                  >
                    <option value="">Any</option>
                    {seatOptions.map(([seats, count]) => (
                      <option key={seats} value={seats}>
                        {seats} Seats ({count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6 border-b border-white/10 pb-6">
                <label className="mb-3 block text-sm font-semibold text-white/85">Category</label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="h-11 w-full appearance-none rounded-2xl border border-white/15 bg-white/10 px-3 pr-10 text-sm text-white outline-none focus:border-yellow-500/50"
                  >
                    <option value="all">All</option>
                    {categoryOptions.map(([category, count]) => (
                      <option key={category} value={category}>
                        {category} ({count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                </div>
              </div>

              {showAcFilter && (
                <div className="mb-2">
                  <p className="mb-3 text-sm font-semibold text-white/85">Popular</p>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75">
                    <input
                      type="checkbox"
                      checked={filters.hasAC}
                      onChange={(e) => setFilters({ ...filters, hasAC: e.target.checked })}
                      className="h-4 w-4 accent-yellow-500"
                    />
                    Air conditioning (AC)
                  </label>
                </div>
              )}
            </Card>
          </aside>

          {/* Results (right) */}
          <section className="lg:col-span-9">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-white/60">AVAILABLE VEHICLES</p>
                <h2 className="mt-1 text-2xl font-extrabold">Choose your ride</h2>
                <p className="mt-1 text-sm text-white/70">
                  Total <span className="font-semibold text-white">{visibleVehicles.length}</span>{" "}
                  {visibleVehicles.length === 1 ? "result" : "results"}
                </p>
                {fetching && <p className="mt-1 text-xs text-white/50">Searching...</p>}
              </div>

              <div className="flex gap-2">
                {[
                  { key: "cheapest", label: "Cheapest" },
                  { key: "best", label: "Best" },
                  { key: "newest", label: "Newest" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key as any)}
                    className={[
                      "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                      sortBy === s.key
                        ? "bg-yellow-500 text-black"
                        : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of vehicle cards (theme-matched) */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleVehicles.map((vehicle) => {
                const id = vehicle.Vehicle_ID
                const brand = vehicle.Brand
                const model = vehicle.Model
                const category = vehicle.Category
                const year = vehicle.Year
                const seats = vehicle.Seats
                const hasAC = Boolean(vehicle.HasAC)
                const dailyRate = vehicle.DailyRate
                const loc = vehicle.Location
                const img = getVehicleImage(brand, vehicle.ImageUrl)

                return (
                  <Card
                    key={id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-2xl backdrop-blur-xl"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white/5">
                      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-white/10" />
                      </div>

                      <div className="relative aspect-[4/3] w-full">
                        <img
                          src={img}
                          alt={`${brand} ${model}`}
                          className="h-full w-full object-contain p-4"
                        />
                      </div>

                      <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white/85">
                        {category}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold">
                            {brand} <span className="text-white/80">{model}</span>
                          </h3>
                          <p className="mt-1 text-xs text-white/65">
                            {year} - {loc} - {seats} seats {hasAC ? "- AC" : ""}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-extrabold text-white">PHP {dailyRate}</p>
                          <p className="text-xs text-white/60">/day</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => openDetails(vehicle)}
                          className="h-11 w-full rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
                        >
                          View Details
                        </Button>

                        <Link href={`/book-vehicle/${id}`} className="w-full">
                          <Button className="h-11 w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-500/90">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {visibleVehicles.length === 0 && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70 backdrop-blur-xl">
                No vehicles match your filters right now.
              </div>
            )}

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
              <DialogContent className="max-w-3xl border-white/10 bg-black/90 text-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-extrabold text-white">Vehicle Details</DialogTitle>
                </DialogHeader>

                {detailsVehicle ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <div className="relative aspect-[4/3] w-full">
                        <img
                          src={getVehicleImage(detailsVehicle.Brand, detailsVehicle.ImageUrl)}
                          alt={`${detailsVehicle.Brand} ${detailsVehicle.Model}`}
                          className="h-full w-full object-contain p-4"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold tracking-widest text-white/60">VEHICLE</p>
                        <h3 className="mt-2 text-2xl font-extrabold">
                          {detailsVehicle.Brand} <span className="text-white/80">{detailsVehicle.Model}</span>
                        </h3>
                        <p className="mt-1 text-sm text-white/60">{detailsVehicle.PlateNo}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-white/50">Category</p>
                          <p className="mt-1 font-semibold text-white">{detailsVehicle.Category}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-white/50">Seats</p>
                          <p className="mt-1 font-semibold text-white">{detailsVehicle.Seats}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-white/50">Year</p>
                          <p className="mt-1 font-semibold text-white">{detailsVehicle.Year}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-white/50">Location</p>
                          <p className="mt-1 font-semibold text-white">{detailsVehicle.Location}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                          {detailsVehicle.HasAC ? "With AC" : "No AC"}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                          {detailsVehicle.Status}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-widest text-white/50">Daily Rate</p>
                        <p className="mt-2 text-2xl font-extrabold text-white">
                          PHP {detailsVehicle.DailyRate}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Link href={`/book-vehicle/${detailsVehicle.Vehicle_ID}`} className="flex-1">
                          <Button className="w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-500/90">
                            Book Now
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => setDetailsOpen(false)}
                          className="flex-1 rounded-2xl border-white/20 bg-white text-black hover:bg-neutral-100 hover:text-black"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/70">No vehicle selected.</p>
                )}
              </DialogContent>
            </Dialog>
          </section>
        </div>
      </div>

      {/* Footer (simple, theme matched) */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={110} height={36} className="h-8 w-auto object-contain" />
            <p className="text-xs text-white/60">(c) {new Date().getFullYear()} YOLO Car Rental. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/browse-vehicles" className="hover:text-white">
              Browse
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
