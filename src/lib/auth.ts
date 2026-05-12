import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

// Sign a JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Get current user from cookies (Server Components)
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    })
    return user
  } catch {
    return null
  }
}

// Get user from request (API Routes)
export async function getUserFromRequest(req: NextRequest) {
  try {
    const token =
      req.cookies.get('auth-token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) return null
    const payload = await verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
    return user
  } catch {
    return null
  }
}

// Set auth cookie
export function setAuthCookie(token: string) {
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Clear auth cookie
export function clearAuthCookie() {
  cookies().delete('auth-token')
}
