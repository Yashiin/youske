/**
 * Pixel Art Sprite Generator & Asset Sheet Engine for Yosuke: The Last Battle
 * Generates hand-crafted 16-bit / 32-bit dark fantasy pixel art sprites,
 * tilesets, attack arcs, props, and colossal boss parts.
 */

export interface PixelSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

// Utility to create a crisp pixel-art offscreen canvas
export function createPixelCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Helper to draw a pixel or rectangle of pixels
function px(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number = 1,
  h: number = 1
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Helper to draw horizontal pixel line
function hline(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), 1);
}

// Helper to draw vertical pixel line
function vline(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  h: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, Math.floor(h));
}

// Dithering pattern helper (for retro dark fantasy shading)
function ditherRect(
  ctx: CanvasRenderingContext2D,
  color1: string,
  color2: string,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      ctx.fillStyle = (dx + dy) % 2 === 0 ? color1 : color2;
      ctx.fillRect(Math.floor(x + dx), Math.floor(y + dy), 1, 1);
    }
  }
}

// --- PALETTE CONSTANTS ---
export const PALETTE = {
  // Yosuke
  skinLight: '#fed7aa',
  skinMid: '#fba872',
  skinDark: '#c2410c',
  hairDark: '#090d16',
  hairMid: '#1e293b',
  hairLight: '#334155',
  haoriDark: '#0f172a',
  haoriMid: '#1e1b4b',
  haoriLight: '#312e81',
  goldDark: '#b45309',
  goldMid: '#f59e0b',
  goldLight: '#fde047',
  scarfDark: '#7f1d1d',
  scarfMid: '#dc2626',
  scarfLight: '#f87171',
  scarfHighlight: '#fecaca',
  steelDark: '#334155',
  steelMid: '#64748b',
  steelLight: '#cbd5e1',
  steelBright: '#ffffff',
  leatherDark: '#451a03',
  leatherMid: '#78350f',

  // Enemies
  ghoulDark: '#3b0764',
  ghoulMid: '#6b21a8',
  ghoulLight: '#9333ea',
  ghoulEye: '#facc15',
  oniArmorDark: '#450a0a',
  oniArmorMid: '#991b1b',
  oniArmorLight: '#dc2626',
  oniSkin: '#7f1d1d',
  goliathStoneDark: '#111827',
  goliathStoneMid: '#1f2937',
  goliathStoneLight: '#374151',
  goliathMagmaDark: '#c2410c',
  goliathMagmaLight: '#fb923c',
  wraithDark: '#09090b',
  wraithMid: '#18181b',
  wraithCyan: '#22d3ee',
  wraithPurple: '#7e22ce',

  // Boss Malakor
  bossObsidianDark: '#090104',
  bossObsidianMid: '#1c040b',
  bossObsidianLight: '#360917',
  bossRuneDark: '#991b1b',
  bossRuneMid: '#dc2626',
  bossRuneLight: '#f43f5e',
  bossCoreWhite: '#ffffff',

  // Environment & Tiles
  stoneBrickDark: '#0f172a',
  stoneBrickMid: '#1e293b',
  stoneBrickLight: '#334155',
  stoneBrickEdge: '#475569',
  mossGreenDark: '#064e3b',
  mossGreenMid: '#059669',
  mossGreenLight: '#34d399',
  toriiWoodDark: '#450a0a',
  toriiWoodMid: '#7f1d1d',
  toriiWoodLight: '#991b1b',
  shrineStoneDark: '#1e293b',
  shrineStoneLight: '#475569',
  sacredBlueDark: '#0369a1',
  sacredBlueLight: '#38bdf8',
  sacredBlueWhite: '#e0f2fe',
};

// =========================================================================
// 1. YOSUKE SPRITE GENERATOR (HIGH DETAIL PIXEL ART)
// =========================================================================

export class YosukeSpriteAtlas {
  public idleFrames: PixelSprite[] = [];
  public runFrames: PixelSprite[] = [];
  public jumpFrame!: PixelSprite;
  public fallFrame!: PixelSprite;
  public landFrame!: PixelSprite;
  public light1Frame!: PixelSprite;
  public light2Frame!: PixelSprite;
  public light3Frame!: PixelSprite;
  public heavyFrame!: PixelSprite;
  public airAttackFrame!: PixelSprite;
  public airHeavyFrame!: PixelSprite;
  public dashFrame!: PixelSprite;
  public blockFrame!: PixelSprite;
  public parryFrame!: PixelSprite;
  public counterFrame!: PixelSprite;
  public hurtFrame!: PixelSprite;
  public defeatFrame!: PixelSprite;

  constructor() {
    this.generateAllSprites();
  }

  private generateAllSprites(): void {
    // Generate Idle (4 frames)
    for (let f = 0; f < 4; f++) {
      this.idleFrames.push(this.drawYosukePose('idle', f));
    }
    // Generate Run (6 frames)
    for (let f = 0; f < 6; f++) {
      this.runFrames.push(this.drawYosukePose('run', f));
    }
    // Single pose frames
    this.jumpFrame = this.drawYosukePose('jump', 0);
    this.fallFrame = this.drawYosukePose('fall', 0);
    this.landFrame = this.drawYosukePose('land', 0);
    this.light1Frame = this.drawYosukePose('light1', 0);
    this.light2Frame = this.drawYosukePose('light2', 0);
    this.light3Frame = this.drawYosukePose('light3', 0);
    this.heavyFrame = this.drawYosukePose('heavy', 0);
    this.airAttackFrame = this.drawYosukePose('air_attack', 0);
    this.airHeavyFrame = this.drawYosukePose('air_heavy', 0);
    this.dashFrame = this.drawYosukePose('dash', 0);
    this.blockFrame = this.drawYosukePose('block', 0);
    this.parryFrame = this.drawYosukePose('parry', 0);
    this.counterFrame = this.drawYosukePose('counter', 0);
    this.hurtFrame = this.drawYosukePose('hurt', 0);
    this.defeatFrame = this.drawYosukePose('defeat', 0);
  }

  private drawYosukePose(pose: string, frame: number): PixelSprite {
    const w = 72;
    const h = 72;
    const { canvas, ctx } = createPixelCanvas(w, h);
    const ox = 36;
    const oy = 64; // Feet baseline

    const p = PALETTE;

    // Breathing offset for idle
    const bob = pose === 'idle' ? (frame === 1 || frame === 2 ? -1 : 0) : 0;

    // Helper offsets
    let legL = 0;
    let legR = 0;
    let bodyTilt = 0;

    if (pose === 'run') {
      const legAngles = [-6, -3, 2, 6, 3, -2];
      legL = legAngles[frame];
      legR = -legAngles[frame];
      bodyTilt = 2;
    } else if (pose === 'jump') {
      legL = -4;
      legR = 4;
      bodyTilt = 1;
    } else if (pose === 'fall') {
      legL = -2;
      legR = 2;
    } else if (pose === 'land') {
      legL = -6;
      legR = 6;
      bodyTilt = 2;
    } else if (pose === 'dash') {
      legL = -8;
      legR = 6;
      bodyTilt = 6;
    } else if (pose === 'block' || pose === 'parry') {
      legL = -5;
      legR = 5;
    } else if (pose === 'counter') {
      legL = -7;
      legR = 8;
      bodyTilt = 5;
    }

    const bx = ox + bodyTilt;
    const by = oy - 50 + bob;

    // 1. SHADOW (under feet)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, pose === 'defeat' ? 16 : 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pose === 'defeat') {
      // Fallen wounded pose
      this.drawDefeatedYosuke(ctx, ox, oy);
      return { canvas, width: w, height: h, originX: ox, originY: oy };
    }

    // 2. BACK SCARF (flowing behind)
    this.drawPixelScarf(ctx, bx - 4, by + 12, pose, frame);

    // 3. LEGS / HAKAMA & WARAIJI SANDALS
    // Left leg
    px(ctx, p.haoriDark, ox - 6 + legL, oy - 20, 6, 14);
    px(ctx, p.haoriMid, ox - 5 + legL, oy - 19, 4, 12);
    // Left straw sandal & foot wraps
    px(ctx, p.leatherDark, ox - 7 + legL, oy - 6, 7, 6);
    px(ctx, p.goldDark, ox - 6 + legL, oy - 4, 5, 2);
    px(ctx, p.skinLight, ox - 6 + legL, oy - 3, 2, 2);

    // Right leg
    px(ctx, p.haoriDark, ox + 1 + legR, oy - 20, 6, 14);
    px(ctx, p.haoriMid, ox + 2 + legR, oy - 19, 4, 12);
    // Right straw sandal
    px(ctx, p.leatherDark, ox + legR, oy - 6, 7, 6);
    px(ctx, p.goldDark, ox + 1 + legR, oy - 4, 5, 2);
    px(ctx, p.skinLight, ox + 1 + legR, oy - 3, 2, 2);

    // Hakama pleats
    px(ctx, p.hairDark, ox - 8, oy - 26, 17, 8);
    px(ctx, p.haoriDark, ox - 7, oy - 25, 15, 7);
    px(ctx, p.haoriMid, ox - 6, oy - 24, 13, 5);

    // 4. TORSO / HAORI COAT & GOLD CRESTS
    // Main dark ronin robe
    px(ctx, p.hairDark, bx - 8, by + 10, 16, 18);
    px(ctx, p.haoriDark, bx - 7, by + 11, 14, 16);
    px(ctx, p.haoriMid, bx - 6, by + 12, 12, 14);

    // Inner gi shirt & collar
    px(ctx, p.steelLight, bx - 2, by + 11, 4, 8);
    px(ctx, p.steelDark, bx - 1, by + 12, 2, 7);

    // Gold clan crest on back/chest
    px(ctx, p.goldMid, bx - 3, by + 15, 6, 5);
    px(ctx, p.goldLight, bx - 2, by + 16, 4, 3);
    px(ctx, p.scarfMid, bx - 1, by + 17, 2, 1);

    // Red Obi belt
    px(ctx, p.scarfDark, bx - 8, by + 24, 16, 4);
    px(ctx, p.scarfMid, bx - 7, by + 24, 14, 3);
    px(ctx, p.goldMid, bx - 2, by + 24, 4, 3); // Belt buckle

    // 5. SHOULDER ARMOR (SODE)
    // Left shoulder plate
    px(ctx, p.steelDark, bx - 11, by + 10, 5, 8);
    px(ctx, p.steelMid, bx - 10, by + 11, 3, 6);
    px(ctx, p.goldMid, bx - 11, by + 10, 5, 1);

    // Right shoulder plate
    px(ctx, p.steelDark, bx + 6, by + 10, 5, 8);
    px(ctx, p.steelMid, bx + 7, by + 11, 3, 6);
    px(ctx, p.goldMid, bx + 6, by + 10, 5, 1);

    // 6. HEAD, FACE & WILD RONIN HAIR
    // Neck
    px(ctx, p.skinDark, bx - 2, by + 8, 4, 3);

    // Face base
    px(ctx, p.skinMid, bx - 5, by - 2, 10, 11);
    px(ctx, p.skinLight, bx - 4, by - 1, 8, 9);
    px(ctx, p.skinDark, bx - 5, by + 6, 10, 2); // Jaw shadow

    // Eyes: Focused warrior gaze with cyan glint
    px(ctx, p.hairDark, bx - 2, by + 2, 7, 2); // Brow line
    px(ctx, p.steelBright, bx + 1, by + 3, 3, 2); // Sclera
    px(ctx, p.wraithCyan, bx + 2, by + 3, 2, 2); // Glowing cyan iris!
    px(ctx, p.steelBright, bx + 2, by + 3, 1, 1); // Specular highlight

    // Forehead Bandana / Metal Hitaigane protector
    px(ctx, p.scarfDark, bx - 6, by - 4, 12, 3);
    px(ctx, p.scarfMid, bx - 5, by - 4, 10, 2);
    px(ctx, p.steelLight, bx - 1, by - 4, 3, 2); // Steel clan plate
    px(ctx, p.steelBright, bx, by - 4, 1, 1);

    // Wild Ronin Hair & Topknot Bun
    px(ctx, p.hairDark, bx - 8, by - 9, 16, 8);
    px(ctx, p.hairMid, bx - 7, by - 8, 14, 6);
    px(ctx, p.hairLight, bx - 6, by - 8, 6, 2); // Hair highlights
    // Hair strands falling
    px(ctx, p.hairDark, bx - 9, by - 4, 3, 9);
    px(ctx, p.hairDark, bx + 5, by - 3, 3, 7);

    // Topknot hair bun
    px(ctx, p.hairDark, bx - 4, by - 14, 8, 6);
    px(ctx, p.hairMid, bx - 3, by - 13, 6, 4);
    px(ctx, p.scarfMid, bx - 2, by - 10, 4, 2); // Hair ribbon tie

    // 7. ARMS & WEAPON POSES
    this.drawKatanaAndArms(ctx, bx, by, pose, frame);

    return { canvas, width: w, height: h, originX: ox, originY: oy };
  }

  private drawPixelScarf(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pose: string,
    frame: number
  ): void {
    const p = PALETTE;
    const wave = Math.sin(frame * 1.5) * 3;
    const trailLen = pose === 'dash' ? 24 : pose === 'run' ? 18 : 12;

    // Draw layered multi-colored pixel scarf trailing to the left
    for (let i = 0; i < trailLen; i++) {
      const sx = x - i * 1.4;
      const sy = y + Math.sin(i * 0.4 + wave) * 3 + (pose === 'jump' ? i * 0.8 : -i * 0.2);
      const thickness = Math.max(1, 4 - Math.floor(i / 6));

      // Shaded top & bottom edges
      px(ctx, p.scarfDark, sx, sy - 1, 2, 1);
      px(ctx, p.scarfMid, sx, sy, 2, thickness);
      px(ctx, p.scarfLight, sx, sy + 1, 1, Math.max(1, thickness - 1));
      if (i % 3 === 0) {
        px(ctx, p.scarfHighlight, sx, sy, 1, 1);
      }
    }
  }

  private drawKatanaAndArms(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    pose: string,
    frame: number
  ): void {
    const p = PALETTE;

    if (pose === 'block' || pose === 'parry') {
      // Blade raised in diagonal guard across chest
      // Left arm holding tsuka base
      px(ctx, p.haoriMid, bx - 2, by + 14, 5, 5);
      px(ctx, p.skinLight, bx + 1, by + 13, 3, 3);

      // Right arm supporting guard
      px(ctx, p.haoriMid, bx + 4, by + 12, 5, 5);
      px(ctx, p.skinLight, bx + 6, by + 11, 3, 3);

      // Katana Blade (Diagonal slash guard)
      for (let i = 0; i < 28; i++) {
        const kx = bx - 6 + i * 0.7;
        const ky = by + 26 - i * 1.2;
        px(ctx, p.steelDark, kx, ky, 2, 2);
        px(ctx, p.steelLight, kx, ky, 1, 1);
        px(ctx, p.steelBright, kx + 1, ky - 1, 1, 1); // Hamon specular
      }
      // Tsuba (Guard)
      px(ctx, p.goldMid, bx - 4, by + 24, 4, 4);
      px(ctx, p.goldLight, bx - 3, by + 25, 2, 2);

      // Tsuka (Hilt with red diamond wrap)
      px(ctx, p.scarfDark, bx - 7, by + 28, 4, 8);
      px(ctx, p.goldMid, bx - 6, by + 34, 2, 2); // Kashira pommel

      if (pose === 'parry') {
        // Radiant parry cross flash
        this.drawParryRadiance(ctx, bx + 6, by + 6);
      }
    } else if (pose === 'light1') {
      // Horizontal forward slash
      // Forward lunging arms
      px(ctx, p.haoriMid, bx + 2, by + 12, 8, 4);
      px(ctx, p.skinLight, bx + 9, by + 12, 3, 3);

      // Katana blade pointing forward with horizontal slash trail
      for (let i = 0; i < 26; i++) {
        px(ctx, p.steelDark, bx + 11 + i, by + 11, 1, 3);
        px(ctx, p.steelLight, bx + 11 + i, by + 12, 1, 2);
        px(ctx, p.steelBright, bx + 11 + i, by + 12, 1, 1);
      }
      // Tsuba & Hilt
      px(ctx, p.goldMid, bx + 10, by + 10, 2, 5);
      px(ctx, p.scarfDark, bx + 4, by + 12, 6, 3);
    } else if (pose === 'light2') {
      // Upward reverse diagonal slash
      px(ctx, p.haoriMid, bx + 2, by + 10, 6, 6);
      px(ctx, p.skinLight, bx + 6, by + 8, 3, 3);

      for (let i = 0; i < 28; i++) {
        const kx = bx + 7 + i * 0.8;
        const ky = by + 6 - i * 1.1;
        px(ctx, p.steelDark, kx, ky, 2, 2);
        px(ctx, p.steelLight, kx, ky, 1, 1);
        px(ctx, p.steelBright, kx + 1, ky - 1, 1, 1);
      }
    } else if (pose === 'light3') {
      // Spinning crescent slash (Blade extended in full spin)
      px(ctx, p.haoriMid, bx + 2, by + 12, 7, 5);
      px(ctx, p.skinLight, bx + 8, by + 11, 3, 3);

      for (let i = 0; i < 30; i++) {
        const kx = bx + 9 + i;
        const ky = by + 12;
        px(ctx, p.steelDark, kx, ky - 1, 1, 3);
        px(ctx, p.steelLight, kx, ky, 1, 2);
        px(ctx, p.steelBright, kx, ky, 1, 1);
      }
    } else if (pose === 'heavy') {
      // Overhead two-handed crushing slam
      px(ctx, p.haoriMid, bx + 4, by + 6, 6, 8);
      px(ctx, p.skinLight, bx + 7, by + 12, 3, 4);

      // Blade plunging straight down into the ground
      for (let i = 0; i < 32; i++) {
        const kx = bx + 10 + i * 0.3;
        const ky = by + 14 + i * 1.1;
        px(ctx, p.steelDark, kx - 1, ky, 3, 1);
        px(ctx, p.steelLight, kx, ky, 2, 1);
        px(ctx, p.steelBright, kx, ky, 1, 1);
      }
      // Ground impact sparks
      px(ctx, p.goldLight, bx + 20, by + 48, 6, 4);
      px(ctx, p.goldMid, bx + 18, by + 46, 10, 2);
    } else if (pose === 'counter') {
      // Sonic thrust forward with glowing crimson blade
      px(ctx, p.haoriMid, bx + 4, by + 11, 8, 4);
      px(ctx, p.skinLight, bx + 11, by + 11, 4, 3);

      for (let i = 0; i < 36; i++) {
        px(ctx, p.scarfDark, bx + 14 + i, by + 10, 1, 4);
        px(ctx, p.scarfMid, bx + 14 + i, by + 11, 1, 2);
        px(ctx, p.steelBright, bx + 14 + i, by + 11, 1, 1);
      }
    } else {
      // Idle / Run resting blade at hip (Sheathed Saya & Hilt)
      // Left arm at rest
      px(ctx, p.haoriMid, bx - 6, by + 12, 4, 8);
      px(ctx, p.skinLight, bx - 6, by + 19, 3, 3);

      // Katana Saya (Scabbard) resting at hip angled backwards
      for (let i = 0; i < 16; i++) {
        const sx = bx - 4 - i * 0.9;
        const sy = by + 22 + i * 0.5;
        px(ctx, p.hairDark, sx, sy, 2, 2);
        px(ctx, p.haoriDark, sx, sy, 1, 1);
      }
      // Tsuka & Tsuba sticking out forward
      px(ctx, p.goldMid, bx - 2, by + 20, 3, 3); // Tsuba
      px(ctx, p.scarfDark, bx - 1, by + 18, 5, 2); // Tsuka
      px(ctx, p.goldLight, bx + 4, by + 17, 2, 2); // Pommel
    }
  }

  private drawParryRadiance(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = PALETTE;
    // Radiant cross star
    hline(ctx, p.wraithCyan, x - 12, y, 25);
    vline(ctx, p.wraithCyan, x, y - 12, 25);
    hline(ctx, p.steelBright, x - 6, y, 13);
    vline(ctx, p.steelBright, x, y - 6, 13);
    px(ctx, p.steelBright, x, y, 2, 2);
  }

  private drawDefeatedYosuke(ctx: CanvasRenderingContext2D, ox: number, oy: number): void {
    const p = PALETTE;
    // Fallen onto knee and hand, exhausted/bleeding
    // Body collapsed low
    px(ctx, p.hairDark, ox - 14, oy - 20, 24, 14);
    px(ctx, p.haoriDark, ox - 13, oy - 19, 22, 12);
    px(ctx, p.haoriMid, ox - 11, oy - 17, 18, 9);

    // Head bowed forward
    px(ctx, p.hairDark, ox + 6, oy - 24, 10, 10);
    px(ctx, p.skinMid, ox + 8, oy - 18, 7, 6);
    px(ctx, p.skinDark, ox + 9, oy - 14, 5, 2);

    // Tattered scarf lying in embers
    px(ctx, p.scarfDark, ox - 18, oy - 8, 14, 4);
    px(ctx, p.scarfMid, ox - 16, oy - 7, 10, 2);

    // Broken Katana blade stuck in stone
    px(ctx, p.steelMid, ox + 18, oy - 22, 2, 22);
    px(ctx, p.steelBright, ox + 18, oy - 22, 1, 20);
    px(ctx, p.goldMid, ox + 17, oy - 16, 4, 2); // Tsuba
    // Broken blade tip fragment on ground
    px(ctx, p.steelLight, ox + 24, oy - 3, 6, 2);

    // Blood droplets
    px(ctx, p.scarfDark, ox + 12, oy - 4, 3, 2);
    px(ctx, p.scarfDark, ox - 4, oy - 2, 2, 2);
  }
}

// =========================================================================
// 2. DETAILED ENEMY PIXEL ART SPRITES
// =========================================================================

export class EnemySpriteAtlas {
  public ghoulFrames: PixelSprite[] = [];
  public warriorFrames: PixelSprite[] = [];
  public goliathFrames: PixelSprite[] = [];
  public wraithFrames: PixelSprite[] = [];

  constructor() {
    this.generateEnemies();
  }

  private generateEnemies(): void {
    // 1. Ghoul (4 frames: Idle/Run/Attack/Hurt)
    for (let f = 0; f < 4; f++) {
      this.ghoulFrames.push(this.drawGhoul(f));
    }
    // 2. Demon Warrior Oni (4 frames)
    for (let f = 0; f < 4; f++) {
      this.warriorFrames.push(this.drawOniWarrior(f));
    }
    // 3. Heavy Demon Goliath (4 frames)
    for (let f = 0; f < 4; f++) {
      this.goliathFrames.push(this.drawGoliath(f));
    }
    // 4. Agile Demon Wraith (4 frames)
    for (let f = 0; f < 4; f++) {
      this.wraithFrames.push(this.drawWraith(f));
    }
  }

  private drawGhoul(frame: number): PixelSprite {
    const w = 54;
    const h = 54;
    const { canvas, ctx } = createPixelCanvas(w, h);
    const ox = 27;
    const oy = 48;
    const p = PALETTE;

    const bob = frame % 2 === 1 ? -1 : 0;
    const isAttacking = frame === 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hunched feral body
    px(ctx, p.ghoulDark, ox - 12, oy - 26 + bob, 22, 18);
    px(ctx, p.ghoulMid, ox - 10, oy - 24 + bob, 18, 14);
    px(ctx, p.ghoulLight, ox - 8, oy - 22 + bob, 12, 8); // Back muscle highlight

    // Jagged bony spines along spine
    for (let s = 0; s < 4; s++) {
      px(ctx, p.steelLight, ox - 13 - s * 2, oy - 28 + s * 4 + bob, 3, 3);
      px(ctx, p.steelBright, ox - 14 - s * 2, oy - 29 + s * 4 + bob, 1, 1);
    }

    // Feral Demon Head
    px(ctx, p.ghoulDark, ox + 4, oy - 30 + bob, 14, 12);
    px(ctx, p.ghoulMid, ox + 6, oy - 28 + bob, 10, 9);

    // Glowing amber eyes & dripping fangs
    px(ctx, p.ghoulEye, ox + 11, oy - 26 + bob, 3, 2);
    px(ctx, p.steelBright, ox + 12, oy - 26 + bob, 1, 1);
    // Sharp fangs
    px(ctx, p.steelBright, ox + 12, oy - 20 + bob, 2, 4);
    px(ctx, p.steelBright, ox + 15, oy - 20 + bob, 2, 3);

    // Razor Talons / Claws
    if (isAttacking) {
      // Extended slash claws
      px(ctx, p.ghoulMid, ox + 10, oy - 22 + bob, 12, 4);
      px(ctx, p.steelBright, ox + 22, oy - 26 + bob, 4, 12);
    } else {
      px(ctx, p.ghoulDark, ox + 6, oy - 16 + bob, 8, 4);
      px(ctx, p.steelLight, ox + 12, oy - 14 + bob, 3, 4);
    }

    // Hind legs
    px(ctx, p.ghoulDark, ox - 10, oy - 12, 7, 12);
    px(ctx, p.ghoulMid, ox - 9, oy - 11, 5, 8);
    px(ctx, p.ghoulDark, ox + 2, oy - 12, 7, 12);

    return { canvas, width: w, height: h, originX: ox, originY: oy };
  }

  private drawOniWarrior(frame: number): PixelSprite {
    const w = 64;
    const h = 72;
    const { canvas, ctx } = createPixelCanvas(w, h);
    const ox = 32;
    const oy = 66;
    const p = PALETTE;

    const isAttacking = frame === 2;
    const isBlocking = frame === 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Armored Greaves
    px(ctx, p.oniArmorDark, ox - 9, oy - 22, 7, 22);
    px(ctx, p.oniArmorMid, ox - 8, oy - 21, 5, 18);
    px(ctx, p.oniArmorDark, ox + 2, oy - 22, 7, 22);
    px(ctx, p.oniArmorMid, ox + 3, oy - 21, 5, 18);

    // Segmented Lacquered Torso Armor (Do)
    px(ctx, p.oniArmorDark, ox - 11, oy - 42, 22, 22);
    px(ctx, p.oniArmorMid, ox - 10, oy - 41, 20, 20);
    // Lacing bands & gold trim
    px(ctx, p.goldMid, ox - 10, oy - 38, 20, 2);
    px(ctx, p.goldMid, ox - 10, oy - 32, 20, 2);
    px(ctx, p.goldLight, ox - 4, oy - 36, 8, 5); // Golden demon crest

    // Shoulder Armor (O-Sode)
    px(ctx, p.oniArmorDark, ox - 16, oy - 42, 6, 12);
    px(ctx, p.oniArmorMid, ox - 15, oy - 41, 4, 10);
    px(ctx, p.oniArmorDark, ox + 10, oy - 42, 6, 12);
    px(ctx, p.oniArmorMid, ox + 11, oy - 41, 4, 10);

    // Fierce Horned Kabuto Helmet & Hannya Mask
    px(ctx, p.oniArmorDark, ox - 8, oy - 58, 16, 17);
    px(ctx, p.oniArmorMid, ox - 7, oy - 57, 14, 15);

    // Large Golden Horns curving upward
    // Left horn
    px(ctx, p.goldDark, ox - 10, oy - 62, 4, 8);
    px(ctx, p.goldMid, ox - 14, oy - 68, 5, 8);
    px(ctx, p.goldLight, ox - 16, oy - 72, 3, 5);
    // Right horn
    px(ctx, p.goldDark, ox + 6, oy - 62, 4, 8);
    px(ctx, p.goldMid, ox + 9, oy - 68, 5, 8);
    px(ctx, p.goldLight, ox + 13, oy - 72, 3, 5);

    // Glowing Demonic Eyes in mask
    px(ctx, p.ghoulEye, ox - 3, oy - 48, 3, 2);
    px(ctx, p.ghoulEye, ox + 3, oy - 48, 3, 2);
    px(ctx, p.steelBright, ox - 2, oy - 48, 1, 1);
    px(ctx, p.steelBright, ox + 4, oy - 48, 1, 1);

    // Weapons / Shield
    if (isBlocking) {
      // Iron Greatshield with demonic crest
      px(ctx, p.steelDark, ox + 8, oy - 48, 10, 36);
      px(ctx, p.steelMid, ox + 9, oy - 47, 8, 34);
      px(ctx, p.goldMid, ox + 11, oy - 38, 4, 16);
    } else if (isAttacking) {
      // Naginata spear thrust forward
      px(ctx, p.steelDark, ox + 4, oy - 34, 38, 4);
      px(ctx, p.steelLight, ox + 4, oy - 33, 38, 2);
      // Serrated spear blade
      px(ctx, p.oniArmorLight, ox + 40, oy - 38, 8, 12);
      px(ctx, p.steelBright, ox + 44, oy - 37, 4, 10);
    } else {
      // Naginata resting diagonally
      for (let i = 0; i < 36; i++) {
        const nx = ox + 4 + i * 0.5;
        const ny = oy - 14 - i * 1.2;
        px(ctx, p.steelDark, nx, ny, 3, 3);
        px(ctx, p.steelMid, nx, ny, 2, 2);
      }
    }

    return { canvas, width: w, height: h, originX: ox, originY: oy };
  }

  private drawGoliath(frame: number): PixelSprite {
    const w = 84;
    const h = 88;
    const { canvas, ctx } = createPixelCanvas(w, h);
    const ox = 42;
    const oy = 80;
    const p = PALETTE;

    const isAttacking = frame === 2;

    // Massive Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive Stone Legs
    px(ctx, p.goliathStoneDark, ox - 18, oy - 24, 14, 24);
    px(ctx, p.goliathStoneMid, ox - 16, oy - 22, 10, 20);
    px(ctx, p.goliathStoneDark, ox + 4, oy - 24, 14, 24);
    px(ctx, p.goliathStoneMid, ox + 6, oy - 22, 10, 20);

    // Stone Torso with Magma Fissures
    px(ctx, p.goliathStoneDark, ox - 24, oy - 62, 48, 40);
    px(ctx, p.goliathStoneMid, ox - 22, oy - 60, 44, 36);
    px(ctx, p.goliathStoneLight, ox - 20, oy - 58, 20, 16);

    // Glowing Magma Veins
    px(ctx, p.goliathMagmaDark, ox - 14, oy - 52, 28, 3);
    px(ctx, p.goliathMagmaLight, ox - 12, oy - 51, 24, 1);
    px(ctx, p.goliathMagmaDark, ox - 4, oy - 48, 4, 18);
    px(ctx, p.goliathMagmaLight, ox - 3, oy - 46, 2, 14);
    px(ctx, p.goliathMagmaDark, ox + 8, oy - 38, 12, 3);
    px(ctx, p.goliathMagmaLight, ox + 9, oy - 37, 10, 1);

    // Massive Stone Head & Horn Crest
    px(ctx, p.goliathStoneDark, ox + 4, oy - 76, 26, 20);
    px(ctx, p.goliathStoneMid, ox + 6, oy - 74, 22, 16);
    // Fiery eye slits
    px(ctx, p.goliathMagmaLight, ox + 18, oy - 68, 6, 3);
    px(ctx, p.steelBright, ox + 20, oy - 68, 3, 2);

    // Giant Spiked Iron Mace
    if (isAttacking) {
      // Smashed into the floor with ground sparks
      px(ctx, p.steelDark, ox + 20, oy - 18, 36, 18);
      px(ctx, p.steelMid, ox + 22, oy - 16, 32, 14);
      // Spikes
      px(ctx, p.steelLight, ox + 26, oy - 22, 6, 5);
      px(ctx, p.steelLight, ox + 40, oy - 22, 6, 5);
      px(ctx, p.steelLight, ox + 52, oy - 12, 6, 6);
    } else {
      // Carried over shoulder
      px(ctx, p.steelDark, ox - 34, oy - 80, 24, 28);
      px(ctx, p.steelMid, ox - 32, oy - 78, 20, 24);
      px(ctx, p.steelLight, ox - 36, oy - 82, 6, 6);
      px(ctx, p.steelLight, ox - 20, oy - 82, 6, 6);
    }

    return { canvas, width: w, height: h, originX: ox, originY: oy };
  }

  private drawWraith(frame: number): PixelSprite {
    const w = 54;
    const h = 64;
    const { canvas, ctx } = createPixelCanvas(w, h);
    const ox = 27;
    const oy = 56;
    const p = PALETTE;

    const bob = Math.sin(frame * 1.5) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ox, oy, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tattered Phantom Cloak
    px(ctx, p.wraithDark, ox - 12, oy - 46 + bob, 24, 38);
    px(ctx, p.wraithMid, ox - 10, oy - 44 + bob, 20, 32);

    // Ethereal shadow tendrils at bottom of cloak
    for (let t = 0; t < 5; t++) {
      px(ctx, p.wraithPurple, ox - 10 + t * 4, oy - 12 + bob + (t % 2) * 3, 3, 6);
    }

    // Hood & Mask
    px(ctx, p.wraithDark, ox - 6, oy - 52 + bob, 16, 14);
    // Glowing Cyan Visor / Slit
    px(ctx, p.wraithCyan, ox + 2, oy - 44 + bob, 7, 3);
    px(ctx, p.steelBright, ox + 4, oy - 44 + bob, 3, 2);

    // Twin Curved Daggers
    px(ctx, p.wraithCyan, ox + 8, oy - 32 + bob, 14, 3);
    px(ctx, p.steelBright, ox + 14, oy - 38 + bob, 3, 12);

    return { canvas, width: w, height: h, originX: ox, originY: oy };
  }
}

// =========================================================================
// 3. GIANT DEMON BOSS: MALAKOR PIXEL ART ASSETS
// =========================================================================

export class MalakorSpriteAtlas {
  public headSprite!: PixelSprite;
  public torsoSprite!: PixelSprite;
  public leftArmIdle!: PixelSprite;
  public leftArmSlam!: PixelSprite;
  public rightArmSword!: PixelSprite;
  public bloodMeteorSprite!: PixelSprite;

  constructor() {
    this.generateBossAssets();
  }

  private generateBossAssets(): void {
    const p = PALETTE;

    // 1. Torso & Core (240x260)
    {
      const w = 240;
      const h = 260;
      const { canvas, ctx } = createPixelCanvas(w, h);
      const ox = 120;
      const oy = 260;

      // Colossal obsidian armored chest
      px(ctx, p.bossObsidianDark, ox - 80, 20, 160, 220);
      px(ctx, p.bossObsidianMid, ox - 75, 25, 150, 210);
      px(ctx, p.bossObsidianLight, ox - 70, 30, 40, 60); // Shoulder plate
      px(ctx, p.bossObsidianLight, ox + 30, 30, 40, 60);

      // Skull Pauldrons on shoulders
      px(ctx, p.steelDark, ox - 105, 15, 35, 45);
      px(ctx, p.steelMid, ox - 100, 20, 25, 35);
      px(ctx, p.steelDark, ox + 70, 15, 35, 45);
      px(ctx, p.steelMid, ox + 75, 20, 25, 35);

      // Glowing Demonic Core Rune (Weak Spot on chest)
      const coreGrad = ctx.createRadialGradient(ox, 125, 10, ox, 125, 60);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, p.bossRuneLight);
      coreGrad.addColorStop(0.7, p.bossRuneDark);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(ox - 60, 65, 120, 120);

      // Heart Core Rune glyph
      px(ctx, p.bossCoreWhite, ox - 10, 115, 20, 20);
      px(ctx, p.bossRuneLight, ox - 14, 111, 28, 4);
      px(ctx, p.bossRuneLight, ox - 14, 131, 28, 4);

      this.torsoSprite = { canvas, width: w, height: h, originX: ox, originY: oy };
    }

    // 2. Head & Massive Horns (180x160)
    {
      const w = 180;
      const h = 160;
      const { canvas, ctx } = createPixelCanvas(w, h);
      const ox = 90;
      const oy = 150;

      // Horns curving outwards
      // Left horn
      for (let i = 0; i < 45; i++) {
        const hx = ox - 35 - i * 1.2;
        const hy = 80 - i * 1.5 + Math.sin(i * 0.1) * 6;
        px(ctx, p.bossObsidianDark, hx, hy, 14, 14);
        px(ctx, p.bossObsidianMid, hx + 2, hy + 2, 10, 10);
        px(ctx, p.bossRuneDark, hx + 4, hy + 4, 3, 3); // Inset rune
      }
      // Right horn
      for (let i = 0; i < 45; i++) {
        const hx = ox + 25 + i * 1.2;
        const hy = 80 - i * 1.5 + Math.sin(i * 0.1) * 6;
        px(ctx, p.bossObsidianDark, hx, hy, 14, 14);
        px(ctx, p.bossObsidianMid, hx + 2, hy + 2, 10, 10);
        px(ctx, p.bossRuneDark, hx + 4, hy + 4, 3, 3);
      }

      // Demonic Skull Visage
      px(ctx, p.bossObsidianDark, ox - 38, 55, 76, 70);
      px(ctx, p.bossObsidianMid, ox - 34, 59, 68, 62);

      // Blazing Demon Eye Sockets
      px(ctx, p.bossRuneLight, ox - 24, 76, 18, 10);
      px(ctx, p.goldLight, ox - 20, 78, 10, 6);
      px(ctx, p.bossCoreWhite, ox - 18, 80, 5, 3);

      px(ctx, p.bossRuneLight, ox + 6, 76, 18, 10);
      px(ctx, p.goldLight, ox + 10, 78, 10, 6);
      px(ctx, p.bossCoreWhite, ox + 13, 80, 5, 3);

      // Demonic Fangs
      for (let f = 0; f < 5; f++) {
        px(ctx, p.steelBright, ox - 20 + f * 9, 114, 5, 12);
        px(ctx, p.steelLight, ox - 19 + f * 9, 114, 3, 10);
      }

      this.headSprite = { canvas, width: w, height: h, originX: ox, originY: oy };
    }

    // 3. Blood Meteor Sprite (36x36)
    {
      const w = 36;
      const h = 36;
      const { canvas, ctx } = createPixelCanvas(w, h);
      const grad = ctx.createRadialGradient(18, 18, 3, 18, 18, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, p.goldLight);
      grad.addColorStop(0.6, p.bossRuneLight);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 36, 36);

      px(ctx, p.bossCoreWhite, 16, 16, 4, 4);
      this.bloodMeteorSprite = { canvas, width: w, height: h, originX: 18, originY: 18 };
    }
  }
}

// =========================================================================
// 4. DETAILED TILESET & ENVIRONMENT SPRITES
// =========================================================================

export class EnvironmentTileset {
  public groundTile!: HTMLCanvasElement;
  public wallTile!: HTMLCanvasElement;
  public platformEdgeL!: HTMLCanvasElement;
  public platformEdgeR!: HTMLCanvasElement;
  public toriiGate!: HTMLCanvasElement;
  public shrineLantern!: HTMLCanvasElement;
  public soulUrn!: HTMLCanvasElement;
  public spikedHazard!: HTMLCanvasElement;

  constructor() {
    this.generateTiles();
  }

  private generateTiles(): void {
    const p = PALETTE;

    // 1. Ground Surface Tile (32x32) with pixel moss and cracked brick
    {
      const { canvas, ctx } = createPixelCanvas(32, 32);
      // Dark stone foundation
      ctx.fillStyle = p.stoneBrickDark;
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = p.stoneBrickMid;
      ctx.fillRect(1, 4, 30, 27);

      // Brick mortar lines
      ctx.strokeStyle = p.stoneBrickEdge;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 5, 32, 13);
      ctx.strokeRect(0, 18, 32, 14);
      vline(ctx, p.stoneBrickEdge, 16, 5, 13);

      // Top lush pixel moss with hanging roots
      ctx.fillStyle = p.mossGreenDark;
      ctx.fillRect(0, 0, 32, 5);
      ctx.fillStyle = p.mossGreenMid;
      ctx.fillRect(0, 0, 32, 3);
      ctx.fillStyle = p.mossGreenLight;
      ctx.fillRect(1, 0, 30, 1);
      // Dangling moss roots
      px(ctx, p.mossGreenMid, 4, 5, 2, 3);
      px(ctx, p.mossGreenMid, 12, 5, 2, 4);
      px(ctx, p.mossGreenMid, 22, 5, 2, 3);
      px(ctx, p.mossGreenMid, 28, 5, 2, 2);

      this.groundTile = canvas;
    }

    // 2. Wall / Sub-layer Brick Tile (32x32)
    {
      const { canvas, ctx } = createPixelCanvas(32, 32);
      ctx.fillStyle = p.stoneBrickDark;
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = p.stoneBrickMid;
      ctx.fillRect(1, 1, 30, 30);

      // Cracked stone texture & mortar
      ctx.strokeStyle = p.stoneBrickDark;
      ctx.strokeRect(0, 0, 16, 16);
      ctx.strokeRect(16, 0, 16, 16);
      ctx.strokeRect(8, 16, 16, 16);
      px(ctx, p.stoneBrickLight, 4, 4, 8, 1);
      px(ctx, p.stoneBrickLight, 20, 20, 8, 1);

      this.wallTile = canvas;
    }

    // 3. Weathered Stone Torii Gate (96x110)
    {
      const { canvas, ctx } = createPixelCanvas(96, 110);
      // Main crossbeams (Kasagi & Shimaki)
      px(ctx, p.toriiWoodDark, 0, 8, 96, 14);
      px(ctx, p.toriiWoodMid, 2, 10, 92, 10);
      px(ctx, p.goldMid, 16, 8, 4, 14); // Gold metal brackets
      px(ctx, p.goldMid, 76, 8, 4, 14);

      // Lower beam (Nuki)
      px(ctx, p.toriiWoodDark, 8, 30, 80, 8);
      px(ctx, p.toriiWoodMid, 9, 31, 78, 6);

      // Two Pillars (Hashira)
      px(ctx, p.toriiWoodDark, 14, 22, 12, 88);
      px(ctx, p.toriiWoodMid, 16, 22, 8, 88);
      px(ctx, p.stoneBrickDark, 12, 98, 16, 12); // Stone base (Daiishi)

      px(ctx, p.toriiWoodDark, 70, 22, 12, 88);
      px(ctx, p.toriiWoodMid, 72, 22, 8, 88);
      px(ctx, p.stoneBrickDark, 68, 98, 16, 12);

      // Sacred Shimenawa Rope hanging between pillars
      for (let r = 0; r < 50; r++) {
        const ry = 32 + Math.sin(r * 0.06) * 6;
        px(ctx, p.goldDark, 23 + r, ry, 2, 3);
        px(ctx, p.goldLight, 23 + r, ry + 1, 1, 1);
      }
      // Paper Shide streamers
      px(ctx, p.steelBright, 34, 38, 4, 8);
      px(ctx, p.steelBright, 46, 39, 4, 8);
      px(ctx, p.steelBright, 58, 38, 4, 8);

      this.toriiGate = canvas;
    }

    // 4. Sanctuary Jizo Stone Lantern Shrine (36x56)
    {
      const { canvas, ctx } = createPixelCanvas(36, 56);
      // Stone base
      px(ctx, p.shrineStoneDark, 6, 44, 24, 12);
      px(ctx, p.shrineStoneLight, 8, 45, 20, 10);

      // Stone Pillar
      px(ctx, p.shrineStoneDark, 12, 28, 12, 16);
      px(ctx, p.shrineStoneLight, 14, 29, 8, 14);

      // Fire Chamber (Hibukuro)
      px(ctx, p.shrineStoneDark, 8, 14, 20, 14);
      px(ctx, '#000000', 10, 16, 16, 10);

      // Glowing Sacred Spirit Flame inside
      px(ctx, p.sacredBlueLight, 14, 18, 8, 8);
      px(ctx, p.sacredBlueWhite, 16, 20, 4, 4);

      // Pagoda Stone Roof (Kasa)
      px(ctx, p.shrineStoneDark, 2, 8, 32, 6);
      px(ctx, p.shrineStoneLight, 4, 9, 28, 4);
      px(ctx, p.shrineStoneDark, 14, 2, 8, 6); // Top finial gem (Hoju)
      px(ctx, p.goldMid, 16, 3, 4, 4);

      this.shrineLantern = canvas;
    }

    // 5. Destructible Soul Urn (28x34)
    {
      const { canvas, ctx } = createPixelCanvas(28, 34);
      // Ceramic bulb body
      ctx.fillStyle = p.leatherDark;
      ctx.beginPath();
      ctx.arc(14, 22, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.leatherMid;
      ctx.beginPath();
      ctx.arc(14, 21, 9, 0, Math.PI * 2);
      ctx.fill();

      // Urn rim & neck
      px(ctx, p.leatherDark, 8, 7, 12, 6);
      px(ctx, p.goldMid, 6, 4, 16, 3);

      // Glowing soul seal
      px(ctx, p.sacredBlueLight, 12, 18, 4, 4);
      px(ctx, p.sacredBlueWhite, 13, 19, 2, 2);

      this.soulUrn = canvas;
    }

    // 6. Hazard Spikes (32x24)
    {
      const { canvas, ctx } = createPixelCanvas(32, 24);
      // 4 metallic blood-stained spikes
      for (let s = 0; s < 4; s++) {
        const sx = s * 8;
        ctx.fillStyle = p.steelDark;
        ctx.beginPath();
        ctx.moveTo(sx, 24);
        ctx.lineTo(sx + 4, 2);
        ctx.lineTo(sx + 8, 24);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = p.steelLight;
        ctx.beginPath();
        ctx.moveTo(sx + 2, 24);
        ctx.lineTo(sx + 4, 3);
        ctx.lineTo(sx + 5, 24);
        ctx.closePath();
        ctx.fill();

        // Blood stains on tips
        px(ctx, p.scarfDark, sx + 3, 3, 2, 5);
        px(ctx, p.scarfMid, sx + 3, 5, 2, 3);
      }
      this.spikedHazard = canvas;
    }
  }
}

// Global Singleton instances for instant cached access
export const yosukeAtlas = new YosukeSpriteAtlas();
export const enemyAtlas = new EnemySpriteAtlas();
export const bossAtlas = new MalakorSpriteAtlas();
export const envTileset = new EnvironmentTileset();
