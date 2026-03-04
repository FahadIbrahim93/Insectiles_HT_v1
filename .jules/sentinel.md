## 2026-03-04 - [Hardcoded Secret Exposure]
**Vulnerability:** The `GEMINI_API_KEY` was being hardcoded into the client-side bundle via Vite's `define` property in `vite.config.ts`.
**Learning:** Hardcoding secrets in build configurations like `vite.config.ts` causes them to be bundled into the production JavaScript, making them accessible to any user in the browser.
**Prevention:** Use server-side proxies or edge functions for API calls that require secrets. Never expose backend secrets to the frontend.
