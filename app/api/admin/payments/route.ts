import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const payments = await prisma.paymentInfo.findMany({
      include: {
        RentalInfo: {
          include: {
            Customer: true,
            Vehicle: true,
          },
        },
      },
      orderBy: { CreatedAt: "desc" },
    })
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    const payload = payments.map((payment) => ({
      Payment_ID: payment.Payment_ID,
      Rental_ID: payment.Rental_ID,
      Amount: toNumber(payment.Amount),
      PaymentDate: payment.PaymentDate,
      PaymentMethod: payment.PaymentMethod,
      Status: payment.Status,
      CreatedAt: payment.CreatedAt,
      Rental: payment.RentalInfo
        ? {
            Rental_ID: payment.RentalInfo.Rental_ID,
            Status: payment.RentalInfo.Status,
            TotalAmount: toNumber(payment.RentalInfo.TotalAmount),
            Customer: payment.RentalInfo.Customer
              ? {
                  Customer_ID: payment.RentalInfo.Customer.Customer_ID,
                  Customer_Name: payment.RentalInfo.Customer.Customer_Name,
                  Email: payment.RentalInfo.Customer.Email,
                }
              : null,
            Vehicle: payment.RentalInfo.Vehicle
              ? {
                  Vehicle_ID: payment.RentalInfo.Vehicle.Vehicle_ID,
                  Brand: payment.RentalInfo.Vehicle.Brand,
                  Model: payment.RentalInfo.Vehicle.Model,
                  PlateNo: payment.RentalInfo.Vehicle.PlateNo,
                  Status: payment.RentalInfo.Vehicle.Status,
                }
              : null,
          }
        : null,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
