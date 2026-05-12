'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2, Users, AlertCircle, CheckCircle2,
  LayoutDashboard, LogOut, Bell, Search, Download, Plus, Eye,
  Phone, Mail, Home, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatPrice, getLeadStatusColor, LEAD_STATUSES, CITIES, PROPERTY_TYPES } from '@/lib/utils'
import type { Lead } from '@/types'

interface AdminUser { id: string; name: string; email: string; role: string }
interface Stats {
  totalProperties: number; activeProperties: number; pendingProperties: number;
  totalLeads: number; freshLeads: number; dealDoneLeads: number;
  totalUsers: number; totalSellers: number;
}

const AMENITIES_LIST = ['Lift','Parking','Power Backup','Security','CCTV','Gym','Swimming Pool','Club House','Garden','Play Area','Water Supply 24x7','Internet','Gated Community']

const emptyForm = {
  title: '', description: '', price: '', priceNegotiable: false,
  propertyType: 'FLAT', listingType: 'SELL', furnishing: 'UNFURNISHED',
  address: '', city: 'Mohali', sector: '', locality: '', pincode: '',
  area: '', areaUnit: 'sqft', bedrooms: '', bathrooms: '', parking: '',
  facing: '', coverImage: '', featured: false,
}

export default function AdminDashboardClient({ user }: { user: AdminUser }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [pendingProps, setPendingProps] = useState<any[]>([])
  const [leadsByStatus, setLeadsByStatus] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview'|'leads'|'properties'|'add-property'>('overview')
  const [loading, setLoading] = useState(true)

  // Leads
  const [leadsPage, setLeadsPage] = useState(1)
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [leadsTotalPages, setLeadsTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Add Property
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<{url:string; publicId:string}[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      if (d.success) {
        setStats(d.data.stats)
        setPendingProps(d.data.recentProperties)
        setLeadsByStatus(d.data.leadsByStatus)
      }
      setLoading(false)
    })
  }, [])

  const fetchLeads = async () => {
    setLeadsLoading(true)
    const params = new URLSearchParams({ page: String(leadsPage), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    if (searchFilter) params.set('search', searchFilter)
    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    if (data.success) {
      setLeads(data.data)
      setLeadsTotal(data.pagination.total)
      setLeadsTotalPages(data.pagination.totalPages)
    }
    setLeadsLoading(false)
  }

  useEffect(() => { if (activeTab === 'leads') fetchLeads() }, [activeTab, leadsPage, statusFilter])

  const updateLeadStatus = async (leadId: string, status: string) => {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if ((await res.json()).success) {
      toast.success('Status updated')
      fetchLeads()
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: status as any })
    }
  }

  const approveProperty = async (propertyId: string) => {
    const res = await fetch(`/api/properties/${propertyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    })
    if ((await res.json()).success) {
      toast.success('Property approved!')
      setPendingProps(p => p.filter(x => x.id !== propertyId))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.success) {
      setImages(prev => [...prev, ...data.data])
      if (!form.coverImage && data.data[0]) setForm(p => ({ ...p, coverImage: data.data[0].url }))
      toast.success('Images uploaded!')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.address || !form.area) return toast.error('Fill required fields')
    if (images.length === 0) return toast.error('Upload at least 1 image')
    setSubmitting(true)
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amenities, images }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (data.success) {
      toast.success('Property listed successfully!')
      setForm(emptyForm)
      setImages([])
      setAmenities([])
      setActiveTab('overview')
    } else {
      toast.error(data.error || 'Failed')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const exportLeads = () => {
    const csv = [
      ['Name','Phone','Email','Budget','Location','Status','Property','Created'].join(','),
      ...leads.map(l => [l.name,l.phone,l.email||'',l.budget||'',l.location||'',l.status,l.property?.title||'',formatDate(l.createdAt)].map(v=>`"${v}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'All Leads', icon: Users, badge: stats?.freshLeads },
    { id: 'properties', label: 'Properties', icon: Building2, badge: stats?.pendingProperties },
    { id: 'add-property', label: 'Add Property', icon: Plus },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">PropEstate</span>
          </Link>
          <div className="mt-2 px-2 py-1 bg-primary-600/20 rounded-lg">
            <p className="text-primary-300 text-xs font-medium">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge }: any) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon className="w-4 h-4" /> {label}
              {badge ? (
                <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900 capitalize">
            {activeTab === 'overview' ? 'Dashboard' : activeTab === 'leads' ? 'Lead Management' : activeTab === 'add-property' ? 'Add Property' : 'Properties'}
          </h1>
          <div className="flex items-center gap-4">
            {stats?.pendingProperties ? (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-sm text-yellow-700">
                <Bell className="w-4 h-4" /> {stats.pendingProperties} pending
              </div>
            ) : null}
            <Link href="/" target="_blank" className="btn-ghost text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" /> View Site
            </Link>
          </div>
        </header>

        <div className="p-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Properties', value: stats?.totalProperties, icon: Building2, color: 'blue', sub: `${stats?.activeProperties} active` },
                  { label: 'Total Leads', value: stats?.totalLeads, icon: Users, color: 'purple', sub: `${stats?.freshLeads} fresh` },
                  { label: 'Deals Done', value: stats?.dealDoneLeads, icon: CheckCircle2, color: 'green', sub: 'closed' },
                  { label: 'Pending Review', value: stats?.pendingProperties, icon: AlertCircle, color: 'yellow', sub: 'needs approval' },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 shadow-card">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color==='blue'?'bg-blue-50':color==='purple'?'bg-purple-50':color==='green'?'bg-green-50':'bg-yellow-50'}`}>
                      <Icon className={`w-6 h-6 ${color==='blue'?'text-blue-600':color==='purple'?'text-purple-600':color==='green'?'text-green-600':'text-yellow-600'}`} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{loading ? '...' : value ?? 0}</p>
                    <p className="text-gray-500 text-sm mt-1">{label}</p>
                    <p className="text-gray-400 text-xs">{sub}</p>
                  </div>
                ))}
              </div>

              {leadsByStatus.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <h3 className="font-semibold text-gray-900 mb-4">Leads by Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {leadsByStatus.map(({ status, count }) => (
                      <div key={status} className="border border-gray-100 rounded-xl p-3">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <span className={`badge ${getLeadStatusColor(status)} text-xs mt-1`}>{status.replace(/_/g,' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingProps.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="p-6 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
                  </div>
                  {pendingProps.map(p => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{p.title}</p>
                        <p className="text-sm text-gray-500">{p.city} · {p.seller?.name} · {formatPrice(p.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/property/${p.slug}`} target="_blank" className="btn-ghost text-sm py-1.5 px-3">Preview</Link>
                        <button onClick={() => approveProperty(p.id)} className="btn-primary text-sm py-1.5 px-4">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LEADS ── */}
          {activeTab === 'leads' && (
            <div className="space-y-4 animate-in">
              <div className="bg-white rounded-2xl p-4 shadow-card flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Search name, phone..." value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && fetchLeads()}
                      className="pl-9 input-field py-2 text-sm w-64" />
                  </div>
                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLeadsPage(1) }} className="input-field py-2 text-sm w-48">
                    <option value="">All Statuses</option>
                    {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <button onClick={exportLeads} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="crm-table">
                    <thead><tr>
                      <th>Name</th><th>Phone</th><th>Budget</th><th>Location</th>
                      <th>Property</th><th>Status</th><th>Follow Up</th><th>Date</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {leadsLoading ? (
                        Array.from({length:8}).map((_,i) => (
                          <tr key={i}>{Array.from({length:9}).map((_,j) => <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                        ))
                      ) : leads.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-12 text-gray-400">No leads found</td></tr>
                      ) : leads.map(lead => (
                        <tr key={lead.id} className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
                          <td><p className="font-medium text-gray-900">{lead.name}</p><p className="text-xs text-gray-400">{lead.email}</p></td>
                          <td><a href={`tel:${lead.phone}`} className="text-primary-600 font-medium" onClick={e=>e.stopPropagation()}>{lead.phone}</a></td>
                          <td className="font-medium">{lead.budget || '—'}</td>
                          <td>{lead.location || '—'}</td>
                          <td className="max-w-[140px]">
                            {lead.property ? <Link href={`/property/${lead.property.id}`} target="_blank" className="text-primary-600 text-xs truncate block hover:underline" onClick={e=>e.stopPropagation()}>{lead.property.title}</Link> : '—'}
                          </td>
                          <td>
                            <select value={lead.status} onChange={e=>{e.stopPropagation();updateLeadStatus(lead.id,e.target.value)}} onClick={e=>e.stopPropagation()}
                              className={`badge ${getLeadStatusColor(lead.status)} text-xs border-0 cursor-pointer`}>
                              {LEAD_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </td>
                          <td className="text-sm">
                            {lead.followUpDate ? <span className={new Date(lead.followUpDate)<new Date()?'text-red-600 font-medium':'text-gray-600'}>{formatDate(lead.followUpDate)}</span> : '—'}
                          </td>
                          <td className="text-xs text-gray-400">{formatDate(lead.createdAt)}</td>
                          <td><button onClick={e=>{e.stopPropagation();setSelectedLead(lead)}} className="text-primary-600 hover:underline text-xs">Details</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {leadsTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Page {leadsPage} of {leadsTotalPages}</p>
                    <div className="flex gap-2">
                      <button onClick={()=>setLeadsPage(p=>p-1)} disabled={leadsPage===1} className="btn-outline text-sm py-1.5 px-3 disabled:opacity-50">Prev</button>
                      <button onClick={()=>setLeadsPage(p=>p+1)} disabled={leadsPage===leadsTotalPages} className="btn-outline text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ADD PROPERTY ── */}
          {activeTab === 'add-property' && (
            <form onSubmit={handleSubmitProperty} className="space-y-6 max-w-4xl animate-in">

              {/* Basic Info */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required placeholder="e.g. 3BHK Flat in Sector 70 Mohali" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <select value={form.propertyType} onChange={e=>setForm(p=>({...p,propertyType:e.target.value}))} className="input-field">
                      {PROPERTY_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing For *</label>
                    <select value={form.listingType} onChange={e=>setForm(p=>({...p,listingType:e.target.value}))} className="input-field">
                      <option value="SELL">Sale</option>
                      <option value="RENT">Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} required placeholder="5000000" className="input-field" />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="checkbox" id="neg" checked={form.priceNegotiable as any} onChange={e=>setForm(p=>({...p,priceNegotiable:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
                    <label htmlFor="neg" className="text-sm text-gray-700">Price Negotiable</label>
                    <input type="checkbox" id="feat" checked={form.featured as any} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} className="w-4 h-4 accent-primary-600 ml-4" />
                    <label htmlFor="feat" className="text-sm text-gray-700">Mark as Featured</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} required rows={4} className="input-field resize-none" placeholder="Describe the property..." />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                    <input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} required placeholder="House No, Street, Colony..." className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <select value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} className="input-field">
                      {CITIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                    <input value={form.sector} onChange={e=>setForm(p=>({...p,sector:e.target.value}))} placeholder="Sector 70" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                    <input value={form.locality} onChange={e=>setForm(p=>({...p,locality:e.target.value}))} placeholder="Aerocity" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input value={form.pincode} onChange={e=>setForm(p=>({...p,pincode:e.target.value}))} placeholder="140307" className="input-field" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                    <div className="flex gap-2">
                      <input type="number" value={form.area} onChange={e=>setForm(p=>({...p,area:e.target.value}))} required placeholder="1200" className="input-field flex-1" />
                      <select value={form.areaUnit} onChange={e=>setForm(p=>({...p,areaUnit:e.target.value}))} className="input-field w-24">
                        <option value="sqft">sqft</option>
                        <option value="sqyd">sqyd</option>
                        <option value="marla">Marla</option>
                        <option value="kanal">Kanal</option>
                      </select>
                    </div>
                  </div>
                  {[
                    {label:'Bedrooms', key:'bedrooms', opts:[1,2,3,4,5,6]},
                    {label:'Bathrooms', key:'bathrooms', opts:[1,2,3,4,5]},
                    {label:'Parking', key:'parking', opts:[1,2,3]},
                  ].map(({label,key,opts}) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <select value={(form as any)[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className="input-field">
                        <option value="">N/A</option>
                        {opts.map(n=><option key={n}>{n}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                    <select value={form.furnishing} onChange={e=>setForm(p=>({...p,furnishing:e.target.value}))} className="input-field">
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                    <select value={form.facing} onChange={e=>setForm(p=>({...p,facing:e.target.value}))} className="input-field">
                      <option value="">Any</option>
                      {['North','South','East','West','North-East','North-West','South-East','South-West'].map(f=><option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map(a => (
                      <button type="button" key={a} onClick={()=>setAmenities(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a])}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${amenities.includes(a)?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">Images * <span className="text-gray-400 font-normal text-sm">(Max 10)</span></h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {images.map((img, i) => (
                    <div key={i} className={`relative aspect-square rounded-xl overflow-hidden group border-2 ${form.coverImage===img.url?'border-primary-500':'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={()=>setForm(p=>({...p,coverImage:img.url}))} className="text-xs bg-white text-gray-800 px-1.5 py-0.5 rounded">Cover</button>
                        <button type="button" onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} className="bg-red-500 text-white p-1 rounded"><Home className="w-3 h-3" /></button>
                      </div>
                      {form.coverImage===img.url && <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1 py-0.5 rounded">Cover</div>}
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50">
                      {uploading ? <Loader2 className="w-5 h-5 text-primary-600 animate-spin" /> : <><Plus className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-400 mt-1">Add</span></>}
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-400">Note: Cloudinary must be configured in .env for image upload to work.</p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button type="button" onClick={()=>setActiveTab('overview')} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" disabled={submitting||uploading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : <><Plus className="w-4 h-4" /> Publish Property</>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setSelectedLead(null)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto animate-slide-down">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Lead Details</h3>
                <button onClick={()=>setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">{selectedLead.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedLead.name}</p>
                      <span className={`badge ${getLeadStatusColor(selectedLead.status)} text-xs`}>{selectedLead.status.replace(/_/g,' ')}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><a href={`tel:${selectedLead.phone}`} className="text-primary-600 font-medium">{selectedLead.phone}</a></div>
                    {selectedLead.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />{selectedLead.email}</div>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LEAD_STATUSES.map(s => (
                      <button key={s.value} onClick={()=>updateLeadStatus(selectedLead.id,s.value)}
                        className={`text-xs py-2 px-3 rounded-lg border transition-colors ${selectedLead.status===s.value?'border-primary-500 bg-primary-50 text-primary-700 font-medium':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedLead.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selectedLead.notes}</p>
                  </div>
                )}
                {selectedLead.property && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Interested In</p>
                    <Link href={`/property/${selectedLead.property.id}`} target="_blank" className="block bg-primary-50 border border-primary-100 rounded-xl p-3">
                      <p className="font-medium text-primary-800">{selectedLead.property.title}</p>
                    </Link>
                  </div>
                )}
                <p className="text-xs text-gray-400">Created: {formatDate(selectedLead.createdAt)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}