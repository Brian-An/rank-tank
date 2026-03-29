import { generateExplanations } from '@/lib/openai'
import type { Category } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { category } = (await request.json()) as { category: Category }

    if (!category?.id || !Array.isArray(category?.items)) {
      return Response.json({ explanations: {} }, { status: 400 })
    }

    const explanations = await generateExplanations(category)
    return Response.json({ explanations: explanations ?? {} })
  } catch {
    return Response.json({ explanations: {} })
  }
}
