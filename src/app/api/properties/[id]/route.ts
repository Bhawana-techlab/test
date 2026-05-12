import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/properties/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: {
        images: { orderBy: { order: 'asc' } },
        seller: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        _count: { select: { leads: true, inquiries: true } },
      },
    })

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    // Increment views
    await prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } })

    return NextResponse.json({ success: true, data: property })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/properties/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const property = await prisma.property.findUnique({ where: { id: params.id } })
    if (!property) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Only owner or admin can update
    if (property.sellerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { images, ...rest } = body

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...rest,
        price: rest.price ? parseFloat(rest.price) : undefined,
        area: rest.area ? parseFloat(rest.area) : undefined,
        bedrooms: rest.bedrooms ? parseInt(rest.bedrooms) : undefined,
        bathrooms: rest.bathrooms ? parseInt(rest.bathrooms) : undefined,
      },
      include: { images: true },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Property updated' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/properties/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const property = await prisma.property.findUnique({ where: { id: params.id } })
    if (!property) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    if (property.sellerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.property.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Property deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
