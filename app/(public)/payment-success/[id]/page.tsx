"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 yolo-animated-bg opacity-100" />
        <div className="absolute inset-0 opacity-[0.14]">
          <Image src="/cars.png" alt="" fill priority className="object-cover grayscale contrast-125 blur-[1px]" />
        </div>
        <div className="absolute left-1/2 top-[-240px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
        <Card className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/25" />

          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl font-extrabold">
            OK
          </div>
          <h1 className="text-3xl font-extrabold">Payment Successful!</h1>
          <p className="mt-3 text-sm text-white/75">
            Your rental has been confirmed. You will receive a confirmation email shortly.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/browse-vehicles">
              <Button variant="outline" className="h-12 rounded-2xl border-white/25 bg-transparent text-white hover:bg-white/10">
                Browse More Cars
              </Button>
            </Link>
            <Link href="/">
              <Button className="h-12 rounded-2xl bg-white text-black hover:bg-white/90">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
