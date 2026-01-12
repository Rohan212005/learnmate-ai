'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from './Sidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    // 🔥 ADD THIS: Detect if browser was just opened
    const browserJustOpened = !sessionStorage.getItem('browser_session_active')
    if (browserJustOpened) {
      sessionStorage.setItem('browser_session_active', 'true')
      // Clear any stale auth from previous browser session
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`)
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      const publicRoutes = ['/login', '/signup', '/']
      const isPublicRoute = publicRoutes.includes(pathname)
      
      // 🔥 ADD THIS: If browser just opened and we have a session, force revalidation
      if (browserJustOpened && session) {
        try {
          // Verify session is still valid
          const { error } = await supabase.auth.getUser()
          if (error) {
            // Session is invalid, clear it
            await supabase.auth.signOut()
            router.push('/login')
            setShowSidebar(false)
            setLoading(false)
            return
          }
        } catch {
          // If validation fails, assume session is stale
          await supabase.auth.signOut()
          router.push('/login')
          setShowSidebar(false)
          setLoading(false)
          return
        }
      }
      
      if (!session && !isPublicRoute) {
        router.push('/login')
      } else if (session && isPublicRoute) {
        router.push('/dashboard')
      }
      
      setShowSidebar(!!session && !isPublicRoute)
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

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'p-4 md:p-6' : ''} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        {children}
      </main>
    </div>
  )
}