import React from 'react'
import AdvancedAnalyzer from '../components/AdvancedAnalyzer'

export const AnalyzeEmail: React.FC = () => {
  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold mb-4">Analyze Threat</h1>
      <AdvancedAnalyzer />
    </div>
  )
}

export default AnalyzeEmail
