"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, Filter, MapPin, Calendar, Clock } from "lucide-react"

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

function getBrandImage(brand: string) {
  const b = (brand || "").toLowerCase()
  if (b.includes("honda")) return "/honda.png"
  if (b.includes("toyota")) return "/toyota.png"
  if (b.includes("mitsubishi")) return "/mitsubishi.png"
  if (b.includes("nissan")) return "/nissan.png"
  if (b.includes("ford")) return "/ford.png"
  return "/car-bg.png"
}

export default function BrowseVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const [sortBy, setSortBy] = useState<"popular" | "cheapest" | "best" | "newest">("popular")
  const [location, setLocation] = useState("Mumbai")
  const [destination, setDestination] = useState("Goa")
  const [date, setDate] = useState("2025-01-16")
  const [time, setTime] = useState("03:00 AM")

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
  }, [filters, sortBy, date])

  const fetchVehicles = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.append("priceMin", filters.priceMin.toString())
      params.append("priceMax", filters.priceMax.toString())
      params.append("sortBy", sortBy)

      if (filters.seats !== null) params.append("seats", filters.seats.toString())
      if (filters.category !== "all") params.append("category", filters.category)
      if (filters.hasAC) params.append("hasAC", "true")

      if (date) {
        params.append("startDate", date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 7)
        params.append("endDate", endDate.toISOString().split("T")[0])
      }

      const response = await fetch(`/api/public/vehicles?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
        setFilteredVehicles(data)
      } else {
        setVehicles([])
        setFilteredVehicles([])
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setVehicles([])
      setFilteredVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // If your API returns no vehicles (ex: demo), show brand cards (Honda..Ford) as requested.
  const fallbackBrandCards = useMemo(() => {
    const brands = [
      { Brand: "Honda", Model: "Featured", Category: "Sedan", DailyRate: 159, Seats: 5, HasAC: true, Year: 2024, Location: "City" },
      { Brand: "Toyota", Model: "Featured", Category: "Sedan", DailyRate: 135, Seats: 5, HasAC: true, Year: 2024, Location: "City" },
      { Brand: "Mitsubishi", Model: "Featured", Category: "SUV", DailyRate: 150, Seats: 7, HasAC: true, Year: 2024, Location: "City" },
      { Brand: "Nissan", Model: "Featured", Category: "Sedan", DailyRate: 145, Seats: 5, HasAC: true, Year: 2024, Location: "City" },
      { Brand: "Ford", Model: "Featured", Category: "SUV", DailyRate: 155, Seats: 7, HasAC: true, Year: 2024, Location: "City" },
    ] as Array<Partial<Vehicle>>

    return brands
  }, [])

  const results = filteredVehicles.length > 0 ? filteredVehicles : fallbackBrandCards

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

          <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            <Link className="hover:text-white transition" href="/">
              Home
            </Link>
            <Link className="hover:text-white transition" href="/browse-vehicles">
              Cars
            </Link>
            <Link className="hover:text-white transition" href="/browse-vehicles">
              Services
            </Link>
            <Link className="hover:text-white transition" href="/browse-vehicles">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-white/90">Login</Button>
            </Link>
          </div>
        </div>

        {/* Search bar row (clean + glass) */}
        <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-3 rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur md:grid-cols-12 md:items-end">
            <div className="md:col-span-3">
              <label className="mb-1 block text-[11px] font-semibold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> From
                </span>
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-[11px] font-semibold text-white/70">To</label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-[11px] font-semibold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date
                </span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white focus-visible:ring-yellow-500/60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-white/70">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Time
                </span>
              </label>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
              />
            </div>

            <div className="md:col-span-1">
              <Button className="h-11 w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-500/90">
                Search
              </Button>
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
                      priceMin: 0,
                      priceMax: 10000,
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
                  min={0}
                  max={10000}
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                  className="w-full accent-yellow-500"
                />
                <div className="mt-2 flex justify-between text-xs text-white/70">
                  <span>₱ {filters.priceMin}</span>
                  <span>₱ {filters.priceMax}</span>
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
                    <option value="4">4 Seat</option>
                    <option value="5">5 Seat</option>
                    <option value="7">7 Seat</option>
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
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                </div>
              </div>

              {/* Popular */}
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
            </Card>
          </aside>

          {/* Results (right) */}
          <section className="lg:col-span-9">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-white/60">AVAILABLE VEHICLES</p>
                <h2 className="mt-1 text-2xl font-extrabold">Choose your ride</h2>
                <p className="mt-1 text-sm text-white/70">
                  Total <span className="font-semibold text-white">{filteredVehicles.length || 5}</span>{" "}
                  {filteredVehicles.length === 1 ? "result" : "results"}
                </p>
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
              {results.map((v: any, idx: number) => {
                const id = v.Vehicle_ID ?? idx + 1
                const brand = v.Brand ?? "Honda"
                const model = v.Model ?? "Featured"
                const category = v.Category ?? "Sedan"
                const year = v.Year ?? 2024
                const seats = v.Seats ?? 5
                const hasAC = Boolean(v.HasAC ?? true)
                const dailyRate = v.DailyRate ?? 149
                const loc = v.Location ?? "City"
                const img = getBrandImage(brand)

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
                        <Image src={img} alt={`${brand} ${model}`} fill className="object-contain p-4" />
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
                            {year} • {loc} • {seats} seats {hasAC ? "• AC" : ""}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-extrabold text-white">₱{dailyRate}</p>
                          <p className="text-xs text-white/60">/day</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Link href={`/book-vehicle/${id}`} className="w-full">
                          <Button
                            variant="outline"
                            className="h-11 w-full rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
                          >
                            View Details
                          </Button>
                        </Link>

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

            {filteredVehicles.length === 0 && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70 backdrop-blur-xl">
                No vehicles match your filters right now. Showing featured brands instead.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer (simple, theme matched) */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={110} height={36} className="h-8 w-auto object-contain" />
            <p className="text-xs text-white/60">© {new Date().getFullYear()} YOLO Car Rental. All rights reserved.</p>
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
