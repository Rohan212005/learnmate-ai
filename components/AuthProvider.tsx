'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      const publicRoutes = ['/login', '/signup', '/']
      
      if (!session && !publicRoutes.includes(pathname)) {
        router.push('/login')
      } else if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
        router.push('/dashboard')
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

  return <>{children}</>
}