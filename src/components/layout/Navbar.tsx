'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Home, Search, Building2, Phone, BookOpen, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface NavUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<NavUser | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data.user) })
      .catch(() => {})
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setUserMenuOpen(false)
    toast.success('Logged out successfully')
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/buy', label: 'Buy' },
    { href: '/sell', label: 'Sell', highlight: true },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ]

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    if (user.role === 'SELLER') return '/seller/dashboard'
    return '/profile'
  }

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white shadow-sm' : 'bg-white'
    )}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900">Prop<span className="text-primary-600">Estate</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: CTA + User */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sell" className="btn-outline text-sm py-2 px-4">
              Post Property <span className="ml-1 text-xs text-primary-600 font-semibold">FREE</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="badge bg-primary-100 text-primary-700 mt-1">{user.role}</span>
                    </div>
                    <Link href={getDashboardLink()} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-5">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-slide-down">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="btn-outline text-center">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-red-600 w-full">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="btn-primary text-center">Sign In</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="btn-outline text-center">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  )
}
