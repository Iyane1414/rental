import bcrypt from "bcrypt"
import { prisma } from "./db"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByUsername(username: string) {
  return prisma.userInfo.findUnique({
    where: { Username: username },
  })
}
