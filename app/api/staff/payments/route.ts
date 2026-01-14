import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
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
      orderBy: { Payment_ID: "desc" },
    })

    const formattedPayments = payments.map((payment) => ({
      Payment_ID: payment.Payment_ID,
      Rental_ID: payment.Rental_ID,
      Customer_Name: payment.RentalInfo.Customer.Customer_Name,
      Vehicle_Info: `${payment.RentalInfo.Vehicle.Brand} ${payment.RentalInfo.Vehicle.Model}`,
      Amount: payment.Amount.toString(),
      PaymentDate: payment.PaymentDate,
      PaymentMethod: payment.PaymentMethod,
      Status: payment.Status,
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Rental_ID, Amount, PaymentMethod, PaymentDate } = await request.json()

    // Check if payment already exists
    const existingPayment = await prisma.paymentInfo.findUnique({
      where: { Rental_ID },
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already exists for this rental" },
        { status: 400 }
      )
    }

    // Create payment
    const newPayment = await prisma.paymentInfo.create({
      data: {
        Rental_ID,
        Amount: parseFloat(Amount),
        PaymentDate: new Date(PaymentDate),
        PaymentMethod,
        Status: "Completed",
      },
    })

    // Update rental status to Ongoing if it was Pending Payment
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID },
    })

    if (rental && rental.Status === "Pending Payment") {
      await prisma.rentalInfo.update({
        where: { Rental_ID },
        data: { Status: "Ongoing" },
      })

      // Update vehicle status to Rented
      await prisma.vehicleInfo.update({
        where: { Vehicle_ID: rental.Vehicle_ID },
        data: { Status: "Rented" },
      })
    }

    return NextResponse.json({
      message: "Payment recorded successfully",
      Payment_ID: newPayment.Payment_ID,
    })
  } catch (error) {
    console.error("Error recording payment:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}
