
import re
import logging
from urllib.parse import urlparse
import socket

logger = logging.getLogger(__name__)

class URLAnalyzer:
    def __init__(self):
        self.suspicious_tlds = ['.tk', '.ru', '.cn', '.zip', '.xyz', '.top', '.gq']
        self.suspicious_keywords = ['login', 'verify', 'secure', 'account', 'update', 'banking', 'signin', 'support']
        self.shorteners = ['bit.ly', 'goo.gl', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ad.vu']
        
        # Simulating brand names for mismatch detection
        # Ideally this would come from the email text context, but we check for common targets
        self.common_brands = ['paypal', 'google', 'apple', 'microsoft', 'facebook', 'netflix', 'amazon']

    def analyze(self, url: str):
        if not url:
            return {"score": 0.0, "reasons": []}

        score = 0
        reasons = []

        try:
            # Fix URL scheme
            if not url.startswith(('http://', 'https://')):
                url = 'http://' + url
                
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            
            # 1. IP Address check
            ipv4_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
            if re.match(ipv4_pattern, domain):
                score = 100
                reasons.append("URL Host is an IP address (highly suspicious)")
            
            # 2. Suspicious TLDs
            if any(domain.endswith(tld) for tld in self.suspicious_tlds):
                score = max(score, 80)
                reasons.append(f"Suspicious Top-Level Domain detected ({domain.split('.')[-1]})")

            # 3. URL Shorteners
            if domain in self.shorteners:
                score = max(score, 70)
                reasons.append("URL Shortener used (hides destination)")
                
            # 4. Brand Mismatch / Typosquatting (Simple check)
            # If domain contains a brand name but isn't exactly that brand's domain (e.g. "paypal-security.com")
            # This is a heuristic.
            for brand in self.common_brands:
                if brand in domain:
                    # Check if it is NOT the official domain (simplified)
                    # e.g. paypal.com is good, paypal-secure.com is bad
                    if not (domain == f"{brand}.com" or domain.endswith(f".{brand}.com")):
                        score = max(score, 75)
                        reasons.append(f"Potential Brand Impersonation detected ({brand} in non-official domain)")

            # 5. Keyword Stuffing
            found_keywords = [k for k in self.suspicious_keywords if k in url.lower()]
            if found_keywords:
                score = max(score, 40)
                # boost if already suspicious
                if score > 0:
                    score += 10
                reasons.append(f"Suspicious sensitive keywords in URL: {', '.join(found_keywords)}")

            # 6. Length and Obfuscation
            if len(url) > 75:
                score = max(score, 30)
                reasons.append("URL is abnormally long")
            
            if '@' in url:
                 score = 100
                 reasons.append("URL contains '@' (credential harvesting attempt)")

        except Exception as e:
            logger.error(f"URL analysis error: {e}")
            pass

        score = min(score, 100)
        return {
            "score": float(score),
            "reasons": reasons
        }
