"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-muted-bg py-8 flex items-center justify-center">
      <Card className="p-8 max-w-md text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="text-3xl font-bold mb-4 text-success">Payment Successful!</h1>
        <p className="text-muted mb-8">
          Your rental has been confirmed. You will receive a confirmation email shortly.
        </p>
        <Link href="/">
          <Button className="w-full bg-primary text-white hover:bg-primary-dark">Back to Home</Button>
        </Link>
      </Card>
    </div>
  )
}
