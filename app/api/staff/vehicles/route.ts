import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const where = status && status !== "all" ? { Status: status } : {}

    const vehicles = await prisma.vehicleInfo.findMany({
      where,
      orderBy: { Vehicle_ID: "asc" },
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}
