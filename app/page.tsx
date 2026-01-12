'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  useEffect(() => {
    // 🔥 ADD THIS: Clear sessionStorage on home page load
    // This ensures each browser session starts fresh
    sessionStorage.clear()
    
    const redirectUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/login'
      }
    }
    
    redirectUser()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  )
}