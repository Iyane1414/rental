import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const pendingRentals = await prisma.rentalInfo.findMany({
      where: {
        Status: "Pending Payment",
        PaymentInfo: null,
      },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })

    const formatted = pendingRentals.map((rental) => ({
      Rental_ID: rental.Rental_ID,
      Customer_Name: rental.Customer.Customer_Name,
      Vehicle_Info: `${rental.Vehicle.Brand} ${rental.Vehicle.Model}`,
      TotalAmount: rental.TotalAmount.toString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching pending rentals:", error)
    return NextResponse.json({ error: "Failed to fetch pending rentals" }, { status: 500 })
  }
}
