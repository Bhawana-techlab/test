'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Create a lead from contact form
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, phone: form.phone, email: form.email,
        notes: `Subject: ${form.subject}\n${form.message}`,
        source: 'contact_form',
      }),
    })
    setLoading(false)
    setDone(true)
    toast.success('Message sent! We\'ll get back to you soon.')
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="bg-gray-950 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-gray-400 text-lg">We're here to help with all your property needs</p>
        </div>

        <div className="container-app py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info */}
            <div className="space-y-6">
              {[
                { icon: Phone, label: 'Phone', value: '+91 78375 88185', href: 'tel:+917837588185' },
                { icon: Mail, label: 'Email', value: 'info@propestate.in', href: 'mailto:info@propestate.in' },
                { icon: MapPin, label: 'Office', value: 'Sector 70, Mohali, Punjab 140307', href: '#' },
                { icon: Clock, label: 'Working Hours', value: 'Mon–Sat: 9am – 7pm', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-card flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    {href ? (
                      <a href={href} className="font-semibold text-gray-900 hover:text-primary-600">{value}</a>
                    ) : (
                      <p className="font-semibold text-gray-900">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-card">
              {done ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          required className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          required className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="input-field" placeholder="How can we help?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        rows={5} className="input-field resize-none" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
