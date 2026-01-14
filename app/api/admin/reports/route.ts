import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom") || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
    const dateTo = searchParams.get("dateTo") || new Date().toISOString().split("T")[0]

    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setDate(toDate.getDate() + 1) // Include entire end date

    // Revenue Summary
    const payments = await prisma.paymentInfo.findMany({
      where: {
        PaymentDate: {
          gte: fromDate,
          lt: toDate,
        },
        Status: "Completed",
      },
    })

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.Amount), 0)
    const averageRevenue = payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : "0"

    // Rental Summary
    const rentals = await prisma.rentalInfo.findMany({
      where: {
        CreatedAt: {
          gte: fromDate,
          lt: toDate,
        },
      },
      include: {
        PaymentInfo: true,
      },
    })

    const totalRentals = rentals.length
    const activeRentals = rentals.filter((r) => r.Status === "Ongoing").length
    const completedRentals = rentals.filter((r) => r.Status === "Completed").length
    const cancelledRentals = rentals.filter((r) => r.Status === "Cancelled").length
    const pendingPaymentRentals = rentals.filter((r) => r.Status === "Pending Payment" && !r.PaymentInfo).length

    // Top Vehicles - count rentals by vehicle
    const allRentals = await prisma.rentalInfo.findMany({
      where: {
        CreatedAt: {
          gte: fromDate,
          lt: toDate,
        },
      },
      include: {
        Vehicle: true,
        PaymentInfo: true,
      },
    })

    const vehicleMap = new Map<number, { brand: string; model: string; count: number }>()
    allRentals.forEach((rental) => {
      const vehicleId = rental.Vehicle_ID
      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, {
          brand: rental.Vehicle?.Brand || "Unknown",
          model: rental.Vehicle?.Model || "Unknown",
          count: 0,
        })
      }
      const entry = vehicleMap.get(vehicleId)
      if (entry) entry.count++
    })

    const topVehicles = Array.from(vehicleMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((v) => ({
        Vehicle_Brand: v.brand,
        Vehicle_Model: v.model,
        rentalCount: v.count,
      }))

    // Top Customers - count rentals by customer
    const customerMap = new Map<number, { name: string; count: number }>()
    allRentals.forEach((rental) => {
      const customerId = rental.Customer_ID
      if (!customerMap.has(customerId)) {
        const customer = rentals.find((r) => r.Customer_ID === customerId)
        customerMap.set(customerId, {
          name: customer ? (customer as any).Customer?.Customer_Name || "Unknown" : "Unknown",
          count: 0,
        })
      }
      const entry = customerMap.get(customerId)
      if (entry) entry.count++
    })

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((c) => ({
        Customer_Name: c.name,
        rentalCount: c.count,
      }))

    // Staff Performance - count rentals by staff
    const staffMap = new Map<number | null, { username: string; rentals: number; revenue: number }>()
    
    for (const rental of allRentals) {
      const staffId = rental.User_ID
      if (staffId !== null && staffId !== undefined) {
        if (!staffMap.has(staffId)) {
          const staff = await prisma.userInfo.findUnique({
            where: { User_ID: staffId },
          })
          staffMap.set(staffId, {
            username: staff?.Username || "Unknown",
            rentals: 0,
            revenue: 0,
          })
        }
        const entry = staffMap.get(staffId)
        if (entry) {
          entry.rentals++
          // Add revenue from payment if exists
          const payment = rental.PaymentInfo
          if (payment) {
            entry.revenue += Number(payment.Amount)
          }
        }
      }
    }

    const staffPerformance = Array.from(staffMap.values())
      .sort((a, b) => b.rentals - a.rentals)
      .map((s) => ({
        Username: s.username,
        rentalCount: s.rentals,
        revenueHandled: s.revenue.toFixed(2),
      }))

    return NextResponse.json({
      totalRevenue: totalRevenue.toFixed(2),
      averageRevenue: averageRevenue,
      totalRentals,
      activeRentals,
      completedRentals,
      cancelledRentals,
      pendingPaymentRentals,
      topVehicles,
      topCustomers,
      staffPerformance,
    })
  } catch (error) {
    console.error("Error generating reports:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}
