'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Target, Zap, Brain, ChevronRight, Send, Sparkles, Calendar, Clock, Trophy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface LearningInterfaceProps {
  user: any
  history: any[]
  topic: string
  setTopic: (topic: string) => void
  level: string
  setLevel: (level: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function LearningInterface({ 
  user,
  history,
  topic,
  setTopic,
  level,
  setLevel,
  onSubmit
}: LearningInterfaceProps) {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConcisePlan, setShowConcisePlan] = useState(false)
  const [detailedCurriculum, setDetailedCurriculum] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [recentSessions, setRecentSessions] = useState<any[]>([])

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !user) return

    setLoading(true)
    setResponse('')
    setShowConcisePlan(false)
    setDetailedCurriculum('')
    setCurrentSessionId(null)

    try {
      console.log('Sending API request with userId:', user.id)
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          level, 
          userId: user.id
        }),
      })

      const data = await res.json()
      console.log('API Response received:', { 
        success: data.success, 
        sessionId: data.sessionId,
        hasSessionId: !!data.sessionId 
      })
      
      if (data.success) {
        setResponse(data.conciseSummary || data.response)
        setDetailedCurriculum(data.detailedCurriculum || data.response)
        // Convert to string to handle bigint IDs properly
        setCurrentSessionId(data.sessionId ? String(data.sessionId) : null)
        setShowConcisePlan(true)
        
        fetchRecentSessions()
        
        if (onSubmit) {
          const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
          onSubmit(syntheticEvent)
        }
      } else {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('API Error:', error)
      setResponse('Error connecting to AI service.')
    }

    setLoading(false)
  }

  const fetchRecentSessions = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user.id)
      .in('session_state', ['active', 'completed'])
      .order('last_accessed', { ascending: false })
      .limit(3)
    
    if (data) {
      console.log('Fetched recent sessions:', data.length)
      setRecentSessions(data)
    }
  }

  const handleDiveInDetail = async () => {
    if (!detailedCurriculum) {
      console.error('No detailed curriculum available')
      return
    }
    
    try {
      // Convert sessionId to string for consistency
      const sessionIdStr = currentSessionId ? String(currentSessionId) : null
      
      if (sessionIdStr) {
        const { error } = await supabase
          .from('history')
          .update({
            session_state: 'active',
            last_accessed: new Date().toISOString()
          })
          .eq('id', sessionIdStr)
        
        if (error) {
          console.error('Failed to update session state:', error)
        }
      }
      
      const learningPlanData = {
        topic,
        level,
        conciseSummary: response,
        detailedCurriculum,
        sessionId: sessionIdStr,
        createdAt: new Date().toISOString(),
        tempId: sessionIdStr || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      console.log('Saving to localStorage:', learningPlanData)
      localStorage.setItem('currentLearningPlan', JSON.stringify(learningPlanData))
      
      fetchRecentSessions()
      
      setShowConcisePlan(false)
      setCurrentSessionId(null)
      
      const idToUse = sessionIdStr || learningPlanData.tempId
      console.log('Navigating to detailed view with ID:', idToUse)
      window.location.href = `/learning/detailed?sessionId=${idToUse}&topic=${encodeURIComponent(topic)}&level=${level}`
      
    } catch (error) {
      console.error('Error preparing detailed view:', error)
      window.location.href = `/learning/detailed?topic=${encodeURIComponent(topic)}&level=${level}`
    }
  }

  const handleContinueSession = (session: any) => {
    localStorage.setItem('currentLearningPlan', JSON.stringify({
      topic: session.topic,
      level: session.level,
      sessionId: String(session.id), // Convert to string
      currentWeek: session.current_week,
      progress: Math.round(((session.current_week - 1) / 4) * 100),
      lastAccessed: session.last_accessed
    }))
    
    supabase
      .from('history')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', session.id)
    
    window.location.href = `/learning/detailed?sessionId=${session.id}&topic=${encodeURIComponent(session.topic)}&level=${session.level}`
  }

  const quickTopics = [
    { title: 'Machine Learning', icon: <Brain size={18} />, desc: 'AI & ML Basics' },
    { title: 'Web Development', icon: <Zap size={18} />, desc: 'React, Next.js' },
    { title: 'Data Science', icon: <Target size={18} />, desc: 'Python, Analysis' },
    { title: 'Mathematics', icon: <BookOpen size={18} />, desc: 'Calculus, Algebra' },
  ]

  const getWeekLines = () => {
    if (!response) return []
    
    const lines = response.split('\n')
    return lines.filter(line => 
      line.trim() && 
      (line.toLowerCase().includes('week') || line.match(/^\d+\./) || line.match(/^week\s+\d+/i))
    ).slice(0, 4)
  }

  useEffect(() => {
    if (user) {
      fetchRecentSessions()
    }
  }, [user])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="mr-2" size={22} />
            Start Learning Session
          </h2>
          
          <form onSubmit={handleGeneratePlan} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                What topic do you want to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Artificial Intelligence, Calculus, Python Programming..."
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Your current level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`p-3.5 rounded-xl border transition-all ${level === lvl
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <span className="capitalize font-medium">{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Generating Learning Plan...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  Generate Learning Plan
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Topics</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(item.title)
                    setLevel('beginner')
                  }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {showConcisePlan && response && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/30 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Target className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your 4-Week Learning Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">
                  {level} level • 4 Weeks • Ready to Start
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {getWeekLines().map((weekLine, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">
                      {weekLine.replace(/^#+\s*/, '').replace(/^week\s*\d+[:\-]\s*/i, '').trim()}
                    </p>
                  </div>
                </div>
              ))}
              
              {getWeekLines().length === 0 && (
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">Week 1: Fundamentals and basics of {topic}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">Week 2: Core concepts and applications</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">Week 3: Advanced techniques and analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">Week 4: Mastery and real-world projects</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={handleDiveInDetail}
              disabled={!detailedCurriculum}
              className={`w-full p-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                !detailedCurriculum 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              <Sparkles className="mr-2" size={20} />
              Dive in Detail
              <ChevronRight className="ml-2" size={20} />
            </button>
            
            <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="mr-2" />
                Start today • Complete in 4 weeks • Interactive assessments
              </div>
            </div>
          </div>
        )}

        {response && !showConcisePlan && response.includes('#') && !response.toLowerCase().includes('week') && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/30 p-6">
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Continue Learning
          </h3>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => {
                // Calculate progress based on weeks completed
                const progressPercentage = Math.round(((session.current_week - 1) / 4) * 100)
                
                return (
                  <div 
                    key={session.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600">
                          {session.topic}
                        </h4>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {session.level} • {session.session_state === 'completed' ? 'Completed' : `Week ${session.current_week}/4`}
                        </div>
                      </div>
                      {session.session_state === 'completed' ? (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                          <Trophy size={12} className="inline mr-1" />
                          Completed
                        </div>
                      ) : (
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
                          {progressPercentage}%
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            session.session_state === 'completed' 
                              ? 'bg-green-500' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleContinueSession(session)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center"
                    >
                      {session.session_state === 'completed' ? 'Review' : 'Continue'}
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-500 dark:text-gray-400">No active sessions</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start a new learning journey!</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Learning Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Sessions</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {recentSessions.filter(s => s.session_state === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {recentSessions.filter(s => s.session_state === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Level</span>
              <span className="font-bold capitalize text-purple-600 dark:text-purple-400">{level}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6">
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-2">SDG 4</div>
            <div className="font-semibold text-lg mb-1">Quality Education</div>
            <p className="text-green-100 text-sm">
              Structured learning for everyone
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}