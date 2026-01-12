import React from 'react'
import type { PhishingAnalysisResponse } from '../types/phishing.types'

interface Props {
  nlpScore?: number
  explainability?: PhishingAnalysisResponse['explainability']
}

export const NLPAnalysis: React.FC<Props> = ({ nlpScore = 0, explainability }) => {
  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="text-sm text-slate-300 font-medium">NLP Analysis</div>
      <div className="mt-2">Score: {nlpScore.toFixed(2)}</div>
      <div className="mt-2 text-sm text-slate-300">
        {explainability?.factors.includes('high_urgency') ? <div className="text-red-300">URGENT language detected</div> : <div>No urgent indicators</div>}
      </div>
    </div>
  )
}

export default NLPAnalysis
