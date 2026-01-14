import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rentalId = parseInt(params.id)

    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: rentalId },
      include: {
        Customer: true,
        Vehicle: true,
        PaymentInfo: true,
      },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    return NextResponse.json({
      Rental_ID: rental.Rental_ID,
      Customer_ID: rental.Customer_ID,
      Customer_Name: rental.Customer.Customer_Name,
      Customer_Email: rental.Customer.Email,
      Customer_Phone: rental.Customer.ContactNo,
      Vehicle_ID: rental.Vehicle_ID,
      Vehicle_Brand: rental.Vehicle.Brand,
      Vehicle_Model: rental.Vehicle.Model,
      PlateNo: rental.Vehicle.PlateNo,
      VehicleStatus: rental.Vehicle.Status,
      StartDate: rental.StartDate,
      EndDate: rental.EndDate,
      TotalAmount: rental.TotalAmount.toString(),
      Status: rental.Status,
      Payment_ID: rental.PaymentInfo?.Payment_ID,
      Payment_Status: rental.PaymentInfo?.Status,
    })
  } catch (error) {
    console.error("Error fetching rental detail:", error)
    return NextResponse.json({ error: "Failed to fetch rental detail" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rentalId = parseInt(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Update rental status
    const updatedRental = await prisma.rentalInfo.update({
      where: { Rental_ID: rentalId },
      data: { Status: status },
      include: { Vehicle: true },
    })

    // Update vehicle status based on rental status
    let vehicleStatus = updatedRental.Vehicle.Status
    if (status === "Ongoing") {
      vehicleStatus = "Rented"
    } else if (status === "Completed" || status === "Cancelled") {
      vehicleStatus = "Available"
    }

    await prisma.vehicleInfo.update({
      where: { Vehicle_ID: updatedRental.Vehicle_ID },
      data: { Status: vehicleStatus },
    })

    // Log the audit trail
    await prisma.rentalAudit.create({
      data: {
        Rental_ID: rentalId,
        OldStatus: updatedRental.Status === status ? updatedRental.Status : updatedRental.Status,
        NewStatus: status,
        ChangedBy: 2, // Default staff user ID
        ChangedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `Rental status updated to ${status}`,
      Rental_ID: updatedRental.Rental_ID,
      Status: status,
    })
  } catch (error) {
    console.error("Error updating rental:", error)
    return NextResponse.json({ error: "Failed to update rental" }, { status: 500 })
  }
}
