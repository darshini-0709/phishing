import React from 'react'
import { ExternalLink } from 'lucide-react'

interface AlertItem { id: string; from: string; subject: string; score: number; date: string }

export const RecentAlertsTable: React.FC<{ items: AlertItem[] }> = ({ items }) => {
  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-200 font-medium">Recent Alerts</div>
        <div className="text-xs text-slate-400">Showing latest</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-left">
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="py-2">{it.id}</td>
                <td className="py-2">{it.from}</td>
                <td className="py-2 truncate max-w-xs">{it.subject}</td>
                <td className="py-2">{(it.score * 100).toFixed(0)}%</td>
                <td className="py-2 flex items-center gap-2">{it.date} <ExternalLink className="h-4 w-4 text-slate-400"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentAlertsTable
