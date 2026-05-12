import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'SELLER']).default('USER'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, password, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    })

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const response = NextResponse.json({
      success: true,
      data: { user },
      message: 'Registration successful',
    }, { status: 201 })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
