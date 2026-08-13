import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Image,
  LogOut,
  ChefHat,
  Menu,
  X,
  FileUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Recipes', href: '/admin/recipes', icon: BookOpen },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Bulk Import', href: '/admin/import', icon: FileUp },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E9E1D8] flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#E4573D] rounded-md flex items-center justify-center flex-shrink-0">
          <ChefHat size={16} className="text-white" />
        </div>
        <div>
          <span className="font-serif text-[1.0625rem] text-[#24211F] block leading-none"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Recipet
          </span>
          <span className="text-[0.6875rem] text-[#6F6862] font-medium uppercase tracking-wider">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href ||
            (href !== '/admin/dashboard' && location.pathname.startsWith(href))
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User & logout */}
      <div className="border-t border-[#E9E1D8] p-4">
        {user?.email && (
          <p className="text-xs text-[#9A9490] truncate mb-3 px-2">{user.email}</p>
        )}
        <button
          onClick={handleSignOut}
          className="admin-nav-item w-full text-left"
          id="admin-signout-btn"
        >
          <LogOut size={18} />
          Sign Out
        </button>
        <div className="mt-2 px-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#6F6862] hover:text-[#E4573D] transition-colors"
          >
            ↗ View website
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F3EF] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 xl:w-60 flex-shrink-0 bg-white border-r border-[#E9E1D8] flex-col fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-[#E9E1D8] flex-col lg:hidden transition-transform duration-200 ${
          sidebarOpen ? 'flex translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile admin navigation"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 text-[#6F6862]"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 xl:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E9E1D8] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-[#6F6862] hover:bg-[#F5EFE8]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-[1.0625rem] text-[#24211F]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Recipet Admin
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-8" id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
