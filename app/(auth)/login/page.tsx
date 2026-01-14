"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid credentials")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push(data.user.Role === "Admin" ? "/admin/dashboard" : "/staff/dashboard")
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background (same as homepage vibe) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 yolo-animated-bg opacity-100" />

        {/* Background image (change to cars.png) */}
        <div className="absolute inset-0 opacity-[0.14]">
          <Image
            src="/cars.png"
            alt=""
            fill
            priority
            className="object-cover grayscale contrast-125 blur-[1px]"
          />
        </div>

        {/* Spotlights + fade */}
        <div className="absolute left-1/2 top-[-240px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[-180px] top-[-160px] h-[480px] w-[480px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Top tiny nav */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={140} height={48} className="h-10 w-auto object-contain" />
        </Link>

        <Link href="/browse-vehicles">
          <Button variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10">
            Browse
          </Button>
        </Link>
      </div>

      {/* Center card like reference */}
      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center justify-center px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Mustard edge glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-yellow-500/35" />

          <div className="relative">
            {/* ✅ CENTERED HEADER */}
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-white/80">Hi, Welcome to</p>

              <div className="mt-3 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={170}
                  height={56}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>

              <p className="mt-2 text-sm text-white/70">
                Sign in to manage bookings and access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 rounded-2xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-yellow-500/60"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/" className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-white/25 bg-transparent text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-white text-black hover:bg-white/90"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            {/* Demo credentials (mustard accent) */}
            <div className="mt-6 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-white/85">
              <p className="mb-2 font-semibold text-yellow-300">Demo Credentials</p>
              <p>
                Admin: <span className="font-semibold text-white">admin123</span> / password
              </p>
              <p>
                Staff: <span className="font-semibold text-white">staff001</span> / password
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-white/55">
              By signing in, you agree to our terms and policies.
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
