import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: Number.parseInt(id) },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })
    if (!rental) {
      return NextResponse.json({ message: "Rental not found" }, { status: 404 })
    }
    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch rental" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const data = await request.json()

    const rentalId = Number.parseInt(id)
    if (!Number.isInteger(rentalId)) {
      return NextResponse.json({ message: "Invalid rental ID" }, { status: 400 })
    }

    const statusValue = data.Status ?? data.status
    const nextStatus = typeof statusValue === "string" ? statusValue : undefined

    const rental = await prisma.rentalInfo.update({
      where: { Rental_ID: rentalId },
      data: {
        ...(nextStatus && { Status: nextStatus }),
        ...(data.User_ID && { User_ID: data.User_ID }),
      },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })

    if (nextStatus && rental.Vehicle_ID) {
      let nextVehicleStatus: string | null = null
      if (nextStatus === "Ongoing") nextVehicleStatus = "Rented"
      if (nextStatus === "Completed" || nextStatus === "Cancelled") nextVehicleStatus = "Available"
      if (nextStatus === "Pending Payment") nextVehicleStatus = "Reserved"

      if (nextVehicleStatus) {
        await prisma.vehicleInfo.update({
          where: { Vehicle_ID: rental.Vehicle_ID },
          data: { Status: nextVehicleStatus },
        })
      }
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error("Error updating rental:", error)
    return NextResponse.json({ message: "Failed to update rental" }, { status: 500 })
  }
}
