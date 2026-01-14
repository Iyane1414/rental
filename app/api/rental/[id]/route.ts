import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const rental = await prisma.rentalInfo.findUnique({
      where: { Rental_ID: Number.parseInt(params.id) },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rental" }, { status: 500 })
  }
}
