export interface PhishingAnalysisRequest {
  text: string
  urls: string[]
  images_b64: string[]
}

export interface Explainability {
  factors: string[]
  warnings: string[]
}

export interface PhishingAnalysisResponse {
  risk_score: number
  nlp_score: number
  url_score: number
  vision_score: number
  explainability: Explainability
}

export interface LiveProgress {
  step: string
  percent?: number
  partial_result?: Partial<PhishingAnalysisResponse>
}
