import React, { useEffect, useRef, useState, useMemo } from 'react';
import { audio } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import { ASSET_PATHS, GAME_SETTINGS } from '../constants';
import { preloadAssets } from '../utils/assetLoader';
import { motion, AnimatePresence } from 'motion/react';
import { GameRenderer } from '../engine/Renderer';
import { ObjectPool } from '../engine/ObjectPool';

interface Insect {
  id: number;
  lane: number;
  y: number;
  spriteIndex: number;
  speed: number;
  active: boolean;
}

interface PsyEffect {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
  active: boolean;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    score, highScore, gameOver, isPlaying, isFeverMode, feverProgress,
    addScore, setGameOver, startGame: startStoreGame, setFeverMode
  } = useGameStore();

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const videosRef = useRef<HTMLVideoElement[]>([]);

  const insectPool = useMemo(() => new ObjectPool<Insect>(
    () => ({ id: 0, lane: 0, y: 0, spriteIndex: 0, speed: 0, active: false }),
    (obj) => { obj.active = false; }
  ), []);

  const effectPool = useMemo(() => new ObjectPool<PsyEffect>(
    () => ({ x: 0, y: 0, life: 0, maxLife: 30, hue: 0, active: false }),
    (obj) => { obj.active = false; }
  ), []);

  const state = useRef({
    insects: [] as Insect[],
    psyEffects: [] as PsyEffect[],
    speed: GAME_SETTINGS.INITIAL_SPEED,
    frames: 0,
    lastSpawnFrame: 0,
    hue: 0,
    insectIdCounter: 0,
    bgIndex: 0,
    shake: 0,
  });

  const requestRef = useRef<number>(null!) ;

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

  const spawnInsect = () => {
    const lane = Math.floor(Math.random() * GAME_SETTINGS.LANE_COUNT);
    const spriteIndex = isFeverMode ? (Math.floor(Math.random() * 4) + 8) : Math.floor(Math.random() * 4);
    const insect = insectPool.acquire();
    insect.id = state.current.insectIdCounter++;
    insect.lane = lane;
    insect.y = -GAME_SETTINGS.TILE_HEIGHT;
    insect.spriteIndex = spriteIndex;
    insect.speed = state.current.speed * (isFeverMode ? 1.5 : 1);
    insect.active = true;
    state.current.insects.push(insect);
  };

  const startGame = () => {
    audio.init();
    audio.playBgm();
    startStoreGame();
    state.current.insects.forEach(i => insectPool.release(i));
    state.current.psyEffects.forEach(e => effectPool.release(e));
    state.current = {
      insects: [],
      psyEffects: [],
      speed: GAME_SETTINGS.INITIAL_SPEED,
      frames: 0,
      lastSpawnFrame: 0,
      hue: 0,
      insectIdCounter: 0,
      bgIndex: Math.floor(Math.random() * 4) + 4,
      shake: 0,
    };
    requestRef.current = requestAnimationFrame(update);
  };

  const update = () => {
    if (gameOver || !isPlaying) return;

    state.current.frames++;
    state.current.hue = (state.current.hue + (isFeverMode ? 5 : 1)) % 360;

    if (score >= GAME_SETTINGS.FEVER_THRESHOLD && !isFeverMode) {
        setFeverMode(true);
        audio.playFeverActivation();
    }

    if (state.current.shake > 0) state.current.shake *= 0.9;
    if (isFeverMode && state.current.frames % 10 === 0) state.current.shake = 10;

    state.current.speed = Math.min(
      GAME_SETTINGS.INITIAL_SPEED + (score * GAME_SETTINGS.SPEED_INCREMENT),
      GAME_SETTINGS.MAX_SPEED
    );

    const baseInterval = isFeverMode ? 30 : 100;
    const spawnInterval = Math.max(20, baseInterval - Math.floor(score / 10));
    if (state.current.frames - state.current.lastSpawnFrame > spawnInterval) {
      spawnInsect();
      state.current.lastSpawnFrame = state.current.frames;
    }

    const canvasHeight = canvasRef.current?.height || 0;
    state.current.insects.forEach((insect) => {
      insect.y += insect.speed;
      if (insect.y > canvasHeight) {
        if (!isFeverMode) {
          setGameOver(true);
          audio.playErrorSound();
          audio.stopBgm();
        } else {
          insect.y = -GAME_SETTINGS.TILE_HEIGHT;
        }
      }
    });

    state.current.psyEffects = state.current.psyEffects.filter(p => {
      p.life++;
      if (p.life >= p.maxLife) {
          effectPool.release(p);
          return false;
      }
      return true;
    });

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    ctx.save();
    if (state.current.shake > 0) ctx.translate(Math.random() * state.current.shake, Math.random() * state.current.shake);

    GameRenderer.drawBackground(
      ctx, canvas, isFeverMode, state.current.hue,
      imagesRef.current[state.current.bgIndex], videosRef.current[0]
    );

    GameRenderer.drawInsects(
      ctx, canvas, state.current.insects, imagesRef.current,
      isFeverMode, state.current.hue, state.current.frames
    );

    GameRenderer.drawPsyEffects(ctx, state.current.psyEffects);

    ctx.restore();
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!isPlaying || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const laneWidth = canvas.width / GAME_SETTINGS.LANE_COUNT;
    const clickedLane = Math.floor(x / laneWidth);

    let targetIndex = -1;
    let maxY = -1;

    for (let i = 0; i < state.current.insects.length; i++) {
        const ins = state.current.insects[i];
        if (ins.lane === clickedLane && ins.y > maxY) {
            maxY = ins.y;
            targetIndex = i;
        }
    }

    if (targetIndex !== -1) {
      const target = state.current.insects[targetIndex];
      const effect = effectPool.acquire();
      effect.x = target.lane * laneWidth + laneWidth / 2;
      effect.y = target.y + GAME_SETTINGS.TILE_HEIGHT / 2;
      effect.life = 0;
      effect.hue = Math.random() * 360;
      effect.active = true;
      state.current.psyEffects.push(effect);

      state.current.insects.splice(targetIndex, 1);
      insectPool.release(target);

      addScore(isFeverMode ? 20 : 10);
      state.current.shake = isFeverMode ? 15 : 5;
      audio.playTapSound(isFeverMode);
      videosRef.current.forEach(v => { if (v.paused) v.play().catch(() => {}); });
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

  if (!assetsLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-2xl animate-pulse font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-yellow-500">LOADING PINIK PIPRA...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full sm:max-w-md sm:h-[90vh] mx-auto bg-black overflow-hidden shadow-2xl sm:rounded-2xl sm:border border-white/10">
      <div className="absolute top-4 left-0 right-0 z-10 flex flex-col px-6 pointer-events-none">
        <div className="flex justify-between items-start">
            <div className="text-white font-mono text-2xl drop-shadow-md flex flex-col">
            <motion.span animate={{ scale: isFeverMode ? [1, 1.1, 1] : 1 }} transition={{ repeat: Infinity, duration: 0.5 }}>
                Score: {score}
            </motion.span>
            {isFeverMode && (
                <span className="text-fuchsia-400 animate-pulse text-xl font-bold drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]">FEVER MODE!</span>
            )}
            </div>
            <div className="text-white/50 font-mono text-xl drop-shadow-md">Best: {highScore}</div>
        </div>
        {!isFeverMode && (
            <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden backdrop-blur-sm border border-white/5">
                <motion.div className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${feverProgress * 100}%` }} />
            </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
        onTouchStart={(e) => handleInteraction(e.touches[0].clientX, e.touches[0].clientY)}
      />

      <AnimatePresence>
      {(!isPlaying || gameOver) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
          <motion.h1 animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-yellow-500 mb-2 text-center drop-shadow-[0_0_20px_rgba(0,0,0,1)] transform -skew-x-6">PINIK<br/>PIPRA</motion.h1>
          {gameOver && (
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="mb-8 text-center">
              <p className="text-red-500 font-mono text-xl mb-2 tracking-tighter">TRIP ENDED (GAME OVER)</p>
              <p className="text-white font-mono text-4xl font-bold underline decoration-fuchsia-500">Score: {score}</p>
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={startGame} className="px-12 py-5 bg-white text-black font-black text-2xl rounded-full transition-shadow shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.8)]">
            {gameOver ? 'RE-UP' : 'BEGIN TRIP'}
          </motion.button>
          <p className="mt-8 text-white/30 text-xs font-mono uppercase tracking-[0.2em]">"Get high with the ants"</p>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
