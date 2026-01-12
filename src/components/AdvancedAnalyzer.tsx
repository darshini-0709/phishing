import React, { useCallback, useMemo, useState } from 'react'
import { usePhishingAnalysis } from '../hooks/usePhishingAnalysis'
import PhishingAnalyzer from './PhishingAnalyzer'
import { Globe, Mail, MessageCircle, UploadCloud } from 'lucide-react'
import RiskScoreCard from './RiskScoreCard'
import toast from 'react-hot-toast'
import type { PhishingAnalysisRequest } from '../types/phishing.types'

type Tab = 'legacy' | 'url' | 'email' | 'message' | 'image'

const TabButton: React.FC<{ id: Tab; active: Tab; onClick: (t: Tab) => void; icon: React.ReactNode; label: string }> = ({ id, active, onClick, icon, label }) => (
  <button onClick={() => onClick(id)} className={`flex items-center gap-2 px-3 py-2 rounded ${active === id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
    <div className="w-4 h-4">{icon}</div>
    <div className="text-sm">{label}</div>
  </button>
)

export const AdvancedAnalyzer: React.FC = () => {
  const { loading, progress, result, runAnalysis } = usePhishingAnalysis()
  const [tab, setTab] = useState<Tab>('legacy')

  // URL
  const [urlInput, setUrlInput] = useState('')

  // live detections / indicators
  const [indicators, setIndicators] = useState<{ urls: string[]; emails: string[]; phones: string[]; urgent: string[]; credentialKeywords: string[]; impersonation: string[] } | null>(null)
  const [liveRisk, setLiveRisk] = useState<number>(0)

  // Email
  const [emailText, setEmailText] = useState('')
  const [sender, setSender] = useState('')

  // Message
  const [messageText, setMessageText] = useState('')

  // Images
  const [images, setImages] = useState<{ name: string; b64: string }[]>([])

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    const arr: { name: string; b64: string }[] = []
    for (const f of Array.from(files)) {
      try {
        const b = await f.arrayBuffer()
        const base64 = `data:${f.type};base64,${bufferToBase64(b)}`
        arr.push({ name: f.name, b64: base64 })
      } catch {
        toast.error(`Failed to read ${f.name}`)
      }
    }
    setImages((s) => [...s, ...arr])
  }, [])

  const bufferToBase64 = (buf: ArrayBuffer) => {
    let binary = ''
    const bytes = new Uint8Array(buf)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const dt = e.dataTransfer
    onFiles(dt.files)
  }, [onFiles])

  // Live detection heuristics (local, privacy-preserving)
  const detectLive = useCallback((text: string) => {
    const urlRe = /https?:\/\/[^\s)"'<>]+/g
    const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const phoneRe = /(?:\+\d{1,3}[ -]?)?(?:\(\d{2,4}\)|\d{2,4})[ -]?\d{3,4}[ -]?\d{3,4}/g
    const urgentWords = ['act now', 'urgent', 'immediately', 'verify', 'click here', 'important']
    const credWords = ['password', 'login', 'username', 'credentials', 'ssn', 'social security']

    const urls = Array.from(new Set((text.match(urlRe) || [])))
    const emails = Array.from(new Set((text.match(emailRe) || [])))
    const phones = Array.from(new Set((text.match(phoneRe) || [])))

    const lc = text.toLowerCase()
    const urgentDetected = urgentWords.filter((w) => lc.includes(w))
    const credentialDetected = credWords.filter((w) => lc.includes(w))

    // simple brand impersonation check (local heuristic)
    const brands = ['paypal', 'amazon', 'bank', 'microsoft', 'google']
    const impersonation = brands.filter((b) => lc.includes(b))

    setIndicators({ urls, emails, phones, urgent: urgentDetected, credentialKeywords: credentialDetected, impersonation })
    // compute simple heuristic risk score
    let score = 0
    // base
    score += 0.05
    score += Math.min(urls.length * 0.15, 0.45)
    score += Math.min(emails.length * 0.12, 0.36)
    score += Math.min(phones.length * 0.05, 0.1)
    if (urgentDetected.length) score += 0.18
    if (credentialDetected.length) score += 0.25
    if (impersonation.length) score += 0.18
    // clamp
    score = Math.max(0, Math.min(1, score))
    setLiveRisk(Number(score.toFixed(2)))
  }, [])

  // Masking / redaction for preview (hide emails, urls, phones, credit-card-like numbers)
  const maskedPreview = useCallback((text: string) => {
    if (!text) return ''
    let out = text
    out = out.replace(/[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}/g, '[REDACTED]') // card-like
    out = out.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    out = out.replace(/https?:\/\/[^\s)"'<>]+/g, '[REDACTED_URL]')
    out = out.replace(/(?:\+\d{1,3}[ -]?)?(?:\(\d{2,4}\)|\d{2,4})[ -]?\d{3,4}[ -]?\d{3,4}/g, '[REDACTED_PHONE]')
    return out
  }, [])

  const preparePayload = (): PhishingAnalysisRequest => {
    if (tab === 'url') {
      const urls = urlInput ? [urlInput] : []
      return { text: `URL analysis for ${urlInput}`, urls, images_b64: [] }
    }
    if (tab === 'email') {
      const text = `From: ${sender}\n\n${emailText}`
      const urls = extractUrls(emailText)
      return { text, urls, images_b64: images.map((i) => i.b64) }
    }
    if (tab === 'message') {
      const text = messageText
      const urls = extractUrls(messageText)
      return { text, urls, images_b64: [] }
    }
    if (tab === 'image') {
      return { text: 'Image analysis', urls: [], images_b64: images.map((i) => i.b64) }
    }
    // legacy
    return { text: emailText, urls: extractUrls(emailText), images_b64: images.map((i) => i.b64) }
  }

  const extractUrls = (input: string) => {
    const re = /https?:\/\/[^\s)"'<>]+/g
    const found = input.match(re) || []
    return found
  }

  const handleAnalyze = async () => {
    const payload = preparePayload()
    await runAnalysis(payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TabButton id="legacy" active={tab} onClick={setTab} icon={<UploadCloud />} label="Classic" />
        <TabButton id="url" active={tab} onClick={setTab} icon={<Globe />} label="URL" />
        <TabButton id="email" active={tab} onClick={setTab} icon={<Mail />} label="Email" />
        <TabButton id="message" active={tab} onClick={setTab} icon={<MessageCircle />} label="Message" />
        <TabButton id="image" active={tab} onClick={setTab} icon={<UploadCloud />} label="Image" />
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        {tab === 'legacy' && (
          <div>
            <div className="text-sm text-slate-300 mb-2">Legacy analyzer (email/text + attachments)</div>
            <PhishingAnalyzer />
          </div>
        )}

        {tab === 'url' && (
          <div className="space-y-3">
            <label className="text-sm text-slate-300">URL to analyze</label>
            <input value={urlInput} onChange={(e) => { setUrlInput(e.target.value); detectLive(e.target.value) }} placeholder="https://example.com/login" className="w-full p-2 rounded bg-slate-800 text-slate-100" />
            <div className="text-xs text-slate-400">Domain preview: {urlInput ? new URLSafe(urlInput) : '—'}</div>
            <div className="mt-2">
              <div className="text-xs text-slate-300 font-medium">Live Indicators</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {indicators?.urls?.length ? <span className="px-2 py-1 bg-amber-700 text-xs rounded">URLs: {indicators.urls.length}</span> : null}
                {indicators?.emails?.length ? <span className="px-2 py-1 bg-rose-700 text-xs rounded">Emails: {indicators.emails.length}</span> : null}
                {indicators?.phones?.length ? <span className="px-2 py-1 bg-sky-700 text-xs rounded">Phones: {indicators.phones.length}</span> : null}
                {indicators?.urgent?.length ? <span className="px-2 py-1 bg-red-600 text-xs rounded">Urgency: {indicators.urgent.join(', ')}</span> : null}
              </div>
              <div className="mt-3 text-xs text-slate-400">Masked preview:</div>
              <pre className="bg-slate-800 p-2 rounded text-xs mt-1 whitespace-pre-wrap">{maskedPreview(urlInput)}</pre>
            </div>
          </div>
        )}

        {tab === 'email' && (
          <div className="space-y-3">
            <label className="text-sm text-slate-300">Sender</label>
            <input value={sender} onChange={(e) => { setSender(e.target.value); detectLive(e.target.value) }} placeholder="sender@example.com" className="w-full p-2 rounded bg-slate-800 text-slate-100" />
            <label className="text-sm text-slate-300">Email content</label>
            <textarea value={emailText} onChange={(e) => { setEmailText(e.target.value); detectLive(e.target.value) }} rows={6} className="w-full p-2 rounded bg-slate-800 text-slate-100" />
            <div className="text-xs text-slate-400">Tip: include full headers for better impersonation detection.</div>
            <div className="mt-2">
              <div className="text-xs text-slate-300 font-medium">Live Indicators</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {indicators?.emails?.length ? <span className="px-2 py-1 bg-rose-700 text-xs rounded">Emails: {indicators.emails.length}</span> : null}
                {indicators?.urls?.length ? <span className="px-2 py-1 bg-amber-700 text-xs rounded">URLs: {indicators.urls.length}</span> : null}
                {indicators?.urgent?.length ? <span className="px-2 py-1 bg-red-600 text-xs rounded">Urgency: {indicators.urgent.join(', ')}</span> : null}
                {indicators?.credentialKeywords?.length ? <span className="px-2 py-1 bg-yellow-700 text-xs rounded">Credentials terms</span> : null}
                {indicators?.impersonation?.length ? <span className="px-2 py-1 bg-indigo-700 text-xs rounded">Impersonation: {indicators.impersonation.join(', ')}</span> : null}
              </div>
              <div className="mt-3 text-xs text-slate-400">Masked preview:</div>
              <pre className="bg-slate-800 p-2 rounded text-xs mt-1 whitespace-pre-wrap">{maskedPreview(`From: ${sender}\n\n${emailText}`)}</pre>
            </div>
          </div>
        )}

        {tab === 'message' && (
          <div className="space-y-3">
            <label className="text-sm text-slate-300">Message / SMS</label>
            <textarea value={messageText} onChange={(e) => { setMessageText(e.target.value); detectLive(e.target.value) }} rows={4} className="w-full p-2 rounded bg-slate-800 text-slate-100" />
            <div className="text-xs text-slate-400">Psychological manipulation detection focuses on urgency, authority, and reward language.</div>
            <div className="mt-2">
              <div className="text-xs text-slate-300 font-medium">Live Indicators</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {indicators?.urgent?.length ? <span className="px-2 py-1 bg-red-600 text-xs rounded">Urgency: {indicators.urgent.join(', ')}</span> : null}
                {indicators?.credentialKeywords?.length ? <span className="px-2 py-1 bg-yellow-700 text-xs rounded">Credential cues</span> : null}
                {indicators?.impersonation?.length ? <span className="px-2 py-1 bg-indigo-700 text-xs rounded">Impersonation</span> : null}
              </div>
              <div className="mt-3 text-xs text-slate-400">Masked preview:</div>
              <pre className="bg-slate-800 p-2 rounded text-xs mt-1 whitespace-pre-wrap">{maskedPreview(messageText)}</pre>
            </div>
          </div>
        )}

        {tab === 'image' && (
          <div>
            <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-slate-800 rounded p-6 text-center bg-slate-900/40">
              <div className="flex items-center justify-center gap-2">
                <UploadCloud />
                <div className="text-sm text-slate-300">Drag & drop images or click to upload</div>
              </div>
              <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="mt-3 w-full" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.name} className="bg-slate-800 p-1 rounded">
                  <img src={img.b64} alt={img.name} className="w-full h-24 object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">{progress ? `${progress.step} ${progress.percent ? `— ${Math.round(progress.percent)}%` : ''}` : ''}</div>
          <div>
            <button onClick={handleAnalyze} disabled={loading} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
              {loading ? <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" fill="none"/></svg>Analyzing...</span> : 'Analyze Threat'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-slate-900 p-4 rounded mt-2">
          <div className="text-sm text-slate-200 font-medium">Result summary</div>
          <div className="mt-2 text-slate-300">Risk: {(result.risk_score * 100).toFixed(0)}% — NLP {result.nlp_score.toFixed(2)}, URL {result.url_score.toFixed(2)}, Vision {result.vision_score.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}

function URLSafe(input: string) {
  try {
    const u = new URL(input)
    return u.hostname
  } catch {
    return input
  }
}

export default AdvancedAnalyzer
