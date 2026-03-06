import sys

filepath = 'src/components/GameOverlay.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Update button text to standard START for E2E locator button:has-text("START")
content = content.replace(
    "{gameOver ? 'START AGAIN' : 'START THE TRIP'}",
    "{gameOver ? 'START AGAIN' : 'START'}"
)

with open(filepath, 'w') as f:
    f.write(content)
