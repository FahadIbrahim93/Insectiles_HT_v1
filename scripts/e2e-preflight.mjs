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
const shouldAutoInstall = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.PINIK_E2E_AUTO_INSTALL ?? '').toLowerCase()
);
if (shouldAutoInstall) {
  console.error('[e2e-preflight] Attempting automatic install: npx playwright install chromium');
  try {
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    const installed = await check();
    if (installed) {
      console.log('[e2e-preflight] Browser installation succeeded.');
      process.exit(0);
    }
  } catch (error) {
    console.error('[e2e-preflight] Automatic install failed.', error);
  }
}

console.error('[e2e-preflight] Try: npm run e2e:install');
try {
  execSync('npx playwright --version', { stdio: 'inherit' });
} catch {
  // ignore
}
process.exit(1);
