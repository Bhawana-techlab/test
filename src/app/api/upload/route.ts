import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sellers only' }, { status: 403 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files?.length) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ success: false, error: 'Max 10 images allowed' }, { status: 400 })
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        return await uploadToCloudinary(buffer, 'properties')
      })
    )

    return NextResponse.json({ success: true, data: uploaded, message: 'Images uploaded' })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}

export const config = { api: { bodyParser: false } }
