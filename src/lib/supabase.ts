import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Recipet] Supabase environment variables are not set. ' +
    'Please fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Storage helper — returns public URL for a file in the "recipe-images" bucket
export function getStorageUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
  return data.publicUrl
}

// Helper to format storage paths
export function extractStoragePath(url: string): string {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/recipe-images/')
    return parts[1] || url
  } catch {
    return url
  }
}
