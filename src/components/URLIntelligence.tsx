import React from 'react'

interface Props {
  urlScore?: number
  domains?: { url: string; age_days?: number }[]
}

export const URLIntelligence: React.FC<Props> = ({ urlScore = 0, domains = [] }) => {
  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="text-sm text-slate-300 font-medium">URL Intelligence</div>
      <div className="mt-2">Score: {urlScore.toFixed(2)}</div>
      <ul className="mt-2 space-y-1 text-sm">
        {domains.map((d) => (
          <li key={d.url} className="flex justify-between">
            <span className="truncate">{d.url}</span>
            <span className="text-slate-400">{d.age_days != null ? `${d.age_days} days` : '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default URLIntelligence
