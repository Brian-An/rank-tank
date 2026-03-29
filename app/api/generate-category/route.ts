import { generateCustomRound } from '@/lib/openai'
import { shuffle } from '@/lib/seed'

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt: string }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const safePrompt = prompt.trim().slice(0, 300)
    const category = await generateCustomRound(safePrompt)

    if (!category) {
      return Response.json({ error: "Couldn't generate that challenge. Try a different prompt." }, { status: 500 })
    }

    const shuffledItems = shuffle(category.items, safePrompt)
    return Response.json({ category, shuffledItems })
  } catch {
    return Response.json({ error: 'Failed to generate category' }, { status: 500 })
  }
}
