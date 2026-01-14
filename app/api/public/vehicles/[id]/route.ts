import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Helper: convert Prisma Decimal + Date values into JSON-safe values
function serializeVehicle(vehicle: any) {
  return {
    ...vehicle,
    // Prisma Decimal -> number
    DailyRate:
      vehicle?.DailyRate && typeof vehicle.DailyRate === "object" && typeof vehicle.DailyRate.toNumber === "function"
        ? vehicle.DailyRate.toNumber()
        : Number(vehicle?.DailyRate),

    // Dates -> ISO string (optional but recommended)
    CreatedAt: vehicle?.CreatedAt ? new Date(vehicle.CreatedAt).toISOString() : null,
    UpdatedAt: vehicle?.UpdatedAt ? new Date(vehicle.UpdatedAt).toISOString() : null,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = Number(params.id)

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return NextResponse.json({ error: "Invalid vehicle ID" }, { status: 400 })
    }

    const vehicle = await prisma.vehicleInfo.findUnique({
      where: { Vehicle_ID: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(serializeVehicle(vehicle))
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
  }
}
