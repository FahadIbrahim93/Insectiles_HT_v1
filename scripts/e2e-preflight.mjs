import { access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const browserBasePath = process.env.PLAYWRIGHT_BROWSERS_PATH;
const resolvedCacheRoot =
  browserBasePath && browserBasePath !== '0'
    ? browserBasePath
    : join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'ms-playwright');

const chromiumExecutableCandidates = (browserRoot) => {
  const platformExecutables = {
    linux: {
      chromium: ['chrome-linux', 'chrome'],
      headlessShell: ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
    },
    darwin: {
      chromium: ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
      headlessShell: [
        'chrome-headless-shell-mac',
        'Chromium Headless Shell.app',
        'Contents',
        'MacOS',
        'Chromium Headless Shell',
      ],
    },
    win32: {
      chromium: ['chrome-win', 'chrome.exe'],
      headlessShell: ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
    },
  };

  const platform = platformExecutables[process.platform] ?? platformExecutables.linux;

  return [
    join(browserRoot, ...platform.chromium),
    join(browserRoot, ...platform.headlessShell),
  ];
};

const resolveCandidates = async () => {
  const candidates = new Set();

  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
    candidates.add(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE);
  }

  try {
    const installs = await readdir(resolvedCacheRoot, { withFileTypes: true });
    for (const install of installs) {
      if (!install.isDirectory()) continue;
      if (!install.name.startsWith('chromium') && !install.name.startsWith('chromium_headless_shell') && !install.name.startsWith('chrome-headless-shell')) {
        continue;
      }

      const installPath = join(resolvedCacheRoot, install.name);
      for (const executablePath of chromiumExecutableCandidates(installPath)) {
        candidates.add(executablePath);
      }
    }
  } catch {
    // Ignore missing cache directory and continue with env override only.
  }

  return [...candidates];
};

const exists = async (path) => {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const check = async () => {
  const candidates = await resolveCandidates();

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

console.error('[e2e-preflight] Playwright browser binary not found in user cache or PLAYWRIGHT_CHROMIUM_EXECUTABLE.');
console.error('[e2e-preflight] Try: npm run e2e:install');
try {
  execSync('npx playwright --version', { stdio: 'inherit' });
} catch {
  // ignore
}
process.exit(1);
