import OpenAI from 'openai'
import type { Category, Theme, Difficulty } from './types'

let client: OpenAI | null = null

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

export async function generateRound(theme: Theme, difficulty: Difficulty): Promise<Category | null> {
  const openai = getClient()
  if (!openai) return null

  const difficultyNote = {
    easy: 'Use well-known items with large, obvious value differences.',
    medium: 'Mix famous and lesser-known items with moderate differences.',
    hard: 'Use surprising items where values are close or counterintuitive.',
  }[difficulty]

  const prompt = `Create a ranking challenge for a trivia game.
Theme: ${theme}
Difficulty: ${difficulty}. ${difficultyNote}
Return ONLY valid JSON in this exact structure:
{
  "id": "unique-kebab-id",
  "title": "Rank these [items] from [most] to [least] [unit]",
  "theme": "${theme}",
  "difficulty": "${difficulty}",
  "unit": "[unit label]",
  "items": [
    {"id":"1","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"2","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"3","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"4","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"5","label":"[name]","value":[number],"display":"[formatted]"}
  ],
  "source": "[data source]"
}
Items MUST be in correct order: index 0 = rank 1 (highest value). Use real-world data. All values must be distinct.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate ranking challenges for a trivia game. Return valid JSON only. No markdown, no prose.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const text = completion.choices[0].message.content?.trim() ?? ''
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const category = JSON.parse(json) as Category

    if (!category.id || !category.title || !Array.isArray(category.items) || category.items.length < 3) {
      return null
    }
    return category
  } catch {
    return null
  }
}

export async function generateCommentary(
  score: number,
  title: string,
  playerOrder: string[],
  correctOrder: string[],
): Promise<string | null> {
  const openai = getClient()
  if (!openai) return null

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a witty, enthusiastic game show host. Be specific about their performance. 2-3 sentences max. No emojis.',
        },
        {
          role: 'user',
          content: `Score: ${score}/100. Challenge: "${title}". Player ranked: ${playerOrder.join(' > ')}. Correct order: ${correctOrder.join(' > ')}.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.85,
    })
    return completion.choices[0].message.content?.trim() ?? null
  } catch {
    return null
  }
}
