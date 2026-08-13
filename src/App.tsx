import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import ScrollToTop from '@/components/layout/ScrollToTop'

// Public pages
import Home from '@/pages/Home'
import Recipes from '@/pages/Recipes'
import Recipe from '@/pages/Recipe'
import Category from '@/pages/Category'
import Search from '@/pages/Search'
import About from '@/pages/About'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import NotFound from '@/pages/NotFound'

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminRecipes from '@/pages/admin/AdminRecipes'
import AdminRecipeForm from '@/pages/admin/AdminRecipeForm'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminMedia from '@/pages/admin/AdminMedia'
import AdminBulkImport from '@/pages/admin/AdminBulkImport'

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:slug" element={<Recipe />} />
      <Route path="/category/:slug" element={<Category />} />
      <Route path="/search" element={<Search />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/404" element={<NotFound />} />

      {/* ── Admin routes ── */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recipes"
        element={
          <ProtectedRoute>
            <AdminRecipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recipes/new"
        element={
          <ProtectedRoute>
            <AdminRecipeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recipes/:id/edit"
        element={
          <ProtectedRoute>
            <AdminRecipeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/import"
        element={
          <ProtectedRoute>
            <AdminBulkImport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/media"
        element={
          <ProtectedRoute>
            <AdminMedia />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}
