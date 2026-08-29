// Turns an article's raw MDX into clean, speakable text for the "Listen"
// player. Reads the title, the key takeaways, the prose, and the FAQ; skips
// the inline newsletter promo and strips markdown/JSX so the voice reads words,
// not syntax.

export function buildSpeechText(title: string, raw: string): string {
  let t = raw

  // Drop the inline promo entirely.
  t = t.replace(/<NewsletterPromo\s*\/?>/g, ' ')

  // Keep the takeaways, announced as a section.
  t = t.replace(/<KeyTakeaways>/g, ' Key takeaways. ').replace(/<\/KeyTakeaways>/g, ' ')

  // FAQ: read the question, then its answer.
  t = t.replace(/<FAQ\s+question="([^"]+)">([\s\S]*?)<\/FAQ>/g, (_m, q, a) => ` ${q}. ${a} `)

  // Any remaining JSX/HTML tags.
  t = t.replace(/<\/?[A-Za-z][^>]*>/g, ' ')

  // Links and images: keep the visible text, drop the URL.
  t = t.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Markdown syntax: headings, blockquotes, list markers, emphasis, code.
  t = t.replace(/^#{1,6}\s+/gm, '')
  t = t.replace(/^>\s?/gm, '')
  t = t.replace(/^\s*[-*]\s+/gm, '')
  t = t.replace(/(\*\*|\*|__|_)/g, '')
  t = t.replace(/`+/g, '')

  // Collapse whitespace.
  t = t.replace(/\s+/g, ' ').trim()

  return `${title}. ${t}`
}

// Splits speakable text into sentence-ish chunks. Chunked playback keeps the
// browser's speech engine from cutting off on long text and gives us progress.
export function toSpeechChunks(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+(?:["')\]]+)?|\S[^.!?]*$/g)
  return (parts ?? [text]).map((s) => s.trim()).filter(Boolean)
}
