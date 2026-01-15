"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const featuredCars = [
  { name: "Honda", src: "/honda.png", rating: 4.9, reviews: 128, note: "Comfort + fuel saver" },
  { name: "Toyota", src: "/toyota.png", rating: 4.8, reviews: 203, note: "Reliable daily driver" },
  { name: "Mitsubishi", src: "/mitsubishi.png", rating: 4.7, reviews: 94, note: "Spacious + smooth ride" },
  { name: "Nissan", src: "/nissan.png", rating: 4.6, reviews: 76, note: "City-friendly handling" },
  { name: "Ford", src: "/ford.png", rating: 4.7, reviews: 81, note: "Strong performance" },
]

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "text-yellow-500" : "text-neutral-300"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && hasHalf)
          return <Star key={i} filled={filled} />
        })}
      </div>
      <span className="text-sm font-semibold text-neutral-800">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-black text-white">
        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute inset-0 yolo-animated-bg opacity-100" />

          <div className="absolute left-1/2 top-[-220px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-140px] top-[-160px] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* NAV */}
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={140}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
              <Link className="hover:text-white transition" href="/">Home</Link>
              <Link className="hover:text-white transition" href="/browse-vehicles">Cars</Link>
              <Link className="hover:text-white transition" href="/browse-vehicles">Services</Link>
              <Link className="hover:text-white transition" href="/browse-vehicles">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/browse-vehicles">
                <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  Browse
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-white text-black hover:bg-white/90">Login</Button>
              </Link>
            </div>
          </header>

          {/* CONTENT */}
          <div className="grid grid-cols-1 gap-10 pb-44 pt-6 lg:grid-cols-12 lg:items-start">
            {/* LEFT STATS */}
            <aside className="lg:col-span-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs font-semibold tracking-widest text-white/70">RENT</p>

                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-3xl font-extrabold leading-none">100+</p>
                    <p className="mt-1 text-xs text-white/70">Vehicles available</p>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div>
                    <p className="text-3xl font-extrabold leading-none">20k+</p>
                    <p className="mt-1 text-xs text-white/70">Happy customers</p>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  <div className="text-xs text-white/70">
                    <p className="font-semibold text-white/85">Fast booking</p>
                    <p className="mt-1">Reliable cars • Transparent rates</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* CENTER SPACE (desktop) */}
            <div className="hidden lg:col-span-6 lg:block" />

            {/* RIGHT COPY */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs font-semibold tracking-widest text-white/70">PREMIUM CAR RENTAL</p>

                <h1 className="mt-3 text-4xl font-extrabold leading-tight">
                  Rent the best
                  <span className="block text-white/85">cars</span>
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Stress-free rental experience with clean units, simple search tools, and pickup options.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/browse-vehicles">
                    <Button className="w-full bg-white text-black hover:bg-white/90">Open Catalog</Button>
                  </Link>

                  <Link href="/browse-vehicles" className="text-center text-xs text-white/70 hover:text-white">
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CAR OVERLAP */}
          <div className="pointer-events-none absolute left-1/2 bottom-[-90px] z-20 w-full -translate-x-1/2">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex justify-center">
                <div className="relative translate-x-[0px] translate-y-[-100px]">
                  <div className="absolute left-1/2 top-[76%] h-12 w-[78%] -translate-x-1/2 rounded-full bg-black/80 blur-2xl" />
                  <Image
                    src="/car-bg.png"
                    alt="Featured car"
                    width={1400}
                    height={1000}
                    priority
                    className="h-auto w-[250px] max-w-[92vw] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR CARS */}
      <section className="bg-white pb-16 pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-widest text-neutral-500">OUR CARS</p>
            <h2 className="mt-2 text-3xl font-extrabold text-black">Featured Cars</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600">
              Top picks based on recent rentals—easy to drive, clean units, and great comfort.
              Book anytime from the Browse page.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {featuredCars.map((car) => (
              <div
                key={car.name}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-50">
                  <Image
                    src={car.src}
                    alt={car.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-3"
                  />
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-center text-sm font-extrabold text-black">{car.name}</p>

                  <div className="flex items-center justify-center">
                    <StarRating rating={car.rating} />
                  </div>

                  <p className="text-center text-xs text-neutral-500">
                    {car.note} • {car.reviews} reviews
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tagline like reference */}
          <div className="mt-16 text-center">
            <p className="text-sm font-extrabold tracking-wide text-black">
              WE DO BEST
              <span className="block text-yellow-500">THAN YOU WISH</span>
            </p>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-yellow-500/80" />
            <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-600">
              Premium service, transparent pricing, and a smooth booking experience—every time.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={110} height={36} className="h-8 w-auto object-contain" />
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} YOLO Car Rental. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/browse-vehicles" className="hover:text-black">Browse</Link>
            <Link href="/login" className="hover:text-black">Login</Link>
            <Link href="/browse-vehicles" className="hover:text-black">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
