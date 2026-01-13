import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // === ADDED DEBUGGING ===
    console.log('=== API CALL STARTED ===')
    console.log('Time:', new Date().toISOString())
    
    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    
    const { topic, level, userId, isAdmin, isChatMode } = body
    
    console.log('Parsed values:', { 
      topic, 
      level, 
      userId: userId ? `present (${userId.substring(0, 8)}...)` : 'MISSING!', 
      isAdmin, 
      isChatMode 
    })
    
    console.log('=== ENV CHECK ===')
    console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0)
    console.log('=== ENV CHECK END ===')
    // === END DEBUGGING ===

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: topic' },
        { status: 400 }
      )
    }

    console.log('DEBUG: GEMINI_API_KEY exists?', !!process.env.GEMINI_API_KEY)
    console.log('DEBUG: NEXT_PUBLIC_GEMINI_API_KEY exists?', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (apiKey) {
      console.log('DEBUG: Using API key, length:', apiKey.length)
      
      try {
        let prompt = ''
        
        if (isChatMode) {
          prompt = `The user asks: "${topic}"
          
          Provide a helpful, knowledgeable response as a general AI assistant.
          Answer naturally and conversationally.
          If it's an educational topic, provide insightful information.
          If it's a general question, answer appropriately.
          Be friendly, clear, and helpful.`
        } else {
          const userLevel = level || 'beginner'
          prompt = `Create a structured 4-week learning curriculum about: "${topic}" for ${userLevel} level.

Generate the response in this EXACT format:

<CONCISE_SUMMARY>
# ${topic} - 4 Week Learning Plan
Week 1: [Very brief 1-2 line description of Week 1 focus]
Week 2: [Very brief 1-2 line description of Week 2 focus]
Week 3: [Very brief 1-2 line description of Week 3 focus]
Week 4: [Very brief 1-2 line description of Week 4 focus]
</CONCISE_SUMMARY>

<DETAILED_CURRICULUM>
## WEEK 1: [Week 1 Title - make it descriptive]
### Learning Objectives
- [Clear objective 1]
- [Clear objective 2]
- [Clear objective 3]

### Detailed Content
[Provide comprehensive educational content for week 1. This should be detailed, lengthy, and informative. Use proper markdown formatting with headings, paragraphs, bullet points, and examples. Make sure there is adequate spacing between sections.]

### Assessment Questions
Generate 10 diverse multiple-choice questions covering different aspects of this week's content.

CRITICAL INSTRUCTIONS FOR QUESTIONS:
1. Create 10 UNIQUE questions that test DIFFERENT concepts from the content
2. Each question must have 4 DISTINCT answer options
3. Correct answers should be RANDOMLY distributed (some A, some B, some C, some D)
4. Make options plausible but clearly different
5. Include a mix of factual, conceptual, and application questions
6. DO NOT repeat question patterns or concepts
7. Ensure questions vary in difficulty (some easy, some medium, some challenging)

Format each question EXACTLY like this:
Q: [Unique question text]
A) [Distinct option A]
B) [Distinct option B]
C) [Distinct option C]
D) [Distinct option D]
Answer: [Randomly choose A, B, C, or D - ensure variety across all 10 questions]

## WEEK 2: [Week 2 Title - continue progression]
### Learning Objectives
- [Objective 1 building on week 1]
- [Objective 2 building on week 1]
- [Objective 3 introducing new concepts]

### Detailed Content
[Week 2 detailed content - continue building knowledge with proper formatting and spacing.]

### Assessment Questions
[10 MORE UNIQUE questions - completely different from Week 1 questions. Follow same critical instructions.]

## WEEK 3: [Week 3 Title - advanced concepts]
[Same structure with 10 more unique questions]

## WEEK 4: [Week 4 Title - mastery and application]
[Same structure with 10 more unique questions]
</DETAILED_CURRICULUM>

CRITICAL FORMATTING RULES:
1. <CONCISE_SUMMARY> must be VERY brief - only 1-2 lines per week
2. <DETAILED_CURRICULUM> must use proper markdown with good spacing
3. Each week must have EXACTLY 10 assessment questions
4. Questions MUST be varied with random correct answers
5. NEVER show assessment questions in the concise summary
6. Use clear section breaks and proper paragraph spacing
7. Content should flow logically from basic to advanced`
        }

        console.log('DEBUG: Calling Gemini API with prompt length:', prompt.length)
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: isChatMode ? 0.9 : 0.7,
              maxOutputTokens: isChatMode ? 1200 : 8000,
              topP: 0.95,
              topK: 50,
            }
          })
        })

        console.log('DEBUG: Gemini API response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('DEBUG: Gemini API error:', errorText)
          throw new Error(`Gemini API error ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('DEBUG: Gemini API success, data received')
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const aiResponse = data.candidates[0].content.parts[0].text
          console.log('DEBUG: AI response generated, length:', aiResponse.length)
          
          let conciseSummary = ''
          let detailedCurriculum = ''
          
          const conciseMatch = aiResponse.match(/<CONCISE_SUMMARY>([\s\S]*?)<\/CONCISE_SUMMARY>/)
          if (conciseMatch) {
            conciseSummary = conciseMatch[1].trim()
          } else {
            const lines = aiResponse.split('\n').slice(0, 10)
            conciseSummary = lines.join('\n')
          }
          
          const detailedMatch = aiResponse.match(/<DETAILED_CURRICULUM>([\s\S]*?)<\/DETAILED_CURRICULUM>/)
          if (detailedMatch) {
            detailedCurriculum = detailedMatch[1].trim()
          } else {
            detailedCurriculum = aiResponse
          }
          
          console.log('DEBUG: Generated concise summary, length:', conciseSummary.length)
          console.log('DEBUG: Generated detailed curriculum, length:', detailedCurriculum.length)
          
          let sessionId = null
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          
          console.log('DEBUG: Attempting Supabase save...')
          console.log('DEBUG: supabaseUrl:', !!supabaseUrl)
          console.log('DEBUG: supabaseServiceKey:', !!supabaseServiceKey)
          console.log('DEBUG: userId:', !!userId)
          
          if (supabaseUrl && supabaseServiceKey && userId) {
            try {
              const supabase = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                  autoRefreshToken: false,
                  persistSession: false
                }
              })
              
              console.log('DEBUG: Supabase client created, attempting insert...')
              
              const insertData = {
                user_id: userId,
                topic,
                level: level || 'beginner',
                response: detailedCurriculum || aiResponse,
                session_state: 'new',
                current_week: 1,
                total_weeks: 4,
                progress_percentage: 0,
                last_accessed: new Date().toISOString(),
                updated_at: new Date().toISOString() // FIXED: Added missing column
              }
              
              console.log('DEBUG: Insert data prepared:', JSON.stringify(insertData, null, 2))
              
              const { data: sessionData, error: sessionError } = await supabase
                .from('history')
                .insert([insertData])
                .select()
                .single()
              
              if (sessionError) {
                console.error('DEBUG: Supabase insert ERROR:', sessionError)
                console.error('DEBUG: Error details:', {
                  message: sessionError.message,
                  code: sessionError.code,
                  details: sessionError.details,
                  hint: sessionError.hint
                })
              } else {
                sessionId = sessionData.id
                console.log('DEBUG: Session saved with ID:', sessionId)
                console.log('DEBUG: Full inserted data:', sessionData)
              }
            } catch (dbError) {
              console.error('DEBUG: Database catch error:', dbError)
            }
          } else {
            console.log('DEBUG: Supabase save skipped - missing:', {
              supabaseUrl: !supabaseUrl,
              supabaseServiceKey: !supabaseServiceKey,
              userId: !userId
            })
          }
          
          return NextResponse.json({
            success: true,
            response: aiResponse,
            conciseSummary: conciseSummary,
            detailedCurriculum: detailedCurriculum,
            sessionId: sessionId,
            topic,
            level: level || 'general',
            timestamp: new Date().toISOString(),
            note: 'AI Learning Plan',
            isAdmin: isAdmin || false,
            mode: isChatMode ? 'chat' : 'learning',
            model: 'gemini-2.5-flash-lite'
          })
        } else {
          console.error('DEBUG: Gemini returned empty response:', data)
          throw new Error('Gemini returned empty response')
        }
      } catch (apiError: any) {
        console.error('DEBUG: Gemini API failed:', apiError.message)
        
        const fallbackResponse = isChatMode
          ? `I understand you're asking about "${topic}". I'd love to help with that! While the AI service is currently unavailable, here's what I suggest: For general questions, try searching online. For learning topics, use the Learning Assistant mode for structured guidance.`
          : `<CONCISE_SUMMARY>
# ${topic} - 4 Week Learning Plan
Week 1: Introduction to ${topic} fundamentals and basic concepts
Week 2: Core principles and practical applications
Week 3: Advanced techniques and real-world implementation
Week 4: Mastery, projects, and next steps
</CONCISE_SUMMARY>

<DETAILED_CURRICULUM>
## WEEK 1: Fundamentals
### Learning Objectives
- Understand basic concepts of ${topic}
- Learn key terminology

### Detailed Content
Welcome to Week 1! Let's start with the fundamentals of ${topic}. This week will cover the basics and build a strong foundation.

### Assessment Questions
Q: What is a fundamental aspect of ${topic}?
A) Basic understanding
B) Advanced mastery
C) Complex analysis
D) Technical implementation
Answer: A

[9 more questions would be generated by AI when available]
</DETAILED_CURRICULUM>`
        
        let conciseSummary = `# ${topic} - 4 Week Learning Plan\nWeek 1: Introduction to ${topic} fundamentals\nWeek 2: Core principles and applications\nWeek 3: Advanced techniques\nWeek 4: Mastery and projects`
        let detailedCurriculum = `## WEEK 1: Fundamentals\n### Learning Objectives\n- Understand basic concepts\n- Learn key terminology\n\n### Detailed Content\n[Fallback content for ${topic}]`
        
        const conciseMatch = fallbackResponse.match(/<CONCISE_SUMMARY>([\s\S]*?)<\/CONCISE_SUMMARY>/)
        if (conciseMatch) conciseSummary = conciseMatch[1].trim()
        
        const detailedMatch = fallbackResponse.match(/<DETAILED_CURRICULUM>([\s\S]*?)<\/DETAILED_CURRICULUM>/)
        if (detailedMatch) detailedCurriculum = detailedMatch[1].trim()
        
        let sessionId = null
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        
        if (supabaseUrl && supabaseServiceKey && userId) {
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey)
            
            const { data: sessionData, error: sessionError } = await supabase
              .from('history')
              .insert([{
                user_id: userId,
                topic,
                level: level || 'beginner',
                response: detailedCurriculum,
                session_state: 'new',
                current_week: 1,
                total_weeks: 4,
                progress_percentage: 0,
                last_accessed: new Date().toISOString(),
                updated_at: new Date().toISOString() // FIXED: Added missing column
              }])
              .select()
              .single()
            
            if (!sessionError) {
              sessionId = sessionData.id
            }
          } catch (error) {
            console.error('Fallback session save error:', error)
          }
        }
        
        return NextResponse.json({
          success: true,
          response: fallbackResponse,
          conciseSummary: conciseSummary,
          detailedCurriculum: detailedCurriculum,
          sessionId: sessionId,
          topic,
          level: level || 'general',
          timestamp: new Date().toISOString(),
          note: 'Fallback response (AI service unavailable)',
          isAdmin: isAdmin || false,
          mode: isChatMode ? 'chat' : 'learning'
        })
      }
    } else {
      console.error('DEBUG: No API key found in environment variables')
      
      return NextResponse.json({
        success: false,
        error: 'AI service not configured',
        response: isChatMode 
          ? `I'd love to chat with you about "${topic}"! Please add a Gemini API key to enable AI conversations.`
          : `<CONCISE_SUMMARY>
# ${topic} - 4 Week Learning Plan
Week 1: Setup required - Add Gemini API key
Week 2: Core concepts will generate after setup
Week 3: Advanced topics available with API
Week 4: Complete your learning journey
</CONCISE_SUMMARY>`,
        conciseSummary: `# ${topic} - Setup Required\nWeek 1: Add Gemini API key to enable AI learning`,
        detailedCurriculum: `## Setup Required\nPlease configure Gemini API key to generate learning content.`,
        note: 'Add GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY to .env.local'
      }, { status: 503 })
    }

  } catch (error: any) {
    console.error('DEBUG: API route error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      response: `# Oops! Something went wrong.\n\nWe couldn't process your request. Please try again in a moment.\n\nError: ${error.message}`,
      conciseSummary: `# Error\nUnable to generate learning plan at this time.`,
      detailedCurriculum: `## Error\nServer error occurred. Please try again.`,
      note: 'Server error'
    }, { status: 500 })
  }
}