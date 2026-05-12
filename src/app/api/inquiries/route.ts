import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/inquiries - Submit inquiry (auto creates lead)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, message, budget, propertyId } = body

    if (!name || !phone || !propertyId) {
      return NextResponse.json({ success: false, error: 'Name, phone, and property are required' }, { status: 400 })
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, city: true, propertyType: true, price: true, sellerId: true },
    })
    if (!property) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })

    const user = await getUserFromRequest(req)

    // Create inquiry record
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        phone,
        email,
        message,
        budget,
        propertyId,
        userId: user?.id || null,
      },
    })

    // 🔥 AUTO CREATE LEAD - This is the key feature!
    // Check if lead already exists for this phone + property
    const existingLead = await prisma.lead.findFirst({
      where: { phone, propertyId },
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          name,
          phone,
          email,
          requirement: `Interested in ${property.title}`,
          location: property.city,
          budget: budget || `Around ₹${(property.price / 100000).toFixed(0)} Lac`,
          propertyType: property.propertyType,
          propertyId,
          source: 'website',
          notes: message || null,
          status: 'FRESH',
        },
      })
    } else {
      // Update existing lead status back to active
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          status: existingLead.status === 'NOT_INTERESTED' || existingLead.status === 'LOST'
            ? 'FRESH'
            : existingLead.status,
          notes: message ? `${existingLead.notes || ''}\n\nNew inquiry: ${message}` : existingLead.notes,
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: 'Inquiry submitted! Our team will contact you soon.',
    }, { status: 201 })
  } catch (error) {
    console.error('Inquiry error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// GET /api/inquiries - Admin only
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
    }

    const inquiries = await prisma.inquiry.findMany({
      include: {
        property: { select: { id: true, title: true, city: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: inquiries })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
