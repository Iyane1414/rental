import Link from "next/link"
import { Button } from "@/components/ui/button"

const brandLogos = [
  { name: "Audi", color: "text-gray-700" },
  { name: "BMW", color: "text-blue-600" },
  { name: "Ford", color: "text-blue-500" },
  { name: "Bentley", color: "text-gray-800" },
  { name: "Porsche", color: "text-red-600" },
  { name: "Mercedes", color: "text-gray-700" },
]

const featuredVehicles = [
  {
    id: 1,
    brand: "BMW",
    model: "M440 Coupe",
    price: 159,
    image: "placeholder.svg?height=300&width=400&query=luxury BMW M440 red coupe sports car",
  },
  {
    id: 2,
    brand: "VW",
    model: "T-Roc",
    price: 58,
    image: "placeholder.svg?height=300&width=400&query=white Volkswagen T-Roc SUV",
  },
  {
    id: 3,
    brand: "BMW",
    model: "X3 30",
    price: 70,
    image: "placeholder.svg?height=300&width=400&query=dark BMW X3 luxury SUV",
  },
  {
    id: 4,
    brand: "BMW",
    model: "520",
    price: 65,
    image: "placeholder.svg?height=300&width=400&query=gray BMW 520 sedan",
  },
  {
    id: 5,
    brand: "Mercedes",
    model: "AMG GT 63 S",
    price: 220,
    image: "placeholder.svg?height=300&width=400&query=white Mercedes AMG sports car",
  },
  {
    id: 6,
    brand: "Audi",
    model: "Q7",
    price: 95,
    image: "placeholder.svg?height=300&width=400&query=black Audi Q7 luxury SUV",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">YOLO</h1>
          <div className="space-x-3">
            <Link href="/browse-vehicles">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary text-white hover:bg-primary-dark">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold mb-2 opacity-90">PREMIUM CAR RENTAL</p>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-pretty">Premium Car Collection</h2>
              <p className="text-lg opacity-95 mb-8 max-w-xl">
                Experience luxury and performance with our exclusive fleet of premium vehicles. Fast booking,
                competitive rates, and outstanding service.
              </p>
              <Link href="/browse-vehicles">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold">
                  Browse Vehicles
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              <img src="/luxury-red-sports-car-side-view-premium.jpg" alt="Premium Car" className="relative z-10 w-full drop-shadow-lg" />
              <div className="absolute top-8 right-8 bg-primary text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                40% off
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Brands */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-semibold mb-2">EXPLORE OUR BRANDS</p>
            <h3 className="text-3xl font-bold">Browse By Brands</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {brandLogos.map((brand) => (
              <div key={brand.name} className="brand-icon">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${brand.color} mb-1`}>⬤</div>
                  <p className="text-xs font-semibold text-foreground">{brand.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-sm text-primary font-semibold mb-2">PREMIUM SELECTION</p>
              <h3 className="text-3xl font-bold">Explore All Vehicles</h3>
            </div>
            <Link href="/browse-vehicles">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 bg-transparent">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-card group">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded text-sm font-semibold">
                    40% OFF
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-1">OR DAILY RATE</p>
                  <h4 className="text-xl font-bold mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h4>
                  <p className="text-2xl font-bold text-primary mb-4">PHP {vehicle.price}/day</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">👤 5</span>
                    <span className="flex items-center gap-1">🧳 3</span>
                    <span className="flex items-center gap-1">⚙️ Auto</span>
                  </div>
                  <Link href={`/book-vehicle/${vehicle.id}`}>
                    <Button className="w-full bg-primary text-white hover:bg-primary-dark">Book Now</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
