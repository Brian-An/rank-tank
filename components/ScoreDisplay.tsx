'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ScoreDisplay({ score, perfect }: { score: number; perfect: boolean }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 900
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  return (
    <div className="text-center">
      <div
        className={cn(
          'text-7xl sm:text-8xl font-black tabular-nums tracking-tight',
          score >= 80 ? 'text-yellow-400' : score >= 50 ? 'text-orange-400' : 'text-red-400',
        )}
      >
        {displayed}
      </div>
      <div className="text-white/40 text-base mt-1">out of 100</div>
      {perfect && (
        <div className="text-yellow-400 font-bold mt-2 text-sm tracking-widest uppercase animate-pulse">
          Perfect Round!
        </div>
      )}
    </div>
  )
}
