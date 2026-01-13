'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, BookOpen, MessageSquare } from 'lucide-react'
import LearningInterface from '@/components/LearningInterface'
import ChatInterface from '@/components/ChatInterface'

export default function DashboardPage() {
  const [mode, setMode] = useState<'learning' | 'chat'>('learning')
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('beginner')
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      text: "Hello! I'm LearnMate AI, your educational assistant.",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem('mode') as 'learning' | 'chat'
    setMode(savedMode || 'learning')
    
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
    const { data } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (data) setHistory(data)
  }

  const handleLearningSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Learning submit triggered from dashboard')
  }

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: chatInput,
          level: 'general',
          isChatMode: true
        }),
      })

      const data = await res.json()
      
      const aiResponse = {
        id: messages.length + 2,
        text: data.success ? data.response : `I understand you're asking about "${chatInput}".`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const aiResponse = {
        id: messages.length + 2,
        text: `Thanks for your question about "${chatInput}"!`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }
    
    setChatLoading(false)
  }

  const handleModeChange = (newMode: 'learning' | 'chat') => {
    setMode(newMode)
    localStorage.setItem('mode', newMode)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent backdrop-blur-sm py-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="mr-3 text-blue-500" size={28} />
              {mode === 'learning' ? 'Learning Assistant' : 'AI Chat'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {mode === 'learning' 
                ? 'What would you like to learn today?'
                : 'Ask me anything!'
              }
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => handleModeChange('learning')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center ${
                mode === 'learning'
                  ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookOpen size={18} className="mr-2" />
              Learning
            </button>
            <button
              onClick={() => handleModeChange('chat')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center ${
                mode === 'chat'
                  ? 'bg-white dark:bg-gray-700 shadow text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare size={18} className="mr-2" />
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Show Learning or Chat Interface */}
      <div className="flex-1">
        {mode === 'learning' ? (
          user ? (
            <LearningInterface 
              user={user}
              history={history}
              topic={topic}
              setTopic={setTopic}
              level={level}
              setLevel={setLevel}
              onSubmit={handleLearningSubmit}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading user data...</p>
              </div>
            </div>
          )
        ) : (
          <ChatInterface 
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatLoading={chatLoading}
            onSend={handleChatSend}
          />
        )}
      </div>
    </div>
  )
}