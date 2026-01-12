import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { PhishingAnalysisRequest, PhishingAnalysisResponse, LiveProgress } from '../types/phishing.types'
import { analyzeEmail, createAnalysisWebSocket } from '../services/api'

export function usePhishingAnalysis() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<LiveProgress | null>(null)
  const [result, setResult] = useState<PhishingAnalysisResponse | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => () => {
    wsRef.current?.close()
  }, [])

  const startWebSocket = () =>
    new Promise<void>((resolve, reject) => {
      try {
        wsRef.current = createAnalysisWebSocket(
          (data) => {
            if (data.type === 'progress') {
              setProgress(data.payload as LiveProgress)
            } else if (data.type === 'result') {
              setResult(data.payload as PhishingAnalysisResponse)
              setProgress(null)
              toast.success('Analysis complete')
              resolve()
            }
          },
          (err) => {
            toast.error('WebSocket error')
            reject(err)
          }
        )
      } catch (err) {
        reject(err)
      }
    })

  const runAnalysis = async (payload: PhishingAnalysisRequest) => {
    setLoading(true)
    setResult(null)
    setProgress({ step: 'Queued', percent: 0 })
    try {
      await startWebSocket()
      const restRes = await analyzeEmail(payload)
      setResult(restRes)
      setProgress(null)
    } catch (err: any) {
      toast.error(err?.message ?? 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return { loading, progress, result, runAnalysis, ws: wsRef.current }
}
