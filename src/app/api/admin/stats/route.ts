import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
    }

    const [
      totalProperties, activeProperties, pendingProperties,
      totalLeads, freshLeads, dealDoneLeads,
      totalUsers, totalSellers,
      recentLeads, recentProperties,
      leadsByStatus,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'FRESH' } }),
      prisma.lead.count({ where: { status: 'DEAL_DONE' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { title: true, city: true } },
          agent: { select: { name: true } },
        },
      }),
      prisma.property.findMany({
        take: 5,
        where: { status: 'PENDING' },
        include: { seller: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProperties, activeProperties, pendingProperties,
          totalLeads, freshLeads, dealDoneLeads,
          totalUsers, totalSellers,
        },
        recentLeads,
        recentProperties,
        leadsByStatus: leadsByStatus.map(l => ({ status: l.status, count: l._count.status })),
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
