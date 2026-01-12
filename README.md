# AI PhishDetect — Frontend

React 18 + TypeScript + Vite + TailwindCSS frontend scaffold for AI Phishing Detection System.

Quick start:

1. Install dependencies

```powershell
npm install
```

2. Run dev server

```powershell
npm run dev
```

Backend endpoints expected:
- `POST /analyze_email` — receives payload { text, urls, images_b64 }
- WebSocket `ws(s)://<host>/ws/analyze` — streams progress and final result
