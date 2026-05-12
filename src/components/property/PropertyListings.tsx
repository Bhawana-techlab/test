'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react'
import PropertyCard from './PropertyCard'
import { CITIES, PROPERTY_TYPES, BUDGET_RANGES } from '@/lib/utils'
import type { Property } from '@/types'

export default function PropertyListings({ searchParams }: { searchParams: Record<string, string> }) {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState({
    city: searchParams.city || '',
    propertyType: searchParams.propertyType || '',
    listingType: searchParams.listingType || '',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
    bedrooms: searchParams.bedrooms || '',
    keyword: searchParams.keyword || '',
    page: parseInt(searchParams.page || '1'),
  })

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })

      const res = await fetch(`/api/properties?${params}`)
      const data = await res.json()
      if (data.success) {
        setProperties(data.data)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      }
      setLoading(false)
    }
    fetchProperties()
  }, [filters])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ city: '', propertyType: '', listingType: '', minPrice: '', maxPrice: '', bedrooms: '', keyword: '', page: 1 })
  }

  const activeFiltersCount = [filters.city, filters.propertyType, filters.listingType, filters.minPrice, filters.bedrooms].filter(Boolean).length

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : `${total.toLocaleString()} Properties Found`}
          </h1>
          {(filters.city || filters.propertyType) && (
            <p className="text-gray-500 text-sm mt-1">
              {[filters.city, filters.propertyType].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {/* Keyword search */}
          <input
            value={filters.keyword}
            onChange={e => updateFilter('keyword', e.target.value)}
            placeholder="Search keyword..."
            className="input-field w-48 py-2 text-sm"
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}>
              <Grid3X3 className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}>
              <List className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-card animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
              <select value={filters.city} onChange={e => updateFilter('city', e.target.value)} className="input-field py-2 text-sm">
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Property Type</label>
              <select value={filters.propertyType} onChange={e => updateFilter('propertyType', e.target.value)} className="input-field py-2 text-sm">
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">For</label>
              <select value={filters.listingType} onChange={e => updateFilter('listingType', e.target.value)} className="input-field py-2 text-sm">
                <option value="">Buy & Rent</option>
                <option value="SELL">Buy</option>
                <option value="RENT">Rent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Budget</label>
              <select
                value={`${filters.minPrice}-${filters.maxPrice}`}
                onChange={e => {
                  const [min, max] = e.target.value.split('-')
                  setFilters(p => ({ ...p, minPrice: min, maxPrice: max, page: 1 }))
                }}
                className="input-field py-2 text-sm"
              >
                <option value="-">Any Budget</option>
                {BUDGET_RANGES.map(r => (
                  <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Bedrooms</label>
              <select value={filters.bedrooms} onChange={e => updateFilter('bedrooms', e.target.value)} className="input-field py-2 text-sm">
                <option value="">Any</option>
                <option value="1">1+ BHK</option>
                <option value="2">2+ BHK</option>
                <option value="3">3+ BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pg = i + 1
                return (
                  <button
                    key={pg}
                    onClick={() => setFilters(p => ({ ...p, page: pg }))}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      filters.page === pg ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page === totalPages}
                className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
