import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@propestate.in'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const adminName = process.env.ADMIN_NAME || 'Admin'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`)
    return
  }

  const hashed = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      phone: '+91 00000 00000',
    },
  })

  console.log(` Admin user created:`)
  console.log(`   Email:    ${admin.email}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   Role:     ${admin.role}`)

  // Create a demo seller
  const sellerExists = await prisma.user.findUnique({ where: { email: 'seller@propestate.in' } })
  if (!sellerExists) {
    await prisma.user.create({
      data: {
        name: 'Demo Seller',
        email: 'seller@propestate.in',
        password: await bcrypt.hash('Seller@123', 12),
        role: 'SELLER',
        phone: '+91 99999 88888',
      },
    })
    console.log(` Demo seller created: seller@propestate.in / Seller@123`)
  }
}

main()
  .catch(e => { console.error('Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
