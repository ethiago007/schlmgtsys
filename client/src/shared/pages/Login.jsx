import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { loginUser, getUserRole } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user, role } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  // If already logged in, redirect
  if (user && role === 'admin') navigate('/admin')
  if (user && role === 'student') navigate('/portal')

  const onSubmit = async (data) => {
  setLoading(true)
  try {
    const loggedInUser = await loginUser(data.email, data.password)
    const userRole     = await getUserRole(loggedInUser.uid)

    if (userRole === 'admin') {
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } else if (userRole === 'student') {
      toast.success('Welcome back!')
      navigate('/portal')
    } else if (userRole === 'teacher') {
      toast.success('Welcome, Teacher!')
      navigate('/teacher')       // ← add this
    } else {
      toast.error('No role assigned to this account.')
    }
  } catch (error) {
    toast.error('Invalid email or password.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-1">School Portal</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </motion.div>
    </div>
  )
}

export default Login