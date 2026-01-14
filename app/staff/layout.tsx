"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/staff/dashboard", icon: "📊" },
    { label: "Rentals", href: "/staff/rentals", icon: "🔑" },
    { label: "Payments", href: "/staff/payments", icon: "💳" },
    { label: "Vehicles", href: "/staff/vehicles", icon: "🚗" },
    { label: "Customers", href: "/staff/customers", icon: "👥" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">YOLO Rental</h1>
          <p className="text-blue-200 text-sm">Staff Portal</p>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={`w-full justify-start ${
                  pathname === item.href
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-blue-800"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-200 hover:text-red-100 hover:bg-red-900/20"
        >
          🚪 Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
