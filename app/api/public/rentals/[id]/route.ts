import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const rental = await prisma.rentalInfo.findUnique({
      where: {
        Rental_ID: parseInt(id),
      },
      include: {
        Customer: true,
        Vehicle: true,
        PaymentInfo: true,
      },
    })

    if (!rental) {
      return NextResponse.json({ message: "Rental not found" }, { status: 404 })
    }

    // Helper to safely convert Decimal to number
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    return NextResponse.json({
      Rental_ID: rental.Rental_ID,
      Customer_ID: rental.Customer_ID,
      Customer: {
        Customer_ID: rental.Customer.Customer_ID,
        Customer_Name: rental.Customer.Customer_Name,
        Email: rental.Customer.Email,
        ContactNo: rental.Customer.ContactNo,
        Address: rental.Customer.Address,
      },
      Vehicle_ID: rental.Vehicle_ID,
      Vehicle: {
        Vehicle_ID: rental.Vehicle.Vehicle_ID,
        Brand: rental.Vehicle.Brand,
        Model: rental.Vehicle.Model,
        PlateNo: rental.Vehicle.PlateNo,
        Status: rental.Vehicle.Status,
        DailyRate: toNumber(rental.Vehicle.DailyRate),
      },
      StartDate: rental.StartDate,
      EndDate: rental.EndDate,
      TotalAmount: toNumber(rental.TotalAmount),
      Status: rental.Status,
      CreatedAt: rental.CreatedAt,
      Payment: rental.PaymentInfo
        ? {
            Payment_ID: rental.PaymentInfo.Payment_ID,
            Amount: toNumber(rental.PaymentInfo.Amount),
            Status: rental.PaymentInfo.Status,
            CreatedAt: rental.PaymentInfo.CreatedAt,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching rental:", error)
    return NextResponse.json({ message: "Failed to fetch rental" }, { status: 500 })
  }
}
