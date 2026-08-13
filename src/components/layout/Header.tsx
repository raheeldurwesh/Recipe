import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, ChefHat } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Recipes', href: '/recipes' },
  { label: 'Categories', href: '/recipes#categories' },
  { label: 'Popular', href: '/recipes?sort=popular' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-[#E9E1D8] shadow-sm'
            : 'bg-[#FFF9F2]/95 backdrop-blur-sm border-b border-[#E9E1D8]'
        }`}
        role="banner"
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0"
              aria-label="Recipet — Home"
            >
              <div className="w-8 h-8 bg-[#E4573D] rounded-md flex items-center justify-center flex-shrink-0">
                <ChefHat size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span
                className="font-serif text-[1.375rem] text-[#24211F] leading-none tracking-[-0.01em]"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                Recipet
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-[0.9375rem] font-medium text-[#6F6862] hover:text-[#24211F] transition-colors duration-150 rounded-md hover:bg-[#F5EFE8]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-md text-[#6F6862] hover:text-[#24211F] hover:bg-[#F5EFE8] transition-colors"
                aria-label="Open search"
                id="header-search-btn"
              >
                <Search size={18} />
              </button>
              <Link
                to="/recipes"
                className="btn-primary text-sm px-5 py-2.5"
                id="header-explore-cta"
              >
                Explore Recipes
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-md text-[#6F6862] hover:text-[#24211F]"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-md text-[#6F6862] hover:text-[#24211F]"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#E9E1D8] py-3 animate-fade-in">
            <nav className="section-container flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 text-[1rem] font-medium text-[#24211F] hover:text-[#E4573D] border-b border-[#F5EFE8] last:border-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3">
                <Link
                  to="/recipes"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Explore Recipes
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
          role="dialog"
          aria-label="Search"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3">
              <Search size={20} className="text-[#6F6862] flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes, ingredients, or dishes..."
                className="flex-1 text-[1rem] text-[#24211F] bg-transparent border-none outline-none placeholder:text-[#6F6862]"
                aria-label="Search recipes"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-[#6F6862] hover:text-[#24211F]"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>
            <div className="border-t border-[#E9E1D8] px-4 py-3">
              <p className="text-sm text-[#6F6862]">
                Press <kbd className="px-1.5 py-0.5 bg-[#F5EFE8] rounded text-xs font-mono">Enter</kbd> to search
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
