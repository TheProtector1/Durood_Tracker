'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DuaLibrary from '@/components/DuaLibrary'

export default function DuaLibraryPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      {/* Islamic decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Islamic star icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">📖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dua Library</h1>
          <p className="text-gray-600">Explore authentic duas with Arabic, Urdu, and English translations</p>
        </div>

        {/* Dua Library Component */}
        <DuaLibrary />
      </div>
    </div>
  )
}
