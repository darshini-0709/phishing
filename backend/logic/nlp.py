
import logging
import os
import pickle
import re
import numpy as np

logger = logging.getLogger(__name__)

class NLPAnalyzer:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load_models()

        # 2. Psychological Manipulation Detection (Rule-based)
        self.urgency_patterns = [
            r"urgent", r"immediately", r"now", r"limited time", r"24 hours", 
            r"act fast", r"immediate action", r"expires", r"deadline"
        ]
        self.fear_patterns = [
            r"suspended", r"blocked", r"unusual activity", r"unauthorized", 
            r"legal action", r"warrant", r"arrest", r"terminated", r"breach"
        ]
        self.authority_patterns = [
            r"admin", r"support team", r"security department", r"verification center",
            r"bank", r"irs", r"tax", r"ceo", r"hr department"
        ]
        self.action_requests = [
            r"click here", r"verify", r"confirm", r"update your", 
            r"sign in", r"log in", r"reply", r"download"
        ]

    def _load_models(self):
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_path, "models", "email_model.pkl")
        vectorizer_path = os.path.join(base_path, "models", "email_vectorizer.pkl")

        try:
            if os.path.exists(model_path) and os.path.exists(vectorizer_path):
                logger.info("Loading local NLP models...")
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                with open(vectorizer_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                logger.info("Local NLP models loaded successfully.")
            else:
                logger.error(f"Model files not found at {model_path} or {vectorizer_path}")
        except Exception as e:
            logger.error(f"Failed to load NLP models: {e}")

    def analyze(self, text: str):
        scores = []
        reasons = []
        
        if not text:
            return {"score": 0.0, "reasons": []}

        # 1. NLP Model Prediction
        nlp_prob = 0.0
        if self.model and self.vectorizer:
            try:
                # Vectorize
                features = self.vectorizer.transform([text])
                # Predict probability (class 1 assumed to be phishing/spam)
                nlp_prob = self.model.predict_proba(features)[0][1]
                
                # Format explanation
                if nlp_prob > 0.5:
                    reasons.append(f"AI Model analysis detected suspicious patterns ({int(nlp_prob*100)}% confidence)")
            except Exception as e:
                logger.error(f"Prediction error: {e}")
                
        scores.append(nlp_prob * 100) # Base score on 0-100 scale

        # 2. Key/Rule-based Detection
        lower_text = text.lower()
        
        # Urgency
        if self._check_patterns(lower_text, self.urgency_patterns):
            scores.append(85) # High impact
            reasons.append("Urgency language detected (pressure to act)")

        # Fear / Threats
        if self._check_patterns(lower_text, self.fear_patterns):
            scores.append(90) # Very high impact
            reasons.append("Fear/Threat language detected (account suspended/legal)")

        # Authority
        if self._check_patterns(lower_text, self.authority_patterns):
            scores.append(60)
            reasons.append("Authority impersonation detected")
            
        # Action Requests
        if self._check_patterns(lower_text, self.action_requests):
            scores.append(50)
            reasons.append("High-risk action request detected (click/verify)")

        # Aggregate Score
        # If we have model score, weight it heavily, but rules boost it.
        # Simple max strategy or weighted average?
        # Let's take the MAX of model score and rule usage to be safe (if model misses but rules hit).
        final_score = max(scores) if scores else 0.0
        
        # Ensure rules increase the NLP score if model was low but rules found something
        # If model says 0.2 but we have urgency, we want score to be higher.
        
        return {
            "score": float(final_score), # 0-100
            "reasons": reasons
        }

    def _check_patterns(self, text, patterns):
        for p in patterns:
            if re.search(p, text):
                return True
        return False
