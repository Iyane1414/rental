import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(request: NextRequest) {
  try {
    const { rentalId } = await request.json()

    if (!rentalId) {
      return NextResponse.json({ error: "Rental ID is required" }, { status: 400 })
    }

    // Get rental details
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: rentalId },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    if (rental.Status !== "Ongoing") {
      return NextResponse.json({ error: "Only ongoing rentals can be completed" }, { status: 400 })
    }

    // Update rental to Completed
    const updatedRental = await prisma.rentalInfo.update({
      where: { Rental_ID: rentalId },
      data: { Status: "Completed" },
    })

    // Update vehicle back to Available
    await prisma.vehicleInfo.update({
      where: { Vehicle_ID: rental.Vehicle_ID },
      data: { Status: "Available" },
    })

    // Record the status change in audit log
    await prisma.rentalAudit.create({
      data: {
        Rental_ID: rentalId,
        OldStatus: "Ongoing",
        NewStatus: "Completed",
        ChangedBy: rental.User_ID,
        ChangedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Rental completed successfully. Vehicle is now available.",
      rental: updatedRental,
    })
  } catch (error) {
    console.error("Error completing rental:", error)
    return NextResponse.json({ error: "Failed to complete rental" }, { status: 500 })
  }
}
