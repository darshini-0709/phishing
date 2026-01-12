import React, { useCallback, useMemo, useState } from 'react'
import { usePhishingAnalysis } from '../hooks/usePhishingAnalysis'
import type { PhishingAnalysisRequest } from '../types/phishing.types'
import RiskScoreCard from './RiskScoreCard'
import NLPAnalysis from './NLPAnalysis'
import URLIntelligence from './URLIntelligence'
import VisionDetection from './VisionDetection'
import ExplainableAI from './ExplainableAI'
import toast from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'

export const PhishingAnalyzer: React.FC = () => {
  const { loading, progress, result, runAnalysis } = usePhishingAnalysis()
  const [text, setText] = useState('')
  const [images, setImages] = useState<{ name: string; b64: string }[]>([])
  const [detectedUrls, setDetectedUrls] = useState<string[]>([])

  const extractUrls = useCallback((input: string) => {
    const re = /https?:\/\/[^\s)"'<>]+/g
    const found = input.match(re) || []
    setDetectedUrls(found)
  }, [])

  const onTextChange = (v: string) => {
    setText(v)
    extractUrls(v)
  }

  const onFiles = async (files: FileList | null) => {
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
  }

  const bufferToBase64 = (buf: ArrayBuffer) => {
    let binary = ''
    const bytes = new Uint8Array(buf)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  const payload = useMemo<PhishingAnalysisRequest>(() => ({ text, urls: detectedUrls, images_b64: images.map((i) => i.b64) }), [text, detectedUrls, images])

  const handleAnalyze = async () => {
    if (!text && images.length === 0) {
      toast.error('Provide email text or attachments')
      return
    }
    await runAnalysis(payload)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-900 p-4 rounded">
            <label className="block text-sm text-slate-300">Email text</label>
            <textarea value={text} onChange={(e) => onTextChange(e.target.value)} rows={8} className="w-full bg-slate-800 text-slate-100 p-2 rounded mt-2" />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <UploadCloud className="h-4 w-4" />
                <input type="file" multiple onChange={(e) => onFiles(e.target.files)} className="text-slate-300" />
                <span className="ml-2">Detected URLs: {detectedUrls.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={loading} onClick={handleAnalyze} className="px-4 py-2 rounded bg-gradient-to-r from-red-500 to-orange-400 text-white">
                  {loading ? 'Analyzing...' : 'ANALYZE'}
                </button>
              </div>
            </div>
            {progress && (
              <div className="mt-2 text-sm text-slate-300">
                {progress.step} {progress.percent ? `— ${Math.round(progress.percent)}%` : ''}
              </div>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.name} className="bg-slate-800 p-1 rounded">
                  <img src={img.b64} alt={img.name} className="w-full h-24 object-contain" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NLPAnalysis nlpScore={result?.nlp_score} explainability={result?.explainability} />
            <URLIntelligence urlScore={result?.url_score} domains={detectedUrls.map((u) => ({ url: u }))} />
            <VisionDetection visionScore={result?.vision_score} images={images} />
          </div>
        </div>

        <div className="space-y-3">
          <RiskScoreCard score={result?.risk_score ?? 0} nlp={result?.nlp_score} url={result?.url_score} vision={result?.vision_score} />
          <ExplainableAI factors={result?.explainability?.factors} warnings={result?.explainability?.warnings} />
        </div>
      </div>
    </div>
  )
}

export default PhishingAnalyzer
