"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import DashboardLayout from "@/components/admin/dashboard-layout"

interface Customer {
  Customer_ID: number
  Customer_Name: string
  Email: string
  ContactNo: string
  LicenseNo: string
  Address: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Customers</h1>

        <div className="overflow-x-auto">
          <Card>
            <table className="w-full">
              <thead className="bg-muted-bg border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">License No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.Customer_ID} className="hover:bg-muted-bg">
                    <td className="px-6 py-3 text-sm font-semibold">{customer.Customer_Name}</td>
                    <td className="px-6 py-3 text-sm">{customer.Email}</td>
                    <td className="px-6 py-3 text-sm">{customer.ContactNo}</td>
                    <td className="px-6 py-3 text-sm">{customer.LicenseNo}</td>
                    <td className="px-6 py-3 text-sm">{customer.Address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
