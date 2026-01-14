import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = await getUserByUsername(username)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await verifyPassword(password, user.Password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      token: "dummy-token",
      user: {
        User_ID: user.User_ID,
        Username: user.Username,
        Role: user.Role,
        Email: user.Email,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
