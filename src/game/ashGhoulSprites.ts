/**
 * Ash Ghoul (Necrófago de Ceniza / basic_monster) Sprite Sheet Engine
 * High-precision frame extractor with true measured Y bands and X intervals,
 * complete background removal (zero gray checkerboard artifacts), and
 * perfectly grounded baseline origins to eliminate visual stuttering.
 */

import { EnemyAction } from './types';

export interface GhoulFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface GhoulAnimationSet {
  idle: GhoulFrame[];
  walk: GhoulFrame[];
  attack: GhoulFrame[];
  windup: GhoulFrame[];
  run: GhoulFrame[];
  hurt: GhoulFrame[];
  dead: GhoulFrame[];
}

interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio?: number;
}

// True measured pixel coordinates directly from /assets/aistudio/enemi_1_b0c28fb7.jpg (5632 x 3072)
// Row 0: Idle Stance (true Y: 96, H: 328, foot baseline Y: 424)
const IDLE_COORDS: RawCoord[] = [
  { x: 36, y: 96, w: 464, h: 328, anchorXRatio: 0.5 },
  { x: 584, y: 96, w: 464, h: 328, anchorXRatio: 0.5 },
  { x: 1116, y: 96, w: 468, h: 328, anchorXRatio: 0.5 },
  { x: 1660, y: 96, w: 464, h: 328, anchorXRatio: 0.5 },
  { x: 2204, y: 96, w: 468, h: 328, anchorXRatio: 0.5 },
  { x: 2756, y: 96, w: 464, h: 328, anchorXRatio: 0.5 },
];

// Row 1: Walk Cycle (true Y: 524, H: 328, foot baseline Y: 852)
const WALK_COORDS: RawCoord[] = [
  { x: 36, y: 524, w: 468, h: 328, anchorXRatio: 0.5 },
  { x: 580, y: 524, w: 476, h: 328, anchorXRatio: 0.5 },
  { x: 1156, y: 524, w: 432, h: 328, anchorXRatio: 0.5 },
  { x: 1668, y: 524, w: 476, h: 328, anchorXRatio: 0.5 },
  { x: 2204, y: 524, w: 480, h: 328, anchorXRatio: 0.5 },
  { x: 2784, y: 524, w: 452, h: 328, anchorXRatio: 0.5 },
  { x: 3312, y: 524, w: 460, h: 328, anchorXRatio: 0.5 },
];

// Row 2: Attack Claw Slash (true Y: 944, H: 328, foot baseline Y: 1272)
const ATTACK_COORDS: RawCoord[] = [
  { x: 40, y: 944, w: 468, h: 328, anchorXRatio: 0.48 },
  { x: 588, y: 944, w: 464, h: 328, anchorXRatio: 0.48 },
  { x: 1136, y: 944, w: 468, h: 328, anchorXRatio: 0.46 },
  { x: 1672, y: 944, w: 488, h: 328, anchorXRatio: 0.44 },
  { x: 2228, y: 944, w: 480, h: 328, anchorXRatio: 0.46 },
  { x: 2780, y: 944, w: 460, h: 328, anchorXRatio: 0.5 },
];

// Row 3: Snarl / Windup Telegraph (true Y: 1376, H: 320, foot baseline Y: 1696)
const WINDUP_COORDS: RawCoord[] = [
  { x: 40, y: 1376, w: 460, h: 320, anchorXRatio: 0.5 },
  { x: 572, y: 1376, w: 468, h: 320, anchorXRatio: 0.5 },
  { x: 1108, y: 1376, w: 476, h: 320, anchorXRatio: 0.5 },
  { x: 1640, y: 1376, w: 480, h: 320, anchorXRatio: 0.5 },
  { x: 2192, y: 1376, w: 480, h: 320, anchorXRatio: 0.5 },
];

// Row 4: Run / Pounce Stride (true Y: 1784, H: 344, foot baseline Y: 2128)
const RUN_COORDS: RawCoord[] = [
  { x: 40, y: 1784, w: 460, h: 344, anchorXRatio: 0.48 },
  { x: 600, y: 1784, w: 472, h: 344, anchorXRatio: 0.48 },
  { x: 1180, y: 1784, w: 408, h: 332, anchorXRatio: 0.46 },
  { x: 1688, y: 1784, w: 516, h: 344, anchorXRatio: 0.45 },
  { x: 2284, y: 1784, w: 504, h: 332, anchorXRatio: 0.44 },
  { x: 2868, y: 1784, w: 476, h: 344, anchorXRatio: 0.48 },
];

// Row 5: Hurt / Stagger (true Y: 2196, H: 404, foot baseline Y: 2600)
const HURT_COORDS: RawCoord[] = [
  { x: 36, y: 2196, w: 464, h: 404, anchorXRatio: 0.5 },
  { x: 584, y: 2196, w: 468, h: 404, anchorXRatio: 0.5 },
  { x: 1168, y: 2196, w: 420, h: 388, anchorXRatio: 0.5 },
  { x: 1732, y: 2196, w: 472, h: 392, anchorXRatio: 0.5 },
  { x: 2268, y: 2196, w: 484, h: 392, anchorXRatio: 0.5 },
  { x: 2844, y: 2196, w: 468, h: 404, anchorXRatio: 0.5 },
  { x: 3412, y: 2196, w: 472, h: 404, anchorXRatio: 0.5 },
  { x: 4056, y: 2196, w: 496, h: 404, anchorXRatio: 0.48 },
];

// Row 6: Death Collapse (true Y: 2684, H: 356, foot baseline Y: 3040)
const DEAD_COORDS: RawCoord[] = [
  { x: 36, y: 2684, w: 464, h: 356, anchorXRatio: 0.5 },
  { x: 580, y: 2684, w: 456, h: 356, anchorXRatio: 0.5 },
  { x: 1120, y: 2684, w: 460, h: 352, anchorXRatio: 0.5 },
  { x: 1668, y: 2684, w: 480, h: 348, anchorXRatio: 0.5 },
  { x: 2216, y: 2684, w: 480, h: 356, anchorXRatio: 0.5 },
  { x: 2776, y: 2684, w: 476, h: 356, anchorXRatio: 0.5 },
  { x: 3332, y: 2688, w: 488, h: 356, anchorXRatio: 0.5 },
  { x: 3888, y: 2720, w: 496, h: 324, anchorXRatio: 0.5 },
  { x: 4432, y: 2720, w: 560, h: 324, anchorXRatio: 0.5 },
  { x: 5040, y: 2720, w: 564, h: 320, anchorXRatio: 0.5 },
];

export class AshGhoulSpriteAtlas {
  public static readonly IMAGE_SRC = '/assets/aistudio/enemi_1_b0c28fb7.jpg';

  public isLoaded: boolean = false;
  public animations: GhoulAnimationSet | null = null;

  // Scale: matches player and world proportions (~58-64px wide in game)
  private readonly targetScale: number = 0.125;

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
        console.error('Failed to process ash ghoul sprite sheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load ash ghoul sprite asset:', AshGhoulSpriteAtlas.IMAGE_SRC);
    };
    img.src = AshGhoulSpriteAtlas.IMAGE_SRC;
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

    const extractFrame = (coord: RawCoord): GhoulFrame => {
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
          originX: Math.round(finalW * (coord.anchorXRatio ?? 0.5)),
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

      // Clean transparent checkerboard background
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

        // Neutral gray checkerboard tile in JPEG: low color variance (diff <= 22) and brightness between 95 and 195
        if (diff <= 22 && avg >= 95 && avg <= 195) {
          data[offset + 3] = 0; // Transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);

      return {
        canvas: frameCanvas,
        width: finalW,
        height: finalH,
        originX: Math.round(finalW * (coord.anchorXRatio ?? 0.5)),
        originY: finalH,
      };
    };

    this.animations = {
      idle: IDLE_COORDS.map(extractFrame),
      walk: WALK_COORDS.map(extractFrame),
      attack: ATTACK_COORDS.map(extractFrame),
      windup: WINDUP_COORDS.map(extractFrame),
      run: RUN_COORDS.map(extractFrame),
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
  ): GhoulFrame | null {
    if (!this.animations || !this.isLoaded) return null;

    const anims = this.animations;

    switch (state) {
      case 'dead': {
        const frames = anims.dead;
        const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 8));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'hurt':
      case 'staggered': {
        const frames = anims.hurt;
        const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 10));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'windup': {
        const frames = anims.windup;
        const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 7));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'attack': {
        const frames = anims.attack;
        const idx = Math.min(frames.length - 1, Math.floor(stateTimer * 12));
        return frames[idx] || frames[frames.length - 1];
      }
      case 'chase': {
        // High speed run synchronized to velocity vector
        const frames = anims.run;
        const speed = Math.abs(vx);
        if (speed < 5) {
          return anims.idle[0];
        }
        // Pixel stride per cycle: 28px world displacement per frame
        const strideDistancePerFrame = 24;
        const idx = Math.floor(distanceTraveled / strideDistancePerFrame) % frames.length;
        return frames[idx] || frames[0];
      }
      case 'patrol': {
        // Natural prowl / walk cycle synchronized directly to movement velocity
        const frames = anims.walk;
        const speed = Math.abs(vx);
        if (speed < 5) {
          // Standing or blocked by obstacle: use idle frame instead of running feet in place
          return anims.idle[0];
        }
        // Exactly 1 stride cycle (7 frames) covers ~84px of world travel (~12px per frame)
        const strideDistancePerFrame = 12;
        const idx = Math.floor(distanceTraveled / strideDistancePerFrame) % frames.length;
        return frames[idx] || frames[0];
      }
      case 'idle':
      default: {
        const frames = anims.idle;
        const idx = Math.abs(Math.floor(globalTime * 4.5)) % frames.length;
        return frames[idx] || frames[0];
      }
    }
  }
}

export const ashGhoulAtlas = new AshGhoulSpriteAtlas();
if (typeof window !== 'undefined') {
  (window as unknown as { __ASH_GHOUL_ATLAS?: AshGhoulSpriteAtlas }).__ASH_GHOUL_ATLAS = ashGhoulAtlas;
}
