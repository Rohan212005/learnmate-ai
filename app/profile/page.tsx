'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Calendar, BookOpen, TrendingUp, Shield, LogOut, Edit, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    beginnerSessions: 0,
    intermediateSessions: 0,
    advancedSessions: 0,
    lastActive: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setDisplayName(user?.email?.split('@')[0] || 'Student')
      
      if (user) {
        fetchStats(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const fetchStats = async (userId: string) => {
    const { data: sessions } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
    
    if (sessions) {
      const lastSession = sessions.length > 0 
        ? new Date(sessions[0].created_at).toLocaleDateString()
        : 'Never'
      
      setStats({
        totalSessions: sessions.length,
        beginnerSessions: sessions.filter(s => s.level === 'beginner').length,
        intermediateSessions: sessions.filter(s => s.level === 'intermediate').length,
        advancedSessions: sessions.filter(s => s.level === 'advanced').length,
        lastActive: lastSession
      })
    }
  }

  const handleSaveProfile = async () => {
    // In a real app, you would update user metadata here
    setIsEditing(false)
    alert('Profile updated! (Demo: Changes are not saved to database)')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <User className="mr-3 text-blue-500" size={28} />
          Your Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account and track your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-xl font-medium flex items-center transition-colors"
              >
                {isEditing ? <X size={18} className="mr-2" /> : <Edit size={18} className="mr-2" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-4">
                  <User className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-4">
                  <Mail className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email Address
                  </label>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Used for login and notifications
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mr-4">
                  <Calendar className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Member Since
                  </label>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Date(user?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {Math.floor((new Date().getTime() - new Date(user?.created_at).getTime()) / (1000 * 60 * 60 * 24))} days of learning
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center"
                  >
                    <Save size={20} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <Shield className="text-red-600 dark:text-red-400" size={22} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Security
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Change Password
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your password regularly for security
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Change
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center"
              >
                <LogOut size={20} className="mr-2" />
                Logout from All Devices
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="mr-2" size={22} />
              Learning Statistics
            </h2>

            <div className="space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total Sessions</span>
                  <BookOpen size={20} className="text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalSessions}
                </div>
                <div className="h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(stats.totalSessions * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Beginner</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.beginnerSessions}
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Intermediate</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.intermediateSessions}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Advanced</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.advancedSessions}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Active</div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {stats.lastActive}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Learning Level</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSessions === 0 ? 'New Learner' :
                     stats.beginnerSessions > stats.intermediateSessions + stats.advancedSessions ? 'Beginner' :
                     stats.intermediateSessions > stats.advancedSessions ? 'Intermediate' : 'Advanced'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SDG Badge */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6">
            <div className="text-white text-center">
              <div className="text-4xl font-bold mb-3">🎯</div>
              <div className="font-semibold text-lg mb-2">Personalized Learning</div>
              <p className="text-blue-100 text-sm">
                Your AI assistant adapts to your level and learning pace
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-medium text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage</span>
                <span className="font-medium text-gray-900 dark:text-white">Unlimited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Queries</span>
                <span className="font-medium text-gray-900 dark:text-white">Unlimited*</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                *Subject to fair use policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}