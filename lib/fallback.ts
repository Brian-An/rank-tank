export function getFallbackCommentary(score: number, title: string): string {
  if (score === 100)
    return `Perfect score on "${title}"! You nailed every single ranking — an absolute legend.`
  if (score >= 80)
    return `${score}/100 on "${title}" — impressive! You had a great read on most of them, with just a couple of close calls.`
  if (score >= 60)
    return `${score}/100 on "${title}". Solid effort! Some tricky ones in there, but you held your own.`
  if (score >= 40)
    return `${score}/100 on "${title}". Halfway there! Some of those rankings go against your intuition — that's what makes it fun.`
  return `${score}/100 on "${title}". Tough category! The data had some surprises — now you know for next time.`
}
