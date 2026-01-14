import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const vehicles = await prisma.vehicleInfo.findMany()
    return NextResponse.json(vehicles)
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
        Status: data.Status,
        DailyRate: Number.parseFloat(data.DailyRate),
        Year: Number.parseInt(data.Year),
      },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
