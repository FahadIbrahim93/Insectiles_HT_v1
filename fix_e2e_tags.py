import sys

filepath = 'src/components/GameOverlay.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add game-overlay testid
content = content.replace(
    'return (\n    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-md bg-black/80 animate-fade-in">',
    'return (\n    <div data-testid="game-overlay" className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-md bg-black/80 animate-fade-in">'
)

# Add game-over testid
content = content.replace(
    ') : (\n          <div className="flex flex-col items-center gap-2 animate-pop-in">',
    ') : (\n          <div data-testid="game-over" className="flex flex-col items-center gap-2 animate-pop-in">'
)

with open(filepath, 'w') as f:
    f.write(content)
