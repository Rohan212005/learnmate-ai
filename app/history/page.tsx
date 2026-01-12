'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { History as HistoryIcon, Calendar, BookOpen, Filter, Trash2, Eye, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function HistoryPage() {
  // ALL HOOKS AT TOP - ALWAYS 5 HOOKS
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchHistory(user.id)
      }
    }
    getUser()
  }, [])

  const fetchHistory = async (userId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (data) setSessions(data)
    setLoading(false)
  }

  const deleteSession = async (id: number) => {
    if (!confirm('Delete this learning session?')) return
    
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', id)
    
    if (!error && user) {
      fetchHistory(user.id)
      if (selectedSession?.id === id) {
        setSelectedSession(null)
      }
    }
  }

  const clearAllHistory = async () => {
    if (!confirm('Delete ALL your learning history? This cannot be undone.')) return
    
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('user_id', user.id)
    
    if (!error) {
      setSessions([])
      setSelectedSession(null)
    }
  }

  const filteredSessions = filter === 'all' 
    ? sessions 
    : sessions.filter(s => s.level === filter)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <HistoryIcon className="mr-3 text-blue-500" size={28} />
              Learning History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review your past learning sessions and track your progress
            </p>
          </div>
          
          {sessions.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-xl font-medium flex items-center transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sessions List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter size={20} className="mr-2" />
                Filter Sessions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {['all', 'beginner', 'intermediate', 'advanced'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all ${filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {f === 'all' ? 'All Levels' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your history...</p>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                      selectedSession?.id === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {session.topic}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(session.level)}`}>
                            {session.level}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <Calendar size={14} className="mr-1.5" />
                          {formatDate(session.created_at)}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                          {session.response.substring(0, 200)}...
                        </p>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSession(session)
                          }}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                          title="Delete session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No learning sessions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filter === 'all' 
                    ? "You haven't started any learning sessions yet."
                    : `No ${filter} level sessions found.`
                  }
                </p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Start Learning Now
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Session Detail */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Session Details
                  </h2>
                  {selectedSession && (
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
              
              {selectedSession ? (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedSession.topic}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedSession.level)}`}>
                        {selectedSession.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-6">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(selectedSession.created_at)}
                    </div>
                  </div>
                  
                  <div className="prose prose-blue dark:prose-invert max-w-none mb-6">
                    <ReactMarkdown>{selectedSession.response}</ReactMarkdown>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        window.location.href = `/dashboard?topic=${encodeURIComponent(selectedSession.topic)}&level=${selectedSession.level}`
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all mb-3"
                    >
                      Continue Learning This Topic
                    </button>
                    
                    <button
                      onClick={() => deleteSession(selectedSession.id)}
                      className="w-full bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete This Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Eye className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a session
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click on any session from the list to view detailed content here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}