'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, BookOpen, Lock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Target, Sparkles, Brain, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function DetailedLearningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentWeek, setCurrentWeek] = useState(1)
  const [progress, setProgress] = useState(0)
  const [unlockedWeeks, setUnlockedWeeks] = useState([1])
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([])
  const [assessmentScores, setAssessmentScores] = useState<{[key: number]: number}>({})
  const [showWeekDropdown, setShowWeekDropdown] = useState(false)
  const [learningPlan, setLearningPlan] = useState<any>(null)
  const [weekContent, setWeekContent] = useState<string>('')
  const [showAssessment, setShowAssessment] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({})
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [totalQuestions] = useState(10)
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  
  const sessionId = searchParams.get('sessionId')
  const topic = searchParams.get('topic') || 'Learning Topic'
  const level = searchParams.get('level') || 'beginner'
  
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true)
      
      console.log('Initializing page with:', { sessionId, topic, level })
      
      // FIRST: Always try localStorage
      const savedPlan = localStorage.getItem('currentLearningPlan')
      if (savedPlan) {
        try {
          const plan = JSON.parse(savedPlan)
          console.log('Loaded from localStorage:', plan)
          setLearningPlan(plan)
          setCurrentWeek(plan.currentWeek || 1)
          setProgress(plan.progress || 0)
          
          // Set unlocked weeks
          const unlocked = []
          for (let i = 1; i <= Math.min(plan.currentWeek || 1, 4); i++) {
            unlocked.push(i)
          }
          setUnlockedWeeks(unlocked)
          
          // Set completed weeks
          const completed = []
          for (let i = 1; i < (plan.currentWeek || 1); i++) {
            completed.push(i)
          }
          setCompletedWeeks(completed)
          
          parseWeekContent(plan.detailedCurriculum, plan.currentWeek || 1)
          
          // Load scores
          if (plan.sessionId) {
            const savedScores = localStorage.getItem(`assessment_scores_${plan.sessionId}`)
            if (savedScores) {
              setAssessmentScores(JSON.parse(savedScores))
            }
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error)
        }
      }
      
      // SECOND: Try to fetch from Supabase if we have a valid sessionId
      // Convert to string and check if it's numeric (bigint from Supabase)
      const sessionIdStr = sessionId ? String(sessionId) : null
      const isNumericId = sessionIdStr && /^\d+$/.test(sessionIdStr)
      
      if (isNumericId && sessionIdStr.length > 0) {
        try {
          console.log('Fetching from Supabase with numeric ID:', sessionIdStr)
          
          const { data: sessionData, error } = await supabase
            .from('history')
            .select('*')
            .eq('id', sessionIdStr)
            .single()
          
          if (!error && sessionData) {
            console.log('Supabase data received:', sessionData)
            setSession(sessionData)
            
            const currentWeekNum = sessionData.current_week || 1
            setCurrentWeek(currentWeekNum)
            
            // Update unlocked weeks
            const unlocked = []
            for (let i = 1; i <= Math.min(currentWeekNum, 4); i++) {
              unlocked.push(i)
            }
            setUnlockedWeeks(unlocked)
            
            // Update completed weeks
            const completed = []
            for (let i = 1; i < currentWeekNum; i++) {
              completed.push(i)
            }
            setCompletedWeeks(completed)
            
            // Update progress
            const actualProgress = Math.round(((currentWeekNum - 1) / 4) * 100)
            setProgress(actualProgress)
            
            parseWeekContent(sessionData.response, currentWeekNum)
            
            // Update localStorage with latest data
            if (savedPlan) {
              const plan = JSON.parse(savedPlan)
              plan.currentWeek = currentWeekNum
              plan.progress = actualProgress
              localStorage.setItem('currentLearningPlan', JSON.stringify(plan))
            }
          } else if (error) {
            console.log('Supabase query returned error:', error)
          }
        } catch (error) {
          console.log('Supabase fetch failed:', error)
        }
      } else if (!savedPlan && topic) {
        // If no localStorage and no valid sessionId, create a basic plan from URL
        const basicPlan = {
          topic: topic,
          level: level || 'beginner',
          currentWeek: 1,
          progress: 0,
          sessionId: sessionIdStr,
          detailedCurriculum: `# ${topic}\n\nStart learning about ${topic}!`
        }
        setLearningPlan(basicPlan)
        parseWeekContent(basicPlan.detailedCurriculum, 1)
      }
      
      setLoading(false)
    }
    
    initializePage()
  }, [sessionId, topic, level])

  const parseWeekContent = (curriculum: string, weekNumber: number) => {
    if (!curriculum) {
      setWeekContent(`# Week ${weekNumber}: ${topic}\n\nContent will be generated by AI.`)
      return
    }
    
    const weekPattern = new RegExp(`## WEEK ${weekNumber}:([\\s\\S]*?)(?:## WEEK ${weekNumber + 1}:|<\\/DETAILED_CURRICULUM>|$)`, 'i')
    const match = curriculum.match(weekPattern)
    
    if (match && match[1]) {
      let content = match[1].trim()
      
      // Extract assessment questions for this week
      extractAssessmentQuestions(curriculum, weekNumber)
      
      // Remove Assessment Questions section from display
      const assessmentIndex = content.indexOf('### Assessment Questions')
      if (assessmentIndex !== -1) {
        content = content.substring(0, assessmentIndex).trim()
      }
      
      // Clean up any remaining question lines
      content = content.replace(/Q:.*/g, '')
                       .replace(/A\) .*/g, '')
                       .replace(/B\) .*/g, '')
                       .replace(/C\) .*/g, '')
                       .replace(/D\) .*/g, '')
                       .replace(/Answer:.*/g, '')
                       .trim()
      
      setWeekContent(content)
    } else {
      setWeekContent(`# Week ${weekNumber}\n\nDetailed content for ${topic}.`)
    }
  }

  // NEW FUNCTION: Extract actual assessment questions from curriculum
  const extractAssessmentQuestions = (curriculum: string, weekNumber: number) => {
    try {
      console.log('Extracting questions for week:', weekNumber)
      
      // Find the assessment section for this week
      const weekPattern = new RegExp(`## WEEK ${weekNumber}:([\\s\\S]*?)(?:## WEEK ${weekNumber + 1}:|<\\/DETAILED_CURRICULUM>|$)`, 'i')
      const weekMatch = curriculum.match(weekPattern)
      
      if (!weekMatch) {
        console.log('No week content found for week:', weekNumber)
        setParsedQuestions(generateFallbackQuestions(weekNumber))
        return
      }
      
      const weekContent = weekMatch[1]
      const questionsSection = weekContent.match(/### Assessment Questions([\s\S]*?)(?=###|## WEEK|\/DETAILED_CURRICULUM|$)/i)
      
      if (!questionsSection) {
        console.log('No assessment questions found for week:', weekNumber)
        setParsedQuestions(generateFallbackQuestions(weekNumber))
        return
      }
      
      const questionsText = questionsSection[1]
      const questionBlocks = questionsText.split(/(?=Q:)/g).filter(block => block.trim())
      
      const parsedQuestions = []
      
      for (const block of questionBlocks) {
        if (block.trim()) {
          const question = parseQuestionBlock(block)
          if (question) {
            parsedQuestions.push(question)
          }
        }
      }
      
      console.log(`Parsed ${parsedQuestions.length} questions for week ${weekNumber}`)
      
      if (parsedQuestions.length > 0) {
        setParsedQuestions(parsedQuestions.slice(0, 10)) // Limit to 10 questions
      } else {
        setParsedQuestions(generateFallbackQuestions(weekNumber))
      }
      
    } catch (error) {
      console.error('Error extracting questions:', error)
      setParsedQuestions(generateFallbackQuestions(weekNumber))
    }
  }

  // NEW FUNCTION: Parse a single question block
  const parseQuestionBlock = (block: string) => {
    try {
      const lines = block.trim().split('\n').filter(line => line.trim())
      
      if (lines.length < 6) return null // Need at least Q, A, B, C, D, Answer
      
      const question = lines[0].replace(/^Q:\s*/, '').trim()
      
      // Extract options
      const options = []
      let correctAnswer = ''
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.match(/^A\)\s/)) {
          options[0] = line.replace(/^A\)\s*/, '').trim()
        } else if (line.match(/^B\)\s/)) {
          options[1] = line.replace(/^B\)\s*/, '').trim()
        } else if (line.match(/^C\)\s/)) {
          options[2] = line.replace(/^C\)\s*/, '').trim()
        } else if (line.match(/^D\)\s/)) {
          options[3] = line.replace(/^D\)\s*/, '').trim()
        } else if (line.match(/^Answer:\s*/i)) {
          const answerMatch = line.match(/^Answer:\s*([A-D])/i)
          if (answerMatch) {
            correctAnswer = answerMatch[1].toUpperCase()
          }
        }
      }
      
      if (question && options.length === 4 && correctAnswer) {
        return {
          question,
          options,
          correctAnswer
        }
      }
      
      return null
    } catch (error) {
      console.error('Error parsing question block:', error)
      return null
    }
  }

  // NEW FUNCTION: Generate fallback questions if parsing fails
  const generateFallbackQuestions = (weekNumber: number) => {
    const questions = []
    const weekFocus = [
      `fundamentals and basics of ${topic}`,
      `core principles and applications of ${topic}`,
      `advanced techniques in ${topic}`,
      `mastery and real-world projects in ${topic}`
    ]
    
    const focus = weekFocus[weekNumber - 1] || weekFocus[0]
    
    for (let i = 0; i < 10; i++) {
      // Make each question slightly different
      const questionTypes = [
        `What is a key aspect of ${focus}?`,
        `Which concept is essential for understanding ${focus}?`,
        `How does ${focus} relate to practical applications?`,
        `What distinguishes ${focus} from related topics?`,
        `Why is ${focus} important in this field?`,
        `Which approach is commonly used in ${focus}?`,
        `What challenges are associated with ${focus}?`,
        `How has ${focus} evolved over time?`,
        `What are the main components of ${focus}?`,
        `Which skill is most important for mastering ${focus}?`
      ]
      
      questions.push({
        question: questionTypes[i] || `Week ${weekNumber}, Question ${i + 1}: About ${focus}`,
        options: [
          `An essential concept that forms the foundation`,
          `A practical application used in real-world scenarios`,
          `A common misunderstanding that should be addressed`,
          `An advanced technique requiring specialized knowledge`
        ],
        correctAnswer: ['A', 'B', 'C', 'D'][i % 4] // Rotate correct answers
      })
    }
    
    return questions
  }

  const handleWeekSelect = (week: number) => {
    if (unlockedWeeks.includes(week)) {
      setCurrentWeek(week)
      if (session?.response) {
        parseWeekContent(session.response, week)
      } else if (learningPlan?.detailedCurriculum) {
        parseWeekContent(learningPlan.detailedCurriculum, week)
      }
      setShowWeekDropdown(false)
    }
  }

  const handleAssessmentStart = () => {
    // Ensure we have questions for this week
    if (parsedQuestions.length === 0) {
      // Try to extract questions if we haven't already
      const curriculum = session?.response || learningPlan?.detailedCurriculum
      if (curriculum) {
        extractAssessmentQuestions(curriculum, currentWeek)
      }
    }
    
    setShowAssessment(true)
    setCurrentQuestion(0)
    setUserAnswers({})
    setAssessmentComplete(false)
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = { ...userAnswers, [currentQuestion]: answer }
    setUserAnswers(newAnswers)
    
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        completeAssessment(newAnswers)
      }
    }, 1000)
  }

  const completeAssessment = async (answers: {[key: number]: string}) => {
    // Calculate score based on actual correct answers
    let correctCount = 0
    const totalQuestions = parsedQuestions.length > 0 ? parsedQuestions.length : 10
    
    for (let i = 0; i < totalQuestions; i++) {
      const userAnswer = answers[i]
      const correctAnswer = parsedQuestions[i]?.correctAnswer || ['A', 'B', 'C', 'D'][i % 4]
      
      if (userAnswer === correctAnswer) {
        correctCount++
      }
    }
    
    const score = Math.round((correctCount / totalQuestions) * 100)
    
    const newCompletedWeeks = [...completedWeeks, currentWeek]
    setCompletedWeeks(newCompletedWeeks)
    
    const newScores = { ...assessmentScores, [currentWeek]: score }
    setAssessmentScores(newScores)
    
    if (sessionId) {
      localStorage.setItem(`assessment_scores_${sessionId}`, JSON.stringify(newScores))
    }
    
    // Unlock next week if score >= 60%
    if (score >= 60 && currentWeek < 4) {
      const nextWeek = currentWeek + 1
      if (!unlockedWeeks.includes(nextWeek)) {
        const newUnlocked = [...unlockedWeeks, nextWeek]
        setUnlockedWeeks(newUnlocked)
        
        const weeksCompleted = nextWeek - 1
        const newProgress = Math.round((weeksCompleted / 4) * 100)
        setProgress(newProgress)
        
        // Update localStorage
        const savedPlan = localStorage.getItem('currentLearningPlan')
        if (savedPlan) {
          const plan = JSON.parse(savedPlan)
          plan.currentWeek = nextWeek
          plan.progress = newProgress
          localStorage.setItem('currentLearningPlan', JSON.stringify(plan))
        }
        
        // Update Supabase if we have session
        const sessionIdStr = sessionId ? String(sessionId) : null
        if (sessionIdStr && session) {
          try {
            await supabase
              .from('history')
              .update({
                current_week: nextWeek,
                progress_percentage: newProgress,
                last_accessed: new Date().toISOString()
              })
              .eq('id', sessionIdStr)
            console.log('Progress saved to Supabase')
          } catch (error) {
            console.log('Could not update Supabase, but localStorage is updated')
          }
        }
      }
    }
    
    if (newCompletedWeeks.length === 4) {
      const sessionIdStr = sessionId ? String(sessionId) : null
      if (sessionIdStr && session) {
        try {
          await supabase
            .from('history')
            .update({
              session_state: 'completed',
              progress_percentage: 100,
              completed_at: new Date().toISOString()
            })
            .eq('id', sessionIdStr)
        } catch (error) {
          console.log('Could not mark as completed in Supabase')
        }
      }
    }
    
    setAssessmentComplete(true)
    setShowAssessment(false)
  }

  const handleNextWeek = () => {
    if (currentWeek < 4 && unlockedWeeks.includes(currentWeek + 1)) {
      setCurrentWeek(currentWeek + 1)
      if (session?.response) {
        parseWeekContent(session.response, currentWeek + 1)
      } else if (learningPlan?.detailedCurriculum) {
        parseWeekContent(learningPlan.detailedCurriculum, currentWeek + 1)
      }
    }
  }

  const getWeekTitle = (weekNumber: number) => {
    if (!session?.response && !learningPlan?.detailedCurriculum) {
      return `Week ${weekNumber}`
    }
    
    const curriculum = session?.response || learningPlan?.detailedCurriculum || ''
    const match = curriculum.match(new RegExp(`## WEEK ${weekNumber}:\\s*([^\\n]+)`, 'i'))
    return match ? match[1].trim() : `Week ${weekNumber}`
  }

  // Get questions for the current week - use parsed ones if available
  const getCurrentWeekQuestions = () => {
    if (parsedQuestions.length > 0) {
      return parsedQuestions
    }
    
    // Fallback to generated questions
    return generateFallbackQuestions(currentWeek)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading learning session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </button>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">{topic}</h1>
              <p className="text-sm text-gray-500 capitalize">{level} Level</p>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Weekly Progress</h2>
            <div className="text-sm text-gray-500">
              Overall: <span className="font-semibold">{progress}%</span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowWeekDropdown(!showWeekDropdown)}
              className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  completedWeeks.includes(currentWeek)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {completedWeeks.includes(currentWeek) ? (
                    <CheckCircle size={20} />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Week {currentWeek}: {getWeekTitle(currentWeek)}</div>
                  <div className="text-sm text-gray-500">
                    {completedWeeks.includes(currentWeek) 
                      ? `Completed (${assessmentScores[currentWeek] || 0}%)`
                      : unlockedWeeks.includes(currentWeek)
                      ? 'In Progress'
                      : 'Locked'
                    }
                  </div>
                </div>
              </div>
              {showWeekDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Week {currentWeek} Progress</span>
                <span>{completedWeeks.includes(currentWeek) ? '100%' : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: completedWeeks.includes(currentWeek) ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
            
            {showWeekDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {[1, 2, 3, 4].map(week => (
                  <button
                    key={week}
                    onClick={() => handleWeekSelect(week)}
                    disabled={!unlockedWeeks.includes(week)}
                    className={`w-full p-4 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                      currentWeek === week
                        ? 'bg-blue-50'
                        : unlockedWeeks.includes(week)
                        ? 'hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        completedWeeks.includes(week)
                          ? 'bg-green-100 text-green-600'
                          : unlockedWeeks.includes(week)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {completedWeeks.includes(week) ? (
                          <CheckCircle size={16} />
                        ) : !unlockedWeeks.includes(week) ? (
                          <Lock size={16} />
                        ) : (
                          week
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Week {week}</div>
                        <div className="text-sm text-gray-500">{getWeekTitle(week)}</div>
                      </div>
                    </div>
                    {assessmentScores[week] && (
                      <span className="text-sm font-medium text-green-600">{assessmentScores[week]}%</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Week {currentWeek}: {getWeekTitle(currentWeek)}
            </h3>
            {completedWeeks.includes(currentWeek) && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle size={16} className="mr-1" />
                Completed ({assessmentScores[currentWeek] || 0}%)
              </span>
            )}
          </div>
          
          <div className="prose prose-gray max-w-none mb-8">
            <div className="whitespace-pre-wrap leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700" {...props} />,
                  p: ({node, ...props}) => <p className="mt-3 mb-3 text-gray-600 leading-7" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mt-2 mb-3 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mt-2 mb-3 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1 text-gray-600" {...props} />,
                  code: ({node, ...props}) => <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto mt-3 mb-4" {...props} />,
                }}
              >
                {weekContent || `Loading Week ${currentWeek} content...`}
              </ReactMarkdown>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            {!completedWeeks.includes(currentWeek) ? (
              <div className="space-y-4">
                <button
                  onClick={handleAssessmentStart}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Target className="mr-2" size={20} />
                  Evaluate Your Knowledge
                </button>
                <p className="text-sm text-gray-500 text-center">
                  Complete assessment with 60%+ score to unlock Week {currentWeek + 1}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentWeek < 4 && unlockedWeeks.includes(currentWeek + 1) && (
                  <button
                    onClick={handleNextWeek}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center"
                  >
                    Continue to Week {currentWeek + 1}
                    <ArrowRight className="ml-2" size={20} />
                  </button>
                )}
                <button
                  onClick={handleAssessmentStart}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Review Assessment
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-500 mt-0.5 mr-3" size={20} />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How it works</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete each week's content and assessment</li>
                <li>• Score 60% or higher to unlock the next week</li>
                <li>• Revisit completed weeks anytime for revision</li>
                <li>• All 4 weeks must be completed in order</li>
                <li>• Your progress is automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Modal - FIXED: Now uses parsed questions */}
      {showAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Week {currentWeek} Assessment</h3>
                  <p className="text-blue-100 text-sm">Question {currentQuestion + 1} of {totalQuestions}</p>
                </div>
                <button
                  onClick={() => setShowAssessment(false)}
                  className="text-white hover:text-blue-200 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">
                  {getCurrentWeekQuestions()[currentQuestion]?.question || 'Loading question...'}
                </h4>
                
                <div className="space-y-4">
                  {getCurrentWeekQuestions()[currentQuestion]?.options.map((option: string, index: number) => {
                    const optionLetter = ['A', 'B', 'C', 'D'][index]
                    const currentQuestions = getCurrentWeekQuestions()
                    const correctAnswer = currentQuestions[currentQuestion]?.correctAnswer || 'A'
                    const isSelected = userAnswers[currentQuestion] === optionLetter
                    const isCorrectAnswer = correctAnswer === optionLetter
                    
                    let buttonStyle = 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    if (isSelected) {
                      buttonStyle = isCorrectAnswer 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                    }
                    
                    return (
                      <button
                        key={optionLetter}
                        onClick={() => handleAnswerSelect(optionLetter)}
                        className={`w-full p-4 text-left rounded-xl border transition-all ${buttonStyle}`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-lg mr-4 font-medium ${
                            isSelected
                              ? isCorrectAnswer
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {optionLetter}
                          </div>
                          <span className="text-gray-900">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Assessment Progress</span>
                  <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {userAnswers[currentQuestion] && (
                <div className="mt-6 p-4 rounded-xl animate-pulse" style={{
                  backgroundColor: userAnswers[currentQuestion] === getCurrentWeekQuestions()[currentQuestion]?.correctAnswer 
                    ? '#f0fdf4' 
                    : '#fef2f2',
                  border: `1px solid ${userAnswers[currentQuestion] === getCurrentWeekQuestions()[currentQuestion]?.correctAnswer 
                    ? '#bbf7d0' 
                    : '#fecaca'}`
                }}>
                  <div className="flex items-center" style={{
                    color: userAnswers[currentQuestion] === getCurrentWeekQuestions()[currentQuestion]?.correctAnswer 
                      ? '#16a34a' 
                      : '#dc2626'
                  }}>
                    {userAnswers[currentQuestion] === getCurrentWeekQuestions()[currentQuestion]?.correctAnswer ? (
                      <>
                        <CheckCircle className="mr-3" size={24} />
                        <div>
                          <div className="font-bold">Correct!</div>
                          <div className="text-sm mt-1">Well done! Moving to next question...</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-3" size={24} />
                        <div>
                          <div className="font-bold">Incorrect</div>
                          <div className="text-sm mt-1">
                            The correct answer is {getCurrentWeekQuestions()[currentQuestion]?.correctAnswer}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {currentQuestion + 1} of {totalQuestions} questions
                </div>
                {!userAnswers[currentQuestion] && (
                  <button
                    onClick={() => {
                      const randomAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
                      handleAnswerSelect(randomAnswer)
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Skip for now →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {assessmentComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="text-center">
              <div className={`inline-flex p-3 rounded-full mb-4 ${
                assessmentScores[currentWeek] >= 60 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {assessmentScores[currentWeek] >= 60 ? (
                  <CheckCircle size={48} />
                ) : (
                  <AlertCircle size={48} />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {assessmentScores[currentWeek] >= 60 ? 'Congratulations!' : 'Keep Practicing!'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                You scored <span className="font-bold">{assessmentScores[currentWeek]}%</span> on Week {currentWeek} assessment.
              </p>
              
              {assessmentScores[currentWeek] >= 60 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-medium">
                    <Sparkles className="inline mr-2" size={20} />
                    {currentWeek < 4 
                      ? `Week ${currentWeek + 1} has been unlocked! Continue your learning journey.`
                      : 'You have completed all 4 weeks! Amazing work!'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-medium">
                    Review the material and try again to unlock Week {currentWeek + 1}.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setAssessmentComplete(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Review Content
                </button>
                
                {assessmentScores[currentWeek] >= 60 && currentWeek < 4 ? (
                  <button
                    onClick={() => {
                      setAssessmentComplete(false)
                      handleNextWeek()
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Next Week
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAssessmentComplete(false)
                      handleAssessmentStart()
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}