import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const vehicles = await prisma.vehicleInfo.findMany()
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    const payload = vehicles.map((vehicle) => ({
      ...vehicle,
      DailyRate: toNumber(vehicle.DailyRate),
    }))

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const vehicle = await prisma.vehicleInfo.create({
      data: {
        Brand: data.Brand,
        Model: data.Model,
        PlateNo: data.PlateNo,
        ImageUrl: data.ImageUrl ? data.ImageUrl.toString().trim() : null,
        Status: data.Status || "Available",
        DailyRate: Number.parseFloat(data.DailyRate),
        Year: Number.parseInt(data.Year),
        Seats: data.Seats ? Number.parseInt(data.Seats) : 4,
        Category: data.Category || "Sedan",
        HasAC:
          data.HasAC !== undefined
            ? typeof data.HasAC === "boolean"
              ? data.HasAC
              : data.HasAC === "true"
            : true,
        Location: data.Location || "Mumbai",
      },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
