'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2, Users, Eye, Plus, LogOut, Home, TrendingUp,
  Edit, Trash2, CheckCircle, Clock, XCircle, Phone, Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatPrice, getLeadStatusColor, getPropertyStatusColor, LEAD_STATUSES } from '@/lib/utils'
import type { Property, Lead } from '@/types'

interface SellerUser { id: string; name: string; email: string; role: string }

export default function SellerDashboardClient({ user }: { user: SellerUser }) {
  const [activeTab, setActiveTab] = useState<'listings' | 'leads'>('listings')
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, leads: 0, fresh: 0 })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [propsRes, leadsRes] = await Promise.all([
        fetch(`/api/properties?sellerId=${user.id}&status=&limit=50`),
        fetch('/api/leads?limit=50'),
      ])
      const propsData = await propsRes.json()
      const leadsData = await leadsRes.json()

      if (propsData.success) {
        setProperties(propsData.data)
        const props = propsData.data
        setStats(s => ({
          ...s,
          total: props.length,
          active: props.filter((p: Property) => p.status === 'ACTIVE').length,
          pending: props.filter((p: Property) => p.status === 'PENDING').length,
        }))
      }
      if (leadsData.success) {
        setLeads(leadsData.data)
        setStats(s => ({
          ...s,
          leads: leadsData.pagination?.total || leadsData.data.length,
          fresh: leadsData.data.filter((l: Lead) => l.status === 'FRESH').length,
        }))
      }
      setLoading(false)
    }
    fetchData()
  }, [user.id])

  const deleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    if ((await res.json()).success) {
      setProperties(p => p.filter(x => x.id !== id))
      toast.success('Property deleted')
    }
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if ((await res.json()).success) {
      setLeads(ls => ls.map(l => l.id === leadId ? { ...l, status: status as any } : l))
      toast.success('Status updated')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const navItems = [
    { id: 'listings', label: 'My Listings', icon: Building2, badge: stats.total },
    { id: 'leads', label: 'My Leads', icon: Users, badge: stats.fresh },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">PropEstate</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}

          <Link href="/seller/add-property"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">Seller</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm py-1.5 px-2 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0">
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'listings' ? 'My Listings' : 'My Leads'}
          </h1>
          <div className="flex gap-3">
            {activeTab === 'listings' && (
              <Link href="/seller/add-property" className="btn-primary text-sm py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Property
              </Link>
            )}
            <Link href="/" target="_blank" className="btn-outline text-sm py-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> View Site
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Listings', value: stats.total, icon: Building2, color: 'blue' },
              { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
              { label: 'Fresh Leads', value: stats.fresh, icon: Users, color: 'purple' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' :
                  color === 'yellow' ? 'bg-yellow-50' : 'bg-purple-50'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' :
                    color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'
                  }`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-gray-500 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── MY LISTINGS ── */}
          {activeTab === 'listings' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-16 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-500 mb-6">Start by adding your first property</p>
                  <Link href="/seller/add-property" className="btn-primary">Add Property</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {properties.map(p => (
                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {(p.coverImage || p.images?.[0]?.url) ? (
                          <Image src={p.coverImage || p.images[0].url} alt={p.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 truncate">{p.title}</p>
                            <p className="text-sm text-gray-500">{p.city} · {formatPrice(p.price)}</p>
                          </div>
                          <span className={`badge ${getPropertyStatusColor(p.status)} flex-shrink-0`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {p.views} views
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/property/${p.slug}`} target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/seller/edit-property/${p.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProperty(p.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MY LEADS ── */}
          {activeTab === 'leads' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Budget</th>
                      <th>Property</th>
                      <th>Status</th>
                      <th>Follow Up</th>
                      <th>Visit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400">No leads yet</td></tr>
                    ) : (
                      leads.map(lead => (
                        <tr key={lead.id}>
                          <td>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
                          </td>
                          <td>
                            <a href={`tel:${lead.phone}`} className="text-primary-600 font-medium hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </a>
                          </td>
                          <td className="font-medium text-gray-800">{lead.budget || '—'}</td>
                          <td className="max-w-[150px]">
                            {lead.property ? (
                              <span className="text-xs text-gray-600 truncate block">{lead.property.title}</span>
                            ) : '—'}
                          </td>
                          <td>
                            <select
                              value={lead.status}
                              onChange={e => updateLeadStatus(lead.id, e.target.value)}
                              className={`badge ${getLeadStatusColor(lead.status)} text-xs border-0 cursor-pointer`}
                            >
                              {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </td>
                          <td className="text-sm">
                            {lead.followUpDate ? (
                              <span className={new Date(lead.followUpDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                {formatDate(lead.followUpDate)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="text-sm text-gray-600">{lead.visitStatus || '—'}</td>
                          <td className="text-xs text-gray-400">{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
