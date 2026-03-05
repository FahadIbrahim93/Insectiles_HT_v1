## 2024-05-22 - [Vite Secret Exposure via Define]
**Vulnerability:** Exposure of `GEMINI_API_KEY` to the frontend bundle.
**Learning:** The `define` configuration in `vite.config.ts` was used to pass environment variables directly to the client, making them accessible in the production JavaScript.
**Prevention:** Avoid using `define` in `vite.config.ts` for sensitive environment variables. Sensitive keys should only be used in server-side code or proxied through a secure backend.
