import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { customerName, email, phone, licenseNo, vehicleId, startDate, endDate, totalAmount } = await request.json()

    // Validate required fields
    if (!customerName || !email || !phone || !licenseNo || !vehicleId || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if vehicle exists and is available
    const vehicle = await prisma.vehicleInfo.findUnique({
      where: { Vehicle_ID: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 })
    }

    if (vehicle.Status !== "Available") {
      return NextResponse.json({ message: "Vehicle is not available" }, { status: 400 })
    }

    // Check if vehicle is already booked during these dates
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    const conflictingRental = await prisma.rentalInfo.findFirst({
      where: {
        Vehicle_ID: vehicleId,
        Status: {
          in: ["Pending Payment", "Ongoing"],
        },
        AND: [
          {
            StartDate: {
              lte: endDateObj,
            },
          },
          {
            EndDate: {
              gte: startDateObj,
            },
          },
        ],
      },
    })

    if (conflictingRental) {
      return NextResponse.json(
        { message: "Vehicle is already booked for these dates" },
        { status: 400 }
      )
    }

    // Create or get customer
    let customer = await prisma.customerInfo.findUnique({
      where: { LicenseNo: licenseNo },
    })

    if (!customer) {
      customer = await prisma.customerInfo.create({
        data: {
          Customer_Name: customerName,
          ContactNo: phone,
          LicenseNo: licenseNo,
          Email: email,
          Address: "Not provided",
        },
      })
    }

    // Create rental - Status = "Pending Payment"
    // Assign to default admin user (User_ID = 1) for now
    const rental = await prisma.rentalInfo.create({
      data: {
        Customer_ID: customer.Customer_ID,
        Vehicle_ID: vehicleId,
        User_ID: 1, // Default admin user
        StartDate: new Date(startDate),
        EndDate: new Date(endDate),
        TotalAmount: parseFloat(totalAmount.toString()),
        Status: "Pending Payment",
      },
    })

    await prisma.vehicleInfo.update({
      where: { Vehicle_ID: vehicleId },
      data: { Status: "Reserved" },
    })

    return NextResponse.json({ rentalId: rental.Rental_ID, success: true })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 })
  }
}
