import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const payments = await prisma.paymentInfo.findMany({
      orderBy: { CreatedAt: "desc" },
    })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
