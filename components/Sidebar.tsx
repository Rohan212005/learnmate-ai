'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import ProfileDropdown from './ProfileDropdown'

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home size={22} /> },
    { name: 'History', href: '/history', icon: <BookOpen size={22} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={22} /> },
  ]

  return (
    <div className={`bg-gray-900 text-white ${isOpen ? 'w-64' : 'w-20'} h-screen flex flex-col fixed left-0 top-0 z-30`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'}`}>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="font-bold">LM</span>
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-lg">LearnMate AI</h1>
              <p className="text-xs text-gray-400">SDG 4: Education</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-gray-800 rounded-lg"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className={`${isOpen ? 'mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </div>
                {isOpen && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-800">
        <ProfileDropdown />
      </div>
    </div>
  )
}

export default Sidebar