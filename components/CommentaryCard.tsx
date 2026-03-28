export function CommentaryCard({ text, isAI }: { text: string; isAI: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
      <p className="text-white/80 text-base leading-relaxed italic">"{text}"</p>
      {isAI && (
        <p className="text-white/30 text-xs mt-3">AI commentary</p>
      )}
    </div>
  )
}
