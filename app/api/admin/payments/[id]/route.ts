import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const paymentId = Number.parseInt(id)
    if (!Number.isInteger(paymentId)) {
      return NextResponse.json({ message: "Invalid payment ID" }, { status: 400 })
    }

    const data = await request.json()
    const nextStatus = typeof data.Status === "string" ? data.Status : typeof data.status === "string" ? data.status : undefined

    const updatedPayment = await prisma.paymentInfo.update({
      where: { Payment_ID: paymentId },
      data: {
        ...(data.Amount !== undefined && { Amount: Number.parseFloat(data.Amount) }),
        ...(data.PaymentDate && { PaymentDate: new Date(data.PaymentDate) }),
        ...(data.PaymentMethod && { PaymentMethod: data.PaymentMethod }),
        ...(nextStatus && { Status: nextStatus }),
      },
      include: {
        RentalInfo: true,
      },
    })

    if (nextStatus && updatedPayment.RentalInfo) {
      let nextRentalStatus: string | null = null
      let nextVehicleStatus: string | null = null

      if (nextStatus === "Paid") {
        nextRentalStatus = "Ongoing"
        nextVehicleStatus = "Rented"
      } else if (nextStatus === "Refunded" || nextStatus === "Failed") {
        nextRentalStatus = "Cancelled"
        nextVehicleStatus = "Available"
      } else if (nextStatus === "Pending") {
        nextRentalStatus = "Pending Payment"
        nextVehicleStatus = "Reserved"
      }

      if (nextRentalStatus) {
        await prisma.rentalInfo.update({
          where: { Rental_ID: updatedPayment.Rental_ID },
          data: { Status: nextRentalStatus },
        })
      }

      if (nextVehicleStatus && updatedPayment.RentalInfo.Vehicle_ID) {
        await prisma.vehicleInfo.update({
          where: { Vehicle_ID: updatedPayment.RentalInfo.Vehicle_ID },
          data: { Status: nextVehicleStatus },
        })
      }
    }

    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    return NextResponse.json({
      Payment_ID: updatedPayment.Payment_ID,
      Rental_ID: updatedPayment.Rental_ID,
      Amount: toNumber(updatedPayment.Amount),
      PaymentDate: updatedPayment.PaymentDate,
      PaymentMethod: updatedPayment.PaymentMethod,
      Status: updatedPayment.Status,
      CreatedAt: updatedPayment.CreatedAt,
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ message: "Failed to update payment" }, { status: 500 })
  }
}
