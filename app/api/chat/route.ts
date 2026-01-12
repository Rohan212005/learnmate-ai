import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, level, userId, isAdmin, isChatMode } = body

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: topic' },
        { status: 400 }
      )
    }

    // DEBUG: Check if API keys are loaded
    console.log('DEBUG: GEMINI_API_KEY exists?', !!process.env.GEMINI_API_KEY);
    console.log('DEBUG: NEXT_PUBLIC_GEMINI_API_KEY exists?', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    
    // Use either GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (apiKey) {
      console.log('DEBUG: Using API key, length:', apiKey.length);
      
      try {
        let prompt = ''
        
        if (isChatMode) {
          // CHAT MODE: Free-form chatbot - answer ANYTHING like normal Gemini
          prompt = `The user asks: "${topic}"
          
          Provide a helpful, knowledgeable response as a general AI assistant.
          Answer naturally and conversationally.
          If it's an educational topic, provide insightful information.
          If it's a general question, answer appropriately.
          Be friendly, clear, and helpful.`
        } else {
          // LEARNING MODE: Structured learning plan ONLY
          const userLevel = level || 'beginner'
          prompt = `You are LearnMate AI, an educational assistant for UN SDG 4: Quality Education.
          
          Create a COMPREHENSIVE learning plan about: "${topic}"
          For student level: ${userLevel}
          
          This must be a DETAILED, STRUCTURED learning path with:
          1. Clear learning objectives and outcomes
          2. Prerequisites needed
          3. Step-by-step curriculum (4-6 weeks/modules)
          4. Practical projects and exercises for each step
          5. Key concepts explained in detail
          6. Common challenges and solutions
          7. Assessment methods
          8. Recommended resources (books, courses, videos - with links if possible)
          9. Timeline and milestones
          10. Real-world applications
          
          Format in beautiful markdown with emojis, headers, bullet points, and motivational elements.
          Make it actionable, inspiring, and tailored for ${userLevel} level.
          
          IMPORTANT: This is ONLY for creating learning plans, not for answering general questions.`
        }

        console.log('DEBUG: Calling Gemini API with prompt length:', prompt.length);
        
        // UPDATED: Using Gemini 2.5 Flash (stable model)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
              temperature: isChatMode ? 0.9 : 0.7, // More creative for chat
              maxOutputTokens: isChatMode ? 1200 : 2500, // More detailed for learning plans
              topP: 0.95,
              topK: 50,
            }
          })
        })

        console.log('DEBUG: Gemini API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('DEBUG: Gemini API error:', errorText);
          throw new Error(`Gemini API error ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('DEBUG: Gemini API success, data received');
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const aiResponse = data.candidates[0].content.parts[0].text
          console.log('DEBUG: AI response generated, length:', aiResponse.length);
          
          return NextResponse.json({
            success: true,
            response: aiResponse,
            topic,
            level: level || 'general',
            timestamp: new Date().toISOString(),
            note: isChatMode ? 'AI Chat Response' : 'AI Learning Plan',
            isAdmin: isAdmin || false,
            mode: isChatMode ? 'chat' : 'learning'
          })
        } else {
          console.error('DEBUG: Gemini returned empty response:', data);
          throw new Error('Gemini returned empty response')
        }
      } catch (apiError: any) {
        console.error('DEBUG: Gemini API failed:', apiError.message)
        
        // Fallback responses
        const fallbackResponse = isChatMode
          ? `I understand you're asking about "${topic}". I'd love to help with that! While the AI service is currently unavailable, here's what I suggest: For general questions, try searching online. For learning topics, use the Learning Assistant mode for structured guidance.`
          : `# Learning Plan: ${topic}\n\n## For ${level || 'beginner'} Level\n\nWhile the AI learning plan generator is temporarily unavailable, here's a basic framework:\n\n### 1. Start with Fundamentals\nLearn basic concepts and terminology\n\n### 2. Practice Core Skills\nWork through beginner exercises\n\n### 3. Build Projects\nApply knowledge to real scenarios\n\n### 4. Advanced Topics\nExplore more complex aspects\n\n### 5. Community & Resources\nJoin forums and find learning materials\n\n*Tip: Break down "${topic}" into smaller chunks and learn systematically.*`
        
        return NextResponse.json({
          success: true,
          response: fallbackResponse,
          topic,
          level: level || 'general',
          timestamp: new Date().toISOString(),
          note: 'Fallback response (AI service unavailable)',
          isAdmin: isAdmin || false,
          mode: isChatMode ? 'chat' : 'learning'
        })
      }
    } else {
      // No API key found
      console.error('DEBUG: No API key found in environment variables');
      console.error('DEBUG: Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('GENINI')));
      
      return NextResponse.json({
        success: false,
        error: 'AI service not configured',
        response: isChatMode 
          ? `I'd love to chat with you about "${topic}"! Please add a Gemini API key to enable AI conversations.`
          : `# Learning Plan Setup Required\n\nTo generate AI-powered learning plans for "${topic}", please add your Gemini API key to the environment variables.\n\nGet a free key from: https://makersuite.google.com/app/apikey`,
        note: 'Add GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY to .env.local'
      }, { status: 503 })
    }

  } catch (error: any) {
    console.error('DEBUG: API route error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      response: `# Oops! Something went wrong.\n\nWe couldn't process your request. Please try again in a moment.\n\nError: ${error.message}`,
      note: 'Server error'
    }, { status: 500 })
  }
}