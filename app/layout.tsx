import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rank Tank — Can you rank them right?',
  description: 'A game-show-style ranking game. Drag items into the correct order and see how you score.',
  openGraph: {
    title: 'Rank Tank',
    description: 'Can you rank them right?',
    siteName: 'Rank Tank',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  )
}
