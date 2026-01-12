'use client'

import { BookOpen, Target, Zap, Brain, ChevronRight, Send, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface LearningInterfaceProps {
  user: any
  history: any[]
  topic: string
  setTopic: (topic: string) => void
  level: string
  setLevel: (level: string) => void
  response: string
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export default function LearningInterface({ 
  user,
  history,
  topic,
  setTopic,
  level,
  setLevel,
  response,
  loading,
  onSubmit
}: LearningInterfaceProps) {
  const quickTopics = [
    { title: 'Machine Learning', icon: <Brain size={18} />, desc: 'Basics of AI & ML' },
    { title: 'Web Development', icon: <Zap size={18} />, desc: 'React, Next.js, APIs' },
    { title: 'Data Science', icon: <Target size={18} />, desc: 'Python, Pandas, Analysis' },
    { title: 'Mathematics', icon: <BookOpen size={18} />, desc: 'Calculus, Algebra, Stats' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Input */}
      <div className="lg:col-span-2 space-y-6">
        {/* Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="mr-2" size={22} />
            Start Learning Session
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-5">
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
                  Generating Learning Content...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  Generate Learning Plan
                </>
              )}
            </button>
          </form>

          {/* Quick Topics */}
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

        {/* AI Response */}
        {response && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/30 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Brain className="text-white" size={22} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Learning Plan
              </h3>
            </div>
            
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Sparkles size={16} className="mr-2" />
                Generated for {level} level • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - History & Stats */}
      <div className="space-y-6">
        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Learning Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sessions Today</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Topics</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{history.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Level</span>
              <span className="font-bold capitalize text-green-600 dark:text-green-400">{level}</span>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="mr-2" size={20} />
            Recent Sessions
          </h3>
          
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setTopic(item.topic)
                    setLevel(item.level)
                  }}
                  className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                        {item.topic}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        {item.level} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-500 dark:text-gray-400">No learning sessions yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start your first session above!</p>
            </div>
          )}
        </div>

        {/* SDG Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6">
          <div className="text-center text-white">
            <div className="text-3xl font-bold mb-2">SDG 4</div>
            <div className="font-semibold text-lg mb-1">Quality Education</div>
            <p className="text-green-100 text-sm">
              This project supports UN Sustainable Development Goal 4
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}