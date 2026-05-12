import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import InquiryForm from '@/components/forms/InquiryForm'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Bed, Bath, Maximize, MapPin, Phone, Calendar, Eye, Share2, Heart, CheckCircle, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

async function getProperty(id: string) {
  try {
    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { slug: id }], status: 'ACTIVE' },
      include: {
        images: { orderBy: { order: 'asc' } },
        seller: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
      },
    })
    if (property) {
      await prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } })
    }
    return property
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProperty(params.id)
  if (!p) return { title: 'Property Not Found' }
  return {
    title: p.title,
    description: p.description.slice(0, 160),
    openGraph: { title: p.title, images: p.coverImage ? [p.coverImage] : [] },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id)
  if (!property) notFound()

  const typeLabel: Record<string, string> = {
    FLAT: 'Flat/Apartment', INDEPENDENT_HOUSE: 'Independent House', VILLA: 'Villa',
    PLOT: 'Plot/Land', COMMERCIAL: 'Commercial', SHOP: 'Shop', OFFICE: 'Office', AGRICULTURAL: 'Agricultural Land',
  }

  const allImages = property.images.length > 0
    ? property.images.map(i => i.url)
    : property.coverImage ? [property.coverImage] : ['/placeholder-property.jpg']

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-app py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link href="/buy" className="hover:text-primary-600">Buy</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{property.title}</span>
          </div>
        </div>

        <div className="container-app py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-card">
                <div className="relative h-80 md:h-96">
                  <Image src={allImages[0]} alt={property.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="badge bg-primary-600 text-white">
                      {property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                    </span>
                    <span className="badge bg-white text-gray-700 shadow">
                      {typeLabel[property.propertyType] || property.propertyType}
                    </span>
                  </div>
                  {property.featured && (
                    <span className="absolute top-4 right-4 badge bg-yellow-500 text-white">Featured</span>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-3">
                    {allImages.slice(1, 5).map((img, i) => (
                      <div key={i} className="relative h-20 rounded-xl overflow-hidden">
                        <Image src={img} alt="" fill className="object-cover" />
                        {i === 3 && allImages.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold">+{allImages.length - 5}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Price */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{[property.locality, property.sector, property.city].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-3xl font-bold text-primary-600">{formatPrice(property.price)}</p>
                    {property.priceNegotiable && <p className="text-sm text-gray-500 mt-1">Negotiable</p>}
                  </div>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                  {property.bedrooms && (
                    <div className="text-center">
                      <Bed className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                      <p className="font-semibold text-gray-900">{property.bedrooms} BHK</p>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <Bath className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                      <p className="font-semibold text-gray-900">{property.bathrooms}</p>
                      <p className="text-xs text-gray-500">Bathrooms</p>
                    </div>
                  )}
                  <div className="text-center">
                    <Maximize className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <p className="font-semibold text-gray-900">{property.area.toLocaleString()} {property.areaUnit}</p>
                    <p className="text-xs text-gray-500">Area</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <p className="font-semibold text-gray-900">{property.views}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-gray-900 text-lg mb-4">About this Property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Details Table */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Property Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Property Type', typeLabel[property.propertyType]],
                    ['Listing Type', property.listingType === 'SELL' ? 'For Sale' : 'For Rent'],
                    ['Furnishing', property.furnishing?.replace(/_/g, ' ')],
                    ['Area', `${property.area} ${property.areaUnit}`],
                    property.bedrooms ? ['Bedrooms', `${property.bedrooms} BHK`] : null,
                    property.bathrooms ? ['Bathrooms', String(property.bathrooms)] : null,
                    property.parking ? ['Parking', String(property.parking)] : null,
                    property.facing ? ['Facing', property.facing] : null,
                    ['City', property.city],
                    property.pincode ? ['Pincode', property.pincode] : null,
                    ['Listed On', formatDate(property.createdAt)],
                  ].filter(Boolean).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm w-32 flex-shrink-0">{key}</span>
                      <span className="font-medium text-gray-900 text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map(a => (
                      <div key={a} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm">
                        <CheckCircle className="w-4 h-4" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-4">
              {/* Seller Info */}
              {property.seller && (
                <div className="bg-white rounded-2xl p-5 shadow-card">
                  <h3 className="font-semibold text-gray-900 mb-4">Listed By</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                      {property.seller.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.seller.name}</p>
                      <p className="text-sm text-gray-500">Property Agent</p>
                    </div>
                  </div>
                  {property.seller.phone && (
                    <a href={`tel:${property.seller.phone}`}
                      className="w-full btn-primary flex items-center justify-center gap-2 mb-2">
                      <Phone className="w-4 h-4" /> {property.seller.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Inquiry Form */}
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
