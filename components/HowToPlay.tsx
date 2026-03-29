export function HowToPlay() {
  const steps = [
    { n: '1', title: 'Read the challenge', desc: 'A category is revealed — rank items by the given metric' },
    { n: '2', title: 'Drag to rank', desc: 'Reorder items from first to last by dragging' },
    { n: '3', title: 'Submit & score', desc: 'See how close you were and get your score out of 100' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest text-center">How to play</p>
      <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
        {steps.map((step) => (
          <div key={step.n} className="flex items-start gap-4 px-5 py-4">
            <span className="text-xs font-mono text-neutral-300 mt-0.5 w-4 shrink-0">{step.n}</span>
            <div>
              <p className="text-neutral-800 text-sm font-semibold">{step.title}</p>
              <p className="text-neutral-400 text-xs leading-relaxed mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
