/**
 * Golden Knight Sprite Sheet Engine for Yosuke
 * High-precision frame extractor with exact bounding boxes,
 * zero checkerboard background artifacts, and anchored ground origins.
 */

import { PlayerAction } from './types';

export interface KnightFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface KnightAnimationSet {
  idle: KnightFrame[];
  run: KnightFrame[];
  jump: KnightFrame[];
  fall: KnightFrame[];
  land: KnightFrame[];
  light1: KnightFrame[];
  light2: KnightFrame[];
  light3: KnightFrame[];
  heavy: KnightFrame[];
  airAttack: KnightFrame[];
  airHeavy: KnightFrame[];
  dash: KnightFrame[];
  block: KnightFrame[];
  parry: KnightFrame[];
  counter: KnightFrame[];
  hurt: KnightFrame[];
  defeat: KnightFrame[];
}

interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio?: number;
}

// Exact sprite bounding coordinates derived from /assets/aistudio/sprites_51b8a25f.jpg
const IDLE_COORDS: RawCoord[] = [
  { x: 94, y: 54, w: 208, h: 427, anchorXRatio: 0.5 },
  { x: 447, y: 58, w: 207, h: 423, anchorXRatio: 0.5 },
  { x: 788, y: 56, w: 209, h: 425, anchorXRatio: 0.5 },
  { x: 1138, y: 56, w: 206, h: 424, anchorXRatio: 0.5 },
  { x: 1471, y: 57, w: 209, h: 423, anchorXRatio: 0.5 },
  { x: 1804, y: 53, w: 208, h: 428, anchorXRatio: 0.5 },
  { x: 2142, y: 57, w: 208, h: 423, anchorXRatio: 0.5 },
];

const RUN_COORDS: RawCoord[] = [
  { x: 2610, y: 86, w: 273, h: 387, anchorXRatio: 0.44 },
  { x: 2958, y: 90, w: 297, h: 385, anchorXRatio: 0.42 },
  { x: 3304, y: 82, w: 315, h: 394, anchorXRatio: 0.40 },
  { x: 3649, y: 86, w: 310, h: 390, anchorXRatio: 0.40 },
  { x: 4025, y: 92, w: 302, h: 385, anchorXRatio: 0.42 },
  { x: 4402, y: 88, w: 309, h: 385, anchorXRatio: 0.42 },
  { x: 4774, y: 87, w: 309, h: 388, anchorXRatio: 0.42 },
  { x: 5135, y: 88, w: 298, h: 384, anchorXRatio: 0.44 },
];

const JUMP_COORDS: RawCoord[] = [
  { x: 73, y: 684, w: 235, h: 333, anchorXRatio: 0.5 },
  { x: 423, y: 689, w: 248, h: 328, anchorXRatio: 0.5 },
  { x: 784, y: 532, w: 200, h: 428, anchorXRatio: 0.5 },
];

const FALL_COORDS: RawCoord[] = [
  { x: 1622, y: 540, w: 282, h: 416, anchorXRatio: 0.46 },
  { x: 1987, y: 557, w: 312, h: 418, anchorXRatio: 0.44 },
];

const LAND_COORDS: RawCoord[] = [
  { x: 2376, y: 612, w: 292, h: 365, anchorXRatio: 0.5 },
];

const LIGHT1_COORDS: RawCoord[] = [
  { x: 99, y: 1114, w: 268, h: 403, anchorXRatio: 0.45 },
  { x: 518, y: 1128, w: 325, h: 389, anchorXRatio: 0.38 },
  { x: 898, y: 1127, w: 405, h: 390, anchorXRatio: 0.34 },
];

const LIGHT2_COORDS: RawCoord[] = [
  { x: 1467, y: 1128, w: 363, h: 389, anchorXRatio: 0.40 },
  { x: 2007, y: 1131, w: 466, h: 385, anchorXRatio: 0.32 },
  { x: 2692, y: 1131, w: 531, h: 386, anchorXRatio: 0.28 },
];

const LIGHT3_COORDS: RawCoord[] = [
  { x: 3315, y: 1052, w: 264, h: 464, anchorXRatio: 0.48 },
  { x: 3784, y: 1132, w: 289, h: 384, anchorXRatio: 0.45 },
  { x: 4120, y: 1044, w: 529, h: 473, anchorXRatio: 0.30 },
];

const HEAVY_COORDS: RawCoord[] = [
  { x: 99, y: 1631, w: 272, h: 403, anchorXRatio: 0.48 },
  { x: 424, y: 1569, w: 364, h: 461, anchorXRatio: 0.40 },
  { x: 972, y: 1635, w: 277, h: 397, anchorXRatio: 0.44 },
  { x: 1268, y: 1620, w: 481, h: 413, anchorXRatio: 0.32 },
];

const AIR_ATTACK_COORDS: RawCoord[] = [
  { x: 4788, y: 1632, w: 298, h: 360, anchorXRatio: 0.44 },
  { x: 5200, y: 1610, w: 282, h: 361, anchorXRatio: 0.44 },
];

const DASH_COORDS: RawCoord[] = [
  { x: 3730, y: 1664, w: 237, h: 368, anchorXRatio: 0.5 },
  { x: 4236, y: 1666, w: 225, h: 368, anchorXRatio: 0.5 },
];

const BLOCK_COORDS: RawCoord[] = [
  { x: 94, y: 2147, w: 259, h: 408, anchorXRatio: 0.48 },
  { x: 579, y: 2142, w: 248, h: 409, anchorXRatio: 0.48 },
  { x: 1039, y: 2138, w: 259, h: 414, anchorXRatio: 0.48 },
];

const PARRY_COORDS: RawCoord[] = [
  { x: 1561, y: 2162, w: 272, h: 390, anchorXRatio: 0.48 },
  { x: 1945, y: 2161, w: 307, h: 394, anchorXRatio: 0.44 },
  { x: 2358, y: 2170, w: 318, h: 387, anchorXRatio: 0.44 },
  { x: 2751, y: 2168, w: 412, h: 388, anchorXRatio: 0.38 },
];

const COUNTER_COORDS: RawCoord[] = [
  { x: 3303, y: 2172, w: 378, h: 384, anchorXRatio: 0.38 },
  { x: 3724, y: 2182, w: 330, h: 374, anchorXRatio: 0.32 },
  { x: 4054, y: 2182, w: 330, h: 374, anchorXRatio: 0.32 },
  { x: 4384, y: 2182, w: 330, h: 374, anchorXRatio: 0.30 },
];

const HURT_COORDS: RawCoord[] = [
  { x: 104, y: 2651, w: 190, h: 413, anchorXRatio: 0.5 },
  { x: 581, y: 2651, w: 238, h: 405, anchorXRatio: 0.5 },
  { x: 1031, y: 2648, w: 276, h: 416, anchorXRatio: 0.46 },
];

const DEFEAT_COORDS: RawCoord[] = [
  { x: 1496, y: 2664, w: 295, h: 396, anchorXRatio: 0.46 },
  { x: 1975, y: 2711, w: 250, h: 345, anchorXRatio: 0.5 },
  { x: 2361, y: 2717, w: 322, h: 340, anchorXRatio: 0.5 },
  { x: 2779, y: 2846, w: 372, h: 210, anchorXRatio: 0.5 },
  { x: 3277, y: 2698, w: 257, h: 372, anchorXRatio: 0.5 },
  { x: 3746, y: 2843, w: 399, h: 218, anchorXRatio: 0.5 },
  { x: 4235, y: 2848, w: 397, h: 212, anchorXRatio: 0.5 },
  { x: 4723, y: 2862, w: 389, h: 198, anchorXRatio: 0.5 },
  { x: 5196, y: 2904, w: 381, h: 157, anchorXRatio: 0.5 },
];

class GoldenKnightManager {
  public isReady: boolean = false;
  public animations: KnightAnimationSet | null = null;
  public masterCanvas: HTMLCanvasElement | null = null;
  private readonly imageSrc = '/assets/aistudio/sprites_51b8a25f.jpg';
  // Target display scale: 420px source height -> ~59px height in world space
  private readonly SCALE = 0.142;

  constructor() {
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        this.processSheet(img);
      } catch (err) {
        console.error('Failed to process golden knight spritesheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load golden knight sprite asset:', this.imageSrc);
    };
    img.src = this.imageSrc;
  }

  private processSheet(img: HTMLImageElement): void {
    const sheetW = img.naturalWidth || 5632;
    const sheetH = img.naturalHeight || 3072;

    const masterCanvas = document.createElement('canvas');
    masterCanvas.width = sheetW;
    masterCanvas.height = sheetH;
    const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true });
    if (!masterCtx) return;

    masterCtx.drawImage(img, 0, 0);
    this.masterCanvas = masterCanvas;

    const extractFrame = (coord: RawCoord): KnightFrame => {
      const finalW = Math.max(1, Math.round(coord.w * this.SCALE));
      const finalH = Math.max(1, Math.round(coord.h * this.SCALE));

      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = finalW;
      frameCanvas.height = finalH;
      const ctx = frameCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return {
          canvas: frameCanvas,
          width: finalW,
          height: finalH,
          originX: Math.round(finalW / 2),
          originY: finalH,
        };
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        masterCanvas,
        coord.x,
        coord.y,
        coord.w,
        coord.h,
        0,
        0,
        finalW,
        finalH
      );

      // Remove checkerboard background:
      // Neutral grays with low color difference (diff <= 26) and brightness 26 to 185
      const imgData = ctx.getImageData(0, 0, finalW, finalH);
      const data = imgData.data;
      const totalPixels = finalW * finalH;

      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const avg = (r + g + b) / 3;

        // Neutral gray checkerboard pattern condition
        if (diff <= 26 && avg >= 26 && avg <= 185) {
          data[offset + 3] = 0; // Alpha 0
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const anchorRatio = coord.anchorXRatio ?? 0.5;
      const originX = Math.round(finalW * anchorRatio);
      const originY = finalH; // Baseline anchored to feet

      return {
        canvas: frameCanvas,
        width: finalW,
        height: finalH,
        originX,
        originY,
      };
    };

    const buildSet = (coords: RawCoord[]): KnightFrame[] => {
      return coords.map((c) => extractFrame(c));
    };

    const idle = buildSet(IDLE_COORDS);
    const run = buildSet(RUN_COORDS);
    const jump = buildSet(JUMP_COORDS);
    const fall = buildSet(FALL_COORDS);
    const land = buildSet(LAND_COORDS);
    const light1 = buildSet(LIGHT1_COORDS);
    const light2 = buildSet(LIGHT2_COORDS);
    const light3 = buildSet(LIGHT3_COORDS);
    const heavy = buildSet(HEAVY_COORDS);
    const airAttack = buildSet(AIR_ATTACK_COORDS);
    const airHeavy = [...airAttack, heavy[heavy.length - 1]];
    const dash = buildSet(DASH_COORDS);
    const block = buildSet(BLOCK_COORDS);
    const parry = buildSet(PARRY_COORDS);
    const counter = buildSet(COUNTER_COORDS);
    const hurt = buildSet(HURT_COORDS);
    const defeat = buildSet(DEFEAT_COORDS);

    this.animations = {
      idle,
      run,
      jump,
      fall,
      land,
      light1,
      light2,
      light3,
      heavy,
      airAttack,
      airHeavy,
      dash,
      block,
      parry,
      counter,
      hurt,
      defeat,
    };

    this.isReady = this.animations.idle.length > 0;
  }

  public getFrame(
    action: PlayerAction,
    globalTime: number,
    actionTimer: number
  ): KnightFrame | null {
    if (!this.isReady || !this.animations) return null;

    const anims = this.animations;

    switch (action) {
      case 'run': {
        const frames = anims.run;
        const idx = Math.abs(Math.floor(globalTime * 14)) % frames.length;
        return frames[idx] || frames[0];
      }
      case 'jump': {
        const frames = anims.jump;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 6));
        return frames[idx] || frames[0];
      }
      case 'fall': {
        const frames = anims.fall;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 5));
        return frames[idx] || frames[0];
      }
      case 'land': {
        const frames = anims.land;
        return frames[0] || anims.idle[0];
      }
      case 'light_attack_1': {
        const frames = anims.light1;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 13));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'light_attack_2': {
        const frames = anims.light2;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 13));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'light_attack_3': {
        const frames = anims.light3;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 12));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'heavy_attack': {
        const frames = anims.heavy;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 12));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'air_attack': {
        const frames = anims.airAttack;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 10));
        return frames[idx] || frames[0];
      }
      case 'air_heavy': {
        const frames = anims.airHeavy;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 9));
        return frames[idx] || frames[0];
      }
      case 'dash': {
        const frames = anims.dash;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 12));
        return frames[idx] || frames[0];
      }
      case 'block': {
        const frames = anims.block;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 6));
        return frames[idx] || frames[0];
      }
      case 'parry': {
        const frames = anims.parry;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 14));
        return frames[idx] || frames[0];
      }
      case 'counter': {
        const frames = anims.counter;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 12));
        return frames[idx] || frames[0];
      }
      case 'hurt': {
        const frames = anims.hurt;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 10));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'defeat': {
        const frames = anims.defeat;
        const idx = Math.min(frames.length - 1, Math.floor(actionTimer * 5));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'idle':
      default: {
        const frames = anims.idle;
        const idx = Math.abs(Math.floor(globalTime * 6)) % frames.length;
        return frames[idx] || frames[0];
      }
    }
  }
}

export const goldenKnightManager = new GoldenKnightManager();
if (typeof window !== 'undefined') {
  (window as unknown as { __GOLDEN_KNIGHT?: GoldenKnightManager }).__GOLDEN_KNIGHT = goldenKnightManager;
}
