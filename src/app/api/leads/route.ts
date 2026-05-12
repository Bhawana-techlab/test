import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const agentId = searchParams.get('agentId')
    const propertyId = searchParams.get('propertyId')
    const search = searchParams.get('search')

    const where: any = {}

    // Seller sees only their property leads
    if (user.role === 'SELLER') {
      where.property = { sellerId: user.id }
    }
    // Agent sees only assigned leads
    if (user.role !== 'ADMIN' && user.role !== 'SELLER') {
      where.agentId = user.id
    }

    if (status) where.status = status
    if (agentId && user.role === 'ADMIN') where.agentId = agentId
    if (propertyId) where.propertyId = propertyId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, city: true, price: true, coverImage: true } },
          agent: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST /api/leads - Create lead (auto from inquiry OR manual by admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, phone, email, address, requirement, location, budget,
      propertyType, propertyId, source, notes, agentId,
    } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 })
    }

    // Check if this lead already exists (same phone + property)
    const existing = propertyId
      ? await prisma.lead.findFirst({ where: { phone, propertyId } })
      : null

    if (existing) {
      // Update the existing lead with latest info
      await prisma.lead.update({
        where: { id: existing.id },
        data: { updatedAt: new Date(), notes: notes || existing.notes },
      })
      return NextResponse.json({ success: true, data: existing, message: 'Lead already exists, updated' })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        address,
        requirement,
        location,
        budget,
        propertyType,
        propertyId: propertyId || null,
        source: source || 'website',
        notes,
        agentId: agentId || null,
        status: 'FRESH',
      },
      include: {
        property: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({ success: true, data: lead, message: 'Lead created' }, { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
