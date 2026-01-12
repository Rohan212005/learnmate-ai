import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, level, userId, isAdmin } = body

    if (!topic || !level) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: topic and level' },
        { status: 400 }
      )
    }

    // Fallback response (works without OpenAI API key)
    const fallbackResponse = `# 🎯 Learning Plan: ${topic}

## 📊 For ${level.toUpperCase()} Level Learner

### 🧠 Introduction to ${topic}
${topic} is a fundamental concept that opens doors to deeper understanding. Let's break it down step by step!

### 🎯 Key Concepts to Master
1. **Core Foundation** - The basic principle behind ${topic}
2. **Practical Application** - How ${topic} is used in real scenarios
3. **Common Terminology** - Essential terms you need to know

### 📚 Learning Pathway
**Step 1:** Start with basic definitions and examples  
**Step 2:** Practice with simple exercises  
**Step 3:** Apply knowledge to mini-projects  
**Step 4:** Explore advanced variations

### 💡 Practical Examples
**Example 1:** [Simple analogy related to ${topic}]  
**Example 2:** [Real-world application case]

### 🔍 Self-Assessment Questions
1. **Q:** What is the primary purpose of ${topic}?  
   **A:** [Basic explanation suitable for ${level} level]

2. **Q:** How would you explain ${topic} to someone new?  
   **A:** [Simple, clear explanation]

### 🚀 Next Steps & Resources
- **Recommended Resource:** Online tutorial or book
- **Practice Exercise:** Try building [simple project]
- **Community:** Join related forums or study groups

### 🌟 Remember
"Learning is a journey, not a destination." Take your time with ${topic} and celebrate small wins!

---

*This learning plan supports **SDG 4: Quality Education** - Ensuring inclusive and equitable quality education for all.*`

    // Try to use OpenAI if available
    let finalResponse = fallbackResponse
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'skip_for_now') {
      try {
        // Dynamic import to avoid edge issues
        const { default: OpenAI } = await import('openai')
        
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        })

        const prompt = `Create a learning plan about ${topic} for a ${level} level student. Include explanations, examples, and exercises. Format in markdown with clear sections.`
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are LearnMate AI, an educational assistant creating learning content for SDG 4: Quality Education. Be encouraging and pedagogical."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        })

        if (completion.choices[0]?.message?.content) {
          finalResponse = completion.choices[0].message.content
        }
      } catch (apiError) {
        console.log('Using fallback response:', apiError)
        // Continue with fallback
      }
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      topic,
      level,
      timestamp: new Date().toISOString(),
      note: process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'skip_for_now' 
        ? 'AI-generated response' 
        : 'Fallback response (add OpenAI key for AI)',
      isAdmin: isAdmin || false
    })

  } catch (error: any) {
    console.error('API error:', error)
    
    // Get topic and level from the error context if available
    let topic = 'the topic'
    let level = 'beginner'
    
    try {
      const body = await request.clone().json()
      topic = body.topic || topic
      level = body.level || level
    } catch (e) {
      // Use defaults
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      response: `# Learning Plan: ${topic}\n\nBasic introduction to ${topic} for ${level} level.\n\nError: ${error.message}`
    }, { status: 500 })
  }
}