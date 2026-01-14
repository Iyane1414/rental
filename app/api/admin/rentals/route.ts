import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const rentals = await prisma.rentalInfo.findMany({
      include: {
        Customer: true,
        Vehicle: true,
      },
      orderBy: { CreatedAt: "desc" },
    })
    return NextResponse.json(rentals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}
