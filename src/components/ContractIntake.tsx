'use client'

import { useState, useRef } from 'react'

interface ContractIntakeProps {
  onContinue: (contractText: string, email: string) => void
}

type Mode = 'paste' | 'upload'

const MIN_LENGTH = 200

export default function ContractIntake({ onContinue }: ContractIntakeProps) {
  const [mode, setMode] = useState<Mode>('paste')
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setExtractionError(null)
    setExtracting(true)
    setFileName(file.name)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()

      if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
          fullText += pageText + '\n\n'
        }
        setText(fullText.trim())
      } else if (ext === 'docx') {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const { value } = await mammoth.extractRawText({ arrayBuffer })
        setText(value.trim())
      } else {
        setExtractionError('Unsupported file type. Please upload a PDF or DOCX, or paste your contract text instead.')
      }
    } catch (err) {
      console.error('[ContractIntake] extraction error:', err)
      setExtractionError(
        'We couldn’t read that file. If your upload returns poor results, try pasting the text directly.'
      )
    } finally {
      setExtracting(false)
    }
  }

  const trimmedLength = text.trim().length
  const canContinue = trimmedLength >= MIN_LENGTH && !extracting

  return (
    <div>
      <div className="mb-6 max-w-sm mx-auto">
        <label htmlFor="intake-email" className="block text-sm font-medium text-brand-text mb-1">
          Your email (optional)
        </label>
        <input
          id="intake-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors"
        />
        <p className="text-xs text-gray-500 mt-1">We&apos;ll send you a copy of your results.</p>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            mode === 'paste'
              ? 'bg-brand-accent text-white'
              : 'bg-white border border-gray-300 text-brand-text hover:border-brand-accent'
          }`}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            mode === 'upload'
              ? 'bg-brand-accent text-white'
              : 'bg-white border border-gray-300 text-brand-text hover:border-brand-accent'
          }`}
        >
          Upload PDF or DOCX
        </button>
      </div>

      {mode === 'paste' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your contract text here — MSA, SOW, or both."
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors resize-y"
        />
      ) : (
        <div className="border border-dashed border-gray-300 rounded p-8 text-center bg-white">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity"
          >
            Choose file
          </button>
          <p className="text-xs text-gray-500 mt-3">PDF or DOCX. Text-based files only — scanned images won&apos;t extract well.</p>

          {fileName && !extracting && !extractionError && (
            <p className="text-sm text-brand-text mt-4 font-medium">
              ✓ {fileName} — {trimmedLength.toLocaleString()} characters extracted
            </p>
          )}
          {extracting && <p className="text-sm text-gray-500 mt-4">Extracting text…</p>}
          {extractionError && (
            <p className="text-sm text-red-600 mt-4">{extractionError}</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        Nothing is stored until you choose to save your results. This isn&apos;t legal advice — it&apos;s a
        commercial fairness check from someone who&apos;s been on the wrong end of a bad one.
      </p>

      <div className="text-center mt-6">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(text.trim(), email.trim())}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
        {trimmedLength > 0 && trimmedLength < MIN_LENGTH && (
          <p className="text-xs text-gray-500 mt-2">
            That looks too short to evaluate meaningfully — add more of the contract text.
          </p>
        )}
      </div>
    </div>
  )
}
