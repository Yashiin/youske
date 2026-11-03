import React from 'react';
import { PlayerStats, BossData, Difficulty } from '../game/types';
import { getComboRating, getComboVisualTier, getDifficultyConfig } from '../game/combat';
import { Volume2, VolumeX, Pause, HelpCircle } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  boss: BossData | null;
  stageName: string;
  difficulty: Difficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenControls: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  boss,
  stageName,
  difficulty,
  isMuted,
  onToggleMute,
  onPause,
  onOpenControls,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100));
  const spiritPercent = Math.max(0, Math.min(100, (stats.spirit / stats.maxSpirit) * 100));
  const combo = getComboRating(stats.comboCount);
  const comboTier = getComboVisualTier(stats.comboCount);
  const diffCfg = getDifficultyConfig(difficulty);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 font-mono select-none">
      {/* Top Perimeter Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Yosuke Vitality & Spirit Cluster */}
        <div className="flex flex-col gap-2 w-72 sm:w-84">
          <div className="flex items-center justify-between text-xs tracking-wider">
            <span className="font-bold text-red-400 font-cinzel">YOSUKE</span>
            <span className="text-neutral-400 tabular-nums">
              {Math.round(stats.hp)} / {stats.maxHp} HP
            </span>
          </div>

          {/* Health Bar with Ornate Frame */}
          <div className="relative w-full h-4 bg-neutral-900 border border-neutral-700 shadow-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-600 to-rose-500 transition-all duration-100 ease-out"
              style={{ width: `${hpPercent}%` }}
            />
            {/* Health notches */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-30">
              <div className="w-px h-full bg-white/40" />
              <div className="w-px h-full bg-white/40" />
              <div className="w-px h-full bg-white/40" />
            </div>
          </div>

          {/* Stamina & Spirit Sub-bars */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            {/* Stamina Bar (for Dashing & Heavy Attacks) */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-amber-400 font-bold">
                <span>STM</span>
                <span className="tabular-nums">{Math.round(stats.stamina)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-75"
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
            </div>

            {/* Spirit Gauge (Charge for Counters & Finishers) */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-cyan-400 font-bold">
                <span>SPIRIT</span>
                <span className="tabular-nums">{Math.round(stats.spirit)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-75"
                  style={{ width: `${spiritPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Boss Health Bar (if active) */}
        {boss && (
          <div className="flex flex-col items-center w-full max-w-lg px-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-black text-rose-500 tracking-widest font-cinzel">
                {boss.name}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                — {boss.title}
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-red-950 border border-red-800 text-red-300">
                PHASE {boss.phase === 'scripted_defeat' ? 'III' : boss.phase}
              </span>
            </div>
            <div className="relative w-full h-5 bg-neutral-950 border-2 border-red-900/80 shadow-2xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-800 via-red-600 to-amber-500 transition-all duration-150"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Right: Controls & Utility Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 bg-neutral-900/90 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors shadow-md"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={onOpenControls}
            aria-label="View Controls"
            className="p-2 bg-neutral-900/90 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors shadow-md"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="p-2 bg-neutral-900/90 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors shadow-md"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Middle Floating Combo Cluster with Dual Feedback Milestone Titles */}
      {stats.comboCount >= 2 && (
        <div
          className="absolute right-8 top-28 flex flex-col items-end pointer-events-none transition-transform duration-100 ease-out origin-right"
          style={{
            transform: `scale(${Math.min(1.45, 0.95 + comboTier.scale * 0.18)})`,
            filter: `drop-shadow(0 0 14px ${comboTier.color}80)`,
          }}
        >
          {/* Main Combo Hit Counter with dynamic size and Blood & Soul color */}
          <div
            className="font-black italic tracking-tighter leading-none flex items-baseline gap-1.5 select-none"
            style={{
              color: comboTier.color,
              fontSize: comboTier.tier === 4 ? '3.5rem' : comboTier.tier === 3 ? '3.0rem' : comboTier.tier === 2 ? '2.5rem' : '2.0rem',
              textShadow: `0 0 18px ${comboTier.color}, 2px 2px 0 #050508, -2px -2px 0 #050508, 2px -2px 0 #050508, -2px 2px 0 #050508`,
            }}
          >
            <span>{stats.comboCount}</span>
            <span className="text-sm sm:text-base font-bold tracking-widest uppercase opacity-90">HITS</span>
          </div>

          {/* Screen Milestone Title Badge */}
          <div
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black tracking-widest uppercase mt-1 px-2.5 py-0.5 bg-black/80 border shadow-lg"
            style={{
              borderColor: comboTier.color,
              color: comboTier.color,
              boxShadow: `0 0 10px ${comboTier.color}40`,
            }}
          >
            <span>{comboTier.tier === 4 ? '☠' : comboTier.tier === 3 ? '⚡' : '✦'}</span>
            <span>{comboTier.label}</span>
            <span>{comboTier.tier === 4 ? '☠' : comboTier.tier === 3 ? '⚡' : '✦'}</span>
          </div>

          {/* Combo Decay Timer Gauge */}
          <div className="w-32 h-1 bg-black/80 border border-neutral-800 mt-1.5 overflow-hidden">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${Math.max(0, Math.min(100, (stats.comboTimer / 1.6) * 100))}%`,
                backgroundColor: comboTier.color,
                boxShadow: `0 0 6px ${comboTier.color}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Perimeter Bar */}
      <div className="flex items-end justify-between w-full">
        {/* Stage Name & Difficulty Indicator */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-neutral-400 font-cinzel tracking-wider px-2.5 py-1 bg-black/60 border border-neutral-800">
            {stageName}
          </div>
          <div
            className="text-[10px] font-bold tracking-wider px-2 py-1 bg-black/75 border"
            style={{ borderColor: diffCfg.badgeColor, color: diffCfg.badgeColor }}
          >
            {diffCfg.label}
          </div>
        </div>

        {/* Quick Control Hints */}
        <div className="hidden md:flex items-center gap-3 text-[10px] text-neutral-400 bg-black/75 px-3 py-1 border border-neutral-800 tracking-wide">
          <span><kbd className="text-white">WASD</kbd> Move/Aim</span>
          <span><kbd className="text-white">Space</kbd> Jump</span>
          <span><kbd className="text-white">J</kbd> Light</span>
          <span><kbd className="text-white">K</kbd> Heavy</span>
          <span><kbd className="text-white">Shift</kbd> 8-Dir Dash</span>
          <span><kbd className="text-white">L</kbd> Parry</span>
        </div>
      </div>
    </div>
  );
};
