import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: Number.parseInt(id) },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })
    if (!rental) {
      return NextResponse.json({ message: "Rental not found" }, { status: 404 })
    }
    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch rental" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const data = await request.json()
    
    // Update rental with provided fields
    const rental = await prisma.rentalInfo.update({
      where: { Rental_ID: Number.parseInt(id) },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.User_ID && { User_ID: data.User_ID }),
        ...(data.return_date && { return_date: new Date(data.return_date) }),
      },
      include: {
        Customer: true,
        Vehicle: true,
      },
    })
    
    return NextResponse.json(rental)
  } catch (error) {
    console.error("Error updating rental:", error)
    return NextResponse.json({ message: "Failed to update rental" }, { status: 500 })
  }
}
