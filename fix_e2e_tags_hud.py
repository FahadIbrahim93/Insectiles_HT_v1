import sys

filepath = 'src/components/GameHud.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add fever-progress
content = content.replace(
    '<div className="mt-4 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">',
    '<div data-testid="fever-progress" className="mt-4 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">'
)

# Add fever-indicator
content = content.replace(
    '<span className="text-fuchsia-400 font-bold text-xs animate-pulse drop-shadow-[0_0_5px_#f472b6]">',
    '<span data-testid="fever-indicator" className="text-fuchsia-400 font-bold text-xs animate-pulse drop-shadow-[0_0_5px_#f472b6]">'
)

with open(filepath, 'w') as f:
    f.write(content)

filepath_overlay = 'src/components/GameOverlay.tsx'
with open(filepath_overlay, 'r') as f:
    content_overlay = f.read()

# Update button text to include "START"
content_overlay = content_overlay.replace(
    "{gameOver ? 'Try Again' : 'Enter the Trip'}",
    "{gameOver ? 'START AGAIN' : 'START THE TRIP'}"
)

with open(filepath_overlay, 'w') as f:
    f.write(content_overlay)
