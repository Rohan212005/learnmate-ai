'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import type { Session } from '@supabase/supabase-js'

export default function Template({ children }: { children: React.ReactNode }) {
  // ALL HOOKS AT TOP - ALWAYS 6 HOOKS
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [session, setSession] = useState<Session | null>(null) // FIXED: Accepts Session or null

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session) // FIXED: This can now accept null
      
      const publicRoutes = ['/login', '/signup', '/']
      const isPublicRoute = publicRoutes.includes(pathname)
      
      if (!session && !isPublicRoute) {
        router.push('/login')
        setShowSidebar(false)
      } else if (session && isPublicRoute) {
        router.push('/dashboard')
        setShowSidebar(true)
      } else {
        setShowSidebar(!!session && !isPublicRoute) // FIXED: Convert to boolean with !!
      }
      
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (showSidebar) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>
      </div>
    )
  }

  return <>{children}</>
}