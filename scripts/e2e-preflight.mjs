import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execSync } from 'node:child_process';

const candidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  '/root/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
  '/root/.cache/ms-playwright/chromium-1208/chrome-linux/chrome',
].filter(Boolean);

const exists = async (path) => {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const check = async () => {
  for (const path of candidates) {
    if (await exists(path)) {
      console.log(`[e2e-preflight] Browser binary found: ${path}`);
      return true;
    }
  }
  return false;
};

const ok = await check();
if (ok) process.exit(0);

console.error('[e2e-preflight] Playwright browser binary not found.');
console.error('[e2e-preflight] Try: npm run e2e:install');
try {
  execSync('npx playwright --version', { stdio: 'inherit' });
} catch {
  // ignore
}
process.exit(1);
