import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import RecipeGrid from '@/components/recipe/RecipeGrid'
import { useCategory } from '@/hooks/useCategories'
import { useRecipes } from '@/hooks/useRecipes'
import { trackCategoryView } from '@/lib/analytics'
import { CATEGORY_IMAGES } from '@/lib/utils'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { category, loading: catLoading } = useCategory(slug || '')
  const { recipes, count, loading: recipesLoading } = useRecipes({
    category: slug,
    perPage: 24,
  })

  useEffect(() => {
    if (category) {
      trackCategoryView(category.slug, category.name)
    }
  }, [category])

  const imgSrc = category?.image_url ||
    CATEGORY_IMAGES[slug?.toLowerCase() || ''] ||
    CATEGORY_IMAGES['dinner']

  if (catLoading) {
    return (
      <PublicLayout>
        <div className="section-container py-16">
          <div className="skeleton h-8 w-40 rounded mb-3" />
          <div className="skeleton h-12 w-64 rounded mb-6" />
          <div className="skeleton h-5 w-full max-w-lg rounded" />
        </div>
      </PublicLayout>
    )
  }

  if (!category) {
    return (
      <PublicLayout>
        <SEOHead title="Category Not Found" noIndex />
        <div className="section-container py-24 text-center">
          <div className="text-5xl mb-4">🍽</div>
          <h1
            className="font-serif text-[#24211F] mb-3"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            Category not found
          </h1>
          <p className="text-[#6F6862] mb-6">This category doesn't exist or has been removed.</p>
          <Link to="/recipes" className="btn-primary">Browse All Recipes</Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <SEOHead
        title={`${category.name} Recipes`}
        description={
          category.description ||
          `Browse all ${category.name.toLowerCase()} recipes on Recipet. Find delicious ${category.name.toLowerCase()} dishes for every occasion.`
        }
        canonical={`/category/${category.slug}`}
        ogImage={category.image_url || undefined}
      />

      {/* Category hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={imgSrc}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#24211F]/80 via-[#24211F]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 section-container pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/recipes" className="hover:text-white transition-colors">Recipes</Link>
            <span>/</span>
            <span className="text-white">{category.name}</span>
          </nav>
          <h1
            className="text-white font-serif"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              lineHeight: 1.15,
            }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/80 text-[0.9375rem] mt-2 max-w-xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Recipes */}
      <div className="section-container py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-[#6F6862]">
            {count > 0 ? `${count} recipe${count === 1 ? '' : 's'}` : 'No recipes yet'}
          </p>
        </div>

        {!recipesLoading && recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥘</div>
            <h2
              className="font-serif text-[#24211F] mb-3"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.5rem' }}
            >
              No {category.name} recipes yet
            </h2>
            <p className="text-[#6F6862] mb-6">
              Check back soon — we're always adding new recipes!
            </p>
            <Link to="/recipes" className="btn-secondary">Browse All Recipes</Link>
          </div>
        ) : (
          <RecipeGrid recipes={recipes} loading={recipesLoading} columns={3} />
        )}
      </div>
    </PublicLayout>
  )
}
