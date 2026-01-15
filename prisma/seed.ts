import { prisma } from "../lib/db"
import bcrypt from "bcrypt"

async function main() {
  console.log("Seeding database...")

  // Hash the password for both users
  const hashedPassword = await bcrypt.hash("password", 10)

  // Create Admin user
  const admin = await prisma.userInfo.upsert({
    where: { Username: "admin123" },
    update: {},
    create: {
      Username: "admin123",
      Password: hashedPassword,
      Role: "Admin",
      Email: "admin@yolorental.com",
    },
  })

  console.log("Admin user created:", admin)

  // Create sample vehicles with new fields
  const vehicles = [
    {
      Brand: "Toyota",
      Model: "Vios 1.3 E",
      PlateNo: "TY-2022-001",
      DailyRate: 1500,
      Year: 2022,
      Seats: 4,
      Category: "Sedan",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Honda",
      Model: "City 1.5 S",
      PlateNo: "HD-2021-002",
      DailyRate: 1800,
      Year: 2021,
      Seats: 4,
      Category: "Sedan",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Toyota",
      Model: "Innova 2.8 V",
      PlateNo: "TY-2023-003",
      DailyRate: 2500,
      Year: 2023,
      Seats: 7,
      Category: "SUV",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Mitsubishi",
      Model: "Mirage G4 GLX",
      PlateNo: "MS-2020-004",
      DailyRate: 1200,
      Year: 2020,
      Seats: 4,
      Category: "Sedan",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Hyundai",
      Model: "Creta SX",
      PlateNo: "HY-2022-005",
      DailyRate: 2000,
      Year: 2022,
      Seats: 5,
      Category: "SUV",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Maruti",
      Model: "Swift VXi",
      PlateNo: "MR-2021-006",
      DailyRate: 1000,
      Year: 2021,
      Seats: 5,
      Category: "Sedan",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
    {
      Brand: "Mahindra",
      Model: "XUV500",
      PlateNo: "MH-2023-007",
      DailyRate: 3000,
      Year: 2023,
      Seats: 7,
      Category: "SUV",
      HasAC: true,
      Location: "Mumbai",
      Status: "Available",
    },
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicleInfo.upsert({
      where: { PlateNo: vehicle.PlateNo },
      update: {},
      create: vehicle as any,
    })
  }

  console.log("Sample vehicles created:", vehicles.length)
  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
