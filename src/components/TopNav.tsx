import React from 'react'
import { Search, Bell } from 'lucide-react'

export const TopNav: React.FC = () => {
  return (
    <header className="flex items-center justify-between gap-4 p-4 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input placeholder="Search emails, domains, alerts..." className="bg-slate-900 text-slate-100 placeholder-slate-500 px-3 py-2 rounded pl-9 w-72" />
          <Search className="absolute left-2 top-2.5 text-slate-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-300 hover:text-white"><Bell /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center text-slate-900 font-bold">JD</div>
          <div className="text-sm text-slate-200">Admin</div>
        </div>
      </div>
    </header>
  )
}

export default TopNav
