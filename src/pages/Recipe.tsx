import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Users, ChefHat, Calendar, Printer, ArrowDown } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import RecipeJsonLd from '@/components/seo/RecipeJsonLd'
import RecipeGallery from '@/components/recipe/RecipeGallery'
import IngredientList from '@/components/recipe/IngredientList'
import RecipeMethod from '@/components/recipe/RecipeMethod'
import RecipeCard, { RecipeCardSkeleton } from '@/components/recipe/RecipeCard'
import { useRecipe, useRelatedRecipes } from '@/hooks/useRecipes'
import { formatTime, formatDate } from '@/lib/utils'
import { trackRecipeView, trackPrintRecipe } from '@/lib/analytics'

function RecipeSkeleton() {
  return (
    <div className="section-container py-10 max-w-5xl">
      <div className="skeleton h-5 w-28 rounded mb-4" />
      <div className="skeleton h-10 w-3/4 rounded mb-3" />
      <div className="skeleton h-5 w-full rounded mb-2" />
      <div className="skeleton h-5 w-2/3 rounded mb-8" />
      <div className="skeleton rounded-lg mb-8" style={{ aspectRatio: '16 / 9' }} />
    </div>
  )
}

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { recipe, loading, error } = useRecipe(slug || '')
  const { recipes: related, loading: relatedLoading } = useRelatedRecipes(
    recipe?.category_id || null,
    recipe?.id || '',
    4
  )

  useEffect(() => {
    if (recipe) {
      trackRecipeView(recipe.id, recipe.title, recipe.category?.name)
    }
  }, [recipe])

  useEffect(() => {
    if (error) navigate('/404', { replace: true })
  }, [error, navigate])

  const handlePrint = () => {
    if (recipe) trackPrintRecipe(recipe.id, recipe.title)
    window.print()
  }

  const scrollToRecipe = () => {
    document.getElementById('recipe-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <PublicLayout>
        <RecipeSkeleton />
      </PublicLayout>
    )
  }

  if (!recipe) return null

  const pageUrl = `https://recipet.com/recipes/${recipe.slug}`

  return (
    <PublicLayout>
      <SEOHead
        title={recipe.seo_title || recipe.title}
        description={recipe.meta_description || recipe.description || undefined}
        canonical={`/recipes/${recipe.slug}`}
        ogImage={recipe.main_image || undefined}
        ogType="article"
      />
      <RecipeJsonLd recipe={recipe} url={pageUrl} />

      {/* Article wrapper for print */}
      <article className="bg-[#FFF9F2]">
        {/* Breadcrumb */}
        <div className="section-container py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#6F6862]">
            <Link to="/" className="hover:text-[#E4573D] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/recipes" className="hover:text-[#E4573D] transition-colors">Recipes</Link>
            {recipe.category && (
              <>
                <span>/</span>
                <Link to={`/category/${recipe.category.slug}`} className="hover:text-[#E4573D] transition-colors">
                  {recipe.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[#24211F] line-clamp-1">{recipe.title}</span>
          </nav>
        </div>

        {/* Hero content */}
        <div className="section-container pb-8 max-w-5xl">
          {recipe.category && (
            <Link
              to={`/category/${recipe.category.slug}`}
              className="category-badge mb-3 inline-block hover:text-[#C9442A]"
            >
              {recipe.category.name}
            </Link>
          )}

          <h1
            className="font-serif text-[#24211F] mb-4"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-[1.0625rem] text-[#6F6862] leading-relaxed mb-5 max-w-2xl">
              {recipe.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6F6862] mb-6">
            {recipe.author && (
              <span className="flex items-center gap-1.5">
                <ChefHat size={14} className="text-[#E4573D]" />
                By <strong className="text-[#24211F] font-medium">{recipe.author}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#E4573D]" />
              {formatDate(recipe.updated_at)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8 print:hidden">
            <button
              onClick={scrollToRecipe}
              className="btn-primary text-sm px-4 py-2.5"
              id="jump-to-recipe-btn"
            >
              <ArrowDown size={15} />
              Jump to Recipe
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary text-sm px-4 py-2.5"
              id="print-recipe-btn"
            >
              <Printer size={15} />
              Print Recipe
            </button>
          </div>

          {/* Recipe image gallery */}
          <RecipeGallery
            mainImage={recipe.main_image}
            gallery={recipe.gallery}
            title={recipe.title}
          />
        </div>

        {/* Recipe body */}
        <div id="recipe-content" className="section-container pb-16 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-16">
            {/* Left: Ingredients + Method */}
            <div className="space-y-12 min-w-0">
              <IngredientList
                ingredients={recipe.ingredients || []}
                defaultServings={recipe.servings}
                recipeId={recipe.id}
              />
              <RecipeMethod instructions={recipe.instructions || []} />
            </div>

            {/* Right: Recipe info panel */}
            <aside aria-label="Recipe information" className="lg:sticky lg:top-24 h-fit">
              <div className="recipe-info-box">
                <h2
                  className="font-serif text-[#24211F] mb-5 pb-4 border-b border-[#E9E1D8]"
                  style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.125rem' }}
                >
                  Recipe Details
                </h2>
                <dl className="space-y-4">
                  {recipe.prep_time > 0 && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-[#6F6862] font-medium">Prep Time</dt>
                      <dd className="flex items-center gap-1.5 text-sm font-semibold text-[#24211F]">
                        <Clock size={13} className="text-[#E4573D]" />
                        {formatTime(recipe.prep_time)}
                      </dd>
                    </div>
                  )}
                  {recipe.cook_time > 0 && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-[#6F6862] font-medium">Cook Time</dt>
                      <dd className="flex items-center gap-1.5 text-sm font-semibold text-[#24211F]">
                        <Clock size={13} className="text-[#E4573D]" />
                        {formatTime(recipe.cook_time)}
                      </dd>
                    </div>
                  )}
                  {recipe.total_time > 0 && (
                    <div className="flex justify-between items-center border-t border-[#F0EAE4] pt-4">
                      <dt className="text-sm text-[#6F6862] font-medium">Total Time</dt>
                      <dd className="flex items-center gap-1.5 text-sm font-bold text-[#E4573D]">
                        <Clock size={13} />
                        {formatTime(recipe.total_time)}
                      </dd>
                    </div>
                  )}
                  {recipe.servings > 0 && (
                    <div className="flex justify-between items-center border-t border-[#F0EAE4] pt-4">
                      <dt className="text-sm text-[#6F6862] font-medium">Servings</dt>
                      <dd className="flex items-center gap-1.5 text-sm font-semibold text-[#24211F]">
                        <Users size={13} className="text-[#E4573D]" />
                        {recipe.servings}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#E9E1D8]">
                    <p className="text-xs font-semibold text-[#6F6862] uppercase tracking-wider mb-3">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.tags.map((tag) => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Related recipes */}
        {(related.length > 0 || relatedLoading) && (
          <div className="bg-white border-t border-[#E9E1D8] py-16 print:hidden">
            <div className="section-container">
              <h2
                className="font-serif text-[#24211F] mb-8"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
              >
                You might also like
              </h2>
              {relatedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[0,1,2,3].map((i) => <RecipeCardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {related.map((r) => (
                    <RecipeCard key={r.id} recipe={r as import('@/types').RecipeWithCategory} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </PublicLayout>
  )
}
