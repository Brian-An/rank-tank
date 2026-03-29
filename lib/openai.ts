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

export async function generateCustomRound(userPrompt: string): Promise<Category | null> {
  const openai = getClient()
  if (!openai) return null

  const prompt = `A user wants a ranking challenge: "${userPrompt}"
Create a trivia ranking game based on their idea. Use real-world data.
Return ONLY valid JSON in this exact structure:
{
  "id": "unique-kebab-id",
  "title": "Rank these [items] from [most] to [least] [unit]",
  "theme": "tech",
  "difficulty": "medium",
  "unit": "[unit label]",
  "source": "[data source]",
  "items": [
    {"id":"1","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"2","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"3","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"4","label":"[name]","value":[number],"display":"[formatted]"},
    {"id":"5","label":"[name]","value":[number],"display":"[formatted]"}
  ]
}
Items MUST be sorted: index 0 = highest value. All values must be distinct. Use a valid theme from: tech, music, geography, sports, business, science, movies.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate ranking challenges for a trivia game. Return valid JSON only. No markdown, no prose.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    const text = completion.choices[0].message.content?.trim() ?? ''
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

export async function generateExplanations(category: Category): Promise<Record<string, string> | null> {
  const openai = getClient()
  if (!openai) return null

  const itemList = category.items
    .map((it, i) => `id="${it.id}" rank ${i + 1}: ${it.label} — ${it.display} ${category.unit}`)
    .join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You write concise, factual one-sentence explanations for trivia game items. Return valid JSON only. No markdown.',
        },
        {
          role: 'user',
          content: `For the challenge "${category.title}" (measuring ${category.unit}), explain in ONE sentence why each item ranks where it does. Be specific about the value.\nItems:\n${itemList}\n\nReturn ONLY valid JSON: {"<id>": "<one sentence>", ...}\nNo emojis. No hedging. Start each sentence with the item name.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.6,
    })

    const text = completion.choices[0].message.content?.trim() ?? ''
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(json) as Record<string, string>
  } catch {
    return null
  }
}

export async function generateHint(category: Category, playerOrder: string[]): Promise<string | null> {
  const openai = getClient()
  if (!openai) return null

  const correctOrder = category.items.map((i) => i.label).join(', ')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You give helpful hints for a ranking trivia game. One short sentence only. Never reveal values or the full answer.',
        },
        {
          role: 'user',
          content: `Challenge: "${category.title}"\nPlayer's current order (top to bottom): ${playerOrder.join(', ')}\nCorrect order: ${correctOrder}\n\nIdentify the single item most out-of-position. Give ONE short hint like "Move [item] higher" or "Move [item] lower". No values, no full answer.`,
        },
      ],
      max_tokens: 60,
      temperature: 0.7,
    })
    return completion.choices[0].message.content?.trim() ?? null
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
