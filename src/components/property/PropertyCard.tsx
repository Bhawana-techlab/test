import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Bed, Bath, Maximize, MapPin, Phone, Eye } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  className?: string
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const mainImage = property.images?.[0]?.url || property.coverImage || '/placeholder-property.jpg'

  const typeLabel: Record<string, string> = {
    FLAT: 'Flat', INDEPENDENT_HOUSE: 'House', VILLA: 'Villa',
    PLOT: 'Plot', COMMERCIAL: 'Commercial', SHOP: 'Shop', OFFICE: 'Office', AGRICULTURAL: 'Land',
  }

  return (
    <div className={cn('card group cursor-pointer', className)}>
      <Link href={`/property/${property.slug}`}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="badge bg-primary-600 text-white text-xs">
              {property.listingType === 'RENT' ? 'Rent' : 'Sale'}
            </span>
            <span className="badge bg-white text-gray-700 text-xs shadow">
              {typeLabel[property.propertyType] || property.propertyType}
            </span>
          </div>

          {property.featured && (
            <span className="absolute top-3 right-12 badge bg-yellow-500 text-white text-xs">
              Featured
            </span>
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              onClick={e => e.preventDefault()}>
              <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white font-bold text-xl">{formatPrice(property.price)}</p>
            {property.priceNegotiable && (
              <p className="text-white/70 text-xs">Negotiable</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors mb-1">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{property.locality ? `${property.locality}, ` : ''}{property.city}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-gray-400" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Maximize className="w-4 h-4 text-gray-400" />
              <span>{property.area.toLocaleString()} {property.areaUnit}</span>
            </div>
          </div>

          {/* Footer */}
          {property.seller && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                  {property.seller.name?.charAt(0) || 'S'}
                </div>
                <span className="text-xs text-gray-500">{property.seller.name}</span>
              </div>
              {property.seller.phone && (
                <div className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
