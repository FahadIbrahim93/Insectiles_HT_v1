## 2026-03-04 - [Hardcoded Secret Exposure via Define]
**Vulnerability:** Exposure of `GEMINI_API_KEY` to the frontend bundle.
**Learning:** The `define` configuration in `vite.config.ts` was used to pass environment variables directly to the client, making them accessible in the production JavaScript. Hardcoding secrets in build configurations causes them to be bundled into the production JavaScript, making them accessible to any user in the browser.
**Prevention:** Avoid using `define` in `vite.config.ts` for sensitive environment variables. Sensitive keys should only be used in server-side code or proxied through a secure backend. Use server-side proxies or edge functions for API calls that require secrets. Never expose backend secrets to the frontend.
