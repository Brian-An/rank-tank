export function HowToPlay() {
  const steps = [
    { icon: '👀', title: 'Read the challenge', desc: 'A category is revealed — like "Rank by Spotify streams"' },
    { icon: '✋', title: 'Drag to rank', desc: 'Reorder the items from first to last by dragging' },
    { icon: '🎯', title: 'Submit & score', desc: 'See how close you were and get your score out of 100' },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest text-center">How to play</h2>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step) => (
          <div key={step.icon} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-1.5">
            <div className="text-2xl">{step.icon}</div>
            <div className="text-white text-xs font-semibold">{step.title}</div>
            <div className="text-white/40 text-xs leading-relaxed">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
