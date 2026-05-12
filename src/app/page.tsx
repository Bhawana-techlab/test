import Link from 'next/link'
import Image from 'next/image'
import { Search, Building2, MapPin, TrendingUp, Shield, Star, ArrowRight, Phone } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/property/PropertyCard'
import { prisma } from '@/lib/prisma'
import { PROPERTY_TYPES, CITIES } from '@/lib/utils'
import type { Property } from '@/types'
import HeroSearch from '@/components/forms/HeroSearch'

async function getFeaturedProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE', featured: true },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        seller: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
    return properties as unknown as Property[]
  } catch { return [] }
}

async function getRecentProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        seller: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
    return properties as unknown as Property[]
  } catch { return [] }
}

async function getStats() {
  try {
    const [properties, leads, cities] = await Promise.all([
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count({ where: { status: 'DEAL_DONE' } }),
      prisma.property.groupBy({ by: ['city'], where: { status: 'ACTIVE' }, _count: true }),
    ])
    return { properties, deals: leads, cities: cities.length }
  } catch { return { properties: 500, deals: 200, cities: 8 } }
}

export default async function HomePage() {
  const [featured, recent, stats] = await Promise.all([
    getFeaturedProperties(),
    getRecentProperties(),
    getStats(),
  ])

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center pt-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          {/* Red accent blob */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary-800/10 rounded-full blur-3xl" />

          <div className="container-app relative z-10 py-20">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-6">
                <Star className="w-4 h-4 text-primary-400" />
                <span className="text-primary-300 text-sm font-medium">Tricity's Most Trusted Real Estate Platform</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Find Your<br />
                <span className="text-primary-500">Dream Property</span><br />
                In Tricity
              </h1>

              <p className="text-gray-400 text-xl mb-10 max-w-2xl">
                Explore thousands of verified properties in Chandigarh, Mohali & Panchkula. Buy, sell, or rent with confidence.
              </p>

              {/* Search Widget */}
              <HeroSearch />

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { label: 'Active Listings', value: `${stats.properties}+` },
                  { label: 'Happy Clients', value: `${stats.deals}+` },
                  { label: 'Cities Covered', value: `${stats.cities}+` },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Property Types ── */}
        <section className="py-20 bg-gray-50">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="section-title">Browse by Property Type</h2>
              <p className="section-subtitle">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {PROPERTY_TYPES.map(({ value, label }) => (
                <Link key={value} href={`/buy?propertyType=${value}`}
                  className="group bg-white rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:border-primary-200 border border-transparent transition-all duration-300">
                  <div className="w-14 h-14 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Building2 className="w-7 h-7 text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Properties ── */}
        {featured.length > 0 && (
          <section className="py-20">
            <div className="container-app">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="section-title">Featured Properties</h2>
                  <p className="section-subtitle">Handpicked premium listings</p>
                </div>
                <Link href="/buy?featured=true" className="btn-outline text-sm hidden md:flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent Properties ── */}
        <section className="py-20 bg-gray-50">
          <div className="container-app">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">Recently Listed</h2>
                <p className="section-subtitle">Fresh properties just added</p>
              </div>
              <Link href="/buy" className="btn-outline text-sm hidden md:flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>

        {/* ── Cities ── */}
        <section className="py-20">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="section-title">Popular Locations</h2>
              <p className="section-subtitle">Explore properties by city</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CITIES.slice(0, 8).map(city => (
                <Link key={city} href={`/buy?city=${city}`}
                  className="group relative rounded-2xl overflow-hidden h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-end p-4 hover:scale-[1.02] transition-transform duration-300 shadow-card">
                  <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/20 transition-colors duration-300" />
                  <div className="relative">
                    <p className="text-white font-bold text-lg">{city}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Punjab
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Us ── */}
        <section className="py-20 bg-primary-600">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose PropEstate?</h2>
              <p className="text-primary-200 mt-3 text-lg">We make property transactions simple and trustworthy</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: 'Verified Listings', desc: 'Every property is personally verified by our team before listing.' },
                { icon: TrendingUp, title: 'Best Price', desc: 'Get the best deals in the market with our expert negotiation support.' },
                { icon: Phone, title: 'Expert Support', desc: 'Our team guides you through the entire buying/selling process.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
                  <p className="text-primary-100">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20">
          <div className="container-app">
            <div className="bg-gray-950 rounded-3xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to List Your Property?</h2>
              <p className="text-gray-400 text-lg mb-8">Post your property for FREE and reach thousands of verified buyers</p>
              <Link href="/sell" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                Post Property Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
