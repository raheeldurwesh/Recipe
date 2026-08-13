import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'

const FOOTER_LINKS = {
  Explore: [
    { label: 'Recipes', href: '/recipes' },
    { label: 'Categories', href: '/recipes#categories' },
    { label: 'Popular Recipes', href: '/recipes?sort=popular' },
  ],
  About: [
    { label: 'About Recipet', href: '/about' },
    { label: 'Contact', href: '/about#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#24211F] text-white mt-auto" role="contentinfo">
      <div className="section-container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Recipet home">
              <div className="w-8 h-8 bg-[#E4573D] rounded-md flex items-center justify-center">
                <ChefHat size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-xl font-serif text-white"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                Recipet
              </span>
            </Link>
            <p className="text-sm text-[#9A9490] leading-relaxed max-w-xs">
              A premium recipe discovery platform for home cooks and food lovers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3
                className="text-xs font-semibold uppercase tracking-widest text-[#9A9490] mb-4"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#C5BFB9] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#6F6862]">
            © {new Date().getFullYear()} Recipet. All rights reserved.
          </p>
          <p className="text-sm text-[#6F6862]">
            Made with care for home cooks everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
