'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GameClient } from './GameClient'
import type { Category, RankItem } from '@/lib/types'

interface StoredCustomRound {
  category: Category
  shuffledItems: RankItem[]
}

export function CustomGameWrapper({ customId }: { customId: string }) {
  const router = useRouter()
  const [data, setData] = useState<StoredCustomRound | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('custom:' + customId)
    if (!stored) {
      router.replace('/')
      return
    }
    try {
      setData(JSON.parse(stored) as StoredCustomRound)
    } catch {
      router.replace('/')
    }
  }, [customId, router])

  if (!data) return null

  return <GameClient category={data.category} shuffledItems={data.shuffledItems} isDaily={false} isCustom />
}
