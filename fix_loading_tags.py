import sys

filepath = 'src/components/Game.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add loading-screen testid
content = content.replace(
    'return (\n      <div className="flex items-center justify-center w-full h-full bg-black text-white">',
    'return (\n      <div data-testid="loading-screen" className="flex items-center justify-center w-full h-full bg-black text-white">'
)

with open(filepath, 'w') as f:
    f.write(content)

filepath_e2e = 'e2e/game.spec.ts'
with open(filepath_e2e, 'r') as f:
    content_e2e = f.read()

# Use loading-screen testid in E2E
content_e2e = content_e2e.replace(
    "const loadingText = page.locator('text=LOADING PINIK PIPRA...');",
    "const loadingText = page.locator('[data-testid=\"loading-screen\"]');"
)

with open(filepath_e2e, 'w') as f:
    f.write(content_e2e)
