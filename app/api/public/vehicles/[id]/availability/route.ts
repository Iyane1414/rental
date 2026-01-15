import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const vehicleId = Number.parseInt(id)
    if (!Number.isInteger(vehicleId)) {
      return NextResponse.json({ message: "Invalid vehicle ID" }, { status: 400 })
    }

    const rentals = await prisma.rentalInfo.findMany({
      where: {
        Vehicle_ID: vehicleId,
        Status: {
          in: ["Pending Payment", "Ongoing"],
        },
      },
      select: {
        StartDate: true,
        EndDate: true,
        Status: true,
      },
      orderBy: { StartDate: "asc" },
    })

    return NextResponse.json(
      rentals.map((rental) => ({
        StartDate: rental.StartDate,
        EndDate: rental.EndDate,
        Status: rental.Status,
      }))
    )
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ message: "Failed to fetch availability" }, { status: 500 })
  }
}
