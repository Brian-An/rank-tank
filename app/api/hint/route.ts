import { generateHint } from '@/lib/openai'
import type { Category } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { category, playerOrder } = (await request.json()) as {
      category: Category
      playerOrder: string[]
    }

    if (!category?.id || !Array.isArray(playerOrder)) {
      return Response.json({ hint: 'Try looking at the middle items.' })
    }

    const hint = await generateHint(category, playerOrder)
    return Response.json({ hint: hint ?? 'Try looking at the middle items.' })
  } catch {
    return Response.json({ hint: 'Try looking at the middle items.' })
  }
}
