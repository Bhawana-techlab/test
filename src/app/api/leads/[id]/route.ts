import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/leads/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        property: { select: { id: true, title: true, city: true, price: true, coverImage: true, sellerId: true } },
        agent: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })

    // Access control
    if (user.role === 'SELLER' && lead.property?.sellerId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/leads/[id] - Update lead status, notes, follow-up, assign agent
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { property: { select: { sellerId: true } } },
    })
    if (!lead) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Only admin or seller who owns the property can update
    if (user.role !== 'ADMIN' && lead.property?.sellerId !== user.id && lead.agentId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      status, notes, followUpDate, visitDate, visitStatus, visitDescription,
      projectPitched, agentId, lastContactedAt,
    } = body

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
        ...(visitDate !== undefined && { visitDate: visitDate ? new Date(visitDate) : null }),
        ...(visitStatus !== undefined && { visitStatus }),
        ...(visitDescription !== undefined && { visitDescription }),
        ...(projectPitched !== undefined && { projectPitched }),
        ...(agentId !== undefined && user.role === 'ADMIN' && { agentId }),
        ...(lastContactedAt && { lastContactedAt: new Date(lastContactedAt) }),
      },
      include: {
        property: { select: { id: true, title: true } },
        agent: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated, message: 'Lead updated' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/leads/[id] - Admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
    }

    await prisma.lead.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Lead deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
