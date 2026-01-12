import React from 'react'
import { Home, AlertCircle, Mail, Settings, Shield } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }>= ({ to, icon, label }) => {
  const loc = useLocation()
  const active = loc.pathname === to
  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>
      <div className="w-5 h-5">{icon}</div>
      <div className="text-sm">{label}</div>
    </Link>
  )
}

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-950 text-slate-200 min-h-screen p-4 hidden md:block">
      <div className="mb-6">
        <div className="text-xl font-bold">AI PhishDetect</div>
        <div className="text-xs text-slate-400 mt-1">Enterprise Threat Dashboard</div>
      </div>

      <nav className="space-y-1">
        <NavItem to="/" icon={<Home />} label="Dashboard" />
        <NavItem to="/analyze" icon={<Mail />} label="Analyze Email" />
        <NavItem to="/alerts" icon={<AlertCircle />} label="Alerts" />
        <NavItem to="/risk/last" icon={<Shield />} label="Risk Explorer" />
        <div className="border-t border-slate-800 mt-3 pt-3" />
        <NavItem to="/settings" icon={<Settings />} label="Settings" />
      </nav>
    </aside>
  )
}

export default Sidebar
