import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { rentalId, amount, paymentMethod, paymentDate } = await request.json()

    if (!rentalId || !amount || !paymentMethod || !paymentDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify rental exists and is pending payment
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: rentalId },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    if (rental.Status !== "Pending Payment") {
      return NextResponse.json({ error: "Rental is not pending payment" }, { status: 400 })
    }

    // Create payment record
    const payment = await prisma.paymentInfo.create({
      data: {
        Rental_ID: rentalId,
        Amount: parseFloat(amount.toString()),
        PaymentDate: new Date(paymentDate),
        PaymentMethod: paymentMethod,
        Status: "Paid",
      },
    })

    // Update rental status to "Ongoing" (payment received, vehicle now in use)
    await prisma.rentalInfo.update({
      where: { Rental_ID: rentalId },
      data: { Status: "Ongoing" },
    })

    // Update vehicle status to "Rented"
    await prisma.vehicleInfo.update({
      where: { Vehicle_ID: rental.Vehicle_ID },
      data: { Status: "Rented" },
    })

    return NextResponse.json({ 
      paymentId: payment.Payment_ID, 
      success: true,
      message: "Payment processed successfully. Rental is now active and vehicle is marked as rented."
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
