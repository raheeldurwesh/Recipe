import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format minutes into human-readable duration
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Generate a URL-safe slug from a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Scale ingredient quantity by a multiplier
export function scaleQuantity(quantity: string, multiplier: number): string {
  const numMatch = quantity.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)(.*)$/)
  if (!numMatch) return quantity

  let num: number
  const fracMatch = numMatch[1].match(/^(\d+)\/(\d+)$/)
  if (fracMatch) {
    num = parseInt(fracMatch[1]) / parseInt(fracMatch[2])
  } else {
    num = parseFloat(numMatch[1])
  }

  const scaled = num * multiplier
  const suffix = numMatch[2]

  // Format nicely
  if (Number.isInteger(scaled)) return `${scaled}${suffix}`
  // Round to 2 decimal places and trim trailing zeros
  const rounded = Math.round(scaled * 4) / 4 // round to nearest 1/4
  if (Number.isInteger(rounded)) return `${rounded}${suffix}`
  return `${parseFloat(rounded.toFixed(2))}${suffix}`
}

// Truncate text to n characters
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ISO 8601 duration from minutes (for JSON-LD)
export function toDuration(minutes: number): string {
  if (minutes < 60) return `PT${minutes}M`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `PT${h}H`
  return `PT${h}H${m}M`
}

// Placeholder image for missing recipe images
export function getPlaceholderImage(seed?: string): string {
  const seeds = ['food1', 'food2', 'food3', 'food4', 'food5']
  const s = seed || seeds[Math.floor(Math.random() * seeds.length)]
  return `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&seed=${s}`
}

// Sample Unsplash images by category for fallback display
export const CATEGORY_IMAGES: Record<string, string> = {
  breakfast: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&auto=format&fit=crop&q=60',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
  dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60',
  desserts: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=60',
  vegetarian: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=60',
  baking: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&auto=format&fit=crop&q=60',
}

export const HERO_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80',
]
