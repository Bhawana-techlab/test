import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PropertyListings from '@/components/property/PropertyListings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Property',
  description: 'Browse properties for sale and rent in Chandigarh, Mohali, Panchkula and Tricity.',
}

export default function BuyPage({ searchParams }: { searchParams: Record<string, string> }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" /></div>}>
          <PropertyListings searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
