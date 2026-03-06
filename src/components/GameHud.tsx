import type { PerfSnapshot } from '../utils/perfSampler';

interface GameHudProps {
  score: number;
  highScore: number;
  isFeverMode: boolean;
  feverProgress: number;
  comboMultiplier: number;
  shieldCharges: number;
  slowMoActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  perfSnapshot: PerfSnapshot | null;
  showPerfHud: boolean;
  hudPulse?: boolean;
}

export function OdometerDigit({ value }: { value: string }) {
  return (
    <span className="inline-block transition-transform duration-300 ease-out translate-y-0">
      {value}
    </span>
  );
}

export default function GameHud({
  score,
  highScore,
  isFeverMode,
  feverProgress,
  comboMultiplier,
  shieldCharges,
  slowMoActive,
  soundEnabled,
  onToggleSound,
  perfSnapshot,
  showPerfHud,
  hudPulse,
}: GameHudProps) {
  const scoreStr = score.toLocaleString();

  return (
    <div
      data-testid="game-hud"
      className={`absolute top-0 left-0 right-0 z-20 flex flex-col p-4 pt-8 transition-all duration-300 ${
        hudPulse ? "scale-105" : "scale-100"
      } ${isFeverMode ? "bg-fuchsia-900/10" : "bg-gradient-to-b from-black/40 to-transparent"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-white/60 font-mono text-xs uppercase tracking-widest">Score</span>
            <div data-testid="score" className="text-white font-mono text-3xl font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {scoreStr.split('').map((char, i) => (
                <OdometerDigit key={i} value={char} />
              ))}
            </div>
          </div>

          {comboMultiplier > 1 && (
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded bg-yellow-400 text-black font-black text-xs animate-bounce">
                COMBO x{comboMultiplier}
              </span>
              {isFeverMode && (
                <span data-testid="fever-indicator" className="text-fuchsia-400 font-bold text-xs animate-pulse drop-shadow-[0_0_5px_#f472b6]">
                  FEVER ACTIVATED
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col items-end">
            <span className="text-white/40 font-mono text-[10px] uppercase tracking-tighter">Personal Best</span>
            <div data-testid="high-score" className="text-cyan-300 font-mono text-xl font-medium drop-shadow-[0_0_10px_rgba(103,232,249,0.4)]">
              {highScore.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2 items-center">
             <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full border border-white/20 ${
                      i < shieldCharges ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-transparent"
                    }`}
                  />
                ))}
             </div>
             <button
              type="button"
              onClick={onToggleSound}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      <div data-testid="fever-progress" className="mt-4 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isFeverMode ? "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 animate-shimmer shadow-[0_0_15px_#f472b6]" : "bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60"
          }`}
          style={{ width: `${feverProgress * 100}%` }}
        />
      </div>

      {showPerfHud && perfSnapshot && (
        <div className="mt-2 self-end rounded px-2 py-0.5 bg-black/60 border border-white/10 text-[9px] font-mono text-white/40 flex gap-3">
          <span>FPS: {perfSnapshot.fps.toFixed(0)}</span>
          <span>LATENCY: {perfSnapshot.avgFrameMs.toFixed(1)}ms</span>
        </div>
      )}
    </div>
  );
}
