import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, FileText, Tag, PlusCircle, Eye } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { supabase } from '@/lib/supabase'
import { useAdminRecipes } from '@/hooks/useRecipes'
import { formatDate } from '@/lib/utils'
import type { RecipeWithCategory } from '@/types'

interface Stats {
  total: number
  published: number
  drafts: number
  categories: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E9E1D8] p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#24211F] leading-none mb-0.5">{value}</p>
        <p className="text-sm text-[#6F6862]">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { recipes, loading } = useAdminRecipes()
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, drafts: 0, categories: 0 })

  useEffect(() => {
    if (!loading) {
      const published = recipes.filter((r) => r.status === 'published').length
      setStats((s) => ({
        ...s,
        total: recipes.length,
        published,
        drafts: recipes.length - published,
      }))
    }
  }, [recipes, loading])

  useEffect(() => {
    const fetchCatCount = async () => {
      const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
      setStats((s) => ({ ...s, categories: count ?? 0 }))
    }
    fetchCatCount()
  }, [])

  const recentRecipes = recipes.slice(0, 8)

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1
          className="font-serif text-[#24211F] mb-1"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[#6F6862]">Overview of your Recipet content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Recipes"
          value={loading ? '–' : stats.total}
          icon={BookOpen}
          color="bg-[#FEF0EC] text-[#E4573D]"
        />
        <StatCard
          label="Published"
          value={loading ? '–' : stats.published}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Drafts"
          value={loading ? '–' : stats.drafts}
          icon={FileText}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Categories"
          value={loading ? '–' : stats.categories}
          icon={Tag}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/admin/recipes/new" className="btn-primary text-sm" id="dashboard-new-recipe-btn">
          <PlusCircle size={15} />
          New Recipe
        </Link>
        <Link to="/admin/categories" className="btn-secondary text-sm" id="dashboard-categories-btn">
          <Tag size={15} />
          Manage Categories
        </Link>
        <Link to="/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          <Eye size={15} />
          View Site
        </Link>
      </div>

      {/* Recent recipes table */}
      <div className="bg-white rounded-xl border border-[#E9E1D8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E9E1D8] flex items-center justify-between">
          <h2
            className="font-serif text-[#24211F]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.0625rem' }}
          >
            Recent Recipes
          </h2>
          <Link to="/admin/recipes" className="text-sm text-[#E4573D] font-medium hover:text-[#C9442A]">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-[#F0EAE4]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentRecipes.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[#6F6862] text-sm mb-3">No recipes yet.</p>
            <Link to="/admin/recipes/new" className="btn-primary text-sm">
              Create your first recipe
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EAE4]">
            {recentRecipes.map((recipe: RecipeWithCategory) => (
              <div key={recipe.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#FDFAF7] transition-colors">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-[#F5EFE8]">
                  {recipe.main_image && (
                    <img src={recipe.main_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#24211F] truncate">{recipe.title}</p>
                  <p className="text-xs text-[#9A9490]">
                    {recipe.category?.name ?? 'Uncategorized'} · Updated {formatDate(recipe.updated_at)}
                  </p>
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  recipe.status === 'published'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {recipe.status === 'published' ? 'Published' : 'Draft'}
                </span>

                {/* Edit link */}
                <Link
                  to={`/admin/recipes/${recipe.id}/edit`}
                  className="text-xs text-[#6F6862] hover:text-[#E4573D] transition-colors ml-2 flex-shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
