import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const rentals = await prisma.rentalInfo.findMany({
      include: {
        Customer: true,
        Vehicle: true,
        PaymentInfo: true,
      },
      orderBy: { CreatedAt: "desc" },
    })
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    const payload = rentals.map((rental) => ({
      Rental_ID: rental.Rental_ID,
      Customer_ID: rental.Customer_ID,
      Vehicle_ID: rental.Vehicle_ID,
      User_ID: rental.User_ID,
      StartDate: rental.StartDate,
      EndDate: rental.EndDate,
      TotalAmount: toNumber(rental.TotalAmount),
      Status: rental.Status,
      CreatedAt: rental.CreatedAt,
      UpdatedAt: rental.UpdatedAt,
      Customer: rental.Customer
        ? {
            Customer_ID: rental.Customer.Customer_ID,
            Customer_Name: rental.Customer.Customer_Name,
            Email: rental.Customer.Email,
            ContactNo: rental.Customer.ContactNo,
            LicenseNo: rental.Customer.LicenseNo,
            Address: rental.Customer.Address,
          }
        : null,
      Vehicle: rental.Vehicle
        ? {
            Vehicle_ID: rental.Vehicle.Vehicle_ID,
            Brand: rental.Vehicle.Brand,
            Model: rental.Vehicle.Model,
            PlateNo: rental.Vehicle.PlateNo,
            Status: rental.Vehicle.Status,
          }
        : null,
      Payment: rental.PaymentInfo
        ? {
            Payment_ID: rental.PaymentInfo.Payment_ID,
            Amount: toNumber(rental.PaymentInfo.Amount),
            Status: rental.PaymentInfo.Status,
            PaymentDate: rental.PaymentInfo.PaymentDate,
            PaymentMethod: rental.PaymentInfo.PaymentMethod,
          }
        : null,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}
