import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Active rentals (Status = "Ongoing")
    const activeRentals = await prisma.rentalInfo.count({
      where: { Status: "Ongoing" },
    })

    // Available vehicles (Status = "Available")
    const availableVehicles = await prisma.vehicleInfo.count({
      where: { Status: "Available" },
    })

    // Pending Payment rentals
    const pendingPayments = await prisma.rentalInfo.count({
      where: { Status: "Pending Payment" },
    })

    // Vehicles in maintenance
    const vehiclesInMaintenance = await prisma.vehicleInfo.count({
      where: { Status: "Under Maintenance" },
    })

    // Total revenue (sum of PaymentInfo.Amount)
    const revenueData = await prisma.paymentInfo.aggregate({
      _sum: { Amount: true },
    })

    const totalRevenue = revenueData._sum?.Amount
      ? Number(revenueData._sum.Amount)
      : 0

    // Staff count (Role = "Staff")
    const staffCount = await prisma.userInfo.count({
      where: { Role: "Staff" },
    })

    // Completed rentals today (using EndDate as the "completion date")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const completedToday = await prisma.rentalInfo.count({
      where: {
        Status: "Completed",
        EndDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    return NextResponse.json({
      activeRentals,
      availableVehicles,
      pendingPayments,
      pendingPaymentCount: pendingPayments,
      totalRevenue,
      completedToday,
      vehiclesInMaintenance,
      staffCount,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
