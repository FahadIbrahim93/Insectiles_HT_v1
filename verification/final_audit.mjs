import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('Navigating to game...');
  await page.goto('http://localhost:3000');

  // Start game
  await page.click('[data-testid="start-button"]');
  console.log('Game started');

  // Wait for some insects to spawn and tap one to trigger pulse/popup
  await page.waitForTimeout(2000);

  // Trigger a hit via console injection to ensure we catch the visuals
  await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="game-canvas"]');
    const rect = canvas.getBoundingClientRect();
    // Simulate a tap in lane 0
    const clientX = rect.left + rect.width / 8;
    const event = new MouseEvent('mousedown', {
      clientX,
      bubbles: true,
      cancelable: true,
      view: window
    });
    canvas.dispatchEvent(event);
  });

  console.log('Hit triggered, capturing pulse/popup...');
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, 'hit_visuals.png') });

  // Fever mode audit
  await page.evaluate(() => {
    window.useGameStore.setState({ isFeverMode: true, score: 500 });
  });
  await page.waitForTimeout(500);
  console.log('Capturing fever mode AAA visuals...');
  await page.screenshot({ path: path.join(outputDir, 'fever_final_audit.png') });

  await browser.close();
  console.log('Audit complete.');
})();
