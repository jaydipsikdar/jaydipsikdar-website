'use client'

import { useState, useRef } from 'react'
import Button from './ui/Button'

interface ContractIntakeProps {
  onContinue: (contractText: string) => void
}

type Mode = 'paste' | 'upload'

const MIN_LENGTH = 200

export default function ContractIntake({ onContinue }: ContractIntakeProps) {
  const [mode, setMode] = useState<Mode>('paste')
  const [text, setText] = useState('')
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
      <div className="flex gap-2 mb-4 justify-center">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`rounded-pill px-4 py-2 text-sm transition-colors ${
            mode === 'paste'
              ? 'bg-primary text-white'
              : 'bg-white border border-hairline-input text-ink-700 hover:border-primary'
          }`}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`rounded-pill px-4 py-2 text-sm transition-colors ${
            mode === 'upload'
              ? 'bg-primary text-white'
              : 'bg-white border border-hairline-input text-ink-700 hover:border-primary'
          }`}
        >
          Upload PDF or DOCX
        </button>
      </div>

      {mode === 'paste' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your contract text here, MSA, SOW, or both."
          rows={12}
          className="w-full rounded-sm border border-hairline-input bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-500 transition-colors focus:border-primary focus:outline-none resize-y"
        />
      ) : (
        <div className="rounded-md border border-dashed border-hairline-input p-8 text-center bg-white">
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
          <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
            Choose file
          </Button>
          <p className="text-xs text-ink-500 mt-3">PDF or DOCX. Text-based files only, scanned images won&apos;t extract well.</p>

          {fileName && !extracting && !extractionError && (
            <p className="text-sm text-ink-900 mt-4 font-normal">
              {fileName}: {trimmedLength.toLocaleString()} characters extracted
            </p>
          )}
          {extracting && <p className="text-sm text-ink-500 mt-4">Extracting text...</p>}
          {extractionError && (
            <p className="text-sm text-accent-rose mt-4">{extractionError}</p>
          )}
        </div>
      )}

      <p className="text-xs text-ink-500 mt-3 text-center">
        Nothing is stored until you choose to save your results. This isn&apos;t legal advice, it&apos;s a
        commercial fairness check from someone who&apos;s been on the wrong end of a bad one.
      </p>

      <div className="text-center mt-6">
        <Button type="button" disabled={!canContinue} onClick={() => onContinue(text.trim())}>
          Continue
        </Button>
        {trimmedLength > 0 && trimmedLength < MIN_LENGTH && (
          <p className="text-xs text-ink-500 mt-2">
            That looks too short to evaluate meaningfully, add more of the contract text.
          </p>
        )}
      </div>
    </div>
  )
}
