import Header from './Header'
import Footer from './Footer'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2]">
      <Header />
      <main className="flex-1 pt-16" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
