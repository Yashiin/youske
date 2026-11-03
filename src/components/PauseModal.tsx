import React from 'react';
import { Play, RotateCcw, Home, HelpCircle, Flame } from 'lucide-react';
import { Difficulty } from '../game/types';
import { DIFFICULTY_SETTINGS } from '../game/combat';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenControls: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  onOpenControls,
  difficulty,
  onChangeDifficulty,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/85 select-none animate-fade-in font-mono">
      <div className="max-w-md w-full p-8 bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black font-cinzel text-neutral-100 tracking-wider">
          PAUSED
        </h2>
        <div className="h-px w-16 bg-neutral-700 my-4" />

        {/* Difficulty Selector inside Pause Menu */}
        <div className="w-full mb-4 p-3 bg-neutral-900/80 border border-neutral-800 flex flex-col items-center gap-2">
          <span className="text-[11px] font-cinzel text-neutral-400 flex items-center gap-1">
            <Flame size={12} className="text-red-500" /> DIFICULTAD
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {(['normal', 'hard', 'nightmare'] as Difficulty[]).map((diffKey) => {
              const cfg = DIFFICULTY_SETTINGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  onClick={() => onChangeDifficulty(diffKey)}
                  className={`py-1.5 px-2 text-[10px] transition-colors border ${
                    isSelected
                      ? diffKey === 'nightmare'
                        ? 'bg-red-950 border-red-500 text-red-200 font-bold'
                        : diffKey === 'hard'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                        : 'bg-sky-950/80 border-sky-500 text-sky-200 font-bold'
                      : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cfg.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-neutral-400">
            {DIFFICULTY_SETTINGS[difficulty].subtitle}
          </span>
        </div>

        <div className="flex flex-col gap-3 w-full mt-1">
          <button
            data-start="true"
            onClick={onResume}
            className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs tracking-widest border border-red-500 flex items-center justify-center gap-2 transition-colors"
          >
            <Play size={14} className="fill-white" />
            <span>RESUME [ESC]</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-mono text-xs border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={14} />
            <span>RESTART STAGE [R]</span>
          </button>

          <button
            onClick={onOpenControls}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-mono text-xs border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
          >
            <HelpCircle size={14} />
            <span>CONTROLS & COMBAT GUIDE</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-3 bg-black/70 hover:bg-black text-neutral-400 hover:text-white font-mono text-xs border border-neutral-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Home size={14} />
            <span>QUIT TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
