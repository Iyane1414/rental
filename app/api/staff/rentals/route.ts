import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100")

    const where = status && status !== "all" ? { Status: status } : {}

    const rentals = await prisma.rentalInfo.findMany({
      where,
      include: {
        Customer: true,
        Vehicle: true,
      },
      orderBy: { Rental_ID: "desc" },
      take: limit,
    })

    const formattedRentals = rentals.map((rental) => ({
      Rental_ID: rental.Rental_ID,
      Customer_Name: rental.Customer.Customer_Name,
      Vehicle_Brand: rental.Vehicle.Brand,
      Vehicle_Model: rental.Vehicle.Model,
      PlateNo: rental.Vehicle.PlateNo,
      Status: rental.Status,
      StartDate: rental.StartDate,
      EndDate: rental.EndDate,
      TotalAmount: rental.TotalAmount.toString(),
    }))

    return NextResponse.json(formattedRentals)
  } catch (error) {
    console.error("Error fetching rentals:", error)
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}
