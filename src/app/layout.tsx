import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = { variable: '--font-geist-mono' }

export const metadata: Metadata = {
  title: { default: 'PropEstate — Buy, Sell & Rent Properties', template: '%s | PropEstate' },
  description: 'Find the perfect property in Chandigarh, Mohali, Panchkula and Tricity.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-white text-gray-900`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#111', color: '#fff', borderRadius: '10px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  )
}