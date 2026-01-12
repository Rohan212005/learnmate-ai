'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Brain, Lock, Mail, UserPlus, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check Your Email!</h2>
            <p className="text-green-100">
              We've sent a confirmation link to
            </p>
            <p className="text-white font-semibold mt-2 text-lg">{email}</p>
          </div>
          
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Click the link in your email to activate your account and start learning with AI.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              Go to Login
            </Link>
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Note:</span> If you don't see the email, check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-indigo-100 mt-2">Join LearnMate AI today</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="student@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                <div className="flex items-center">
                  <Lock size={16} className="mr-2" />
                  Password
                </div>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                <div className="flex items-center">
                  <Lock size={16} className="mr-2" />
                  Confirm Password
                </div>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3.5 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}