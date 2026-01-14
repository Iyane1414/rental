import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Pending payments (rentals with Pending Payment status and no payment yet)
    const pendingPayments = await prisma.rentalInfo.count({
      where: {
        Status: "Pending Payment",
        PaymentInfo: null,
      },
    })

    // Ongoing rentals
    const ongoingRentals = await prisma.rentalInfo.count({
      where: { Status: "Ongoing" },
    })

    // Available vehicles
    const availableVehicles = await prisma.vehicleInfo.count({
      where: { Status: "Available" },
    })

    // Rentals ending today
    const rentalsEndingToday = await prisma.rentalInfo.count({
      where: {
        EndDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    return NextResponse.json({
      pendingPayments,
      ongoingRentals,
      availableVehicles,
      rentalsEndingToday,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
