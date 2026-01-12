'use client'

import { useState, useEffect } from 'react'
import { User, Moon, Sun, Type, MessageSquare, BookOpen, LogOut, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfileDropdown() {
  // ALL HOOKS AT TOP - NO CONDITIONALS
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [mode, setMode] = useState<'learning' | 'chat'>('learning')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Load preferences from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large'
      const savedMode = localStorage.getItem('mode') as 'learning' | 'chat'
      
      if (savedTheme) setTheme(savedTheme)
      if (savedFontSize) setFontSize(savedFontSize)
      if (savedMode) setMode(savedMode)
    }
    getUser()
  }, [])

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleFontSizeChange = (newSize: 'normal' | 'large') => {
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)
    document.documentElement.classList.toggle('text-lg', newSize === 'large')
  }

  const handleModeChange = (newMode: 'learning' | 'chat') => {
    setMode(newMode)
    localStorage.setItem('mode', newMode)
    window.location.href = '/dashboard'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium text-white text-sm">
            {user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-xs text-gray-400 capitalize">
            {mode === 'learning' ? 'Learning Mode' : 'Chat Mode'}
          </div>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="p-4 border-b border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Interface Mode
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleModeChange('learning')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    mode === 'learning'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <BookOpen size={18} className={mode === 'learning' ? 'text-blue-400' : 'text-gray-400'} />
                  <span className={mode === 'learning' ? 'text-blue-400 font-medium' : 'text-gray-300'}>
                    Learning
                  </span>
                </button>
                <button
                  onClick={() => handleModeChange('chat')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    mode === 'chat'
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare size={18} className={mode === 'chat' ? 'text-green-400' : 'text-gray-400'} />
                  <span className={mode === 'chat' ? 'text-green-400 font-medium' : 'text-gray-300'}>
                    Chat
                  </span>
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="p-4 border-b border-gray-700 space-y-4">
              <div>
                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Theme
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                      theme === 'light'
                        ? 'bg-yellow-500/20 border border-yellow-500/30'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <Sun size={16} className={theme === 'light' ? 'text-yellow-400' : 'text-gray-400'} />
                    <span className={theme === 'light' ? 'text-yellow-400 font-medium' : 'text-gray-300'}>
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <Moon size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-gray-400'} />
                    <span className={theme === 'dark' ? 'text-blue-400 font-medium' : 'text-gray-300'}>
                      Dark
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Font Size
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                      fontSize === 'normal'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <Type size={16} className={fontSize === 'normal' ? 'text-green-400' : 'text-gray-400'} />
                    <span className={fontSize === 'normal' ? 'text-green-400 font-medium' : 'text-gray-300'}>
                      Normal
                    </span>
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                      fontSize === 'large'
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-gray-700/50 hover:bg-gray-700'
                    }`}
                  >
                    <Type size={18} className={fontSize === 'large' ? 'text-green-400' : 'text-gray-400'} />
                    <span className={fontSize === 'large' ? 'text-green-400 font-medium' : 'text-gray-300'}>
                      Large
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}