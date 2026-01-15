import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/public/vehicles
 * Fetch vehicles with filtering and sorting
 *
 * Query parameters:
 * - priceMin: number (minimum daily rate)
 * - priceMax: number (maximum daily rate)
 * - seats: number (number of seats)
 * - category: string (Sedan, SUV, Van, etc.)
 * - hasAC: boolean (filter by AC availability)
 * - sortBy: string (cheapest, best, newest, popular)
 * - startDate: ISO date string (for availability checking)
 * - endDate: ISO date string (for availability checking)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const priceMin = parseInt(searchParams.get("priceMin") || "0")
    const priceMax = parseInt(searchParams.get("priceMax") || "99999")
    const seats = searchParams.get("seats") ? parseInt(searchParams.get("seats")!) : null
    const category = searchParams.get("category") || null
    const hasAC = searchParams.get("hasAC") ? searchParams.get("hasAC") === "true" : null
    const sortBy = searchParams.get("sortBy") || "popular"
    const query = searchParams.get("query")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const where: any = {
      Status: {
        in: ["Available", "Reserved", "Rented"],
      },
      DailyRate: {
        gte: priceMin,
        lte: priceMax,
      },
    }

    // Add optional filters
    if (seats !== null) {
      where.Seats = seats
    }

    if (category && category !== "all") {
      where.Category = category
    }

    if (hasAC !== null) {
      where.HasAC = hasAC
    }

    if (query) {
      where.OR = [
        { Brand: { contains: query, mode: "insensitive" } },
        { Model: { contains: query, mode: "insensitive" } },
      ]
    }

    // Fetch all available vehicles
    let vehicles = await prisma.vehicleInfo.findMany({
      where,
    })

    // If date range provided, check for booking conflicts
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Get vehicle IDs that have overlapping rentals
      const bookedVehicles = await prisma.rentalInfo.findMany({
        where: {
          Status: {
            in: ["Pending Payment", "Ongoing"],
          },
          AND: [
            {
              StartDate: {
                lte: end,
              },
            },
            {
              EndDate: {
                gte: start,
              },
            },
          ],
        },
        select: {
          Vehicle_ID: true,
        },
      })

      const bookedVehicleIds = bookedVehicles.map((rv) => rv.Vehicle_ID)
      vehicles = vehicles.filter((v) => !bookedVehicleIds.includes(v.Vehicle_ID))
    }

    // Sort vehicles based on sortBy parameter
    switch (sortBy) {
      case "cheapest":
        vehicles.sort((a, b) => Number(a.DailyRate) - Number(b.DailyRate))
        break
      case "best":
        // Best = has AC + newer + higher seats
        vehicles.sort((a, b) => {
          if (a.HasAC !== b.HasAC) return a.HasAC ? -1 : 1
          if (a.Year !== b.Year) return b.Year - a.Year
          return b.Seats - a.Seats
        })
        break
      case "newest":
        vehicles.sort((a, b) => b.Year - a.Year)
        break
      case "popular":
      default:
        // Default: keep order by vehicle ID (insertion order)
        vehicles.sort((a, b) => a.Vehicle_ID - b.Vehicle_ID)
    }

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/public/vehicles
 * Create a new vehicle (admin only - but no auth required for now)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      Brand,
      Model,
      PlateNo,
      DailyRate,
      Year,
      Seats,
      Category,
      HasAC,
      Location,
    } = body

    // Validation
    if (!Brand || !Model || !PlateNo || !DailyRate) {
      return NextResponse.json(
        { error: "Missing required fields: Brand, Model, PlateNo, DailyRate" },
        { status: 400 }
      )
    }

    // Check if vehicle with same plate number already exists
    const existingVehicle = await prisma.vehicleInfo.findUnique({
      where: { PlateNo },
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle with this plate number already exists" },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicleInfo.create({
      data: {
        Brand,
        Model,
        PlateNo,
        DailyRate: parseFloat(DailyRate),
        Year: parseInt(Year) || new Date().getFullYear(),
        Seats: parseInt(Seats) || 4,
        Category: Category || "Sedan",
        HasAC: HasAC !== undefined ? Boolean(HasAC) : true,
        Location: Location || "Mumbai",
        Status: "Available",
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    )
  }
}
