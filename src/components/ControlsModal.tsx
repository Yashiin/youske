import React from 'react';
import { X, Shield, Swords, Zap, Wind } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 select-none animate-fade-in font-mono">
      <div className="max-w-2xl w-full p-6 sm:p-8 bg-neutral-950 border border-neutral-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Controls Modal"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-700"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-black font-cinzel text-neutral-100 tracking-wider">
          COMBAT & CONTROLS GUIDE
        </h2>
        <p className="text-xs text-neutral-400 mt-1 mb-6">
          Master Yosuke's blade mechanics to survive against the demonic hordes.
        </p>

        {/* Keyboard Configuration Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Swords size={14} /> DEFAULT KEYBOARD BINDINGS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Move / Aim</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">WASD / Arrows</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Jump</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">Space</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Light Attack</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">J</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Heavy Strike</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">K</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">8-Dir Dash</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">Shift</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Block / Parry</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">L</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Interact</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">E</kbd>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 flex justify-between items-center">
              <span className="text-neutral-400">Pause / Mute</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white font-bold">Esc / M</kbd>
            </div>
          </div>
        </div>

        {/* Combat Mechanics Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1">
              <Shield size={14} /> PARRY & COUNTERATTACK
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Press <kbd className="text-white bg-neutral-800 px-1">L</kbd> right before an incoming attack strikes. Precise timing triggers a time-freeze, deflects all damage, and stuns the attacker. Immediately press <kbd className="text-white bg-neutral-800 px-1">J</kbd> or <kbd className="text-white bg-neutral-800 px-1">K</kbd> to unleash a lethal 2.5x critical Counterattack!
            </p>
          </div>

          <div className="p-3 bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <Swords size={14} /> LIGHT & HEAVY COMBOS
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Chain 3 consecutive Light attacks for escalating damage and knockback. Press <kbd className="text-white bg-neutral-800 px-1">K</kbd> for a devastating Heavy strike that breaks armored demon guards and staggers heavy brutes.
            </p>
          </div>

          <div className="p-3 bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
              <Wind size={14} /> 8-DIRECTIONAL DASH & AERIAL COMBAT
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Press <kbd className="text-white bg-neutral-800 px-1">Shift</kbd> with any <kbd className="text-white bg-neutral-800 px-1">WASD / Arrow</kbd> direction to dash horizontally, upward, or diagonally with invulnerability frames (i-frames). You can perform 1 air dash per jump before landing.
            </p>
          </div>

          <div className="p-3 bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center gap-2 font-bold text-red-500 mb-1">
              <Zap size={14} /> UNBLOCKABLE DEMONIC STRIKES
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Heavy demons and Malakor launch glowing red attacks labeled <span className="font-bold text-red-400">UNBLOCKABLE</span>. These cannot be blocked or parried—you must Jump or Dash to evade!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold text-xs tracking-widest border border-red-500 transition-colors"
        >
          CLOSE GUIDE
        </button>
      </div>
    </div>
  );
};
