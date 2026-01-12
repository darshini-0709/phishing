import React, { useEffect, useState } from 'react'
import RiskScoreCard from '../components/RiskScoreCard'
import RecentAlertsTable from '../components/RecentAlertsTable'
import { Link } from 'react-router-dom'
import { Globe, ShieldAlert, CheckCircle, Zap, Link as LinkIcon, Mail, Image } from 'lucide-react'

type Stat = { total: number; phishing_pct: number; safe_pct: number; high_risk: number; avg_risk: number }

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stat>({ total: 1247, phishing_pct: 89, safe_pct: 11, high_risk: 42, avg_risk: 0.87 })
  const [recent, setRecent] = useState([
    { id: '1', from: 'spoof@paypal.com', subject: 'Action required: verify account', score: 0.92, date: '2026-01-10' },
    { id: '2', from: 'alerts@bank-secure.com', subject: 'Unusual login attempt', score: 0.78, date: '2026-01-09' },
    { id: '3', from: 'support@service.io', subject: 'Payment failed', score: 0.65, date: '2026-01-08' },
  ])

  useEffect(() => {
    // attempt to fetch real stats from backend; fallback to static
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const j = await res.json()
          setStats(j)
        }
      } catch {
        // keep demo values
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm p-6 rounded-lg">
        <h1 className="text-2xl font-semibold">Phishing Threat Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time AI-based threat monitoring across URLs, emails, and images with explainable risk scoring.</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm hover:scale-105 transition-transform border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-800 text-emerald-400"><Globe /></div>
              <div>
                <div className="text-xs text-slate-400">Total URLs Scanned</div>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Last 30d</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm hover:scale-105 transition-transform border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-800 text-red-400"><ShieldAlert /></div>
              <div>
                <div className="text-xs text-slate-400">Phishing Websites Detected</div>
                <div className="text-xl font-bold">{stats.phishing_pct}%</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Confidence</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm hover:scale-105 transition-transform border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-800 text-green-400"><CheckCircle /></div>
              <div>
                <div className="text-xs text-slate-400">Safe Websites</div>
                <div className="text-xl font-bold">{stats.safe_pct}%</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Auto allowlist</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm hover:scale-105 transition-transform border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-slate-800 text-orange-400"><Zap /></div>
              <div>
                <div className="text-xs text-slate-400">High-Risk Threats</div>
                <div className="text-xl font-bold">{stats.high_risk}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Immediate review</div>
          </div>
        </div>
      </div>

      {/* Phishing Website Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
          <div className="text-sm text-slate-200 font-medium">Phishing Website Intelligence</div>
          <p className="text-xs text-slate-400 mt-2">Common templates and examples observed in the wild.</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <div className="p-2 rounded bg-slate-800 text-rose-400"><ShieldAlert /></div>
              <div>
                <div className="font-medium">Fake banking websites</div>
                <div className="text-xs text-slate-400">Impersonate banks with credential harvesting forms.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="p-2 rounded bg-slate-800 text-amber-400"><LinkIcon /></div>
              <div>
                <div className="font-medium">Fake delivery tracking pages</div>
                <div className="text-xs text-slate-400">Spoofed courier pages asking for payment to release packages.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="p-2 rounded bg-slate-800 text-sky-400"><Globe /></div>
              <div>
                <div className="font-medium">Social media login clones</div>
                <div className="text-xs text-slate-400">Login portals mimicking popular platforms to steal sessions.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="p-2 rounded bg-slate-800 text-violet-400"><ShieldAlert /></div>
              <div>
                <div className="font-medium">Crypto scam websites</div>
                <div className="text-xs text-slate-400">Fake exchanges and airdrop pages designed to extract funds.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="p-2 rounded bg-slate-800 text-indigo-400"><Globe /></div>
              <div>
                <div className="font-medium">Government impersonation sites</div>
                <div className="text-xs text-slate-400">Sites posing as government portals requesting sensitive information.</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Analysis Entry Cards */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200 font-medium">URL Analysis</div>
                <div className="text-xs text-slate-400 mt-1">Scan a URL for domain age, hosting, and known-malware indicators.</div>
              </div>
              <div className="text-slate-300"><Link to="/analyze"><LinkIcon /></Link></div>
            </div>
            <div className="mt-3">
              <Link to="/analyze" className="inline-block px-4 py-2 rounded bg-gradient-to-r from-emerald-500 to-green-500 text-slate-900 font-semibold">Analyze Now</Link>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200 font-medium">Email / Message Analysis</div>
                <div className="text-xs text-slate-400 mt-1">Analyze message content for social-engineering cues and malicious links.</div>
              </div>
              <div className="text-slate-300"><Mail /></div>
            </div>
            <div className="mt-3">
              <Link to="/analyze" className="inline-block px-4 py-2 rounded bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold">Analyze Now</Link>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-200 font-medium">Image / Screenshot Analysis</div>
                <div className="text-xs text-slate-400 mt-1">Detect logo spoofing, manipulated images, and embedded phishing content.</div>
              </div>
              <div className="text-slate-300"><Image /></div>
            </div>
            <div className="mt-3">
              <Link to="/analyze" className="inline-block px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold">Analyze Now</Link>
            </div>
          </div>
        </div>

        {/* Visual Charts Section */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
          <div className="text-sm text-slate-200 font-medium">Risk Distribution</div>
          <div className="mt-3 flex gap-3 items-end">
            <div className="flex-1">
              <svg className="w-full h-36" viewBox="0 0 200 80" preserveAspectRatio="none">
                <rect x="0" y="40" width="30" height="40" fill="#10b981" />
                <rect x="40" y="28" width="30" height="52" fill="#f59e0b" />
                <rect x="80" y="10" width="30" height="70" fill="#ef4444" />
                <rect x="120" y="20" width="30" height="60" fill="#fb923c" />
                <rect x="160" y="34" width="30" height="46" fill="#f97316" />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-200 font-medium">Attack Types Breakdown</div>
            <svg className="w-full h-28 mt-2" viewBox="0 0 100 24" preserveAspectRatio="none">
              <circle cx="20" cy="12" r="8" fill="#ef4444" />
              <circle cx="50" cy="12" r="6" fill="#f59e0b" />
              <circle cx="80" cy="12" r="4" fill="#10b981" />
            </svg>
            <div className="flex gap-3 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"/> Credential Theft</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"/> Scam/Payment</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> Brand Abuse</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent alerts and details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAlertsTable items={recent.map((r) => ({ id: r.id, from: r.from, subject: r.subject, score: r.score, date: r.date }))} />

        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
          <div className="text-sm text-slate-200 font-medium">Quick Actions</div>
          <div className="mt-3 text-slate-300 text-sm">Create a blocklist, export alerts, or open detailed risk reports from the list to the left.</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
