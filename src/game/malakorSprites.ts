/**
 * Malakor, Lord of the Demonic Abyss (boss_malakor) Sprite Sheet Engine
 * High-precision frame extractor with measured Y bands and X intervals,
 * complete neutral-gray & red-glow-halo checkerboard removal, and grounded baselines.
 *
 * Spritesheet source: /assets/aistudio/boss_final_4_2f289ee0.jpg (1408 x 768)
 */

export interface MalakorFrame {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export interface MalakorAnimationSet {
  idle: MalakorFrame[];
  walk: MalakorFrame[];
  leap: MalakorFrame[];
  slam: MalakorFrame[];
  cleaveWindup: MalakorFrame[];
  cleave: MalakorFrame[];
  castOrb: MalakorFrame[];
  castBeam: MalakorFrame[];
  hurt: MalakorFrame[];
  defeat: MalakorFrame[];
}

export interface RawCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  anchorXRatio: number;
}

// Exact measured pixel bounding boxes from /assets/aistudio/boss_final_4_2f289ee0.jpg (1408 x 768)
// Row 0: Breathing Idle with Runic Greatsword (Foot Baseline Y: 131, H: 119)
export const IDLE_COORDS: RawCoord[] = [
  { x: 26, y: 12, w: 128, h: 119, anchorXRatio: 0.410 },
  { x: 204, y: 12, w: 128, h: 119, anchorXRatio: 0.398 },
  { x: 380, y: 12, w: 128, h: 119, anchorXRatio: 0.409 },
  { x: 559, y: 12, w: 126, h: 119, anchorXRatio: 0.401 },
  { x: 737, y: 12, w: 127, h: 119, anchorXRatio: 0.399 },
  { x: 913, y: 12, w: 126, h: 119, anchorXRatio: 0.404 },
];

// Row 1: Colossal Stalking / Walking Stride Cycle (Foot Baseline Y: 256, H: 117)
export const WALK_COORDS: RawCoord[] = [
  { x: 30, y: 139, w: 129, h: 117, anchorXRatio: 0.416 },
  { x: 208, y: 139, w: 128, h: 117, anchorXRatio: 0.402 },
  { x: 385, y: 139, w: 130, h: 117, anchorXRatio: 0.412 },
  { x: 563, y: 139, w: 141, h: 117, anchorXRatio: 0.357 },
  { x: 744, y: 139, w: 137, h: 117, anchorXRatio: 0.365 },
  { x: 925, y: 139, w: 133, h: 117, anchorXRatio: 0.367 },
];

// Row 2 (F0..F4): Colossal Leap / Airborne Ascent & Descent
export const LEAP_COORDS: RawCoord[] = [
  { x: 51, y: 262, w: 72, h: 119, anchorXRatio: 0.547 },
  { x: 221, y: 264, w: 75, h: 118, anchorXRatio: 0.524 },
  { x: 404, y: 262, w: 78, h: 117, anchorXRatio: 0.508 },
  { x: 577, y: 262, w: 80, h: 118, anchorXRatio: 0.521 },
  { x: 754, y: 264, w: 84, h: 120, anchorXRatio: 0.529 },
];

// Row 2 (F4..F5): Tremor Ground Slam Impact with Shockwave Dust Burst (Foot Baseline Y: 386)
export const SLAM_COORDS: RawCoord[] = [
  { x: 577, y: 262, w: 80, h: 118, anchorXRatio: 0.521 },
  { x: 754, y: 264, w: 84, h: 120, anchorXRatio: 0.529 },
  { x: 913, y: 287, w: 120, h: 99, anchorXRatio: 0.506 },
];

// Row 3 (F0..F1): Overhead Greatsword Windup (Foot Baseline Y: 518, H: 128)
export const CLEAVE_WINDUP_COORDS: RawCoord[] = [
  { x: 13, y: 390, w: 119, h: 128, anchorXRatio: 0.623 },
  { x: 180, y: 390, w: 118, h: 128, anchorXRatio: 0.618 },
];

// Row 3 (F2..F5): Blazing Hellfire Cleave Arc & Follow-Through (Foot Baseline Y: 518, H: 128)
export const CLEAVE_COORDS: RawCoord[] = [
  { x: 358, y: 390, w: 151, h: 128, anchorXRatio: 0.500 },
  { x: 531, y: 390, w: 155, h: 128, anchorXRatio: 0.500 },
  { x: 712, y: 390, w: 156, h: 128, anchorXRatio: 0.500 },
  { x: 884, y: 390, w: 117, h: 128, anchorXRatio: 0.632 },
];

// Row 4 (F0..F3): Blood Meteor & Dark Abyssal Orb Casting (Foot Baseline Y: 644, H: 119)
export const CAST_ORB_COORDS: RawCoord[] = [
  { x: 35, y: 525, w: 111, h: 119, anchorXRatio: 0.415 },
  { x: 205, y: 525, w: 134, h: 119, anchorXRatio: 0.395 },
  { x: 379, y: 525, w: 137, h: 119, anchorXRatio: 0.408 },
  { x: 554, y: 525, w: 138, h: 119, anchorXRatio: 0.407 },
];

// Row 4 (F3..F5): Abyssal Laser Beam Channeling & Firing Pose (Foot Baseline Y: 644, H: 119)
export const CAST_BEAM_COORDS: RawCoord[] = [
  { x: 554, y: 525, w: 138, h: 119, anchorXRatio: 0.407 },
  { x: 735, y: 525, w: 146, h: 119, anchorXRatio: 0.373 },
  { x: 920, y: 525, w: 112, h: 119, anchorXRatio: 0.460 },
];

// Row 5 (F0..F3): Stagger / Damage Recoil (Foot Baseline Y: 768)
export const HURT_COORDS: RawCoord[] = [
  { x: 33, y: 652, w: 120, h: 116, anchorXRatio: 0.487 },
  { x: 209, y: 652, w: 120, h: 116, anchorXRatio: 0.470 },
  { x: 388, y: 654, w: 119, h: 114, anchorXRatio: 0.474 },
  { x: 562, y: 656, w: 119, h: 112, anchorXRatio: 0.493 },
];

// Row 5 (F4..F5): Kneeling Collapse / Scripted Climax Stance
export const DEFEAT_COORDS: RawCoord[] = [
  { x: 739, y: 664, w: 123, h: 101, anchorXRatio: 0.493 },
  { x: 917, y: 675, w: 127, h: 91, anchorXRatio: 0.512 },
];

export const MALAKOR_SPRITE_COORDS = {
  idle: IDLE_COORDS,
  walk: WALK_COORDS,
  leap: LEAP_COORDS,
  slam: SLAM_COORDS,
  cleaveWindup: CLEAVE_WINDUP_COORDS,
  cleave: CLEAVE_COORDS,
  castOrb: CAST_ORB_COORDS,
  castBeam: CAST_BEAM_COORDS,
  hurt: HURT_COORDS,
  defeat: DEFEAT_COORDS,
};

/**
 * Pure predicate that strips the baked-in neutral gray checkerboard background
 * (and semi-transparent crimson orb/beam halo over checkerboard tiles) in
 * /assets/aistudio/boss_final_4_2f289ee0.jpg while preserving Malakor's
 * purple-obsidian armor, blazing orange-gold chest core, crimson horns,
 * and fiery sword arcs.
 */
export function isMalakorCheckerboardPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const avg = (r + g + b) / 3;

  // 1. Standard neutral gray checkerboard tile (dark gray ~55, light gray ~142)
  if (diff <= 19 && avg >= 42 && avg <= 172) {
    return true;
  }

  // 2. Faint red-aura-tinted checkerboard tile around dark energy orbs (G ≈ B >= 46)
  // Malakor's obsidian-purple armor always has B >= G + 8 or dark shadow G <= 42
  if (Math.abs(g - b) <= 6 && g >= 46 && b >= 46 && r >= g && r - g <= 48) {
    return true;
  }

  return false;
}

export class MalakorSpriteAtlas {
  public static readonly IMAGE_SRC = '/assets/aistudio/boss_final_4_2f289ee0.jpg';

  public isLoaded: boolean = false;
  public animations: MalakorAnimationSet | null = null;

  // Scale: 1.62 renders Malakor at ~193-207px tall, matching his colossal 140x180 hitbox
  private readonly targetScale: number = 1.62;

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
        console.error('Failed to process Malakor boss sprite sheet:', err);
      }
    };
    img.onerror = () => {
      console.warn('Could not load Malakor boss sprite asset:', MalakorSpriteAtlas.IMAGE_SRC);
    };
    img.src = MalakorSpriteAtlas.IMAGE_SRC;
  }

  private processSheet(img: HTMLImageElement): void {
    const sheetW = img.naturalWidth || 1408;
    const sheetH = img.naturalHeight || 768;

    const masterCanvas = document.createElement('canvas');
    masterCanvas.width = sheetW;
    masterCanvas.height = sheetH;
    const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true });
    if (!masterCtx) return;

    masterCtx.drawImage(img, 0, 0);

    const extractFrame = (coord: RawCoord): MalakorFrame => {
      // Extract at 1:1 native pixel resolution first to strip checkerboard cleanly without scaling artifacts
      const cleanCanvas = document.createElement('canvas');
      cleanCanvas.width = coord.w;
      cleanCanvas.height = coord.h;
      const cleanCtx = cleanCanvas.getContext('2d', { willReadFrequently: true });

      const finalW = Math.max(1, Math.round(coord.w * this.targetScale));
      const finalH = Math.max(1, Math.round(coord.h * this.targetScale));
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = finalW;
      frameCanvas.height = finalH;
      const ctx = frameCanvas.getContext('2d');

      if (!cleanCtx || !ctx) {
        return {
          canvas: frameCanvas,
          width: finalW,
          height: finalH,
          originX: Math.round(finalW * coord.anchorXRatio),
          originY: finalH,
        };
      }

      cleanCtx.drawImage(
        masterCanvas,
        coord.x,
        coord.y,
        coord.w,
        coord.h,
        0,
        0,
        coord.w,
        coord.h
      );

      const imgData = cleanCtx.getImageData(0, 0, coord.w, coord.h);
      const data = imgData.data;
      const totalPixels = coord.w * coord.h;

      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        if (isMalakorCheckerboardPixel(r, g, b)) {
          data[offset + 3] = 0;
        }
      }

      cleanCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cleanCanvas, 0, 0, coord.w, coord.h, 0, 0, finalW, finalH);

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
      leap: LEAP_COORDS.map(extractFrame),
      slam: SLAM_COORDS.map(extractFrame),
      cleaveWindup: CLEAVE_WINDUP_COORDS.map(extractFrame),
      cleave: CLEAVE_COORDS.map(extractFrame),
      castOrb: CAST_ORB_COORDS.map(extractFrame),
      castBeam: CAST_BEAM_COORDS.map(extractFrame),
      hurt: HURT_COORDS.map(extractFrame),
      defeat: DEFEAT_COORDS.map(extractFrame),
    };
  }

  public getFrame(
    currentAttack: string,
    isGrounded: boolean,
    vx: number,
    vy: number,
    pendingAttackTimer: number,
    hitFlashTimer: number,
    globalTime: number
  ): MalakorFrame | null {
    if (!this.isLoaded || !this.animations) return null;

    // 1. Airborne Leap / Anti-Camping Reposition
    if (!isGrounded || currentAttack === 'leap_crush') {
      const frames = this.animations.leap;
      const idx = vy < -150 ? 1 : vy < 100 ? 2 : vy < 300 ? 3 : 4;
      return frames[Math.min(frames.length - 1, idx)] || frames[0];
    }

    // 2. Active Attack Windups & Strikes
    if (currentAttack === 'cleave') {
      if (pendingAttackTimer > 0) {
        const frames = this.animations.cleaveWindup;
        const idx = pendingAttackTimer > 0.19 ? 0 : 1;
        return frames[idx] || frames[0];
      }
      const frames = this.animations.cleave;
      const idx = Math.abs(Math.floor(globalTime * 10)) % frames.length;
      return frames[idx] || frames[0];
    }

    if (currentAttack === 'slam') {
      const frames = this.animations.slam;
      if (pendingAttackTimer > 0.2) return frames[0];
      if (pendingAttackTimer > 0) return frames[1];
      return frames[2] || frames[0];
    }

    if (currentAttack === 'meteor') {
      const frames = this.animations.castOrb;
      const idx = Math.abs(Math.floor(globalTime * 8)) % frames.length;
      return frames[idx] || frames[0];
    }

    if (currentAttack === 'beam') {
      const frames = this.animations.castBeam;
      if (pendingAttackTimer > 0.25) return frames[0];
      if (pendingAttackTimer > 0) return frames[1];
      return frames[2] || frames[1];
    }

    if (currentAttack === 'hurt') {
      const frames = this.animations.hurt;
      const idx = Math.abs(Math.floor(globalTime * 8)) % frames.length;
      return frames[idx] || frames[0];
    }

    if (currentAttack === 'dead' || currentAttack === 'defeat') {
      const frames = this.animations.defeat;
      const idx = Math.abs(Math.floor(globalTime * 4)) % frames.length;
      return frames[idx] || frames[0];
    }

    // 3. Brief hit recoil flash when struck while idle
    if (hitFlashTimer > 0.04 && Math.abs(vx) < 20) {
      return this.animations.hurt[0] || this.animations.idle[0];
    }

    // 4. Walking / Stalking across the Throne Room
    if (Math.abs(vx) >= 15) {
      const frames = this.animations.walk;
      const idx = Math.abs(Math.floor(globalTime * 8)) % frames.length;
      return frames[idx] || frames[0];
    }

    // 5. Default Breathing Idle
    const frames = this.animations.idle;
    const idx = Math.abs(Math.floor(globalTime * 5)) % frames.length;
    return frames[idx] || frames[0];
  }
}

export const malakorAtlas = new MalakorSpriteAtlas();
