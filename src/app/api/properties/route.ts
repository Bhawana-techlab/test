import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

// GET /api/properties - Public: list properties with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const city = searchParams.get('city')
    const propertyType = searchParams.get('propertyType')
    const listingType = searchParams.get('listingType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const keyword = searchParams.get('keyword')
    const featured = searchParams.get('featured')
    const sellerId = searchParams.get('sellerId')
    const status = searchParams.get('status')

    const where: any = {}

    // Default: only show ACTIVE for public
    if (status) where.status = status
    else where.status = 'ACTIVE'

    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (propertyType) where.propertyType = propertyType
    if (listingType) where.listingType = listingType
    if (sellerId) where.sellerId = sellerId
    if (featured === 'true') where.featured = true
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) }
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { address: { contains: keyword, mode: 'insensitive' } },
        { locality: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          seller: { select: { id: true, name: true, phone: true } },
          _count: { select: { leads: true, inquiries: true } },
        },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST /api/properties - Create new property (Seller/Admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Only sellers can create properties' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title, description, price, priceNegotiable, propertyType, listingType,
      furnishing, address, city, sector, locality, pincode, latitude, longitude,
      area, areaUnit, bedrooms, bathrooms, balconies, floors, totalFloors, parking,
      amenities, facing, images, coverImage,
    } = body

    if (!title || !description || !price || !propertyType || !address || !city || !area) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 })
    }

    const slug = generateSlug(title)

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        priceNegotiable: priceNegotiable || false,
        propertyType,
        listingType: listingType || 'SELL',
        furnishing: furnishing || 'UNFURNISHED',
        status: user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
        address,
        city,
        sector,
        locality,
        pincode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        area: parseFloat(area),
        areaUnit: areaUnit || 'sqft',
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        balconies: balconies ? parseInt(balconies) : null,
        floors: floors ? parseInt(floors) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        parking: parking ? parseInt(parking) : null,
        amenities: amenities || [],
        facing,
        coverImage,
        slug,
        sellerId: user.id,
        images: images?.length
          ? {
              create: images.map((img: any, i: number) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || title,
                order: i,
              })),
            }
          : undefined,
      },
      include: { images: true },
    })

    return NextResponse.json({ success: true, data: property, message: 'Property submitted for review' }, { status: 201 })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
