import type { PhishingAnalysisRequest, PhishingAnalysisResponse } from '../types/phishing.types'

export async function analyzeEmail(payload: PhishingAnalysisRequest): Promise<PhishingAnalysisResponse> {
  const res = await fetch('/analyze_email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error: ${res.status} ${text}`)
  }
  return res.json()
}

export function createAnalysisWebSocket(onMessage: (data: any) => void, onError: (err: any) => void) {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const url = `${proto}://${host}/ws/analyze`
  const ws = new WebSocket(url)
  ws.onopen = () => console.info('WS open')
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      onMessage(data)
    } catch (e) {
      onError(e)
    }
  }
  ws.onerror = (e) => onError(e)
  ws.onclose = () => console.info('WS closed')
  return ws
}
