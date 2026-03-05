import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import { ASSET_PATHS, GAME_SETTINGS } from '../constants';
import { preloadAssets } from '../utils/assetLoader';
import { getLaneFromClientX } from '../utils/input';
import { GameEngine } from '../utils/gameEngine';
import GameHud from './GameHud';
import GameOverlay from './GameOverlay';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const {
    score, highScore, gameOver, isPlaying, isFeverMode, feverProgress,
    startGame: startStoreGame, addScore, setFeverMode, setGameOver
  } = useGameStore();

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const videosRef = useRef<HTMLVideoElement[]>([]);

  const stopLoop = () => {
    engineRef.current?.stop();
    engineRef.current = null;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { images, videos } = await preloadAssets(
          Object.values(ASSET_PATHS.IMAGES),
          Object.values(ASSET_PATHS.ANIMATIONS)
        );
        imagesRef.current = images;
        videosRef.current = videos;
        setAssetsLoaded(true);
      } catch (error) {
        console.error("Failed to load assets", error);
      }
    };
    load();
  }, []);

  const startGame = () => {
    audio.init();
    audio.playBgm();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    stopLoop();
    startStoreGame();

    const callbacks = {
      getScore: () => score,
      getIsFeverMode: () => isFeverMode,
      getIsPlaying: () => isPlaying,
      getGameOver: () => gameOver,
      setFeverMode: (active: boolean) => setFeverMode(active),
      addScore: (points: number) => addScore(points),
      setGameOver: (over: boolean) => setGameOver(over),
      playFeverActivation: () => audio.playFeverActivation(),
      playTapSound: (isFever: boolean) => audio.playTapSound(isFever),
      playErrorSound: () => audio.playErrorSound(),
      stopBgm: () => audio.stopBgm(),
    };

    engineRef.current = new GameEngine(
      canvas,
      imagesRef.current,
      {
        laneCount: GAME_SETTINGS.LANE_COUNT,
        tileHeight: GAME_SETTINGS.TILE_HEIGHT,
        initialSpeed: GAME_SETTINGS.INITIAL_SPEED,
        speedIncrement: GAME_SETTINGS.SPEED_INCREMENT,
        maxSpeed: GAME_SETTINGS.MAX_SPEED,
        feverThreshold: GAME_SETTINGS.FEVER_THRESHOLD,
      },
      callbacks
    );
    engineRef.current.start();
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    const { isPlaying, gameOver } = useGameStore.getState();
    if (!isPlaying || gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const laneWidth = canvas.width / GAME_SETTINGS.LANE_COUNT;
    const clickedLane = getLaneFromClientX(clientX, rect.left, canvas.width, GAME_SETTINGS.LANE_COUNT);
    if (clickedLane === -1) return;
    
    const engine = engineRef.current;
    if (engine) {
      engine.handleTap(clickedLane);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resize = () => {
        if (canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
        }
      };
      window.addEventListener('resize', resize);
      resize();
      return () => window.removeEventListener('resize', resize);
    }
  }, [assetsLoaded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLaneMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
      const lane = keyLaneMap[e.key];
      if (lane === undefined) return;
      const engine = engineRef.current;
      if (engine) {
        engine.handleTap(lane);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      stopLoop();
      audio.stopBgm();
    };
  }, []);

  if (!assetsLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-2xl animate-pulse font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-yellow-500">LOADING PINIK PIPRA...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} data-testid="game-container" className="relative w-full h-full sm:max-w-md sm:h-[90vh] mx-auto bg-black overflow-hidden shadow-2xl sm:rounded-2xl sm:border border-white/10">
      <GameHud score={score} highScore={highScore} isFeverMode={isFeverMode} feverProgress={feverProgress} />

      <canvas
        data-testid="game-canvas"
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
        onTouchStart={(e) => handleInteraction(e.touches[0].clientX, e.touches[0].clientY)}
      />

      <GameOverlay isPlaying={isPlaying} gameOver={gameOver} score={score} startGame={startGame} />
    </div>
  );
}
