'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Upload, X, ArrowLeft, Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { CITIES, PROPERTY_TYPES } from '@/lib/utils'

const AMENITIES_LIST = [
  'Lift', 'Parking', 'Power Backup', 'Security', 'CCTV', 'Gym', 'Swimming Pool',
  'Club House', 'Garden', 'Play Area', 'Water Supply 24x7', 'Internet', 'Gated Community',
]

export default function AddPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '', description: '', price: '', priceNegotiable: false,
    propertyType: 'FLAT', listingType: 'SELL', furnishing: 'UNFURNISHED',
    address: '', city: 'Mohali', sector: '', locality: '', pincode: '',
    area: '', areaUnit: 'sqft', bedrooms: '', bathrooms: '', balconies: '', parking: '',
    facing: '', coverImage: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    if (images.length + files.length > 10) return toast.error('Max 10 images allowed')

    setUploadingImages(true)
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.success) {
      setImages(prev => [...prev, ...data.data])
      if (!form.coverImage && data.data[0]) setForm(p => ({ ...p, coverImage: data.data[0].url }))
      toast.success(`${data.data.length} image(s) uploaded`)
    } else {
      toast.error(data.error || 'Upload failed')
    }
    setUploadingImages(false)
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== idx)
      if (form.coverImage === prev[idx].url) {
        setForm(p => ({ ...p, coverImage: updated[0]?.url || '' }))
      }
      return updated
    })
  }

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.address || !form.area) {
      return toast.error('Please fill all required fields')
    }
    if (images.length === 0) return toast.error('Please upload at least 1 image')

    setLoading(true)
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amenities: selectedAmenities, images }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      toast.success('Property submitted for review!')
      router.push('/seller/dashboard')
    } else {
      toast.error(data.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/seller/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Add New Property</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. 3BHK Independent Villa in Sector 70 Mohali"
                className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing For *</label>
              <select name="listingType" value={form.listingType} onChange={handleChange} className="input-field">
                <option value="SELL">Sale</option>
                <option value="RENT">Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required
                placeholder="e.g. 5000000" className="input-field" />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" name="priceNegotiable" id="neg" checked={form.priceNegotiable as any}
                onChange={handleChange} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="neg" className="text-sm text-gray-700">Price is negotiable</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required
                rows={4} placeholder="Describe the property in detail..."
                className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required
                placeholder="House No, Street, Colony..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select name="city" value={form.city} onChange={handleChange} className="input-field">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector / Area</label>
              <input name="sector" value={form.sector} onChange={handleChange}
                placeholder="e.g. Sector 70" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
              <input name="locality" value={form.locality} onChange={handleChange}
                placeholder="e.g. Aerocity" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange}
                placeholder="e.g. 140307" className="input-field" />
            </div>
          </div>
        </div>

        {/* Size & Details */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
              <div className="flex gap-2">
                <input name="area" type="number" value={form.area} onChange={handleChange} required
                  placeholder="e.g. 1200" className="input-field flex-1" />
                <select name="areaUnit" value={form.areaUnit} onChange={handleChange} className="input-field w-24">
                  <option value="sqft">sqft</option>
                  <option value="sqyd">sqyd</option>
                  <option value="sqm">sqm</option>
                  <option value="marla">Marla</option>
                  <option value="kanal">Kanal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select name="bedrooms" value={form.bedrooms} onChange={handleChange} className="input-field">
                <option value="">N/A</option>
                {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <select name="bathrooms" value={form.bathrooms} onChange={handleChange} className="input-field">
                <option value="">N/A</option>
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
              <select name="parking" value={form.parking} onChange={handleChange} className="input-field">
                <option value="">N/A</option>
                {[1,2,3].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
              <select name="furnishing" value={form.furnishing} onChange={handleChange} className="input-field">
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi Furnished</option>
                <option value="FULLY_FURNISHED">Fully Furnished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
              <select name="facing" value={form.facing} onChange={handleChange} className="input-field">
                <option value="">Any</option>
                {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button type="button" key={a} onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selectedAmenities.includes(a)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Property Images * <span className="text-gray-400 font-normal text-sm">(Max 10)</span>
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-colors ${
                form.coverImage === img.url ? 'border-primary-500' : 'border-transparent'
              }`}>
                <Image src={img.url} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => setForm(p => ({ ...p, coverImage: img.url }))}
                    className="text-xs bg-white text-gray-800 px-2 py-1 rounded-lg">Cover</button>
                  <button type="button" onClick={() => removeImage(i)}
                    className="bg-red-500 text-white p-1 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
                {form.coverImage === img.url && (
                  <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">Cover</div>
                )}
              </div>
            ))}

            {images.length < 10 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50">
                {uploadingImages ? (
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Add Image</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" onChange={handleImageUpload}
                  disabled={uploadingImages} className="hidden" />
              </label>
            )}
          </div>
          {images.length === 0 && <p className="text-sm text-gray-400">Upload property images. First image will be the cover photo.</p>}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pb-6">
          <Link href="/seller/dashboard" className="btn-outline flex-1 text-center py-3">Cancel</Link>
          <button type="submit" disabled={loading || uploadingImages} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Property for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
