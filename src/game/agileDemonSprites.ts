/**
 * Agile Demon / Espectro Asesino (agile_demon / Wraith) Sprite Sheet Engine
 * High-precision frame extractor with measured Y bands and X intervals,
 * complete neutral-gray checkerboard removal, and grounded baselines.
 *
 * Spritesheet source: /assets/aistudio/enemi_4_24968989.jpg (5632 x 3072)
 */

import { EnemyAction } from './types';

export interface AgileDemonFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface AgileDemonAnimationSet {
  idle: AgileDemonFrame[];
  walk: AgileDemonFrame[];
  run: AgileDemonFrame[];
  jump: AgileDemonFrame[];
  windup: AgileDemonFrame[];
  attack: AgileDemonFrame[];
  hurt: AgileDemonFrame[];
  dead: AgileDemonFrame[];
}

export interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio: number;
}

// Exact measured pixel bounding boxes from /assets/aistudio/enemi_4_24968989.jpg (5632 x 3072)
// Row 0: Floating / Breathing Assassin Stance with Twin Daggers (Foot Baseline Y: 432, H: 380-388)
export const IDLE_COORDS: RawCoord[] = [
  { x: 86, y: 52, w: 327, h: 380, anchorXRatio: 0.401 },
  { x: 534, y: 52, w: 342, h: 380, anchorXRatio: 0.430 },
  { x: 1016, y: 52, w: 325, h: 380, anchorXRatio: 0.397 },
  { x: 1416, y: 44, w: 391, h: 388, anchorXRatio: 0.501 },
  { x: 1931, y: 52, w: 321, h: 380, anchorXRatio: 0.393 },
  { x: 2388, y: 52, w: 328, h: 380, anchorXRatio: 0.384 },
  { x: 2847, y: 52, w: 329, h: 380, anchorXRatio: 0.413 },
];

// Row 1: High-Speed Wraith Sprint / Stalking Stride (Foot Baseline Y: 811, H: 323)
export const WALK_COORDS: RawCoord[] = [
  { x: 63, y: 488, w: 316, h: 323, anchorXRatio: 0.589 },
  { x: 538, y: 488, w: 341, h: 323, anchorXRatio: 0.519 },
  { x: 999, y: 488, w: 381, h: 323, anchorXRatio: 0.562 },
  { x: 1461, y: 488, w: 352, h: 323, anchorXRatio: 0.554 },
  { x: 1894, y: 488, w: 338, h: 323, anchorXRatio: 0.601 },
  { x: 2369, y: 488, w: 367, h: 323, anchorXRatio: 0.531 },
  { x: 2833, y: 488, w: 298, h: 323, anchorXRatio: 0.570 },
];

// Row 1 & Row 3: Aggressive Forward Dash / Chase Cycle
export const RUN_COORDS: RawCoord[] = [
  { x: 63, y: 488, w: 316, h: 323, anchorXRatio: 0.589 },
  { x: 538, y: 488, w: 341, h: 323, anchorXRatio: 0.519 },
  { x: 999, y: 488, w: 381, h: 323, anchorXRatio: 0.562 },
  { x: 1461, y: 488, w: 352, h: 323, anchorXRatio: 0.554 },
  { x: 1894, y: 488, w: 338, h: 323, anchorXRatio: 0.601 },
  { x: 2369, y: 488, w: 367, h: 323, anchorXRatio: 0.531 },
  { x: 2833, y: 488, w: 298, h: 323, anchorXRatio: 0.570 },
];

// Row 2: Airborne Leap / Evasive Backstep & Mid-Air Tuck
export const JUMP_COORDS: RawCoord[] = [
  { x: 540, y: 845, w: 277, h: 362, anchorXRatio: 0.567 },
  { x: 1002, y: 845, w: 304, h: 336, anchorXRatio: 0.576 },
  { x: 1423, y: 845, w: 335, h: 343, anchorXRatio: 0.576 },
  { x: 1935, y: 845, w: 253, h: 342, anchorXRatio: 0.451 },
];

// Row 4 & Row 5: Coiled Stance, Spectral Cyan 4-Point Star Flash Telegraph & Wide Twin-Dagger Ready
export const WINDUP_COORDS: RawCoord[] = [
  { x: 101, y: 1752, w: 231, h: 356, anchorXRatio: 0.576 },
  { x: 533, y: 1752, w: 335, h: 344, anchorXRatio: 0.450 },
  { x: 55, y: 2226, w: 392, h: 347, anchorXRatio: 0.487 },
];

// Row 4 & Row 5: Blazing Cyan Spear-Lunge Thrust & Twin-Dagger Cross-Slash Flurry
export const ATTACK_COORDS: RawCoord[] = [
  { x: 949, y: 1752, w: 432, h: 344, anchorXRatio: 0.366 },
  { x: 1436, y: 1752, w: 498, h: 344, anchorXRatio: 0.424 },
  { x: 510, y: 2226, w: 322, h: 348, anchorXRatio: 0.609 },
  { x: 956, y: 2226, w: 351, h: 344, anchorXRatio: 0.541 },
];

// Row 2: Low Recoil / Staggered Crouch (Foot Baseline Y: 1242-1263)
export const HURT_COORDS: RawCoord[] = [
  { x: 2352, y: 938, w: 313, h: 278, anchorXRatio: 0.550 },
  { x: 2804, y: 953, w: 340, h: 285, anchorXRatio: 0.544 },
  { x: 3269, y: 987, w: 339, h: 276, anchorXRatio: 0.566 },
];

// Row 6: Spectral Disintegration into Dark Smoke & Cyan Spirit Embers (Baseline Y: 3025)
export const DEAD_COORDS: RawCoord[] = [
  { x: 2850, y: 2650, w: 316, h: 375, anchorXRatio: 0.563 },
  { x: 3316, y: 2650, w: 329, h: 376, anchorXRatio: 0.486 },
  { x: 3775, y: 2650, w: 242, h: 375, anchorXRatio: 0.500 },
  { x: 4228, y: 2650, w: 250, h: 340, anchorXRatio: 0.536 },
  { x: 4747, y: 2650, w: 218, h: 347, anchorXRatio: 0.532 },
];

export const AGILE_DEMON_SPRITE_COORDS = {
  idle: IDLE_COORDS,
  walk: WALK_COORDS,
  run: RUN_COORDS,
  jump: JUMP_COORDS,
  windup: WINDUP_COORDS,
  attack: ATTACK_COORDS,
  hurt: HURT_COORDS,
  dead: DEAD_COORDS,
};

/**
 * Pure predicate that detects the baked-in neutral gray checkerboard background
 * in /assets/aistudio/enemi_4_24968989.jpg while preserving the Wraith's
 * indigo/violet cloak, glowing cyan visor & blade trails, bright steel daggers,
 * and deep black outlines.
 */
export function isAgileDemonCheckerboardPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const avg = (r + g + b) / 3;

  // Neutral gray checkerboard tile (dark gray ~55, light gray ~142)
  if (diff <= 19 && avg >= 42 && avg <= 172) {
    return true;
  }

  return false;
}

export class AgileDemonSpriteAtlas {
  public static readonly IMAGE_SRC = '/assets/aistudio/enemi_4_24968989.jpg';

  public isLoaded: boolean = false;
  public animations: AgileDemonAnimationSet | null = null;

  // Scale: 0.145 renders the Wraith at ~47-55px tall, matching its 26x46 agile hitbox
  private readonly targetScale: number = 0.145;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        this.processSheet(img);
        this.isLoaded = true;
      } catch (err) {
        console.error('Failed to process Agile Demon sprite sheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load Agile Demon sprite asset:', AgileDemonSpriteAtlas.IMAGE_SRC);
    };
    img.src = AgileDemonSpriteAtlas.IMAGE_SRC;
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

    const extractFrame = (coord: RawCoord): AgileDemonFrame => {
      const finalW = Math.max(1, Math.round(coord.w * this.targetScale));
      const finalH = Math.max(1, Math.round(coord.h * this.targetScale));

      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = finalW;
      frameCanvas.height = finalH;
      const ctx = frameCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return {
          canvas: frameCanvas,
          width: finalW,
          height: finalH,
          originX: Math.round(finalW * coord.anchorXRatio),
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

      // Remove baked-in checkerboard background
      const imgData = ctx.getImageData(0, 0, finalW, finalH);
      const data = imgData.data;
      const totalPixels = finalW * finalH;

      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        if (isAgileDemonCheckerboardPixel(r, g, b)) {
          data[offset + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      return {
        canvas: frameCanvas,
        width: finalW,
        height: finalH,
        originX: Math.round(finalW * coord.anchorXRatio),
        originY: finalH,
      };
    };

    this.animations = {
      idle: IDLE_COORDS.map(extractFrame),
      walk: WALK_COORDS.map(extractFrame),
      run: RUN_COORDS.map(extractFrame),
      jump: JUMP_COORDS.map(extractFrame),
      windup: WINDUP_COORDS.map(extractFrame),
      attack: ATTACK_COORDS.map(extractFrame),
      hurt: HURT_COORDS.map(extractFrame),
      dead: DEAD_COORDS.map(extractFrame),
    };
  }

  public getFrame(
    state: EnemyAction,
    stateTimer: number,
    globalTime: number,
    vx: number = 0,
    vy: number = 0,
    isGrounded: boolean = true,
    distanceTraveled: number = 0
  ): AgileDemonFrame | null {
    if (!this.isLoaded || !this.animations) return null;

    if (state === 'dead') {
      const frames = this.animations.dead;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 8));
      return frames[Math.max(0, idx)] || frames[0];
    }

    if (state === 'hurt' || state === 'staggered') {
      const frames = this.animations.hurt;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 7));
      return frames[Math.max(0, idx)] || frames[0];
    }

    if (state === 'windup') {
      const frames = this.animations.windup;
      // Agile demon windup is 0.42s -> cycle through coiled stance, cyan star flash, and twin daggers ready
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 8));
      return frames[Math.max(0, idx)] || frames[0];
    }

    if (state === 'attack') {
      const frames = this.animations.attack;
      // Agile demon attack is 0.30s -> fast 4-frame cyan lunge + twin-dagger slash combo
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 14));
      return frames[Math.max(0, idx)] || frames[0];
    }

    // Airborne evasive backstep or leap
    if (!isGrounded || Math.abs(vy) > 40) {
      const frames = this.animations.jump;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 8));
      return frames[Math.max(0, idx)] || frames[0];
    }

    if (state === 'chase') {
      const frames = this.animations.run;
      const speed = Math.abs(vx);
      if (speed < 5) {
        const idleFrames = this.animations.idle;
        const idx = Math.abs(Math.floor(globalTime * 6)) % idleFrames.length;
        return idleFrames[idx] || idleFrames[0];
      }
      // Link sprint frame progression directly to distance traveled (~15px per frame)
      const pixelsPerFrame = 15;
      const idx = Math.abs(Math.floor(distanceTraveled / pixelsPerFrame)) % frames.length;
      return frames[idx] || frames[0];
    }

    if (state === 'patrol') {
      const frames = this.animations.walk;
      const speed = Math.abs(vx);
      if (speed < 5) {
        const idleFrames = this.animations.idle;
        const idx = Math.abs(Math.floor(globalTime * 6)) % idleFrames.length;
        return idleFrames[idx] || idleFrames[0];
      }
      // Link patrol stride progression directly to distance traveled (~13px per frame)
      const pixelsPerFrame = 13;
      const idx = Math.abs(Math.floor(distanceTraveled / pixelsPerFrame)) % frames.length;
      return frames[idx] || frames[0];
    }

    // Default: floating/breathing assassin idle
    const frames = this.animations.idle;
    const idx = Math.abs(Math.floor(globalTime * 6)) % frames.length;
    return frames[idx] || frames[0];
  }
}

export const agileDemonAtlas = new AgileDemonSpriteAtlas();
