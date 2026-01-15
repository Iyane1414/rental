"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LayoutDashboard, Car, CreditCard, Users, ClipboardList, LogOut, RefreshCw, Search } from "lucide-react"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  Email: string
  ContactNo: string
  LicenseNo: string
  Address: string
}

interface CustomerDetail extends Customer {
  Rentals: Array<{
    Rental_ID: number
    StartDate: string
    EndDate: string
    TotalAmount: number
    Status: string
    Vehicle: {
      Vehicle_ID: number
      Brand: string
      Model: string
      PlateNo: string
      Status: string
      ImageUrl?: string | null
    } | null
    Payment: {
      Payment_ID: number
      Amount: number
      Status: string
      PaymentDate: string
      PaymentMethod: string
    } | null
  }>
}

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const nav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Rentals", href: "/admin/rentals", icon: ClipboardList },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Vehicles", href: "/admin/vehicles", icon: Car },
    { label: "Customers", href: "/admin/customers", icon: Users },
  ]

  const isActive = (href: string) => pathname?.startsWith(href)

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } catch {}
    router.push("/login")
  }

  return (
    <aside className="w-[240px] shrink-0 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="px-6 pt-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-10 w-auto object-contain" />
          </Link>

          <div className="mt-6 text-xs font-semibold tracking-widest text-neutral-500">ADMIN PORTAL</div>
        </div>

        <nav className="mt-4 space-y-2 px-3">
          {nav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                    active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-black",
                  ].join(" ")}
                >
                  <Icon className={active ? "h-4 w-4 text-yellow-400" : "h-4 w-4 text-neutral-500"} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-3 pb-6 pt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

          <p className="mt-3 px-1 text-xs text-neutral-400">Ac {new Date().getFullYear()} YOLO Car Rental</p>
        </div>
      </div>
    </aside>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [updatingRentalId, setUpdatingRentalId] = useState<number | null>(null)
  const [query, setQuery] = useState("")

  const totalPaid = useMemo(() => {
    if (!selectedCustomer) return 0
    return selectedCustomer.Rentals.reduce((sum, rental) => sum + (rental.Payment?.Amount ?? 0), 0)
  }, [selectedCustomer])

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return customers
    return customers.filter((customer) => {
      return (
        customer.Customer_Name.toLowerCase().includes(normalized) ||
        customer.Email.toLowerCase().includes(normalized) ||
        customer.ContactNo.toLowerCase().includes(normalized) ||
        customer.LicenseNo.toLowerCase().includes(normalized)
      )
    })
  }, [customers, query])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetail = async (customerId: number) => {
    try {
      setDetailLoading(true)
      setDetailError("")
      const response = await fetch(`/api/admin/customers/${customerId}`)
      if (!response.ok) throw new Error("Failed to load customer details")
      const data = await response.json()
      setSelectedCustomer(data)
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Failed to load customer details")
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateRentalStatus = async (rentalId: number, status: string) => {
    try {
      setUpdatingRentalId(rentalId)
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: status }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to update rental")
      }

      if (selectedCustomer) {
        await fetchCustomerDetail(selectedCustomer.Customer_ID)
      }
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Failed to update rental")
    } finally {
      setUpdatingRentalId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1">
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <h1 className="text-lg font-extrabold text-black">Customer Management</h1>
                <p className="mt-1 text-xs text-neutral-500">Find a customer and view their rental history</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search customers..."
                    className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>
                <Button className="h-9 rounded-xl bg-black text-white hover:bg-black/90" disabled>
                  Add Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchCustomers}
                  className="h-9 w-9 rounded-xl border-neutral-200 bg-white p-0 hover:bg-neutral-100"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <Card className="rounded-2xl border-neutral-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-extrabold text-black">
                    Customers ({filteredCustomers.length})
                  </CardTitle>
                  <p className="mt-2 text-xs text-neutral-500">Search by name, email, phone, or license.</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-col gap-4">
                    <div className="min-h-0">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-sm text-neutral-500">No customers found.</p>
                      ) : (
                        <div className="max-h-[calc(100vh-330px)] overflow-y-auto divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.Customer_ID}
                              type="button"
                              onClick={() => fetchCustomerDetail(customer.Customer_ID)}
                              className={[
                                "w-full text-left px-4 py-3 transition",
                                selectedCustomer?.Customer_ID === customer.Customer_ID
                                  ? "bg-neutral-100"
                                  : "bg-white hover:bg-neutral-50",
                              ].join(" ")}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-black truncate">{customer.Customer_Name}</p>
                                  <p className="mt-1 text-xs text-neutral-500 truncate">{customer.Email}</p>
                                  <p className="mt-1 text-xs text-neutral-400">{customer.ContactNo}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] font-semibold text-neutral-500">License</p>
                                  <p className="text-xs text-neutral-700">{customer.LicenseNo}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-neutral-200">
                <CardHeader className="border-b border-neutral-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-extrabold text-black">Customer Details</CardTitle>
                      <p className="mt-1 text-xs text-neutral-500">Select a customer to view full details.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCustomer(null)}
                      disabled={!selectedCustomer}
                      className="rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                    >
                      Clear
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {detailLoading && <p className="text-neutral-600 text-sm">Loading customer details...</p>}
                  {detailError && <p className="text-red-700 text-sm">{detailError}</p>}

                  {!selectedCustomer && !detailLoading && !detailError && (
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 text-sm text-neutral-500">
                      Choose a customer from the list to view profile details and rental history.
                    </div>
                  )}

                  {selectedCustomer && !detailLoading && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Customer</p>
                        <p className="mt-2 text-2xl font-extrabold text-black break-words">
                          {selectedCustomer.Customer_Name}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
                          <span className="break-all">{selectedCustomer.Email}</span>
                          <span className="break-words">{selectedCustomer.ContactNo}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">License No</p>
                          <p className="mt-2 text-base font-semibold text-black break-words">
                            {selectedCustomer.LicenseNo}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Address</p>
                          <p className="mt-2 text-base text-black break-words">{selectedCustomer.Address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Paid</p>
                          <p className="mt-2 text-2xl font-extrabold text-black">PHP {totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Rentals</p>
                          <p className="mt-2 text-2xl font-extrabold text-black">{selectedCustomer.Rentals.length}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pending Payments</p>
                          <p className="mt-2 text-2xl font-extrabold text-black">
                            {selectedCustomer.Rentals.filter((rental) => rental.Status === "Pending Payment").length}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-black">Rentals</h3>
                          <span className="text-xs text-neutral-500">{selectedCustomer.Rentals.length} total</span>
                        </div>

                        {selectedCustomer.Rentals.length === 0 ? (
                          <p className="mt-2 text-sm text-neutral-500">No rentals found for this customer.</p>
                        ) : (
                          <div className="mt-3 space-y-3">
                            {selectedCustomer.Rentals.map((rental) => (
                              <div
                                key={rental.Rental_ID}
                                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  {rental.Vehicle?.ImageUrl && (
                                    <div className="h-16 w-24 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                      <img
                                        src={rental.Vehicle.ImageUrl}
                                        alt={`${rental.Vehicle.Brand} ${rental.Vehicle.Model}`}
                                        className="h-full w-full object-contain"
                                      />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black">#{rental.Rental_ID}</p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                      {new Date(rental.StartDate).toLocaleDateString()} -{" "}
                                      {new Date(rental.EndDate).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm text-neutral-900">
                                      {rental.Vehicle ? `${rental.Vehicle.Brand} ${rental.Vehicle.Model}` : "Unknown"}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                      {rental.Vehicle?.PlateNo || "No plate number"}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span
                                      className={[
                                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                                        rental.Status === "Pending Payment"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : rental.Status === "Ongoing"
                                            ? "bg-blue-100 text-blue-800"
                                            : rental.Status === "Completed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-neutral-100 text-neutral-700",
                                      ].join(" ")}
                                    >
                                      {rental.Status}
                                    </span>
                                    <span className="text-sm font-semibold text-black">
                                      PHP {(rental.Payment?.Amount ?? 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateRentalStatus(rental.Rental_ID, "Completed")}
                                    disabled={updatingRentalId === rental.Rental_ID}
                                    className="rounded-xl border-neutral-200 bg-white hover:bg-neutral-100"
                                  >
                                    Mark Completed
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateRentalStatus(rental.Rental_ID, "Cancelled")}
                                    disabled={updatingRentalId === rental.Rental_ID}
                                    className="rounded-xl border-neutral-200 bg-white hover:bg-neutral-100"
                                  >
                                    Cancel
                                  </Button>
                                  {rental.Status === "Pending Payment" && (
                                    <Link href={`/payment/${rental.Rental_ID}`}>
                                      <Button size="sm" className="rounded-xl bg-black text-white hover:bg-black/90">
                                        Proceed to Payment
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
