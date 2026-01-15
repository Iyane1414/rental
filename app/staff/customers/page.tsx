"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LayoutDashboard, Receipt, Car, Users, CreditCard, LogOut, RefreshCw } from "lucide-react"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  ContactNo: string
  LicenseNo: string
  Email: string
  Address: string
}

export default function StaffCustomers() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    Customer_Name: "",
    ContactNo: "",
    LicenseNo: "",
    Email: "",
    Address: "",
  })

  const navItems = useMemo(
    () => [
      { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/staff/rentals", label: "Rentals", icon: Receipt },
      { href: "/staff/payments", label: "Payments", icon: CreditCard },
      { href: "/staff/vehicles", label: "Vehicles", icon: Car },
      { href: "/staff/customers", label: "Customers", icon: Users },
    ],
    []
  )

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {}
    router.push("/login")
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/staff/customers")
      if (!res.ok) throw new Error("Failed to fetch customers")
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    try {
      setAddingCustomer(true)
      const res = await fetch("/api/staff/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to add customer")

      setSuccess("Customer added successfully!")
      setFormData({
        Customer_Name: "",
        ContactNo: "",
        LicenseNo: "",
        Email: "",
        Address: "",
      })
      fetchCustomers()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setAddingCustomer(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.Customer_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.LicenseNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-neutral-200 bg-white md:flex md:flex-col">
        <div className="flex items-center gap-3 px-6 py-5">
          <Image
            src="/logo.png"
            alt="YOLO"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs font-semibold tracking-widest text-neutral-500">STAFF PORTAL</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                <Icon className={active ? "h-4 w-4 text-yellow-400" : "h-4 w-4"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <div className="mt-3 px-1 text-[11px] text-neutral-500">© {new Date().getFullYear()} YOLO Car Rental</div>
        </div>
      </aside>

      {/* Main */}
      <main className="md:pl-72">
        {/* Topbar */}
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <Image
                src="/logo.png"
                alt="YOLO"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>

            <div className="hidden md:block">
              <h1 className="text-xl font-extrabold tracking-tight">Customers</h1>
              <p className="text-sm text-neutral-600">View and manage customer information</p>
            </div>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-black text-white hover:bg-black/90">Add New Customer</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <input
                      placeholder="Full Name"
                      value={formData.Customer_Name}
                      onChange={(e) => setFormData({ ...formData, Customer_Name: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                    />
                    <input
                      placeholder="Phone Number"
                      value={formData.ContactNo}
                      onChange={(e) => setFormData({ ...formData, ContactNo: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                    />
                    <input
                      placeholder="License Number"
                      value={formData.LicenseNo}
                      onChange={(e) => setFormData({ ...formData, LicenseNo: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                    />
                    <input
                      placeholder="Email"
                      type="email"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                    />
                    <input
                      placeholder="Address"
                      value={formData.Address}
                      onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                    />
                    <Button
                      onClick={handleAddCustomer}
                      disabled={addingCustomer}
                      className="w-full rounded-xl bg-black text-white hover:bg-black/90"
                    >
                      {addingCustomer ? "Adding..." : "Add Customer"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="h-9 w-px bg-neutral-200" />
              <div className="hidden text-sm font-semibold text-neutral-700 sm:block">Staff</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Mobile title */}
          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-extrabold tracking-tight">Customers</h1>
            <p className="mt-1 text-sm text-neutral-600">View and manage customer information</p>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6 text-red-700">{error}</CardContent>
            </Card>
          )}

          {success && (
            <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6 text-emerald-700">{success}</CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl bg-white"
            />
          </div>

          <Card className="rounded-2xl border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-black">Customers ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <p className="text-neutral-500">No customers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">License No.</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Phone</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.Customer_ID} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 px-4 text-sm font-semibold text-black">{customer.Customer_Name}</td>
                          <td className="py-4 px-4 text-sm font-mono text-neutral-600">{customer.LicenseNo}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{customer.ContactNo}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{customer.Email}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">{customer.Address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
