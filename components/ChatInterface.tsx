'use client'

import { Send, Bot, User, Trash2, Copy, ThumbsUp, ThumbsDown, Sparkles, MessageSquare } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface ChatInterfaceProps {
  messages: any[]
  chatInput: string
  setChatInput: (input: string) => void
  chatLoading: boolean
  onSend: (e: React.FormEvent) => void
}

export default function ChatInterface({ 
  messages, 
  chatInput, 
  setChatInput, 
  chatLoading, 
  onSend 
}: ChatInterfaceProps) {
  const clearChat = () => {
    if (confirm('Clear all chat messages?')) {
      alert('Chat cleared - would need parent state update')
    }
  }

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleQuickQuestion = (question: string) => {
    setChatInput(question)
  }

  const quickQuestions = [
    "Explain machine learning in simple terms",
    "How does photosynthesis work?",
    "What are the basics of Python programming?",
    "Help me understand quantum physics"
  ]

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LearnMate Chat</h1>
              <p className="text-blue-100">Ask me anything about any topic!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block px-3 py-1.5 bg-white/10 rounded-full text-white text-sm">
              <Sparkles size={14} className="inline mr-1" /> SDG 4
            </div>
            <button
              onClick={clearChat}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2"
              title="Clear chat"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Takes all available space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome content when no messages */}
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-3xl mx-auto">
              <div className="text-center pt-12">
                <div className="w-28 h-28 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MessageSquare className="text-blue-500 dark:text-blue-400" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Hello! I'm LearnMate AI, your educational assistant.
                </h2>
                
                {/* GETS Timer */}
                <div className="mb-10">
                  <div className="inline-flex items-center px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    <Sparkles size={16} className="mr-2" />
                    GETS 5:30
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="mt-12">
                  <div className="text-lg text-gray-600 dark:text-gray-400 mb-6 font-medium">Try asking:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        className="px-5 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 transition-colors text-left text-base"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Scrollable Messages Area - ONLY this part scrolls */
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.isUser ? 'justify-end' : ''}`}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] md:max-w-[75%] ${message.isUser ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl p-5 shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                      
                      <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                        message.isUser ? 'border-blue-400' : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className={`text-xs ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!message.isUser && (
                            <>
                              <button
                                onClick={() => copyMessage(message.text)}
                                className={`p-1.5 rounded-lg hover:opacity-80 ${
                                  message.isUser ? 'hover:bg-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                title="Copy message"
                              >
                                <Copy size={14} className={message.isUser ? 'text-white' : 'text-gray-500'} />
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Helpful"
                              >
                                <ThumbsUp size={14} className="text-gray-500" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Not helpful"
                              >
                                <ThumbsDown size={14} className="text-gray-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                      <span className="text-gray-500 ml-2">LearnMate AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Quick Questions when there are a few messages */}
        {messages.length > 0 && messages.length <= 3 && (
          <div className="shrink-0 px-6 pt-4 pb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 2).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 bg-white dark:bg-gray-900">
        <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 p-1 shadow-sm">
          <form onSubmit={onSend} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about any topic..."
              className="flex-1 p-3 bg-transparent text-gray-900 dark:text-white focus:outline-none"
              disabled={chatLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          <Sparkles size={12} className="inline mr-1" /> Supports UN SDG 4: Quality Education
        </div>
      </div>
    </div>
  )
}