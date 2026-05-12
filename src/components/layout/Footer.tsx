import Link from 'next/link'
import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Prop<span className="text-primary-500">Estate</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Your trusted real estate partner in Tricity. Buy, sell, and rent properties with confidence and expert guidance.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/buy', label: 'Buy Property' },
                { href: '/sell', label: 'Post Property Free' },
                { href: '/buy?listingType=RENT', label: 'Rent Property' },
                { href: '/blog', label: 'Real Estate Blog' },
                { href: '/contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white hover:translate-x-1 inline-block transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Property Types</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Flats / Apartments', 'FLAT'],
                ['Independent Houses', 'INDEPENDENT_HOUSE'],
                ['Villas', 'VILLA'],
                ['Plots / Land', 'PLOT'],
                ['Commercial', 'COMMERCIAL'],
                ['Shops / Showrooms', 'SHOP'],
              ].map(([label, type]) => (
                <li key={type}>
                  <Link href={`/buy?propertyType=${type}`} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Sector 70, Mohali,<br />Punjab, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="tel:+917837588185" className="hover:text-white transition-colors">+91 78375 88185</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@propestate.in" className="hover:text-white transition-colors">info@propestate.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} PropEstate. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
