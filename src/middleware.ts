import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_ROUTES = ['/', '/buy', '/sell', '/contact', '/blog', '/login', '/register']
const SELLER_ROUTES = ['/seller']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value
  const payload = token ? await verifyToken(token) : null

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && payload) {
    if (payload.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    if (payload.role === 'SELLER') return NextResponse.redirect(new URL('/seller/dashboard', request.url))
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect seller routes
  if (pathname.startsWith('/seller')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/seller/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
