"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-muted-bg">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-border transition-all`}>
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className={`font-bold ${sidebarOpen ? "text-lg" : "text-sm"}`}>YOLO</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted">
            ≡
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Dashboard" : "📊"}
            </div>
          </Link>
          <Link href="/admin/rentals">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Rentals" : "📋"}
            </div>
          </Link>
          <Link href="/admin/vehicles">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Vehicles" : "🚗"}
            </div>
          </Link>
          <Link href="/admin/customers">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Customers" : "👥"}
            </div>
          </Link>
          <Link href="/admin/payments">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Payments" : "💳"}
            </div>
          </Link>
          <Link href="/admin/reports">
            <div className="p-2 rounded hover:bg-muted-bg text-foreground text-sm">
              {sidebarOpen ? "Reports" : "📈"}
            </div>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
            {sidebarOpen ? "Logout" : "🚪"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
