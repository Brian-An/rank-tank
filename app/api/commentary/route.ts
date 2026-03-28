import { generateCommentary } from '@/lib/openai'
import { getFallbackCommentary } from '@/lib/fallback'

export async function POST(request: Request) {
  try {
    const { score, title, playerOrder, correctOrder } = (await request.json()) as {
      score: number
      title: string
      playerOrder: string[]
      correctOrder: string[]
    }

    const aiText = await generateCommentary(score, title, playerOrder, correctOrder)
    const text = aiText ?? getFallbackCommentary(score, title)

    return Response.json({ text, isAI: !!aiText })
  } catch {
    return Response.json({ error: 'Failed to generate commentary' }, { status: 500 })
  }
}
