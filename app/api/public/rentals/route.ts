import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - List rentals with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get("vehicleId")
    const customerId = searchParams.get("customerId")
    const status = searchParams.get("status")

    const where: any = {}

    if (vehicleId) {
      where.Vehicle_ID = parseInt(vehicleId)
    }

    if (customerId) {
      where.Customer_ID = parseInt(customerId)
    }

    if (status) {
      where.Status = status
    }

    const rentals = await prisma.rentalInfo.findMany({
      where,
      include: {
        Customer: true,
        Vehicle: true,
        PaymentInfo: true,
      },
      orderBy: {
        CreatedAt: "desc",
      },
    })

    // Helper to safely convert Decimal to number
    const toNumber = (value: any): number => {
      if (typeof value === "number") return value
      if (value && typeof value.toNumber === "function") return value.toNumber()
      return Number(value) || 0
    }

    return NextResponse.json(
      rentals.map((rental) => ({
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
        TotalAmount: toNumber(rental.TotalAmount),
        Status: rental.Status,
        Payment_ID: rental.PaymentInfo?.Payment_ID,
        Payment_Status: rental.PaymentInfo?.Status,
      }))
    )
  } catch (error) {
    console.error("Error fetching rentals:", error)
    return NextResponse.json({ message: "Failed to fetch rentals" }, { status: 500 })
  }
}

// POST - Create a new rental (called after booking)
export async function POST(request: NextRequest) {
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
    // Assign to default staff (User_ID = 2) for now
    const rental = await prisma.rentalInfo.create({
      data: {
        Customer_ID: customer.Customer_ID,
        Vehicle_ID: vehicleId,
        User_ID: 2, // Default staff member
        StartDate: new Date(startDate),
        EndDate: new Date(endDate),
        TotalAmount: parseFloat(totalAmount.toString()),
        Status: "Pending Payment",
      },
    })

    return NextResponse.json({ rentalId: rental.Rental_ID, success: true })
  } catch (error) {
    console.error("Rental creation error:", error)
    return NextResponse.json({ message: "Failed to create rental" }, { status: 500 })
  }
}
