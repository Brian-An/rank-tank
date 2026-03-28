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

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return Response.json({ error: 'Invalid input' }, { status: 400 })
    }
    const safeTitle = String(title).slice(0, 200)
    const safePlayerOrder = Array.isArray(playerOrder) ? playerOrder.slice(0, 10).map((s) => String(s).slice(0, 100)) : []
    const safeCorrectOrder = Array.isArray(correctOrder) ? correctOrder.slice(0, 10).map((s) => String(s).slice(0, 100)) : []

    const aiText = await generateCommentary(score, safeTitle, safePlayerOrder, safeCorrectOrder)
    const text = aiText ?? getFallbackCommentary(score, safeTitle)

    return Response.json({ text, isAI: !!aiText })
  } catch {
    return Response.json({ error: 'Failed to generate commentary' }, { status: 500 })
  }
}
