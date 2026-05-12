export type Role = 'USER' | 'SELLER' | 'ADMIN'
export type PropertyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'INACTIVE'
export type PropertyType = 'FLAT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'SHOP' | 'OFFICE' | 'AGRICULTURAL'
export type LeadStatus = 'FRESH' | 'CONTACTED' | 'VISIT_SCHEDULED' | 'VISITED' | 'NEGOTIATION' | 'DEAL_DONE' | 'NOT_INTERESTED' | 'LOST'
export type ListingType = 'SELL' | 'RENT'
export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED'

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: Role
  avatar?: string | null
  isActive: boolean
  createdAt: Date
}

export interface PropertyImage {
  id: string
  url: string
  publicId?: string | null
  alt?: string | null
  order: number
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  priceNegotiable: boolean
  propertyType: PropertyType
  listingType: ListingType
  status: PropertyStatus
  furnishing: FurnishingStatus
  address: string
  city: string
  sector?: string | null
  locality?: string | null
  area: number
  areaUnit: string
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  parking?: number | null
  amenities: string[]
  images: PropertyImage[]
  coverImage?: string | null
  sellerId: string
  seller?: Partial<User>
  slug: string
  featured: boolean
  views: number
  createdAt: Date
  updatedAt: Date
  _count?: { leads?: number; inquiries?: number }
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  requirement?: string | null
  location?: string | null
  budget?: string | null
  propertyType?: string | null
  status: LeadStatus
  source: string
  notes?: string | null
  followUpDate?: Date | null
  lastContactedAt?: Date | null
  visitDate?: Date | null
  visitStatus?: string | null
  visitDescription?: string | null
  projectPitched?: string | null
  propertyId?: string | null
  property?: Partial<Property> | null
  agentId?: string | null
  agent?: Partial<User> | null
  createdAt: Date
  updatedAt: Date
}

export interface Inquiry {
  id: string
  name: string
  phone: string
  email?: string | null
  message?: string | null
  budget?: string | null
  propertyId: string
  property?: Partial<Property>
  userId?: string | null
  isRead: boolean
  createdAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
