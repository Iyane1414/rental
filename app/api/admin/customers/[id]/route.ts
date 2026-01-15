import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const customerId = Number.parseInt(id)
    if (!Number.isInteger(customerId)) {
      return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 })
    }

    const customer = await prisma.customerInfo.findUnique({
      where: { Customer_ID: customerId },
      include: {
        RentalInfo: {
          include: {
            Vehicle: true,
            PaymentInfo: true,
          },
          orderBy: { CreatedAt: "desc" },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    return NextResponse.json({
      Customer_ID: customer.Customer_ID,
      Customer_Name: customer.Customer_Name,
      Email: customer.Email,
      ContactNo: customer.ContactNo,
      LicenseNo: customer.LicenseNo,
      Address: customer.Address,
      CreatedAt: customer.CreatedAt,
      Rentals: customer.RentalInfo.map((rental) => ({
        Rental_ID: rental.Rental_ID,
        Vehicle_ID: rental.Vehicle_ID,
        StartDate: rental.StartDate,
        EndDate: rental.EndDate,
        TotalAmount: toNumber(rental.TotalAmount),
        Status: rental.Status,
        Vehicle: rental.Vehicle
          ? {
              Vehicle_ID: rental.Vehicle.Vehicle_ID,
              Brand: rental.Vehicle.Brand,
              Model: rental.Vehicle.Model,
              PlateNo: rental.Vehicle.PlateNo,
              Status: rental.Vehicle.Status,
              ImageUrl: rental.Vehicle.ImageUrl,
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
      })),
    })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ message: "Failed to fetch customer" }, { status: 500 })
  }
}
