import React from 'react';
import { PlayerStats } from '../game/types';
import { RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverModalProps {
  stats: PlayerStats;
  onRespawn: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRespawn,
  onReturnTitle,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/90 select-none animate-fade-in font-mono">
      <div className="max-w-md w-full p-8 bg-neutral-950 border border-red-900/80 shadow-[0_0_35px_rgba(220,38,38,0.25)] flex flex-col items-center text-center">
        <Skull className="text-red-500 w-12 h-12 mb-3" />
        <h2 className="text-3xl font-black font-cinzel text-neutral-100 tracking-wider">
          YOU HAVE FALLEN
        </h2>
        <div className="h-px w-20 bg-red-700 my-3" />

        <div className="w-full my-2 p-3 bg-red-950/40 border border-red-900/60 rounded flex items-center gap-3 text-left">
          <div className="w-9 h-9 flex-shrink-0 bg-neutral-900 border border-red-800 flex items-center justify-center text-xs font-bold font-cinzel text-red-400">
            YOS
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-red-400 font-cinzel block tracking-wider font-semibold">
              YOSUKE
            </span>
            <p className="text-sm font-cinzel text-neutral-200 italic">
              "¿Qué rayos...?"
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 max-w-xs mb-5">
          La horda demoníaca superó tu defensa. Reanuda la batalla desde el santuario.
        </p>

        {/* Run stats */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 p-3 bg-neutral-900 border border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-500 block text-[10px]">PARRIES</span>
            <span className="text-cyan-400 font-bold text-base tabular-nums">
              {stats.parrySuccessCount}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px]">SCORE</span>
            <span className="text-amber-400 font-bold text-base tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            data-start="true"
            onClick={onRespawn}
            className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs tracking-widest border border-red-500 flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <RotateCcw size={14} />
            <span>RESPAWN AT SANCTUARY</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs border border-neutral-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Home size={14} />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
