import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, ArrowRight, Camera, BarChart2, Users, Zap } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

export default async function SellPage() {
  const user = await getCurrentUser()
  const isSellerOrAdmin = user?.role === 'SELLER' || user?.role === 'ADMIN'

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-950 to-gray-900 py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="container-app relative z-10">
            <span className="badge bg-primary-600/30 text-primary-300 border border-primary-500/30 text-sm mb-6 inline-block px-4 py-1.5">
              100% Free to List
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sell Your Property<br />
              <span className="text-primary-500">Fast & Free</span>
            </h1>
            <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
              List your property on Tricity's #1 real estate platform. Reach thousands of genuine buyers instantly.
            </p>

            {isSellerOrAdmin ? (
              <Link href="/seller/add-property" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                Post Your Property <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=SELLER" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                  Post Property Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-medium px-8 py-4 rounded-xl transition-colors">
                  Already have account? Login
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="container-app">
            <div className="text-center mb-14">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">List your property in 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: Users, title: 'Create Seller Account', desc: 'Register as a seller in 30 seconds. It\'s completely free.' },
                { step: '02', icon: Camera, title: 'Add Your Property', desc: 'Fill in details, upload photos, set price. Our team verifies and publishes.' },
                { step: '03', icon: Zap, title: 'Get Buyer Inquiries', desc: 'Genuine buyers contact you directly. Our CRM tracks every lead for you.' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="bg-white rounded-2xl p-8 shadow-card text-center relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {step}
                  </div>
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-3">{title}</h3>
                  <p className="text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container-app">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="section-title mb-6">Why Sell With PropEstate?</h2>
                <div className="space-y-4">
                  {[
                    'Zero listing charges — completely free forever',
                    'Verified buyer inquiries only — no spam',
                    'Built-in CRM to track all your leads',
                    'Instant notifications on new inquiries',
                    'Professional property listing with photos',
                    'Dedicated support from our expert team',
                    'Thousands of active buyers in Tricity',
                    'Analytics — see who viewed your listing',
                  ].map(benefit => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  {isSellerOrAdmin ? (
                    <Link href="/seller/add-property" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                      Post Property Now <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active Listings', value: '500+' },
                  { label: 'Happy Sellers', value: '200+' },
                  { label: 'Monthly Visitors', value: '10K+' },
                  { label: 'Deals Closed', value: '150+' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-950 rounded-2xl p-8 text-center">
                    <p className="text-4xl font-bold text-primary-500 mb-2">{value}</p>
                    <p className="text-gray-400 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
