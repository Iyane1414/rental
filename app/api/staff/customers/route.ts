import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const customers = await prisma.customerInfo.findMany({
      orderBy: { Customer_ID: "desc" },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Customer_Name, ContactNo, LicenseNo, Email, Address } = await request.json()

    // Validate required fields
    if (!Customer_Name || !ContactNo || !LicenseNo || !Email || !Address) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if license already exists
    const existingCustomer = await prisma.customerInfo.findUnique({
      where: { LicenseNo },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this license number already exists" },
        { status: 400 }
      )
    }

    const newCustomer = await prisma.customerInfo.create({
      data: {
        Customer_Name,
        ContactNo,
        LicenseNo,
        Email,
        Address,
      },
    })

    return NextResponse.json({
      message: "Customer added successfully",
      Customer_ID: newCustomer.Customer_ID,
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
