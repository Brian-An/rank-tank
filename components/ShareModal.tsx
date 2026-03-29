'use client'
import { useRef, useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { RankItem } from '@/lib/types'

interface Props {
  score: number
  title: string
  playerOrder: RankItem[]
  correctOrder: string[]
}

function buildShareText(score: number, title: string, playerOrder: RankItem[], correctOrder: string[]) {
  const rows = playerOrder
    .map((item, i) => {
      const isCorrect = correctOrder[i] === item.id
      return `${isCorrect ? '✅' : '❌'} ${item.label}`
    })
    .join('\n')
  return `🎮 Rank Tank\n\n${title}\nScore: ${score}/100\n\n${rows}\n\nhttps://rank-tank-six.vercel.app/`
}

export function ShareModal({ score, title, playerOrder, correctOrder }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)

  const text = buildShareText(score, title, playerOrder, correctOrder)
  const encodedText = encodeURIComponent(text)

  function open() {
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all text-sm"
        style={{ borderColor: 'var(--border)' }}
      >
        Share result
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) close() }}
        className="m-auto w-full max-w-sm rounded-2xl border bg-white p-0 shadow-xl backdrop:bg-neutral-900/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:duration-200"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-neutral-900 text-sm">Share your result</p>
          <button
            onClick={close}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="px-5 py-4">
          <pre className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed font-sans rounded-xl p-4 border text-pretty" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
            {text}
          </pre>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-neutral-600 text-sm font-medium hover:border-neutral-400 hover:text-neutral-900 transition-all"
              style={{ borderColor: 'var(--border)' }}
            >
              <XIcon />
              X / Twitter
            </a>
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Frank-tank-six.vercel.app%2F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-neutral-600 text-sm font-medium hover:border-neutral-400 hover:text-neutral-900 transition-all"
              style={{ borderColor: 'var(--border)' }}
            >
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>
      </dialog>
    </>
  )
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden>
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
