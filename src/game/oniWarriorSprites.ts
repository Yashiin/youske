/**
 * Oni Demon Warrior (Guerrero Demoníaco / demon_warrior) Sprite Sheet Engine
 * High-precision frame extractor with true measured Y bands and X intervals,
 * clean neutral-gray checkerboard removal, and grounded baseline origins.
 *
 * Spritesheet source: /assets/aistudio/enemi_2_4ea30922.jpg (5632 x 3072)
 */

import { EnemyAction } from './types';

export interface OniFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface OniAnimationSet {
  idle: OniFrame[];
  walk: OniFrame[];
  block: OniFrame[];
  windup: OniFrame[];
  attack: OniFrame[];
  dashThrust: OniFrame[];
  hurt: OniFrame[];
  dead: OniFrame[];
}

export interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio: number;
}

// Exact measured pixel bounding boxes from /assets/aistudio/enemi_2_4ea30922.jpg (5632 x 3072)
// Row 0: Idle with Greatshield and Katana (Foot Baseline Y: 483, H: 426)
export const IDLE_COORDS: RawCoord[] = [
  { x: 82, y: 57, w: 272, h: 426, anchorXRatio: 0.485 },
  { x: 438, y: 57, w: 271, h: 426, anchorXRatio: 0.487 },
  { x: 784, y: 57, w: 274, h: 426, anchorXRatio: 0.489 },
  { x: 1140, y: 57, w: 273, h: 426, anchorXRatio: 0.491 },
  { x: 1487, y: 57, w: 272, h: 426, anchorXRatio: 0.493 },
  { x: 1833, y: 57, w: 273, h: 426, anchorXRatio: 0.495 },
  { x: 2177, y: 57, w: 274, h: 426, anchorXRatio: 0.489 },
  { x: 2530, y: 57, w: 275, h: 426, anchorXRatio: 0.484 },
];

// Row 1: Armored March / Walk Cycle with Katana (Foot Baseline Y: 1010, H: 412)
export const WALK_COORDS: RawCoord[] = [
  { x: 110, y: 598, w: 186, h: 412, anchorXRatio: 0.468 },
  { x: 462, y: 598, w: 177, h: 412, anchorXRatio: 0.492 },
  { x: 795, y: 598, w: 208, h: 412, anchorXRatio: 0.452 },
  { x: 1143, y: 598, w: 174, h: 412, anchorXRatio: 0.500 },
  { x: 1495, y: 598, w: 171, h: 412, anchorXRatio: 0.520 },
  { x: 1809, y: 598, w: 205, h: 412, anchorXRatio: 0.444 },
  { x: 2160, y: 598, w: 165, h: 412, anchorXRatio: 0.515 },
  { x: 2486, y: 598, w: 203, h: 412, anchorXRatio: 0.483 },
];

// Row 3: Iron Tower Shield Guard & Impact Bracing (Foot Baseline Y: 2029, H: 403)
export const BLOCK_COORDS: RawCoord[] = [
  { x: 90, y: 1626, w: 257, h: 403, anchorXRatio: 0.603 },
  { x: 979, y: 1626, w: 387, h: 403, anchorXRatio: 0.698 },
  { x: 2044, y: 1626, w: 255, h: 403, anchorXRatio: 0.592 },
  { x: 2469, y: 1626, w: 234, h: 403, anchorXRatio: 0.624 },
];

// Row 2: Windup Gathering Power (Foot Baseline Y: 1522, H: 480)
export const WINDUP_COORDS: RawCoord[] = [
  { x: 1472, y: 1042, w: 451, h: 480, anchorXRatio: 0.663 },
  { x: 1998, y: 1042, w: 312, h: 480, anchorXRatio: 0.500 },
];

// Row 2 & Row 5: Golden Crescent Slash & Crimson Cleave Combo
export const ATTACK_COORDS: RawCoord[] = [
  { x: 2327, y: 1042, w: 586, h: 480, anchorXRatio: 0.323 },
  { x: 2942, y: 1042, w: 225, h: 480, anchorXRatio: 0.547 },
  { x: 3244, y: 1042, w: 366, h: 480, anchorXRatio: 0.484 },
  { x: 2476, y: 2658, w: 524, h: 399, anchorXRatio: 0.515 },
];

// Row 5: Crimson Dash Thrust Attack (Foot Baseline Y: 3057, H: 399)
export const DASH_THRUST_COORDS: RawCoord[] = [
  { x: 1464, y: 2658, w: 430, h: 399, anchorXRatio: 0.691 },
  { x: 2056, y: 2658, w: 283, h: 399, anchorXRatio: 0.594 },
  { x: 2476, y: 2658, w: 524, h: 399, anchorXRatio: 0.515 },
];

// Row 4: Hurt Recoil & Kneeling Stagger (Foot Baseline Y: 2560, H: 415)
export const HURT_COORDS: RawCoord[] = [
  { x: 3763, y: 2145, w: 219, h: 415, anchorXRatio: 0.479 },
  { x: 4254, y: 2145, w: 216, h: 415, anchorXRatio: 0.491 },
  { x: 3233, y: 2145, w: 265, h: 418, anchorXRatio: 0.385 },
];

// Row 4: Defeat Collapse & Fallen Pose (Foot Baseline Y: 2560, H: 418)
export const DEAD_COORDS: RawCoord[] = [
  { x: 3233, y: 2145, w: 265, h: 418, anchorXRatio: 0.385 },
  { x: 4610, y: 2145, w: 464, h: 418, anchorXRatio: 0.600 },
  { x: 5182, y: 2145, w: 406, h: 412, anchorXRatio: 0.550 },
];

export const ONI_SPRITE_COORDS = {
  idle: IDLE_COORDS,
  walk: WALK_COORDS,
  block: BLOCK_COORDS,
  windup: WINDUP_COORDS,
  attack: ATTACK_COORDS,
  dashThrust: DASH_THRUST_COORDS,
  hurt: HURT_COORDS,
  dead: DEAD_COORDS,
};

/**
 * Pure predicate that detects the baked-in neutral gray checkerboard background
 * in /assets/aistudio/enemi_2_4ea30922.jpg while preserving crimson armor, gold horns,
 * and black outlines.
 */
export function isOniCheckerboardPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const avg = (r + g + b) / 3;
  return diff <= 18 && avg >= 34 && avg <= 152;
}

export class OniWarriorSpriteAtlas {
  public static readonly IMAGE_SRC = '/assets/aistudio/enemi_2_4ea30922.jpg';

  public isLoaded: boolean = false;
  public animations: OniAnimationSet | null = null;

  // Scale: 0.132 matches player and world proportions (~55-58px tall)
  private readonly targetScale: number = 0.132;

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
        console.error('Failed to process Oni warrior sprite sheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load Oni warrior sprite asset:', OniWarriorSpriteAtlas.IMAGE_SRC);
    };
    img.src = OniWarriorSpriteAtlas.IMAGE_SRC;
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

    const extractFrame = (coord: RawCoord): OniFrame => {
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

      // Clean baked-in neutral gray checkerboard background
      const imgData = ctx.getImageData(0, 0, finalW, finalH);
      const data = imgData.data;
      const totalPixels = finalW * finalH;

      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        if (isOniCheckerboardPixel(r, g, b)) {
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
      block: BLOCK_COORDS.map(extractFrame),
      windup: WINDUP_COORDS.map(extractFrame),
      attack: ATTACK_COORDS.map(extractFrame),
      dashThrust: DASH_THRUST_COORDS.map(extractFrame),
      hurt: HURT_COORDS.map(extractFrame),
      dead: DEAD_COORDS.map(extractFrame),
    };
  }

  public getFrame(
    state: EnemyAction,
    stateTimer: number,
    globalTime: number,
    isBlocking: boolean = false,
    vx: number = 0,
    distanceTraveled: number = 0,
    isHeavy: boolean = false
  ): OniFrame | null {
    if (!this.animations || !this.isLoaded) return null;

    const anims = this.animations;

    // 1. Death collapse sequence
    if (state === 'dead') {
      const frames = anims.dead;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 5));
      return frames[idx] || frames[frames.length - 1];
    }

    // 2. Hurt / Stagger recoil
    if (state === 'hurt' || state === 'staggered') {
      const frames = anims.hurt;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 7));
      return frames[idx] || frames[frames.length - 1];
    }

    // 3. Shield Guard / Block (active whenever enemy.isBlocking is true)
    if (isBlocking) {
      const frames = anims.block;
      const idx = 2 + (Math.abs(Math.floor(globalTime * 3)) % 2);
      return frames[idx] || frames[0];
    }

    // 4. Windup / Gathering power before strike
    if (state === 'windup') {
      const frames = anims.windup;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 6));
      return frames[idx] || frames[frames.length - 1];
    }

    // 5. Attack execution (crimson blood-thrust for heavy_demon, golden crescent & crimson combo for demon_warrior)
    if (state === 'attack') {
      const frames = isHeavy ? anims.dashThrust : anims.attack;
      const rate = isHeavy ? 8 : 10;
      const idx = Math.min(frames.length - 1, Math.floor(stateTimer * rate));
      return frames[idx] || frames[frames.length - 1];
    }

    // 6. Movement: Patrol or Chase synchronized to velocity & distance traveled
    if (state === 'patrol' || state === 'chase') {
      const speed = Math.abs(vx);
      if (speed < 5) {
        const frames = anims.idle;
        const idx = Math.abs(Math.floor(globalTime * 4.5)) % frames.length;
        return frames[idx] || frames[0];
      }

      const frames = anims.walk;
      const strideDistancePerFrame = isHeavy ? 16 : 14;
      const idx = Math.floor(Math.max(0, distanceTraveled) / strideDistancePerFrame) % frames.length;
      return frames[idx] || frames[0];
    }

    // 7. Default Idle with Greatshield & Katana
    const frames = anims.idle;
    const idx = Math.abs(Math.floor(globalTime * 4.5)) % frames.length;
    return frames[idx] || frames[0];
  }
}

export const oniWarriorAtlas = new OniWarriorSpriteAtlas();
if (typeof window !== 'undefined') {
  (window as unknown as { __ONI_WARRIOR_ATLAS?: OniWarriorSpriteAtlas }).__ONI_WARRIOR_ATLAS = oniWarriorAtlas;
}
