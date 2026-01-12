import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AnalyzeEmail from './pages/AnalyzeEmail'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import RiskDetails from './pages/RiskDetails'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <TopNav />
            <main className="max-w-7xl mx-auto p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analyze" element={<AnalyzeEmail />} />
                <Route path="/risk/:id" element={<RiskDetails />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
