import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: Number.parseInt(id) },
    })

    if (!rental) {
      return NextResponse.json({ message: "Rental not found" }, { status: 404 })
    }

    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch rental" }, { status: 500 })
  }
}