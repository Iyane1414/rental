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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const vehicleId = Number(id)

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return NextResponse.json({ message: "Invalid vehicle ID" }, { status: 400 })
    }

    const vehicle = await prisma.vehicleInfo.findUnique({
      where: { Vehicle_ID: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(serializeVehicle(vehicle))
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json({ message: "Failed to fetch vehicle" }, { status: 500 })
  }
}
