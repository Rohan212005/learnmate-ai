'use client'

import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Type, MessageSquare, BookOpen, Save, Bell, Globe, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [mode, setMode] = useState<'learning' | 'chat'>('learning')
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const savedFontSize = localStorage.getItem('fontSize') as 'normal' | 'large'
    const savedMode = localStorage.getItem('mode') as 'learning' | 'chat'
    
    if (savedTheme) setTheme(savedTheme)
    if (savedFontSize) setFontSize(savedFontSize)
    if (savedMode) setMode(savedMode)
  }, [])

  const handleSave = () => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('mode', mode)
    
    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // Apply font size
    document.documentElement.classList.toggle('text-lg', fontSize === 'large')
    
    alert('Settings saved!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent backdrop-blur-sm py-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="mr-3 text-blue-500" size={28} />
            Settings & Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your LearnMate AI experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Interface Mode */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MessageSquare className="mr-2" size={22} />
              Interface Mode
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('learning')}
                className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all ${
                  mode === 'learning'
                    ? 'bg-blue-500/20 border-2 border-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                <BookOpen size={28} className={mode === 'learning' ? 'text-blue-500' : 'text-gray-500'} />
                <div className="text-center">
                  <div className={`font-bold ${mode === 'learning' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Learning Assistant
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Structured lessons & plans
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`p-6 rounded-xl flex flex-col items-center gap-3 transition-all ${
                  mode === 'chat'
                    ? 'bg-green-500/20 border-2 border-green-500/30'
                    : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                <MessageSquare size={28} className={mode === 'chat' ? 'text-green-500' : 'text-gray-500'} />
                <div className="text-center">
                  <div className={`font-bold ${mode === 'chat' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Chatbot Mode
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Free-form conversation
                  </div>
                </div>
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {mode === 'learning' 
                ? 'Currently in Learning Assistant mode - get structured educational content.'
                : 'Currently in Chatbot mode - ask anything in a conversational way.'
              }
            </p>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                  Theme
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 ${
                      theme === 'light'
                        ? 'bg-yellow-500/20 border-2 border-yellow-500/30'
                        : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Sun size={24} className={theme === 'light' ? 'text-yellow-500' : 'text-gray-500'} />
                    <span className={theme === 'light' ? 'font-bold text-yellow-600' : 'text-gray-700 dark:text-gray-300'}>
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 border-2 border-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Moon size={24} className={theme === 'dark' ? 'text-blue-500' : 'text-gray-500'} />
                    <span className={theme === 'dark' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>
                      Dark
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                  Font Size
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 ${
                      fontSize === 'normal'
                        ? 'bg-green-500/20 border-2 border-green-500/30'
                        : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Type size={24} className={fontSize === 'normal' ? 'text-green-500' : 'text-gray-500'} />
                    <span className={`${fontSize === 'normal' ? 'font-bold text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      Normal
                    </span>
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 ${
                      fontSize === 'large'
                        ? 'bg-green-500/20 border-2 border-green-500/30'
                        : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Type size={28} className={fontSize === 'large' ? 'text-green-500' : 'text-gray-500'} />
                    <span className={`text-lg ${fontSize === 'large' ? 'font-bold text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      Large
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="mr-2" size={22} />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Learning Reminders</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Daily study reminders</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="mr-2" size={22} />
              Language & Region
            </h2>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="mr-2" size={22} />
              Privacy & Data
            </h2>
            <div className="space-y-4">
              <button className="w-full p-3.5 text-left bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">Export My Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Download all your learning history</div>
              </button>
              <button className="w-full p-3.5 text-left bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                <div className="font-medium">Delete Account</div>
                <div className="text-sm">Permanently remove all data</div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
          >
            <Save className="mr-2" size={22} />
            Save All Changes
          </button>

          {/* SDG Badge */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6">
            <div className="text-center text-white">
              <div className="text-3xl font-bold mb-2">SDG 4</div>
              <div className="font-semibold text-lg mb-1">Quality Education</div>
              <p className="text-green-100 text-sm">
                Your settings help personalize education for everyone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}