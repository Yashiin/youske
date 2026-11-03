import React, { useEffect, useRef } from 'react';
import { DialoguePortrait } from '../game/types';

interface PortraitCanvasProps {
  portrait?: DialoguePortrait;
  size?: number;
}

export const PortraitCanvas: React.FC<PortraitCanvasProps> = ({
  portrait = 'yosuke_normal',
  size = 128,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const w = 40;
    const h = 40;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    if (portrait.startsWith('yosuke')) {
      // Background vignette
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant golden embers / dust particles in portrait background
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.fillRect(5, 7, 2, 2);
      ctx.fillRect(33, 11, 1, 1);
      ctx.fillRect(28, 4, 2, 1);
      ctx.fillRect(8, 32, 1, 2);
      ctx.fillRect(31, 28, 2, 1);

      // Torso / Heavy Golden Knight Armor & Pauldrons
      ctx.fillStyle = '#0f172a'; // Inner dark under-armor
      ctx.fillRect(8, 26, 24, 14);

      // Golden Chestplate / Gorget
      ctx.fillStyle = '#b45309'; // Dark gold shading
      ctx.fillRect(11, 25, 18, 15);
      ctx.fillStyle = '#f59e0b'; // Radiant gold midtone
      ctx.fillRect(13, 26, 14, 14);
      ctx.fillStyle = '#fde047'; // Gleaming gold breastplate trim
      ctx.fillRect(15, 27, 10, 3);
      ctx.fillRect(19, 30, 2, 10); // Center breastplate seam

      // Left & Right Golden Pauldrons (Spiked/Tiered shoulder armor)
      // Left Shoulder
      ctx.fillStyle = '#78350f'; // Pauldron base shadow
      ctx.fillRect(3, 24, 9, 16);
      ctx.fillStyle = '#d97706'; // Mid gold
      ctx.fillRect(4, 23, 7, 14);
      ctx.fillStyle = '#fbbf24'; // Highlight tier
      ctx.fillRect(5, 22, 5, 8);
      ctx.fillStyle = '#fef08a'; // Top gleam
      ctx.fillRect(6, 22, 3, 2);

      // Right Shoulder
      ctx.fillStyle = '#78350f';
      ctx.fillRect(28, 24, 9, 16);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(29, 23, 7, 14);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(30, 22, 5, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(31, 22, 3, 2);

      // Neck & Chin Armor
      ctx.fillStyle = '#78350f';
      ctx.fillRect(15, 20, 10, 6);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(16, 19, 8, 4);

      // Golden Horned Helmet (Main Visage)
      // Base Helm Mass
      ctx.fillStyle = '#78350f'; // Dark outline
      ctx.fillRect(12, 8, 16, 13);
      ctx.fillStyle = '#d97706'; // Gold tone
      ctx.fillRect(13, 9, 14, 11);
      ctx.fillStyle = '#f59e0b'; // Light gold
      ctx.fillRect(14, 9, 12, 10);

      // Majestic Golden Horns / Winged Crests
      // Left Horn curving upward & outward
      ctx.fillStyle = '#78350f';
      ctx.fillRect(9, 7, 4, 7);
      ctx.fillRect(7, 3, 3, 6);
      ctx.fillRect(5, 1, 3, 4);
      ctx.fillRect(4, 0, 2, 2);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, 6, 2, 6);
      ctx.fillRect(8, 3, 2, 5);
      ctx.fillStyle = '#fef08a'; // Tip gleam
      ctx.fillRect(6, 1, 2, 3);

      // Right Horn curving upward & outward
      ctx.fillStyle = '#78350f';
      ctx.fillRect(27, 7, 4, 7);
      ctx.fillRect(30, 3, 3, 6);
      ctx.fillRect(32, 1, 3, 4);
      ctx.fillRect(34, 0, 2, 2);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(28, 6, 2, 6);
      ctx.fillRect(30, 3, 2, 5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(32, 1, 2, 3);

      // Central Helmet Crest / Crown Spike
      ctx.fillStyle = '#b45309';
      ctx.fillRect(18, 4, 4, 6);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(19, 3, 2, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(19, 2, 2, 2); // Crest peak

      // Visor Plate & Slit Eyes
      if (portrait === 'yosuke_hurt') {
        // Cracked armor and flickering visor slit
        // Helmet crack
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(15, 7, 2, 5);
        ctx.fillRect(16, 10, 2, 3);
        ctx.fillStyle = '#991b1b'; // Battle damage scratch
        ctx.fillRect(22, 11, 4, 1);

        // Broken left horn tip
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(4, 0, 2, 2);

        // Darkened visor with distress flicker
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 13, 12, 3);

        // Flickering cyan eye slit
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(16, 14, 2, 1);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(22, 14, 3, 1);

        // Lower faceplate breathing slots
        ctx.fillStyle = '#78350f';
        ctx.fillRect(17, 17, 6, 2);
      } else if (portrait === 'yosuke_grim') {
        // Intensely focused, radiant battle mode
        // Visor Shadow
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(13, 13, 14, 3);

        // Fierce glowing cyan visor slits
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(15, 14, 4, 1);
        ctx.fillRect(21, 14, 4, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(16, 14, 2, 1);
        ctx.fillRect(22, 14, 2, 1);

        // Golden faceplate vertical ventilation grille
        ctx.fillStyle = '#78350f';
        ctx.fillRect(16, 17, 2, 2);
        ctx.fillRect(19, 17, 2, 2);
        ctx.fillRect(22, 17, 2, 2);

        // Intense golden aura gleam
        ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
        ctx.fillRect(12, 8, 2, 12);
        ctx.fillRect(26, 8, 2, 12);
      } else {
        // Normal Stoic Golden Knight Visage
        // Darkened Visor Recess
        ctx.fillStyle = '#090d16';
        ctx.fillRect(14, 13, 12, 3);

        // Glowing Blue/Cyan Knight Eyes
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(15, 14, 3, 1);
        ctx.fillRect(22, 14, 3, 1);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(16, 14, 2, 1);
        ctx.fillRect(23, 14, 2, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(16, 14, 1, 1);
        ctx.fillRect(23, 14, 1, 1);

        // Faceplate Grill Lines
        ctx.fillStyle = '#92400e';
        ctx.fillRect(17, 17, 2, 2);
        ctx.fillRect(21, 17, 2, 2);
      }
    } else if (portrait === 'malakor_menacing') {
      // Abyssal demonic background
      const abyssGrad = ctx.createRadialGradient(20, 20, 4, 20, 20, 24);
      abyssGrad.addColorStop(0, '#450a0a');
      abyssGrad.addColorStop(1, '#050505');
      ctx.fillStyle = abyssGrad;
      ctx.fillRect(0, 0, w, h);

      // Giant Demonic Horns
      ctx.fillStyle = '#1c1917';
      // Left horn curving upward
      ctx.fillRect(8, 4, 4, 14);
      ctx.fillRect(5, 2, 3, 8);
      ctx.fillRect(4, 0, 2, 4);
      // Right horn curving upward
      ctx.fillRect(28, 4, 4, 14);
      ctx.fillRect(32, 2, 3, 8);
      ctx.fillRect(34, 0, 2, 4);

      // Horn lava cracks
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(7, 5, 2, 3);
      ctx.fillRect(31, 5, 2, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, 3, 1, 2);
      ctx.fillRect(33, 3, 1, 2);

      // Abyssal Armor / Shoulders
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(4, 26, 32, 14);
      ctx.fillStyle = '#262626';
      ctx.fillRect(2, 28, 10, 12);
      ctx.fillRect(28, 28, 10, 12);

      // Glowing molten core in chest
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(17, 28, 6, 10);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(18, 30, 4, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(19, 32, 2, 3);

      // Demonic Helm / Faceplate
      ctx.fillStyle = '#171717';
      ctx.fillRect(12, 10, 16, 16);
      ctx.fillStyle = '#262626';
      ctx.fillRect(13, 9, 14, 4);

      // Burning Demonic Eyes (Fierce crimson-yellow slit eyes)
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(13, 15, 5, 3);
      ctx.fillRect(22, 15, 5, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(15, 16, 2, 2);
      ctx.fillRect(23, 16, 2, 2);

      // Infernal maw / vents
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(16, 21, 8, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(17, 22, 2, 2);
      ctx.fillRect(21, 22, 2, 2);
    }
  }, [portrait]);

  return (
    <div
      className="relative flex-shrink-0 bg-neutral-950 border-2 border-red-900/80 shadow-[0_0_20px_rgba(220,38,38,0.3)] overflow-hidden"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
      {/* Subtle corner rungs */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-red-500" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-500" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-red-500" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-red-500" />
    </div>
  );
};
