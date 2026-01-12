import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  score: number
  nlp?: number
  url?: number
  vision?: number
}

export const RiskScoreCard: React.FC<Props> = ({ score = 0, nlp, url, vision }) => {
  const pct = Math.round(score * 100)
  const gradient =
    score > 0.75 ? 'from-red-500 via-orange-500 to-yellow-400' : score > 0.4 ? 'from-orange-400 to-yellow-300' : 'from-emerald-400 to-emerald-600'
  return (
    <div className="w-full bg-slate-900 p-4 rounded">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">Unified Risk Score</div>
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </div>
      <div className="flex items-center gap-4">
        <div className={`rounded-full bg-gradient-to-r ${gradient} p-6 text-white text-2xl font-bold drop-shadow-md`}>
          {pct}%
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-300">Average: {score.toFixed(2)}</div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-slate-400">
            <div>NLP: {nlp?.toFixed(2) ?? '—'}</div>
            <div>URL: {url?.toFixed(2) ?? '—'}</div>
            <div>Vision: {vision?.toFixed(2) ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskScoreCard
