import React, { useEffect, useRef, useState } from 'react';
import { X, BookOpen, Swords, Shield, Flame, Compass } from 'lucide-react';
import { Difficulty, EnemyType } from '../game/types';
import { DIFFICULTY_SETTINGS } from '../game/combat';
import {
  BESTIARY_ENTRIES,
  BestiaryEntry,
  BestiaryPreviewAction,
  getScaledBestiaryStats,
} from '../game/bestiary';
import { ashGhoulAtlas } from '../game/ashGhoulSprites';
import { oniWarriorAtlas } from '../game/oniWarriorSprites';
import { agileDemonAtlas } from '../game/agileDemonSprites';
import { heavyDemonAtlas } from '../game/heavyDemonSprites';
import { malakorAtlas } from '../game/malakorSprites';
import { bossAtlas, enemyAtlas, PALETTE } from '../game/pixelArt';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
}

const PREVIEW_ACTIONS: Array<{ id: BestiaryPreviewAction; label: string }> = [
  { id: 'idle', label: 'Idle' },
  { id: 'chase', label: 'Move' },
  { id: 'windup', label: 'Windup' },
  { id: 'attack', label: 'Attack' },
  { id: 'hurt', label: 'Hurt' },
  { id: 'dead', label: 'Defeat' },
];

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  difficulty,
  onChangeDifficulty,
}) => {
  const [selectedId, setSelectedId] = useState<EnemyType>('basic_monster');
  const [previewAction, setPreviewAction] = useState<BestiaryPreviewAction>('idle');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedEntry: BestiaryEntry =
    BESTIARY_ENTRIES.find((e) => e.id === selectedId) || BESTIARY_ENTRIES[0];
  const scaledStats = getScaledBestiaryStats(selectedEntry, difficulty);

  // Reset preview animation to 'idle' when switching demon archetype
  const handleSelectArchetype = (id: EnemyType) => {
    setSelectedId(id);
    setPreviewAction('idle');
  };

  // Close on Escape key when Bestiary is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // 60 FPS Live Sprite Preview Renderer
  useEffect(() => {
    if (!isOpen) return;
    let rafId: number | null = null;
    const startTime = performance.now();

    const renderPreview = (now: number) => {
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const elapsed = (now - startTime) / 1000;

          ctx.clearRect(0, 0, w, h);
          ctx.imageSmoothingEnabled = false;

          // Subtle dark chamber backdrop
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#090d16');
          bgGrad.addColorStop(0.75, '#111827');
          bgGrad.addColorStop(1, '#090b10');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          // Ground pedestal baseline
          const floorY = Math.round(h * 0.80);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(24, floorY);
          ctx.lineTo(w - 24, floorY);
          ctx.stroke();

          // Subtle ground shadow ellipse
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.beginPath();
          ctx.ellipse(w / 2, floorY + 2, selectedEntry.id === 'boss_malakor' ? 56 : 32, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          const centerX = Math.round(w / 2);
          ctx.translate(centerX, floorY);

          if (selectedEntry.id === 'boss_malakor') {
            const bossAttackMap: Record<BestiaryPreviewAction, string> = {
              idle: 'idle',
              patrol: 'idle',
              chase: 'idle',
              windup: 'cleave',
              attack: 'cleave',
              hurt: 'hurt',
              dead: 'defeat',
            };
            const mappedAttack = bossAttackMap[previewAction] || 'idle';
            const simVx = previewAction === 'chase' || previewAction === 'patrol' ? 125 : 0;
            const simPending = previewAction === 'windup' ? 0.35 : 0;
            const malakorFrame = malakorAtlas.getFrame(
              mappedAttack,
              true,
              simVx,
              0,
              simPending,
              0,
              elapsed
            );

            if (malakorFrame && malakorFrame.canvas) {
              const previewScale = 0.72;
              ctx.scale(previewScale, previewScale);
              ctx.drawImage(
                malakorFrame.canvas,
                Math.round(-malakorFrame.originX),
                Math.round(-malakorFrame.originY)
              );
            } else {
              const bossScale = 0.68;
              ctx.scale(bossScale, bossScale);
              const breath = Math.sin(elapsed * 3) * 3;
              const torso = bossAtlas.torsoSprite;
              if (torso && torso.canvas) {
                ctx.drawImage(
                  torso.canvas,
                  Math.round(-torso.originX),
                  Math.round(-torso.originY + breath)
                );
              }
              const head = bossAtlas.headSprite;
              if (head && head.canvas) {
                ctx.drawImage(
                  head.canvas,
                  Math.round(-head.originX),
                  Math.round(-head.originY - 110 + breath)
                );
              }
              if (previewAction === 'attack' || previewAction === 'windup') {
                ctx.strokeStyle = PALETTE.bossRuneDark;
                ctx.lineWidth = 14;
                ctx.beginPath();
                ctx.moveTo(40, -160 + breath);
                ctx.lineTo(-150, -20);
                ctx.stroke();
              }
            }
          } else {
            // Standard & Elite Demons rendered at 1.65x zoom for crisp pixel inspection
            const zoom = 1.65;
            ctx.scale(zoom, zoom);

            const isMoving = previewAction === 'chase' || previewAction === 'patrol';
            const simVx = isMoving ? 150 : 0;
            const simDist = isMoving ? elapsed * 135 : 0;

            let cycleDuration = 0.85;
            if (previewAction === 'attack') cycleDuration = 0.55;
            if (previewAction === 'windup') cycleDuration = 0.65;
            if (previewAction === 'hurt') cycleDuration = 0.65;
            if (previewAction === 'dead') cycleDuration = 1.1;

            const stateTimer = elapsed % cycleDuration;

            let sprite: { canvas: HTMLCanvasElement; originX: number; originY: number } | null = null;

            if (selectedEntry.id === 'basic_monster') {
              sprite =
                ashGhoulAtlas.getFrame(previewAction, stateTimer, elapsed, simVx, simDist) ||
                enemyAtlas.ghoulFrames[0];
            } else if (selectedEntry.id === 'demon_warrior') {
              sprite =
                oniWarriorAtlas.getFrame(
                  previewAction,
                  stateTimer,
                  elapsed,
                  false,
                  simVx,
                  simDist
                ) || enemyAtlas.warriorFrames[0];
            } else if (selectedEntry.id === 'agile_demon') {
              sprite =
                agileDemonAtlas.getFrame(
                  previewAction,
                  stateTimer,
                  elapsed,
                  simVx,
                  0,
                  true,
                  simDist
                ) || enemyAtlas.wraithFrames[0];
            } else if (selectedEntry.id === 'heavy_demon') {
              sprite =
                heavyDemonAtlas.getFrame(previewAction, stateTimer, elapsed, simVx, simDist) ||
                enemyAtlas.goliathFrames[0];
            }

            if (sprite && sprite.canvas) {
              ctx.drawImage(
                sprite.canvas,
                Math.round(-sprite.originX),
                Math.round(-sprite.originY)
              );
            }
          }

          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(renderPreview);
    };

    rafId = requestAnimationFrame(renderPreview);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isOpen, selectedEntry, previewAction]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bestiary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 select-none animate-fade-in font-mono"
    >
      <div className="max-w-5xl w-full bg-neutral-950 border border-neutral-800 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-500 tracking-widest uppercase font-cinzel font-bold">
              <BookOpen size={14} />
              <span>CODEX OF THE ABYSS</span>
            </div>
            <h2
              id="bestiary-modal-title"
              className="text-xl sm:text-2xl font-black font-cinzel text-neutral-100 tracking-wider mt-0.5"
            >
              DEMONIC BESTIARY
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Difficulty Scaling Filter */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 px-2 flex items-center gap-1 font-cinzel">
                <Flame size={12} className="text-red-500" /> STATS:
              </span>
              {(['normal', 'hard', 'nightmare'] as Difficulty[]).map((diffKey) => {
                const cfg = DIFFICULTY_SETTINGS[diffKey];
                const isSelected = difficulty === diffKey;
                return (
                  <button
                    key={diffKey}
                    onClick={() => onChangeDifficulty(diffKey)}
                    className={`px-2.5 py-1 text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-red-950 text-red-200 font-bold border border-red-600'
                        : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              aria-label="Close Bestiary"
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Grid: Left Archetype Roster + Right Detailed Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
          {/* Left Column: Encountered Demon Archetypes Roster */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-neutral-950/60 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-3 font-cinzel">
                Encountered Archetypes ({BESTIARY_ENTRIES.length})
              </div>
              <div className="space-y-1.5">
                {BESTIARY_ENTRIES.map((entry) => {
                  const isActive = entry.id === selectedEntry.id;
                  return (
                    <button
                      key={entry.id}
                      data-bestiary-entry={entry.id}
                      onClick={() => handleSelectArchetype(entry.id)}
                      className={`w-full text-left p-3 transition-colors border ${
                        isActive
                          ? 'bg-neutral-900 border-red-600 text-white'
                          : 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-cinzel font-bold text-sm tracking-wide text-neutral-100">
                          {entry.index}. {entry.name}
                        </span>
                        <span className="text-[11px] text-neutral-400 tabular-nums">
                          {Math.round(entry.baseHp * DIFFICULTY_SETTINGS[difficulty].hpMult)} HP
                        </span>
                      </div>
                      <div className="text-xs text-red-400/90 mt-0.5">{entry.japaneseTitle}</div>
                      <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
                        <span>{entry.classification}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              Select any demon archetype above to inspect its animated combat stances, lore records, and difficulty-scaled telemetry.
            </div>
          </div>

          {/* Right Column: Selected Archetype Dossier */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-6 overflow-y-auto">
            {/* Top Section: Sprite Stage + Primary Identity & Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Live Animated Sprite Stage */}
              <div className="md:col-span-5 flex flex-col">
                <div className="relative border border-neutral-800 bg-neutral-900/50 flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={previewCanvasRef}
                    width={260}
                    height={210}
                    className="w-full h-[210px] block pixelated"
                  />
                  <div className="absolute top-2.5 left-3 text-[11px] text-neutral-400">
                    <span>{selectedEntry.index}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="uppercase">{previewAction}</span>
                  </div>
                </div>

                {/* Animation State Selector Controls */}
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {PREVIEW_ACTIONS.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setPreviewAction(act.id)}
                      className={`py-1.5 px-2 text-[11px] border transition-colors ${
                        previewAction === act.id
                          ? 'bg-neutral-800 border-red-500 text-white font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Archetype Header & Tabular Combat Telemetry */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                    <span>{selectedEntry.classification}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400">{selectedEntry.threatLevel}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-neutral-100 tracking-wide mt-1">
                    {selectedEntry.name}
                  </h3>
                  <p className="text-xs text-amber-400/90 mt-0.5">
                    {selectedEntry.japaneseTitle} — {selectedEntry.subtitle}
                  </p>
                </div>

                {/* Clean Tabular Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 py-3 border-y border-neutral-800 text-xs tabular-nums">
                  <div>
                    <div className="text-[11px] text-neutral-400">Vitality (HP)</div>
                    <div className="text-sm font-bold text-neutral-100 mt-0.5">
                      {scaledStats.hp} HP
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">Base Strike Damage</div>
                    <div className="text-sm font-bold text-red-400 mt-0.5">
                      {scaledStats.damage} DMG
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">Pursuit Speed</div>
                    <div className="text-sm font-bold text-neutral-100 mt-0.5">
                      {scaledStats.chaseSpeed > 0 ? `${scaledStats.chaseSpeed} px/s` : 'Stationary Sovereign'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">Telegraph Windup</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">
                      {scaledStats.windupSeconds}s
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">Detection Range</div>
                    <div className="text-sm font-bold text-neutral-100 mt-0.5">
                      {scaledStats.aggroDistance} px
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">Collision Box</div>
                    <div className="text-sm font-bold text-neutral-300 mt-0.5">
                      {selectedEntry.dimensions.width} × {selectedEntry.dimensions.height} px
                    </div>
                  </div>
                </div>

                {/* Encounter Locations (Unboxed Clean Metadata) */}
                <div className="text-xs text-neutral-300 flex items-start gap-2">
                  <Compass size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400">Encountered in: </span>
                    <span>{scaledStats.chaptersEncountered.join(' · ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lore Section */}
            <div className="pt-2 border-t border-neutral-800/80">
              <h4 className="text-xs font-bold font-cinzel text-red-400 uppercase tracking-wider mb-2">
                Abyssal Chronicle & Lore
              </h4>
              <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
                {selectedEntry.lore.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Tactical AI & Combat Behaviors */}
            <div className="pt-2 border-t border-neutral-800/80">
              <h4 className="text-xs font-bold font-cinzel text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Swords size={14} /> Tactical AI & Signature Abilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedEntry.tacticalBehaviors.map((ability) => (
                  <div
                    key={ability.name}
                    className="p-3.5 bg-neutral-900/60 border border-neutral-800"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-bold text-neutral-100 text-xs">{ability.name}</span>
                      <span className="text-[11px] text-red-400">{ability.tag}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Yosuke's Counter-Strategy */}
            <div className="p-4 bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2 font-cinzel font-bold text-xs text-cyan-400 uppercase tracking-wider mb-1">
                <Shield size={14} /> Swordsman Counter-Strategy
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {selectedEntry.counterStrategy}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-400">
            Combat parameters dynamically reflect the selected difficulty ({DIFFICULTY_SETTINGS[difficulty].label}).
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs tracking-widest border border-red-500 transition-colors"
          >
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
