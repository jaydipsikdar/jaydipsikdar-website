'use client'

import { useEffect, useState } from 'react'
import { Heart, Link2, Check, MessageCircle } from 'lucide-react'
import { LinkedinIcon, XIcon } from './BrandIcons'

// Per-article engagement: a like (persisted in Supabase, throttled to one per
// browser), quick share to X / LinkedIn / copy-link, and a "Discuss on
// LinkedIn" call to action that stands in for on-site comments - routing
// conversation to where it compounds reach instead of a moderation queue.

type Props = {
  slug: string
  title: string
  url: string
}

function likedKey(slug: string): string {
  return `jss_liked_${slug}`
}

export default function EngagementBar({ slug, title, url }: Props) {
  const [likes, setLikes] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      setLiked(window.localStorage.getItem(likedKey(slug)) === 'true')
    } catch {
      // ignore
    }
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.likes === 'number') setLikes(d.likes)
      })
      .catch(() => {})
  }, [slug])

  async function handleLike() {
    if (liked) return
    setLiked(true)
    setLikes((n) => (n ?? 0) + 1)
    try {
      window.localStorage.setItem(likedKey(slug), 'true')
    } catch {
      // ignore
    }
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        const d = await res.json()
        if (typeof d.likes === 'number') setLikes(d.likes)
      }
    } catch {
      // Optimistic count stands even if the write fails.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  const shareText = encodeURIComponent(title)
  const shareUrl = encodeURIComponent(url)
  const xHref = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`

  const iconBtn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-500 transition-colors hover:text-primary hover:border-primary/40'

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={liked}
        aria-label={liked ? 'You liked this' : 'Like this article'}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
          liked
            ? 'border-primary/40 text-primary'
            : 'border-hairline text-ink-700 hover:border-primary/40 hover:text-primary'
        }`}
      >
        <Heart size={16} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
        <span>{liked ? 'Liked' : 'Like'}</span>
        {likes && likes > 0 ? <span className="text-ink-500">· {likes}</span> : null}
      </button>

      {/* Share */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-ink-500 mr-1">Share</span>
        <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={iconBtn}>
          <XIcon className="h-4 w-4" />
        </a>
        <a
          href={linkedInHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={iconBtn}
        >
          <LinkedinIcon className="h-4 w-4" />
        </a>
        <button onClick={copyLink} aria-label="Copy link" className={iconBtn}>
          {copied ? <Check size={16} strokeWidth={1.75} /> : <Link2 size={16} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Discuss - routes conversation to LinkedIn instead of on-site comments */}
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-ink-700 transition-colors hover:text-primary"
      >
        <MessageCircle size={16} strokeWidth={1.75} />
        Discuss on LinkedIn
      </a>
    </div>
  )
}
