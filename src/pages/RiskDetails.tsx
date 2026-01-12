import React from 'react'
import { useParams } from 'react-router-dom'
import RiskScoreCard from '../components/RiskScoreCard'
import ExplainableAI from '../components/ExplainableAI'

const RiskDetails: React.FC = () => {
  const { id } = useParams()
  // in a real app fetch detailed result by id; here show demo
  const demo = {
    risk_score: 0.92,
    nlp_score: 0.95,
    url_score: 0.89,
    vision_score: 0.78,
    explainability: { factors: ['high_urgency', 'new_domain', 'logo_spoof'], warnings: ['Act now detected', 'Domain registered yesterday'] },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        <div className="w-2/3">
          <h2 className="text-2xl font-semibold">Risk Analysis — {id ?? 'Result'}</h2>
          <div className="mt-3 bg-slate-900 p-4 rounded">
            <div className="text-sm text-slate-300">Summary</div>
            <div className="mt-2 text-slate-200">This result aggregates signals from NLP, URL intelligence, and vision detection to produce an explainable risk score.</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-sm text-slate-300">From</div>
              <div className="font-medium">spoof@paypal.com</div>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-sm text-slate-300">To</div>
              <div className="font-medium">user@example.com</div>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <div className="text-sm text-slate-300">Received</div>
              <div className="font-medium">2026-01-10 09:12</div>
            </div>
          </div>
        </div>

        <div className="w-1/3 space-y-3">
          <RiskScoreCard score={demo.risk_score} nlp={demo.nlp_score} url={demo.url_score} vision={demo.vision_score} />
          <ExplainableAI factors={demo.explainability.factors} warnings={demo.explainability.warnings} />
        </div>
      </div>
    </div>
  )
}

export default RiskDetails
