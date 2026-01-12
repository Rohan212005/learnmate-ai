import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LearnMate AI - Personalized Learning Assistant',
  description: 'SDG 4: Quality Education - AI-powered learning assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}