import { Link } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'

export default function NotFound() {
  return (
    <PublicLayout>
      <SEOHead title="Page Not Found" noIndex />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center section-container py-20">
          <div className="text-8xl mb-6">🍽</div>
          <h1
            className="font-serif text-[#24211F] mb-3"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}
          >
            Looks like this recipe got lost.
          </h1>
          <p className="text-[1rem] text-[#6F6862] mb-8 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist, was removed, or may have moved. Let's get you back to the kitchen.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/recipes" className="btn-primary" id="not-found-back-btn">
              Back to Recipes
            </Link>
            <Link to="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
