'use client'
import { useState } from 'react'
import { Phone, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { propertyId: string; propertyTitle: string }

export default function InquiryForm({ propertyId, propertyTitle }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', budget: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')

    setLoading(true)
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, propertyId }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setSubmitted(true)
      toast.success('Inquiry sent! Team will contact you soon.')
    } else {
      toast.error(data.error || 'Failed to send inquiry')
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-card text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-2">Inquiry Sent!</h3>
        <p className="text-gray-500 text-sm">Our team will contact you within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="font-bold text-gray-900 mb-1">Interested in this property?</h3>
      <p className="text-gray-500 text-sm mb-4">Fill in your details and we'll get back to you.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          required placeholder="Your Name *" className="input-field py-2.5 text-sm"
        />
        <input
          type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          required placeholder="Phone Number *" className="input-field py-2.5 text-sm"
        />
        <input
          type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="Email (optional)" className="input-field py-2.5 text-sm"
        />
        <input
          value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
          placeholder="Your Budget (optional)" className="input-field py-2.5 text-sm"
        />
        <textarea
          value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          rows={3} placeholder="Message (optional)"
          className="input-field py-2.5 text-sm resize-none"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><MessageSquare className="w-4 h-4" /> Send Inquiry</>}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-3">
        By submitting, you agree to be contacted by our team.
      </p>
    </div>
  )
}
