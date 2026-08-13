// ============================================
//   Recipet — Analytics Helpers (GA4 + Google Ads)
// ============================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// ── Page view ──
export function trackPageView(path: string, title: string) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  })
}

// ── Recipe events ──
export function trackRecipeView(recipeId: string, recipeTitle: string, category?: string) {
  gtag('event', 'recipe_view', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    recipe_category: category ?? 'uncategorized',
  })
}

export function trackPrintRecipe(recipeId: string, recipeTitle: string) {
  gtag('event', 'print_recipe', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
  })
}

export function trackServingChange(recipeId: string, newServings: number) {
  gtag('event', 'ingredient_serving_change', {
    recipe_id: recipeId,
    servings: newServings,
  })
}

// ── Search ──
export function trackSearch(query: string, resultsCount: number) {
  gtag('event', 'search', {
    search_term: query,
    results_count: resultsCount,
  })
}

// ── Category ──
export function trackCategoryView(categorySlug: string, categoryName: string) {
  gtag('event', 'category_view', {
    category_slug: categorySlug,
    category_name: categoryName,
  })
}

// ── Newsletter ──
export function trackNewsletterSignup() {
  gtag('event', 'newsletter_signup', {
    method: 'email',
  })

  // Google Ads conversion — uncomment when conversion ID is configured
  // const conversionId = import.meta.env.VITE_GADS_CONVERSION_ID
  // const conversionLabel = import.meta.env.VITE_GADS_CONVERSION_LABEL
  // if (conversionId && conversionLabel) {
  //   gtag('event', 'conversion', {
  //     send_to: `${conversionId}/${conversionLabel}`,
  //   })
  // }
}
