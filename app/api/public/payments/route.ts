import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { rentalId, amount, paymentMethod, paymentDate } = await request.json()

    const rentalIdNum = Number.parseInt(rentalId)
    if (!Number.isInteger(rentalIdNum)) {
      return NextResponse.json({ error: "Invalid rental ID" }, { status: 400 })
    }

    // Verify rental exists and is pending payment
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: rentalIdNum },
      include: { PaymentInfo: true },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    if (["Completed", "Cancelled"].includes(rental.Status)) {
      return NextResponse.json({ error: "Rental is not eligible for payment" }, { status: 400 })
    }

    if (rental.PaymentInfo?.Status === "Paid") {
      return NextResponse.json({
        paymentId: rental.PaymentInfo.Payment_ID,
        success: true,
        message: "Payment already completed.",
      })
    }

    const totalAmountNumber =
      typeof rental.TotalAmount === "number"
        ? rental.TotalAmount
        : rental.TotalAmount && typeof rental.TotalAmount.toNumber === "function"
          ? rental.TotalAmount.toNumber()
          : Number(rental.TotalAmount) || 0
    const rawAmount =
      amount !== undefined && amount !== null ? Number.parseFloat(amount.toString()) : totalAmountNumber
    const paymentAmount = Number.isFinite(rawAmount) ? rawAmount : totalAmountNumber
    const paymentDateValue = paymentDate ? new Date(paymentDate) : new Date()
    const paymentMethodValue = paymentMethod || "Cash"

    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.paymentInfo.upsert({
        where: { Rental_ID: rentalIdNum },
        update: {
          Amount: paymentAmount,
          PaymentDate: paymentDateValue,
          PaymentMethod: paymentMethodValue,
          Status: "Paid",
        },
        create: {
          Rental_ID: rentalIdNum,
          Amount: paymentAmount,
          PaymentDate: paymentDateValue,
          PaymentMethod: paymentMethodValue,
          Status: "Paid",
        },
      })

      await tx.rentalInfo.update({
        where: { Rental_ID: rentalIdNum },
        data: { Status: "Ongoing" },
      })

      await tx.vehicleInfo.update({
        where: { Vehicle_ID: rental.Vehicle_ID },
        data: { Status: "Rented" },
      })

      return updatedPayment
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
