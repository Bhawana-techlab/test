import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')
  return <AdminDashboardClient user={user} />
}
