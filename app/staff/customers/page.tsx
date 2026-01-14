"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  ContactNo: string
  LicenseNo: string
  Email: string
  Address: string
}

export default function StaffCustomers() {
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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-2">View and manage customer information</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add New Customer</Button>
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
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  placeholder="Phone Number"
                  value={formData.ContactNo}
                  onChange={(e) => setFormData({ ...formData, ContactNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  placeholder="License Number"
                  value={formData.LicenseNo}
                  onChange={(e) => setFormData({ ...formData, LicenseNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  placeholder="Address"
                  value={formData.Address}
                  onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <Button
                  onClick={handleAddCustomer}
                  disabled={addingCustomer}
                  className="w-full"
                >
                  {addingCustomer ? "Adding..." : "Add Customer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6 text-green-700">{success}</CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <p className="text-gray-500">No customers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">License No.</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.Customer_ID} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{customer.Customer_Name}</td>
                        <td className="py-3 px-4 text-sm font-mono">{customer.LicenseNo}</td>
                        <td className="py-3 px-4 text-sm">{customer.ContactNo}</td>
                        <td className="py-3 px-4 text-sm">{customer.Email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.Address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
