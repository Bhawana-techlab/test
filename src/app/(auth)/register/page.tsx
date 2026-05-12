'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'USER' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      toast.success('Account created successfully!')
      if (form.role === 'SELLER') router.push('/seller/dashboard')
      else router.push('/')
      router.refresh()
    } else {
      toast.error(data.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">Prop<span className="text-primary-600">Estate</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2">Join PropEstate today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            {[['USER', 'I want to Buy'], ['SELLER', 'I want to Sell']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setForm(p => ({ ...p, role: v }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.role === v ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                }`}>{l}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required placeholder="Your name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required minLength={6} placeholder="Min 6 characters" className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
