'use client'
import { useRouter } from 'next/navigation'

export function LandingHero() {
  const router = useRouter()

  return (
    <div className="text-center space-y-6 py-8">
      {/* Logo */}
      <div className="space-y-2">
        <div className="text-6xl sm:text-7xl font-black tracking-tight">
          <span className="text-yellow-400">RANK</span>
          <span className="text-white"> TANK</span>
        </div>
        <p className="text-white/50 text-lg">Can you rank them right?</p>
      </div>

      {/* Daily challenge CTA */}
      <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/5 border border-yellow-400/20 rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-sm font-semibold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Daily Challenge
          </div>
          <p className="text-white/50 text-sm">Same challenge for everyone today</p>
        </div>
        <button
          onClick={() => router.push('/game?mode=daily')}
          className="w-full py-4 rounded-xl bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-300 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,197,66,0.3)]"
        >
          Play Today's Challenge
        </button>
      </div>
    </div>
  )
}
