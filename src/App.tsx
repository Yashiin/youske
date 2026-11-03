/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { GameState, PlayerStats, BossData, DialogueLine, Difficulty } from './game/types';
import { audio } from './game/audio';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { EndPrologueModal } from './components/EndPrologueModal';
import { ControlsModal } from './components/ControlsModal';
import { CinematicDialogueBox } from './components/CinematicDialogueBox';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const reqAnimFrameRef = useRef<number | null>(null);

  // React UI state (throttled to phase/integer changes, never 60Hz)
  const [gameState, setGameState] = useState<GameState>('title');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    hp: 150,
    maxHp: 150,
    stamina: 100,
    maxStamina: 100,
    spirit: 50,
    maxSpirit: 100,
    comboCount: 0,
    comboTimer: 0,
    score: 0,
    parrySuccessCount: 0,
    counterCount: 0,
  });
  const [bossData, setBossData] = useState<BossData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [stageName, setStageName] = useState('Chapter I: The Ashen Forest');

  // Initialize Engine & Renderer
  useEffect(() => {
    const engine = new GameEngine();
    const renderer = new GameRenderer();

    engineRef.current = engine;
    rendererRef.current = renderer;
    (window as unknown as { __ENGINE?: GameEngine; __AUDIO?: typeof audio }).__ENGINE = engine;
    (window as unknown as { __ENGINE?: GameEngine; __AUDIO?: typeof audio }).__AUDIO = audio;

    engine.setCallbacks(
      (newState) => {
        setGameState(newState);
        setStageName(engine.level.name);
      },
      (newStats) => {
        setStats({ ...newStats });
      },
      (newBoss) => {
        setBossData(newBoss ? { ...newBoss } : null);
      },
      (newDialogue) => {
        setActiveDialogue(newDialogue ? { ...newDialogue } : null);
      }
    );

    // Check autostart query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      engine.startGame(0);
    } else {
      document.body.dataset.state = 'title';
    }

    // Window Resize Observer for canvas sizing
    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      renderer.setDimensions(w, h);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // 60 FPS Game Loop
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const now = currentTime || performance.now();
      const rawDt = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;

      const dt = Math.min(isNaN(rawDt) ? 0.016 : rawDt, 0.05);

      // Advance Engine simulation
      engine.update(dt);

      // Render Frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Update camera
          renderer.update(
            dt,
            engine.player.x,
            engine.player.y,
            engine.level.bounds.width,
            engine.level.bounds.height
          );

          if (engine.screenShakeRequest > 0) {
            renderer.triggerShake(engine.screenShakeRequest);
            engine.screenShakeRequest = 0;
          }

          // Render
          renderer.render(
            ctx,
            engine.level,
            engine.player,
            engine.enemies,
            engine.boss,
            engine.particles,
            engine.damageNumbers,
            engine.hitstopTimer
          );
        }
      }

      reqAnimFrameRef.current = requestAnimationFrame(loop);
    };

    reqAnimFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqAnimFrameRef.current) {
        cancelAnimationFrame(reqAnimFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Global Keyboard Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Title screen Enter / Space to start (respects selected stage & difficulty in TitleScreen)
      if (engine.state === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        const startBtn = document.querySelector<HTMLButtonElement>('button[data-start="true"]');
        if (startBtn) {
          startBtn.click();
        } else {
          engine.startGame(0, engine.difficulty);
        }
        return;
      }

      // Pause toggle (if dialogue is active, Escape skips dialogue instead of pausing)
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (engine.activeDialogue && e.code === 'Escape') {
          engine.skipDialogue();
          return;
        }
        if (engine.state === 'playing') {
          engine.pauseGame();
        } else if (engine.state === 'paused') {
          engine.resumeGame();
        }
        return;
      }

      // Mute toggle
      if (e.code === 'KeyM') {
        const muted = audio.toggleMute();
        setIsMuted(muted);
        return;
      }

      // Restart shortcut while paused
      if (engine.state === 'paused' && e.code === 'KeyR') {
        engine.startGame(engine.currentLevelIndex, engine.difficulty);
        return;
      }

      // Send to engine
      engine.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.handleKeyUp(e.code);
    };

    const handleBlur = () => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.clearInputs();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Handlers
  const handleChangeDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    engineRef.current?.setDifficulty(diff);
  }, []);

  const handleStartGame = useCallback((stageIdx = 0, diff?: Difficulty) => {
    const targetDiff = diff || engineRef.current?.difficulty || 'normal';
    setDifficulty(targetDiff);
    engineRef.current?.startGame(stageIdx, targetDiff);
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pauseGame();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resumeGame();
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startGame(engineRef.current.currentLevelIndex, engineRef.current.difficulty);
    }
  }, []);

  const handleRespawn = useCallback(() => {
    setActiveDialogue(null);
    engineRef.current?.respawnAtCheckpoint();
  }, []);

  const handleReturnTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.state = 'title';
      engineRef.current.activeDialogue = null;
      engineRef.current.dialogueQueue = [];
      document.body.dataset.state = 'title';
      setActiveDialogue(null);
      setGameState('title');
      audio.setMusicMode('none');
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* 60fps Pixel Art Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pixelated z-0 cursor-crosshair"
      />

      {/* World-Matched Minimalist In-Game HUD (Visible during 'playing' or 'paused') */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <HUD
          stats={stats}
          boss={bossData}
          stageName={stageName}
          difficulty={difficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenControls={() => setIsControlsOpen(true)}
        />
      )}

      {/* Cinematic Narrative Dialogue Box */}
      {activeDialogue && (
        <CinematicDialogueBox
          dialogue={activeDialogue}
          onAdvance={() => engineRef.current?.advanceDialogue()}
          onSkip={() => engineRef.current?.skipDialogue()}
        />
      )}

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenControls={() => setIsControlsOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          difficulty={difficulty}
          onChangeDifficulty={handleChangeDifficulty}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onReturnTitle={handleReturnTitle}
          onOpenControls={() => setIsControlsOpen(true)}
          difficulty={difficulty}
          onChangeDifficulty={handleChangeDifficulty}
        />
      )}

      {/* Game Over (Ordinary Defeat) Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          onRespawn={handleRespawn}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Scripted "END OF PROLOGUE" Narrative Defeat Climax Modal */}
      {gameState === 'prologue_ending' && (
        <EndPrologueModal
          stats={stats}
          onReplayPrologue={() => handleStartGame(0)}
          onReplayBoss={() => handleStartGame(2)}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Controls & Combat Guide Modal */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />
    </div>
  );
}
