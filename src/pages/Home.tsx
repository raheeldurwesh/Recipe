import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import RecipeCard, { RecipeCardSkeleton } from '@/components/recipe/RecipeCard'
import CategoryCard, { CategoryCardSkeleton } from '@/components/category/CategoryCard'
import { useRecipes } from '@/hooks/useRecipes'
import { useCategories } from '@/hooks/useCategories'
import { trackNewsletterSignup } from '@/lib/analytics'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&auto=format&fit=crop&q=80'


function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // Simulate async submission (connect to email service in production)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
    trackNewsletterSignup()
  }

  return (
    <section className="py-20 bg-[#24211F]" aria-labelledby="newsletter-heading">
      <div className="section-container max-w-2xl text-center">
        <p className="text-[#E4573D] text-sm font-semibold uppercase tracking-widest mb-3">
          Stay inspired
        </p>
        <h2
          id="newsletter-heading"
          className="text-white font-serif mb-4"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          }}
        >
          Fresh recipes, straight to your inbox.
        </h2>
        <p className="text-[#9A9490] text-[0.9375rem] mb-8 leading-relaxed">
          Subscribe to get new recipes delivered weekly. No spam, just delicious food ideas.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full bg-[#E4573D] flex items-center justify-center flex-shrink-0">
              <Check size={16} />
            </div>
            <span className="text-[1rem] font-medium">You're subscribed! Check your inbox soon.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-4 py-3 rounded-md bg-[#3A3530] border border-[#4A4540] text-white placeholder:text-[#6F6862] text-[0.9375rem] outline-none focus:border-[#E4573D] transition-colors"
              aria-required="true"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary whitespace-nowrap disabled:opacity-70"
              id="newsletter-submit-btn"
            >
              {loading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const { recipes: featuredRecipes, loading: featuredLoading } = useRecipes({ perPage: 5 })
  const { recipes: latestRecipes, loading: latestLoading } = useRecipes({ perPage: 8 })
  const { categories, loading: catLoading } = useCategories()

  // Use the first recipe as hero feature, rest as secondary cards
  const [heroRecipe, ...sideRecipes] = featuredRecipes

  return (
    <PublicLayout>
      <SEOHead
        title="Recipes Worth Making"
        description="Discover delicious recipes, simple cooking ideas, and dishes made for every occasion. Recipet is your premium recipe discovery platform."
        canonical="/"
      />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Beautifully presented food"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1714]/80 via-[#1A1714]/50 to-transparent" />
        </div>

        <div className="relative section-container py-20">
          <div className="max-w-xl">
            <p className="text-[#E4573D] text-sm font-semibold uppercase tracking-widest mb-5 animate-fade-in">
              Welcome to Recipet
            </p>
            <h1
              className="text-white mb-5 animate-fade-in"
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                animationDelay: '0.05s',
              }}
            >
              Recipes worth making.
            </h1>
            <p
              className="text-white/80 text-[1.0625rem] leading-relaxed mb-8 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              Discover delicious recipes, simple cooking ideas, and dishes made for every occasion.
            </p>
            <div
              className="flex flex-wrap gap-3 animate-fade-in"
              style={{ animationDelay: '0.15s' }}
            >
              <Link to="/recipes" className="btn-primary" id="hero-explore-cta">
                Explore Recipes
                <ArrowRight size={16} />
              </Link>
              <Link to="/recipes#categories" className="btn-secondary border-white/30 text-white hover:bg-white/10 hover:border-white/50" id="hero-browse-cta">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Recipes ── */}
      <section className="py-20" aria-labelledby="featured-heading">
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-2">
                Hand-picked
              </p>
              <h2
                id="featured-heading"
                className="font-serif"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                Featured Recipes
              </h2>
            </div>
            <Link
              to="/recipes"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#E4573D] hover:text-[#C9442A] transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <RecipeCardSkeleton variant="large" />
              </div>
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => <RecipeCardSkeleton key={i} variant="horizontal" />)}
              </div>
            </div>
          ) : featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Large feature card */}
              {heroRecipe && (
                <div className="lg:col-span-2">
                  <RecipeCard recipe={heroRecipe} variant="large" loading="eager" />
                </div>
              )}
              {/* Side stack */}
              <div className="flex flex-col gap-4">
                {sideRecipes.slice(0, 3).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} variant="horizontal" />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#6F6862]">
              <p>No recipes published yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <div className="section-divider section-container" />

      {/* ── Categories ── */}
      <section id="categories" className="py-20" aria-labelledby="categories-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-3">
              Browse by type
            </p>
            <h2
              id="categories-heading"
              className="font-serif"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              What are you craving?
            </h2>
          </div>

          {catLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          ) : (
            <p className="text-center text-[#6F6862]">Categories coming soon.</p>
          )}
        </div>
      </section>

      <div className="section-divider section-container" />

      {/* ── Latest Recipes ── */}
      <section className="py-20" aria-labelledby="latest-heading">
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-2">
                New arrivals
              </p>
              <h2
                id="latest-heading"
                className="font-serif"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                Latest Recipes
              </h2>
            </div>
            <Link
              to="/recipes"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#E4573D] hover:text-[#C9442A] transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
            </div>
          ) : latestRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#6F6862] mb-4">No recipes published yet.</p>
              <p className="text-sm text-[#9A9490]">Check back soon — new recipes are on the way!</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/recipes" className="btn-secondary" id="home-view-all-btn">
              View All Recipes <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Most Loved ── */}
      <section className="py-16 bg-white" aria-labelledby="popular-heading">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-3">
              Community favourites
            </p>
            <h2
              id="popular-heading"
              className="font-serif"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Most Loved Recipes
            </h2>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => <RecipeCardSkeleton key={i} variant="large" />)}
            </div>
          ) : latestRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {latestRecipes.slice(0, 3).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} variant="large" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <NewsletterSection />
    </PublicLayout>
  )
}
