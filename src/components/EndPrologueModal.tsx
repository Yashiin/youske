import React from 'react';
import { PlayerStats } from '../game/types';
import { RotateCcw, Swords, Flame, Skull } from 'lucide-react';

interface EndPrologueModalProps {
  stats: PlayerStats;
  onReplayPrologue: () => void;
  onReplayBoss: () => void;
  onReturnTitle: () => void;
}

export const EndPrologueModal: React.FC<EndPrologueModalProps> = ({
  stats,
  onReplayPrologue,
  onReplayBoss,
  onReturnTitle,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/95 select-none animate-fade-in font-mono">
      {/* Narrative Presentation Card */}
      <div className="relative max-w-xl w-full p-8 sm:p-10 bg-neutral-950 border-2 border-red-900/80 shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col items-center text-center">
        {/* Blood Moon Seal Accent */}
        <div className="w-16 h-16 mb-4 rounded-full border-2 border-red-600/70 flex items-center justify-center bg-red-950/40">
          <Skull className="text-red-500 w-8 h-8" />
        </div>

        {/* Narrative Title */}
        <h2 className="text-2xl sm:text-4xl font-black font-cinzel text-neutral-100 tracking-wider">
          END OF PROLOGUE
        </h2>
        <div className="h-px w-24 bg-red-700 my-3" />

        {/* Narrative Story Description */}
        <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed font-serif italic max-w-md">
          <p>
            Yosuke channeled the entirety of his spirit blade into a desperate final stance. For an agonizing second, steel resisted cataclysm.
          </p>
          <p className="text-red-400 font-bold">
            Yet the abyssal titan’s power was absolute. The blade shattered into embers.
          </p>
          <p className="text-neutral-400">
            Felled and bleeding upon the cracked sanctuary stones, Yosuke gazes up into the burning crimson eyes of Malakor. Darkness claims the realm...
          </p>
          <p className="text-neutral-100 font-sans not-italic font-bold tracking-wide pt-2">
            The blade is broken. The true battle has only begun.
          </p>
        </div>

        {/* Combat Run Statistics */}
        <div className="grid grid-cols-3 gap-3 w-full my-6 p-4 bg-neutral-900/90 border border-neutral-800 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-sans">Max Combo</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 tabular-nums">
              {stats.comboCount > 0 ? stats.comboCount : 12} HITS
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-sans">Parries Landed</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400 tabular-nums">
              {stats.parrySuccessCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase font-sans">Final Score</span>
            <span className="text-base sm:text-lg font-bold text-rose-400 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            data-start="true"
            onClick={onReplayPrologue}
            className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs tracking-widest border border-red-500 flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <RotateCcw size={14} />
            <span>PLAY AGAIN FROM START</span>
          </button>

          <button
            onClick={onReplayBoss}
            className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Swords size={14} />
            <span>REMATCH GIANT DEMON</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full sm:w-auto px-5 py-3 bg-black/60 hover:bg-black text-neutral-400 hover:text-neutral-200 font-mono text-xs border border-neutral-800 transition-colors"
          >
            TITLE SCREEN
          </button>
        </div>
      </div>
    </div>
  );
};
