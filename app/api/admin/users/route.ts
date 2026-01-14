import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    const users = await prisma.userInfo.findMany({
      orderBy: { User_ID: "asc" },
      select: {
        User_ID: true,
        Username: true,
        Email: true,
        Role: true,
        CreatedAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { Username, Password, Role, Email } = await request.json()

    if (!Username || !Password || !Email || !Role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await prisma.userInfo.findUnique({
      where: { Username },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10)

    const newUser = await prisma.userInfo.create({
      data: {
        Username,
        Password: hashedPassword,
        Email,
        Role,
      },
    })

    return NextResponse.json({
      message: "User created successfully",
      User_ID: newUser.User_ID,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
