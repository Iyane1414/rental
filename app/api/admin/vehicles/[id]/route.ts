import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const vehicleId = Number.parseInt(id)
    if (!Number.isInteger(vehicleId)) {
      return NextResponse.json({ message: "Invalid vehicle ID" }, { status: 400 })
    }

    const data = await request.json()
    const vehicle = await prisma.vehicleInfo.update({
      where: { Vehicle_ID: vehicleId },
      data: {
        ...(data.Brand && { Brand: data.Brand }),
        ...(data.Model && { Model: data.Model }),
        ...(data.PlateNo && { PlateNo: data.PlateNo }),
        ...(data.ImageUrl !== undefined && {
          ImageUrl: data.ImageUrl ? data.ImageUrl.toString().trim() : null,
        }),
        ...(data.Status && { Status: data.Status }),
        ...(data.DailyRate !== undefined && { DailyRate: Number.parseFloat(data.DailyRate) }),
        ...(data.Year !== undefined && { Year: Number.parseInt(data.Year) }),
        ...(data.Seats !== undefined && { Seats: Number.parseInt(data.Seats) }),
        ...(data.Category && { Category: data.Category }),
        ...(data.HasAC !== undefined && {
          HasAC: typeof data.HasAC === "boolean" ? data.HasAC : data.HasAC === "true",
        }),
        ...(data.Location && { Location: data.Location }),
      },
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json({ message: "Failed to update vehicle" }, { status: 500 })
  }
}
