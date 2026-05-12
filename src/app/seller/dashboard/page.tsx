import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SellerDashboardClient from './SellerDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seller Dashboard' }

export default async function SellerDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'SELLER' && user.role !== 'ADMIN') redirect('/')
  return <SellerDashboardClient user={user} />
}
