import React, { useState } from 'react'

interface Props {
  factors?: string[]
  warnings?: string[]
}

export const ExplainableAI: React.FC<Props> = ({ factors = [], warnings = [] }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen((s) => !s)}>
        <div className="text-sm text-slate-300 font-medium">Explainable AI</div>
        <div className="text-xs text-slate-400">{open ? 'Hide' : 'Show'}</div>
      </div>
      {open && (
        <div className="mt-3">
          <div className="space-y-2">
            {factors.map((f) => (
              <div key={f} className="text-sm">• {f}</div>
            ))}
            <div className="mt-2 text-xs text-orange-300">
              {warnings.length > 0 ? warnings.map((w) => <div key={w}>⚠ {w}</div>) : <div>No warnings</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplainableAI
