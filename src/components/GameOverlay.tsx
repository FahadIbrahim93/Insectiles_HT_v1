import React from 'react';
import type { LeaderboardEntry } from '../types';

interface GameOverlayProps {
  isPlaying: boolean;
  gameOver: boolean;
  score: number;
  leaderboard: LeaderboardEntry[];
  startGame: () => void;
}

export default function GameOverlay({
  isPlaying,
  gameOver,
  score,
  leaderboard,
  startGame,
}: GameOverlayProps) {
  if (isPlaying && !gameOver) return null;

  return (
    <div data-testid="game-overlay" className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 backdrop-blur-md bg-black/80 animate-fade-in">
      <div className="relative w-full max-w-sm flex flex-col items-center gap-10">

        {/* Title/Logo */}
        {!gameOver ? (
          <div className="flex flex-col items-center animate-bounce-slow">
            <div className="relative">
              <span className="text-6xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 via-purple-500 to-cyan-400 drop-shadow-[0_15px_35px_rgba(232,121,249,0.4)]">
                PINIK<br/>PIPRA
              </span>
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_#facc15] rotate-12">
                <span className="text-3xl">👑</span>
              </div>
            </div>
            <p className="mt-4 text-white/40 font-mono text-xs uppercase tracking-[0.4em]">Psychedelic Ant Rush</p>
          </div>
        ) : (
          <div data-testid="game-over" className="flex flex-col items-center gap-2 animate-pop-in">
            <span className="text-white/40 font-mono text-sm uppercase tracking-widest">Game Over</span>
            <div className="relative">
              <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600 drop-shadow-[0_0_25px_rgba(244,114,182,0.4)]">
                {score.toLocaleString()}
              </span>
              <div className="absolute -top-4 -right-12 px-3 py-1 rounded bg-cyan-400 text-black font-black text-xs rotate-12 animate-pulse">
                NEW BEST!
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={startGame}
          className="group relative w-full h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(232,121,249,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <div className="w-full h-full flex items-center justify-center rounded-full bg-black/90 group-hover:bg-transparent transition-colors">
            <span className="text-xl font-bold tracking-widest uppercase text-white">
              {gameOver ? 'START AGAIN' : 'START THE TRIP'}
            </span>
          </div>
        </button>

        {/* Viral Share Option (Mock) */}
        {gameOver && (
          <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-sm font-mono uppercase tracking-widest">Share Result</span>
            <span className="text-xl">📸</span>
          </button>
        )}

        {/* Stats/Leaderboard Lite */}
        <div className="w-full flex flex-col gap-3">
           <div className="flex justify-between items-center px-2">
              <span className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Leaderboard</span>
              <span className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Global</span>
           </div>
           <div className="w-full flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/5">
              {leaderboard.length > 0 ? leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs ${i === 0 ? "text-yellow-400" : "text-white/40"}`}>0{i+1}</span>
                    <span className="text-white font-medium text-sm">{"Player"}</span>
                  </div>
                  <span className="font-mono text-white/60 text-sm">{entry.score.toLocaleString()}</span>
                </div>
              )) : (
                <div className="p-8 flex flex-col items-center gap-2 text-white/20">
                  <span className="text-3xl">🏜️</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest">No entries yet</span>
                </div>
              )}
           </div>
        </div>

        {/* Legal/Footer */}
        <div className="mt-4 flex flex-col items-center gap-1 opacity-20">
           <span className="font-mono text-[9px] uppercase tracking-widest text-white">Studio 2026 Hybrid-Casual</span>
           <span className="font-mono text-[8px] uppercase tracking-tighter text-white">© Pinik Pipra Inc.</span>
        </div>
      </div>
    </div>
  );
}
