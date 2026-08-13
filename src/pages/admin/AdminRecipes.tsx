import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Eye, Search } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { useAdminRecipes } from '@/hooks/useRecipes'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { RecipeWithCategory } from '@/types'

export default function AdminRecipes() {
  const { recipes, loading, refetch } = useAdminRecipes()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    setDeleting(id)
    await supabase.from('recipes').delete().eq('id', id)
    setDeleting(null)
    setDeleteConfirm(null)
    refetch()
  }

  const handleToggleStatus = async (recipe: RecipeWithCategory) => {
    const newStatus = recipe.status === 'published' ? 'draft' : 'published'
    await supabase.from('recipes').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', recipe.id)
    refetch()
  }

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1
            className="font-serif text-[#24211F] mb-1"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            Recipes
          </h1>
          <p className="text-sm text-[#6F6862]">{recipes.length} total recipe{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/recipes/new" className="btn-primary text-sm" id="admin-new-recipe-btn">
          <PlusCircle size={15} />
          New Recipe
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-[#E9E1D8] rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="text-[#6F6862]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="flex-1 text-sm bg-transparent outline-none text-[#24211F] placeholder:text-[#9A9490]"
            id="admin-recipes-search"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 text-sm font-medium rounded-md border transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-[#E4573D] text-white border-[#E4573D]'
                  : 'bg-white text-[#6F6862] border-[#E9E1D8] hover:border-[#24211F]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E9E1D8] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#F0EAE4]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-56 rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-7 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6F6862] text-sm mb-3">
              {search ? `No recipes matching "${search}"` : 'No recipes yet.'}
            </p>
            {!search && (
              <Link to="/admin/recipes/new" className="btn-primary text-sm">
                Create your first recipe
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="px-5 py-3 border-b border-[#E9E1D8] grid grid-cols-[auto_1fr_120px_100px_120px] gap-4 items-center text-xs font-semibold text-[#6F6862] uppercase tracking-wider">
              <span className="w-12">Image</span>
              <span>Recipe</span>
              <span className="text-right hidden sm:block">Updated</span>
              <span className="text-center">Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-[#F0EAE4]">
              {filtered.map((recipe) => (
                <div
                  key={recipe.id}
                  className="px-5 py-3.5 grid grid-cols-[auto_1fr_120px_100px_120px] gap-4 items-center hover:bg-[#FDFAF7] transition-colors"
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-[#F5EFE8] flex-shrink-0">
                    {recipe.main_image && (
                      <img src={recipe.main_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#24211F] truncate">{recipe.title}</p>
                    <p className="text-xs text-[#9A9490] truncate">
                      {recipe.category?.name ?? 'Uncategorized'} · {recipe.slug}
                    </p>
                  </div>

                  {/* Updated date */}
                  <p className="text-xs text-[#9A9490] text-right hidden sm:block">
                    {formatDate(recipe.updated_at)}
                  </p>

                  {/* Status toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleStatus(recipe)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                        recipe.status === 'published'
                          ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                      }`}
                      title={`Click to ${recipe.status === 'published' ? 'unpublish' : 'publish'}`}
                    >
                      {recipe.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/recipes/${recipe.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#6F6862] hover:text-[#24211F] rounded"
                      title="View on site"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      to={`/admin/recipes/${recipe.id}/edit`}
                      className="p-1.5 text-[#6F6862] hover:text-[#24211F] rounded"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      disabled={deleting === recipe.id}
                      className={`p-1.5 rounded transition-colors ${
                        deleteConfirm === recipe.id
                          ? 'text-red-600 bg-red-50'
                          : 'text-[#6F6862] hover:text-red-500'
                      }`}
                      title={deleteConfirm === recipe.id ? 'Click again to confirm delete' : 'Delete'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation hint */}
      {deleteConfirm && (
        <p className="text-xs text-red-500 mt-2 text-right">
          Click the trash icon again to confirm deletion.
        </p>
      )}
    </AdminLayout>
  )
}
