import { Eye, GripVertical, Target } from 'lucide-react'

const steps = [
  { icon: Eye, title: 'Read the challenge', desc: 'A category is revealed — rank items by the given metric' },
  { icon: GripVertical, title: 'Drag to rank', desc: 'Reorder items from first to last by dragging' },
  { icon: Target, title: 'Submit & score', desc: 'See how close you were and get your score out of 100' },
]

export function HowToPlay() {
  return (
    <div className="space-y-3">
      <p className="text-neutral-400 text-xs font-semibold uppercase tracking-widest text-center">How to play</p>
      <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="flex items-start gap-4 px-5 py-4"
              style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}
            >
              <Icon size={14} className="text-neutral-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-800 text-sm font-semibold text-balance">{step.title}</p>
                <p className="text-neutral-400 text-xs leading-relaxed mt-0.5 text-pretty">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
