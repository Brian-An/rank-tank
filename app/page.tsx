import { LandingHero } from '@/components/LandingHero'
import { HowToPlay } from '@/components/HowToPlay'
import { ThemeSelector } from '@/components/ThemeSelector'
import { CustomCategoryInput } from '@/components/CustomCategoryInput'

export default function HomePage() {
  return (
    <main className="min-h-dvh py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-8">
        <LandingHero />
        <ThemeSelector />
        <CustomCategoryInput />
        <HowToPlay />

        <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-neutral-300 text-xs pb-4">
          <span>© 2026 Rank Tank</span>
          <span aria-hidden className="text-neutral-500">
            |
          </span>
          <a
            href="https://x.com/imbrianan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Brian on X"
            className="inline-flex text-neutral-300 hover:text-black transition-colors"
          >
            x
          </a>
          <a
            href="https://linkedin.com/in/brian-an06"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Brian on LinkedIn"
            className="inline-flex text-neutral-300 hover:text-black transition-colors"
          >
            linkedin
          </a>
        </footer>
      </div>
    </main>
  )
}
