'use client'
import { useRouter } from 'next/navigation'

export function LandingHero() {
  const router = useRouter()

  return (
    <div className="text-center space-y-6 py-8">
      {/* Logo */}
      <div className="space-y-2">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-balance">
          <span className="text-yellow-400">RANK</span>
          <span className="text-neutral-900"> TANK</span>
        </h1>
        <p className="text-neutral-400 text-lg text-pretty">Can you rank them right?</p>
      </div>

      {/* Daily challenge CTA */}
      <div className="bg-white border rounded-2xl p-6 space-y-4" style={{ borderColor: 'var(--border)' }}>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-neutral-700 text-sm font-semibold uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-yellow-400 motion-safe:animate-pulse" />
            Daily Challenge
          </div>
          <p className="text-neutral-400 text-sm text-pretty">Same challenge for everyone today</p>
        </div>
        <button
          onClick={() => router.push('/game?mode=daily')}
          className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 active:scale-95 transition-all"
        >
          Play Today's Challenge
        </button>
      </div>
    </div>
  )
}
