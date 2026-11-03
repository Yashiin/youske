import React, { useEffect, useState, useRef } from 'react';
import { DialogueLine } from '../game/types';
import { PortraitCanvas } from './PortraitCanvas';
import { audio } from '../game/audio';
import { ChevronRight, FastForward } from 'lucide-react';

interface CinematicDialogueBoxProps {
  dialogue: DialogueLine | null;
  onAdvance: () => void;
  onSkip: () => void;
}

export const CinematicDialogueBox: React.FC<CinematicDialogueBoxProps> = ({
  dialogue,
  onAdvance,
  onSkip,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const typewriterTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const fullTextRef = useRef<string>('');

  useEffect(() => {
    if (!dialogue) {
      setDisplayedText('');
      setIsTypingComplete(false);
      setProgress(0);
      return;
    }

    // Play dialogue chime
    audio.playDialogueOpen();

    fullTextRef.current = dialogue.text;
    setDisplayedText('');
    setIsTypingComplete(false);
    setProgress(0);
    startTimeRef.current = Date.now();

    let charIndex = 0;
    const textLen = dialogue.text.length;
    const typingIntervalMs = 28;

    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);

    typewriterTimerRef.current = window.setInterval(() => {
      charIndex++;
      if (charIndex <= textLen) {
        setDisplayedText(dialogue.text.slice(0, charIndex));
        if (charIndex % 3 === 0) {
          audio.playDialogueBlip(dialogue.speaker);
        }
      } else {
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }
        setIsTypingComplete(true);
      }
    }, typingIntervalMs);

    // Auto-advance timer (default 4.0s or dialogue.duration)
    const totalDuration = (dialogue.duration || 4.2) * 1000;
    const progressIntervalMs = 50;

    autoAdvanceTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);

      if (elapsed >= totalDuration) {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
        onAdvance();
      }
    }, progressIntervalMs);

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    };
  }, [dialogue?.id, dialogue?.text, onAdvance]);

  // Handle keyboard inputs: Space/Enter/E to advance, Esc to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogue) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onSkip();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        e.stopPropagation();
        handleClickBox();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [dialogue, isTypingComplete, onAdvance, onSkip]);

  const handleClickBox = () => {
    if (!dialogue) return;
    if (!isTypingComplete) {
      // Instantly reveal all text
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      setDisplayedText(dialogue.text);
      setIsTypingComplete(true);
    } else {
      // Advance to next dialogue
      onAdvance();
    }
  };

  if (!dialogue) return null;

  const isMalakor = dialogue.speaker === 'malakor';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 flex flex-col items-center pointer-events-auto select-none font-mono"
      onClick={handleClickBox}
    >
      <div
        className={`w-full max-w-3xl backdrop-blur-md bg-neutral-950/95 border-2 ${
          isMalakor
            ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.35)]'
            : 'border-red-900/80 shadow-[0_0_35px_rgba(185,28,28,0.25)]'
        } p-4 sm:p-5 flex flex-col gap-3 relative cursor-pointer group`}
      >
        {/* Top bar with speaker name and skip button */}
        <div className="flex items-center justify-between border-b border-red-950 pb-2">
          <div className="flex items-center gap-3">
            <span
              className={`font-cinzel font-black tracking-widest text-base sm:text-lg ${
                isMalakor ? 'text-red-500' : 'text-neutral-100'
              }`}
            >
              {dialogue.speakerName}
            </span>
            {dialogue.speakerTitle && (
              <span className="text-[10px] text-neutral-400 tracking-wider uppercase font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800">
                {dialogue.speakerTitle}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="text-[10px] sm:text-xs text-neutral-400 hover:text-white px-2.5 py-1 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Saltar diálogo (ESC)"
          >
            <FastForward size={12} className="text-red-400" />
            <span>SALTAR [ESC]</span>
          </button>
        </div>

        {/* Content area: Portrait + Typewriter Text */}
        <div className="flex items-start gap-4">
          <PortraitCanvas portrait={dialogue.portrait} size={96} />

          <div className="flex-1 flex flex-col justify-between min-h-[72px]">
            <p
              className={`text-sm sm:text-base leading-relaxed tracking-wide font-cinzel ${
                isMalakor ? 'text-red-200 font-semibold' : 'text-neutral-200'
              }`}
            >
              {displayedText}
              {!isTypingComplete && (
                <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse" />
              )}
            </p>

            {/* Prompt helper indicator */}
            <div className="flex items-center justify-end gap-1.5 pt-2 text-neutral-500 text-[10px] font-mono">
              <span className="group-hover:text-neutral-300 transition-colors">
                {isTypingComplete ? 'PRESIONA [ESPACIO / CLICK] PARA CONTINUAR' : 'CLICK PARA COMPLETAR'}
              </span>
              <ChevronRight size={12} className="text-red-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Subtle Auto-Advance Progress Bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isMalakor ? 'bg-red-600' : 'bg-red-700'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
