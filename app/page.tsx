import { LandingHero } from '@/components/LandingHero'
import { HowToPlay } from '@/components/HowToPlay'
import { ThemeSelector } from '@/components/ThemeSelector'

export default function HomePage() {
  return (
    <main className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-8">
        <LandingHero />
        <ThemeSelector />
        <HowToPlay />

        {/* Footer */}
        <p className="text-center text-neutral-300 text-xs pb-4">
          Built with Next.js · Data sourced from public records
        </p>
      </div>
    </main>
  )
}
