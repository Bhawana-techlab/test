'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Home } from 'lucide-react'
import { CITIES, PROPERTY_TYPES } from '@/lib/utils'

export default function HeroSearch() {
  const [tab, setTab] = useState<'BUY' | 'RENT'>('BUY')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [keyword, setKeyword] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (type) params.set('propertyType', type)
    if (keyword) params.set('keyword', keyword)
    if (tab === 'RENT') params.set('listingType', 'RENT')
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 px-2 pt-2">
        {['BUY', 'RENT'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as 'BUY' | 'RENT')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        {/* City */}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 hover:border-gray-200 transition-colors">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
          >
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Property Type */}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 hover:border-gray-200 transition-colors">
          <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Keyword */}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 hover:border-gray-200 transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search keyword..."
            className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          onClick={handleSearch}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>
  )
}
