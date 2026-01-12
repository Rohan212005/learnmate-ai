'use client'

import { Send, Bot, User, Trash2, Copy, ThumbsUp, ThumbsDown, Sparkles, MessageSquare } from 'lucide-react'

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
      // This would need to be handled by parent
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

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6">
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

      {/* Chat Container */}
      <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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
        </div>

        {/* Quick Questions */}
        <div className="px-4 md:px-6 pb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
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

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <form onSubmit={onSend} className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about any topic (supports SDG 4: Quality Education)..."
              className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </form>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            <Sparkles size={12} className="inline mr-1" /> Supports UN SDG 4: Quality Education
          </div>
        </div>
      </div>
    </div>
  )
}