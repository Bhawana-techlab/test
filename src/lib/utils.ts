import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} Lac`
  return `₹${price.toLocaleString('en-IN')}`
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Math.random().toString(36).substr(2, 6)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    FRESH: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    VISIT_SCHEDULED: 'bg-purple-100 text-purple-800',
    VISITED: 'bg-indigo-100 text-indigo-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    DEAL_DONE: 'bg-green-100 text-green-800',
    NOT_INTERESTED: 'bg-red-100 text-red-800',
    LOST: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPropertyStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    SOLD: 'bg-gray-100 text-gray-800',
    INACTIVE: 'bg-gray-100 text-gray-500',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const CITIES = [
  'Mohali', 'Chandigarh', 'Panchkula', 'Zirakpur',
  'Kharar', 'Landran', 'Dera Bassi', 'New Chandigarh',
]

export const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Flat / Apartment' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'SHOP', label: 'Shop' },
  { value: 'OFFICE', label: 'Office Space' },
  { value: 'AGRICULTURAL', label: 'Agricultural Land' },
]

export const BUDGET_RANGES = [
  { label: 'Under 20 Lac', min: 0, max: 2000000 },
  { label: '20-50 Lac', min: 2000000, max: 5000000 },
  { label: '50 Lac - 1 Cr', min: 5000000, max: 10000000 },
  { label: '1 Cr - 2 Cr', min: 10000000, max: 20000000 },
  { label: 'Above 2 Cr', min: 20000000, max: 999999999 },
]

export const LEAD_STATUSES = [
  { value: 'FRESH', label: 'Fresh Lead' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'VISIT_SCHEDULED', label: 'Visit Scheduled' },
  { value: 'VISITED', label: 'Visited' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'DEAL_DONE', label: 'Deal Done' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'LOST', label: 'Lost' },
]
