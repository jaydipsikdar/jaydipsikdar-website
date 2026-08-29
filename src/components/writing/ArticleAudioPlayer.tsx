'use client'

import { useEffect, useRef, useState } from 'react'
import { Headphones, Play, Pause, RotateCcw } from 'lucide-react'
import { toSpeechChunks } from '@/lib/articleSpeech'

// "Listen to this article" player built on the browser's free Web Speech API.
// It reads the article aloud in the visitor's own device voice, so there is no
// cost and no audio file to host. Text is spoken in sentence-sized chunks,
// which keeps long articles from getting cut off and drives the progress bar.
// The whole component swaps cleanly for a pre-generated MP3 <audio> player if
// we later invest in a premium voice.

type Status = 'idle' | 'playing' | 'paused'

export default function ArticleAudioPlayer({ text }: { text: string }) {
  const [supported, setSupported] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)

  const chunksRef = useRef<string[]>([])
  const indexRef = useRef(0)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const statusRef = useRef<Status>('idle')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)
    chunksRef.current = toSpeechChunks(text)

    // Prefer a male English voice. The Web Speech API exposes no gender field,
    // so we match on the male voice names each platform ships, best-quality
    // first (Alex/Daniel on Apple, David/Mark on Windows, the Google male voice
    // on Chrome), then fall back to any voice tagged "Male", then any voice.
    const MALE_VOICE_NAMES = [
      'alex', 'daniel', 'aaron', 'reed', 'nathan', 'tom', 'arthur', 'gordon',
      'oliver', 'rishi', 'fred', 'david', 'mark', 'guy', 'christopher', 'eric',
      'roger', 'ryan', 'google uk english male',
    ]
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'))
      const pool = en.length ? en : voices

      const byName = MALE_VOICE_NAMES.map((name) =>
        pool.find((v) => v.name.toLowerCase().includes(name))
      ).find(Boolean)

      const byLabel = pool.find((v) => {
        const n = v.name.toLowerCase()
        return n.includes('male') && !n.includes('female')
      })

      voiceRef.current = byName ?? byLabel ?? pool.find((v) => v.default) ?? pool[0] ?? null
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [text])

  // Chrome silently pauses long speech after ~15s. While we intend to be
  // playing, nudge it back if the engine has stalled.
  useEffect(() => {
    if (status !== 'playing') return
    const iv = window.setInterval(() => {
      if (statusRef.current === 'playing' && window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }, 8000)
    return () => window.clearInterval(iv)
  }, [status])

  function speakFrom(i: number) {
    const chunks = chunksRef.current
    if (i >= chunks.length) {
      setStatus('idle')
      statusRef.current = 'idle'
      setProgress(1)
      indexRef.current = 0
      window.setTimeout(() => setProgress(0), 1200)
      return
    }
    indexRef.current = i
    const u = new SpeechSynthesisUtterance(chunks[i])
    if (voiceRef.current) u.voice = voiceRef.current
    u.rate = 1
    u.pitch = 1
    u.onend = () => {
      setProgress((i + 1) / chunks.length)
      if (statusRef.current === 'playing') speakFrom(i + 1)
    }
    u.onerror = () => {
      if (statusRef.current === 'playing') speakFrom(i + 1)
    }
    window.speechSynthesis.speak(u)
  }

  function handlePlay() {
    if (status === 'paused') {
      window.speechSynthesis.resume()
      setStatus('playing')
      statusRef.current = 'playing'
      return
    }
    window.speechSynthesis.cancel()
    setStatus('playing')
    statusRef.current = 'playing'
    speakFrom(indexRef.current || 0)
  }

  function handlePause() {
    window.speechSynthesis.pause()
    setStatus('paused')
    statusRef.current = 'paused'
  }

  function handleReset() {
    window.speechSynthesis.cancel()
    indexRef.current = 0
    setProgress(0)
    setStatus('idle')
    statusRef.current = 'idle'
  }

  // Older browsers without speech support simply don't see the player.
  if (!supported) return null

  const pct = Math.round(progress * 100)

  return (
    <div className="my-8 flex items-center gap-4 rounded-lg border border-hairline bg-surface-soft px-4 py-3">
      <button
        onClick={status === 'playing' ? handlePause : handlePlay}
        aria-label={status === 'playing' ? 'Pause' : 'Listen to this article'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
      >
        {status === 'playing' ? (
          <Pause size={18} strokeWidth={1.75} fill="currentColor" />
        ) : (
          <Play size={18} strokeWidth={1.75} fill="currentColor" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
            <Headphones size={15} strokeWidth={1.75} />
            {status === 'idle' ? 'Listen to this article' : status === 'paused' ? 'Paused' : 'Playing'}
          </span>
          {status !== 'idle' && (
            <button
              onClick={handleReset}
              aria-label="Stop and reset"
              className="text-ink-500 transition-colors hover:text-primary"
            >
              <RotateCcw size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
