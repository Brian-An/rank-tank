export function CommentaryCard({ text, isAI }: { text: string; isAI: boolean }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-center">
      <p className="text-neutral-700 text-base leading-relaxed italic">"{text}"</p>
      {isAI && (
        <p className="text-neutral-400 text-xs mt-3">AI commentary</p>
      )}
    </div>
  )
}
