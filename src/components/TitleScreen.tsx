import React from 'react';
import { Volume2, VolumeX, Shield, Swords, Sparkles, Play, Flame } from 'lucide-react';
import { Difficulty } from '../game/types';
import { DIFFICULTY_SETTINGS } from '../game/combat';

interface TitleScreenProps {
  onStart: (stageIdx?: number, difficulty?: Difficulty) => void;
  onOpenControls: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenControls,
  isMuted,
  onToggleMute,
  difficulty,
  onChangeDifficulty,
}) => {
  const [selectedStage, setSelectedStage] = React.useState(0);
  const currentDiffCfg = DIFFICULTY_SETTINGS[difficulty];

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between items-center p-6 sm:p-10 select-none overflow-hidden bg-neutral-950/80">
      {/* Background Dark Vignette & Mist */}
      <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/80 to-neutral-950 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full flex justify-between items-center z-10 max-w-5xl">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-400 font-cinzel">
          <span className="w-2 h-2 bg-red-600 inline-block" />
          <span>PROLOGUE EDITION</span>
        </div>
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="p-2.5 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors shadow-lg"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Center Hero Lockup & SVG Emblem */}
      <div className="flex flex-col items-center text-center z-10 max-w-2xl px-4 py-4">
        {/* Bespoke Dark Fantasy SVG Blade & Crescent Crest */}
        <div className="mb-3 relative flex items-center justify-center">
          <svg
            className="w-18 h-18 sm:w-22 sm:h-22 text-red-600 filter drop-shadow-[0_0_16px_rgba(220,38,38,0.7)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Demonic Crescent */}
            <path
              d="M50 5 C75 5 95 25 95 50 C95 75 75 95 50 95 C38 95 28 90 20 82 C28 85 38 86 50 86 C70 86 86 70 86 50 C86 30 70 14 50 14 C38 14 28 19 20 27 C28 13 38 5 50 5 Z"
              fill="currentColor"
            />
            {/* Crossed Katana Blade */}
            <line x1="16" y1="84" x2="84" y2="16" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
            <line x1="84" y1="16" x2="72" y2="16" stroke="#fbbf24" strokeWidth="3" />
            <line x1="84" y1="16" x2="84" y2="28" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="28" cy="72" r="5" fill="#dc2626" />
            {/* Center Blood Gem */}
            <polygon points="50,32 58,50 50,68 42,50" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-cinzel text-neutral-100 tracking-wider filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          YOSUKE
        </h1>
        <div className="flex items-center gap-3 my-1.5">
          <div className="h-px w-12 bg-red-600" />
          <h2 className="text-sm sm:text-base font-cinzel tracking-[0.3em] text-red-500 font-bold uppercase">
            The Last Battle
          </h2>
          <div className="h-px w-12 bg-red-600" />
        </div>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mt-1 font-mono leading-relaxed">
          Walk the shadowed path of the disgraced swordsman. Master the blade, parry demonic onslaughts, and confront the colossal terror awaiting in the Abyss.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full justify-center">
          <button
            data-start="true"
            onClick={() => onStart(selectedStage, difficulty)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-cinzel font-bold text-sm tracking-widest border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group transition-all"
          >
            <Play size={16} className="fill-white group-hover:scale-110 transition-transform" />
            <span>START PROLOGUE</span>
          </button>

          <button
            onClick={onOpenControls}
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs tracking-wider border border-neutral-700 shadow-md transition-colors"
          >
            CONTROLS & COMBAT
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-col items-center gap-1.5 mt-5 p-2.5 bg-neutral-900/90 border border-neutral-800 w-full max-w-lg">
          <div className="flex items-center gap-2 w-full justify-center flex-wrap">
            <span className="text-neutral-400 font-cinzel text-[11px] mr-1 flex items-center gap-1">
              <Flame size={12} className="text-red-500" /> DIFICULTAD:
            </span>
            {(['normal', 'hard', 'nightmare'] as Difficulty[]).map((diffKey) => {
              const cfg = DIFFICULTY_SETTINGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  onClick={() => onChangeDifficulty(diffKey)}
                  className={`px-3 py-1 text-[11px] font-mono transition-colors border ${
                    isSelected
                      ? diffKey === 'nightmare'
                        ? 'bg-red-950 border-red-500 text-red-200 font-bold shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                        : diffKey === 'hard'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                      : 'bg-black/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            {currentDiffCfg.subtitle}
          </span>
        </div>

        {/* Stage Selector for quick testing or replay */}
        <div className="flex items-center gap-2 mt-3 p-2 bg-neutral-900/80 border border-neutral-800 text-xs">
          <span className="text-neutral-400 font-cinzel text-[11px] mr-1">STAGE:</span>
          {[
            { id: 0, label: 'I. Ashen Forest' },
            { id: 1, label: 'II. Cursed Ramparts' },
            { id: 2, label: 'III. Abyssal Throne (Boss)' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-2.5 py-1 text-[11px] transition-colors border ${
                selectedStage === st.id
                  ? 'bg-red-950 border-red-600 text-red-200 font-bold'
                  : 'bg-black/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flat Control Hints in Bottom Margin */}
      <div className="z-10 text-[11px] text-neutral-400 font-mono tracking-wide text-center">
        <span>WASD Move · Space Jump · J Light · K Heavy · Shift Dash · L Parry · Esc Pause</span>
      </div>
    </div>
  );
};
