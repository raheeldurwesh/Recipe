import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLogin() {
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E4573D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/admin/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: err } = await signIn(email, password)
    if (err) {
      setError(err === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : err)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#E4573D] rounded-xl flex items-center justify-center mx-auto mb-4">
            <ChefHat size={24} className="text-white" />
          </div>
          <h1
            className="font-serif text-[#24211F]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            Recipet Admin
          </h1>
          <p className="text-sm text-[#6F6862] mt-1">Sign in to manage your recipes</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-[#E9E1D8] shadow-sm p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-[#24211F] mb-1.5">
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 rounded-md border border-[#E9E1D8] text-[0.9375rem] text-[#24211F] placeholder:text-[#9A9490] outline-none focus:border-[#E4573D] focus:ring-2 focus:ring-[#E4573D]/10 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-[#24211F] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full px-4 py-2.5 pr-10 rounded-md border border-[#E9E1D8] text-[0.9375rem] text-[#24211F] placeholder:text-[#9A9490] outline-none focus:border-[#E4573D] focus:ring-2 focus:ring-[#E4573D]/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6862] hover:text-[#24211F] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="btn-primary w-full mt-6 justify-center disabled:opacity-60"
              id="admin-signin-btn"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#9A9490] mt-6">
          Admin access only. Create your account in Supabase Auth.
        </p>
      </div>
    </div>
  )
}
