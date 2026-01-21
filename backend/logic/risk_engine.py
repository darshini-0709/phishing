
from .nlp import NLPAnalyzer
from .url_analysis import URLAnalyzer
from .vision import VisionAnalyzer
import numpy as np

class RiskEngine:
    def __init__(self):
        self.nlp = NLPAnalyzer()
        self.url = URLAnalyzer()
        self.vision = VisionAnalyzer()

    def analyze(self, text: str, urls: list, images_b64: list):
        # 1. NLP Analysis
        nlp_res = self.nlp.analyze(text)
        nlp_score = nlp_res['score'] # Assumed 0-100
        factors = nlp_res['reasons'][:]

        # 2. URL Analysis
        url_scores = []
        
        # Analyze explicit URLs
        for u in urls:
            u_res = self.url.analyze(u)
            url_scores.append(u_res['score'])
            factors.extend(u_res['reasons'])
            
        # Also analyze URLs extracted from text if not redundant? 
        # app.py already merges them. 
        
        url_score = max(url_scores) if url_scores else 0.0

        # 3. Vision Analysis
        vision_scores = []
        for img in images_b64:
            v_res = self.vision.analyze(img)
            vision_scores.append(v_res['score'])
            factors.extend(v_res['reasons'])
        
        vision_score = max(vision_scores) if vision_scores else 0.0

        # 4. Unified Risk Score Calculation
        # Formula: (NLP * 0.5) + (URL * 0.3) + (Vision * 0.2)
        
        # Ensure inputs are 0-100. My refactored modules return 0-100.
        
        # Calculate Weighted Score
        raw_risk = (nlp_score * 0.5) + (url_score * 0.3) + (vision_score * 0.2)
        
        # Critical Overrides (High Confidence Signals)
        # If URL is definitely malicious (score 100), the risk should be very high regardless of NLP/Vision
        if url_score >= 90:
             raw_risk = max(raw_risk, 90)
        
        if nlp_score >= 90:
             raw_risk = max(raw_risk, 85)

        risk_score = min(max(raw_risk, 0), 100)

        # 5. Explanations / Verdict
        # Dedup factors
        unique_factors = list(set(factors))
        
        # Identify Warnings (High priority factors)
        warnings = [f for f in unique_factors if "suspicious" in f.lower() or "critical" in f.lower() or "detected" in f.lower()]

        return {
            "risk_score": float(risk_score),
            "nlp_score": float(nlp_score),
            "url_score": float(url_score),
            "vision_score": float(vision_score),
            "factors": unique_factors,
            "warnings": warnings 
        }
