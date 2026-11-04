/**
 * Heavy Demon / Coloso Demoníaco (heavy_demon / Goliath) Sprite Sheet Engine
 * High-precision frame extractor with measured Y bands and X intervals,
 * complete neutral-gray & aura-halo checkerboard removal, and grounded baselines.
 *
 * Spritesheet source: /assets/aistudio/enemi_3_d16bcbab.jpg (5632 x 3072)
 */

import { EnemyAction } from './types';

export interface HeavyDemonFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface HeavyDemonAnimationSet {
  idle: HeavyDemonFrame[];
  walk: HeavyDemonFrame[];
  chase: HeavyDemonFrame[];
  windup: HeavyDemonFrame[];
  attack: HeavyDemonFrame[];
  fireBreath: HeavyDemonFrame[];
  hurt: HeavyDemonFrame[];
  dead: HeavyDemonFrame[];
}

export interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio: number;
}

// Exact measured pixel bounding boxes from /assets/aistudio/enemi_3_d16bcbab.jpg (5632 x 3072)
// Row 0: Idle Stance with Spiked Iron Club on Shoulder (Foot Baseline Y: 426, H: 378)
export const IDLE_COORDS: RawCoord[] = [
  { x: 64, y: 48, w: 362, h: 378, anchorXRatio: 0.555 },
  { x: 445, y: 48, w: 380, h: 378, anchorXRatio: 0.524 },
  { x: 835, y: 48, w: 382, h: 378, anchorXRatio: 0.518 },
  { x: 1231, y: 48, w: 384, h: 378, anchorXRatio: 0.518 },
  { x: 1629, y: 48, w: 386, h: 378, anchorXRatio: 0.554 },
  { x: 2029, y: 48, w: 386, h: 378, anchorXRatio: 0.565 },
  { x: 2427, y: 48, w: 385, h: 378, anchorXRatio: 0.553 },
];

// Row 1: Heavy Unarmed/Colossus March Cycle (Foot Baseline Y: 883, H: 328)
export const WALK_COORDS: RawCoord[] = [
  { x: 113, y: 555, w: 294, h: 328, anchorXRatio: 0.565 },
  { x: 499, y: 555, w: 288, h: 328, anchorXRatio: 0.583 },
  { x: 871, y: 555, w: 302, h: 328, anchorXRatio: 0.576 },
  { x: 1247, y: 555, w: 301, h: 328, anchorXRatio: 0.601 },
  { x: 1654, y: 555, w: 298, h: 328, anchorXRatio: 0.560 },
  { x: 2039, y: 555, w: 294, h: 328, anchorXRatio: 0.568 },
  { x: 2433, y: 555, w: 292, h: 328, anchorXRatio: 0.565 },
  { x: 2821, y: 555, w: 311, h: 328, anchorXRatio: 0.569 },
];

// Row 4: Armed Advance / Guard March with Spiked Club Ready (Foot Baseline Y: 2193, H: 321)
export const CHASE_COORDS: RawCoord[] = [
  { x: 76, y: 1872, w: 339, h: 321, anchorXRatio: 0.640 },
  { x: 486, y: 1872, w: 349, h: 321, anchorXRatio: 0.650 },
  { x: 888, y: 1872, w: 356, h: 321, anchorXRatio: 0.736 },
  { x: 1325, y: 1872, w: 382, h: 321, anchorXRatio: 0.712 },
  { x: 1818, y: 1872, w: 362, h: 321, anchorXRatio: 0.738 },
  { x: 2227, y: 1872, w: 404, h: 321, anchorXRatio: 0.748 },
];

// Row 2 & Row 6: Unblockable Overhead Windup (100% clean overhead club raise sequence)
export const WINDUP_COORDS: RawCoord[] = [
  { x: 59, y: 966, w: 395, h: 424, anchorXRatio: 0.673 },
  { x: 508, y: 966, w: 399, h: 424, anchorXRatio: 0.679 },
  { x: 2749, y: 2630, w: 372, h: 350, anchorXRatio: 0.511 },
  { x: 3206, y: 2442, w: 327, h: 533, anchorXRatio: 0.719 },
];

// Row 2 Molten Ground Slam & Row 3 Fiery Magma Cleave Combo
export const ATTACK_COORDS: RawCoord[] = [
  { x: 1928, y: 966, w: 424, h: 450, anchorXRatio: 0.554 },
  { x: 485, y: 1492, w: 348, h: 318, anchorXRatio: 0.713 },
  { x: 868, y: 1492, w: 482, h: 318, anchorXRatio: 0.728 },
  { x: 1384, y: 1492, w: 384, h: 318, anchorXRatio: 0.719 },
  { x: 1801, y: 1492, w: 389, h: 318, anchorXRatio: 0.704 },
];

// Row 5: Volcanic Fire Breath / Roar (Foot Baseline Y: 2565, H: 318)
export const FIRE_BREATH_COORDS: RawCoord[] = [
  { x: 1289, y: 2248, w: 350, h: 317, anchorXRatio: 0.640 },
  { x: 1674, y: 2248, w: 416, h: 317, anchorXRatio: 0.762 },
  { x: 2100, y: 2248, w: 420, h: 317, anchorXRatio: 0.621 },
  { x: 2530, y: 2248, w: 428, h: 317, anchorXRatio: 0.680 },
];

// Row 2 Kneel & Row 6 Stagger Recoil
export const HURT_COORDS: RawCoord[] = [
  { x: 2467, y: 1080, w: 364, h: 340, anchorXRatio: 0.698 },
  { x: 2945, y: 1080, w: 325, h: 326, anchorXRatio: 0.698 },
  { x: 3622, y: 2650, w: 349, h: 328, anchorXRatio: 0.542 },
];

// Row 6: Volcanic Core Collapse, Magma Eruption & Shattered Basalt Rubble (Foot Baseline Y: 2980)
export const DEAD_COORDS: RawCoord[] = [
  { x: 3622, y: 2650, w: 349, h: 330, anchorXRatio: 0.542 },
  { x: 4046, y: 2650, w: 392, h: 330, anchorXRatio: 0.561 },
  { x: 4457, y: 2608, w: 441, h: 372, anchorXRatio: 0.653 },
  { x: 4992, y: 2650, w: 585, h: 330, anchorXRatio: 0.379 },
];

export const HEAVY_DEMON_SPRITE_COORDS = {
  idle: IDLE_COORDS,
  walk: WALK_COORDS,
  chase: CHASE_COORDS,
  windup: WINDUP_COORDS,
  attack: ATTACK_COORDS,
  fireBreath: FIRE_BREATH_COORDS,
  hurt: HURT_COORDS,
  dead: DEAD_COORDS,
};

/**
 * Pure predicate that detects the baked-in neutral gray checkerboard background
 * (and semi-transparent red-aura-over-checkerboard halo tiles) in
 * /assets/aistudio/enemi_3_d16bcbab.jpg while preserving basalt stone armor,
 * incandescent magma fissures, and deep black outlines.
 */
export function isHeavyDemonCheckerboardPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const avg = (r + g + b) / 3;

  // 1. Standard neutral gray checkerboard tile (dark gray ~55, light gray ~142)
  if (diff <= 19 && avg >= 42 && avg <= 165) {
    return true;
  }

  // 2. Red-aura-tinted checkerboard tile (pure red aura blended over neutral gray leaves G ≈ B >= 46)
  // Basalt stone armor always has a warm purple-brown tint (B >= G + 7) or dark value (G <= 42)
  if (Math.abs(g - b) <= 6 && g >= 46 && b >= 46 && r >= g) {
    return true;
  }

  return false;
}

export class HeavyDemonSpriteAtlas {
  public static readonly IMAGE_SRC = '/assets/aistudio/enemi_3_d16bcbab.jpg';

  public isLoaded: boolean = false;
  public animations: HeavyDemonAnimationSet | null = null;

  // Scale: 0.20 renders the Goliath at ~66-75px tall, matching its 44x68 colossus hitbox
  private readonly targetScale: number = 0.20;

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
        console.error('Failed to process Heavy Demon sprite sheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load Heavy Demon sprite asset:', HeavyDemonSpriteAtlas.IMAGE_SRC);
    };
    img.src = HeavyDemonSpriteAtlas.IMAGE_SRC;
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

    const extractFrame = (coord: RawCoord): HeavyDemonFrame => {
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

        if (isHeavyDemonCheckerboardPixel(r, g, b)) {
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
      chase: CHASE_COORDS.map(extractFrame),
      windup: WINDUP_COORDS.map(extractFrame),
      attack: ATTACK_COORDS.map(extractFrame),
      fireBreath: FIRE_BREATH_COORDS.map(extractFrame),
      hurt: HURT_COORDS.map(extractFrame),
      dead: DEAD_COORDS.map(extractFrame),
    };
  }

  public getFrame(
    state: EnemyAction,
    stateTimer: number,
    globalTime: number,
    vx: number = 0,
    distanceTraveled: number = 0
  ): HeavyDemonFrame | null {
    if (!this.animations || !this.isLoaded) return null;

    const anims = this.animations;

    // 1. Volcanic Death Collapse & Eruption into Rubble
    if (state === 'dead') {
      const frames = anims.dead;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 6.5));
      return frames[idx] || frames[frames.length - 1];
    }

    // 2. Hurt / Stagger Kneel
    if (state === 'hurt' || state === 'staggered') {
      const frames = anims.hurt;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 7));
      return frames[idx] || frames[frames.length - 1];
    }

    // 3. Unblockable Overhead Windup with Red Hyper-Armor Aura
    if (state === 'windup') {
      const frames = anims.windup;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 6));
      return frames[idx] || frames[frames.length - 1];
    }

    // 4. Molten Ground Slam & Fiery Club Cleave
    if (state === 'attack') {
      const frames = anims.attack;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 10));
      return frames[idx] || frames[frames.length - 1];
    }

    // 5. Chase (advancing with spiked iron club lowered and ready)
    if (state === 'chase') {
      const speed = Math.abs(vx);
      if (speed < 5) {
        const frames = anims.idle;
        const idx = Math.abs(Math.floor(globalTime * 4)) % frames.length;
        return frames[idx] || frames[0];
      }
      const frames = anims.chase;
      const strideDistancePerFrame = 13;
      const idx = Math.floor(Math.max(0, distanceTraveled) / strideDistancePerFrame) % frames.length;
      return frames[idx] || frames[0];
    }

    // 6. Patrol (heavy colossus march synchronized to distance traveled)
    if (state === 'patrol') {
      const speed = Math.abs(vx);
      if (speed < 5) {
        const frames = anims.idle;
        const idx = Math.abs(Math.floor(globalTime * 4)) % frames.length;
        return frames[idx] || frames[0];
      }
      const frames = anims.walk;
      const strideDistancePerFrame = 12;
      const idx = Math.floor(Math.max(0, distanceTraveled) / strideDistancePerFrame) % frames.length;
      return frames[idx] || frames[0];
    }

    // 7. Default Idle with Spiked Club on Shoulder
    const frames = anims.idle;
    const idx = Math.abs(Math.floor(globalTime * 4)) % frames.length;
    return frames[idx] || frames[0];
  }
}

export const heavyDemonAtlas = new HeavyDemonSpriteAtlas();
if (typeof window !== 'undefined') {
  (window as unknown as { __HEAVY_DEMON_ATLAS?: HeavyDemonSpriteAtlas }).__HEAVY_DEMON_ATLAS = heavyDemonAtlas;
}
