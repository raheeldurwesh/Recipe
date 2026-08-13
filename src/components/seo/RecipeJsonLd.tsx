import { Helmet } from 'react-helmet-async'
import type { RecipeWithCategory } from '@/types'
import { toDuration } from '@/lib/utils'

interface RecipeJsonLdProps {
  recipe: RecipeWithCategory
  url: string
}

export default function RecipeJsonLd({ recipe, url }: RecipeJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description ?? undefined,
    image: recipe.main_image ? [recipe.main_image] : undefined,
    author: {
      '@type': 'Person',
      name: recipe.author,
    },
    datePublished: recipe.created_at,
    dateModified: recipe.updated_at,
    prepTime: recipe.prep_time ? toDuration(recipe.prep_time) : undefined,
    cookTime: recipe.cook_time ? toDuration(recipe.cook_time) : undefined,
    totalTime: recipe.total_time ? toDuration(recipe.total_time) : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeCategory: recipe.category?.name ?? undefined,
    keywords: recipe.tags?.join(', ') ?? undefined,
    recipeIngredient: recipe.ingredients?.map(
      (ing) => `${ing.quantity} ${ing.unit} ${ing.name}`.trim()
    ),
    recipeInstructions: recipe.instructions?.map((inst) => ({
      '@type': 'HowToStep',
      name: inst.title,
      text: inst.content,
      position: inst.step,
    })),
    url,
  }

  // Remove undefined keys
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd))

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanJsonLd, null, 2)}
      </script>
    </Helmet>
  )
}
