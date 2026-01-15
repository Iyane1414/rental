import { NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"

export const runtime = "nodejs"

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const safeName = sanitizeFilename(file.name || "vehicle")
    const ext = path.extname(safeName) || ".jpg"
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "vehicles")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/vehicles/${filename}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 })
  }
}
