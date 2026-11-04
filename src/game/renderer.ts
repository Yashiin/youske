/**
 * Pixel Art Renderer & Visual FX Engine for Yosuke: The Last Battle
 * Renders atmospheric dark fantasy pixel art environments, layered parallax,
 * animated character sprites, slashes, particles, and the colossal final boss.
 */

import {
  Enemy,
  BossData,
  Particle,
  DamageNumber,
  DestructibleProp,
  Checkpoint,
  Platform,
  LevelData,
  PlayerAction,
} from './types';
import {
  yosukeAtlas,
  enemyAtlas,
  bossAtlas,
  envTileset,
  PALETTE,
  PixelSprite,
} from './pixelArt';
import { goldenKnightManager } from './goldenKnightSprites';
import { ashGhoulAtlas } from './ashGhoulSprites';
import { oniWarriorAtlas } from './oniWarriorSprites';
import { heavyDemonAtlas } from './heavyDemonSprites';
import { agileDemonAtlas } from './agileDemonSprites';

export class GameRenderer {
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;
  private canvasWidth: number = 960;
  private canvasHeight: number = 540;

  // Visual timers
  private globalTime: number = 0;

  public setDimensions(w: number, h: number): void {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  public update(dt: number, targetX: number, targetY: number, levelWidth: number, levelHeight: number): void {
    this.globalTime += dt;

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Camera follow with deadzone and lookahead
    const targetCamX = targetX - this.canvasWidth * 0.45;
    const targetCamY = targetY - this.canvasHeight * 0.6;

    // Smooth damping
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, dt * 6);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, dt * 6);

    // Clamp camera within level bounds
    const maxCamX = Math.max(0, levelWidth - this.canvasWidth);
    const maxCamY = Math.max(0, levelHeight - this.canvasHeight);

    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
    this.cameraY = Math.max(0, Math.min(maxCamY, this.cameraY));
  }

  public triggerShake(amount: number): void {
    this.screenShake = Math.min(24, Math.max(this.screenShake, amount));
  }

  // --- RENDER MAIN FRAME ---

  public render(
    ctx: CanvasRenderingContext2D,
    level: LevelData,
    player: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      facing: 1 | -1;
      action: PlayerAction;
      actionTimer: number;
      isInvulnerable: boolean;
      hitFlashTimer: number;
      scarfPoints: Array<{ x: number; y: number }>;
    },
    enemies: Enemy[],
    boss: BossData | null,
    particles: Particle[],
    damageNumbers: DamageNumber[],
    hitstop: number
  ): void {
    ctx.save();

    // Strict pixelated rendering settings
    ctx.imageSmoothingEnabled = false;

    // Apply camera shake
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.screenShake > 0) {
      shakeOffsetX = Math.round((Math.random() * 2 - 1) * this.screenShake);
      shakeOffsetY = Math.round((Math.random() * 2 - 1) * this.screenShake);
    }

    const isHeavyHitstop = hitstop > 0.07;

    // 1. Render Multi-Layer Parallax Background
    this.renderParallaxBackground(ctx, level);

    // Apply world transform for in-level entities
    ctx.save();
    ctx.translate(
      Math.round(-this.cameraX + shakeOffsetX),
      Math.round(-this.cameraY + shakeOffsetY)
    );

    // 2. Render Platforms with Pixel Tileset
    this.renderLevelGeometry(ctx, level);

    // 3. Render Props & Checkpoints
    this.renderProps(ctx, level.destructibles);
    this.renderCheckpoints(ctx, level.checkpoints);

    // 4. Render Enemies with Pixel Sprites
    for (const enemy of enemies) {
      if (enemy.state !== 'dead' || enemy.stateTimer < 0.6) {
        this.renderEnemy(ctx, enemy);
      }
    }

    // 5. Render Giant Demon Boss if in Boss stage
    if (boss) {
      this.renderBoss(ctx, boss);
    }

    // 6. Render Yosuke (Player) with Pixel Art Animations
    this.renderPlayer(ctx, player);

    // 7. Render In-World Particles & Visual FX
    this.renderParticles(ctx, particles);

    // 8. Render Floating Damage Numbers
    this.renderDamageNumbers(ctx, damageNumbers);

    ctx.restore();

    // 9. Foreground Atmospheric Mist / Ash
    this.renderAtmosphericOverlay(ctx, isHeavyHitstop);

    ctx.restore();
  }

  // --- PARALLAX BACKGROUNDS ---

  private renderParallaxBackground(ctx: CanvasRenderingContext2D, level: LevelData): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const p = PALETTE;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (level.isBossStage) {
      // Demonic crimson eclipse sky
      skyGrad.addColorStop(0, '#0c0205');
      skyGrad.addColorStop(0.35, '#1e050e');
      skyGrad.addColorStop(0.75, '#380918');
      skyGrad.addColorStop(1, '#140207');
    } else if (level.id === 1) {
      // Ashen forest night
      skyGrad.addColorStop(0, '#080c14');
      skyGrad.addColorStop(0.4, '#0f172a');
      skyGrad.addColorStop(0.8, '#1e293b');
      skyGrad.addColorStop(1, '#0b111e');
    } else {
      // Cursed ramparts dusk
      skyGrad.addColorStop(0, '#100818');
      skyGrad.addColorStop(0.4, '#1f1028');
      skyGrad.addColorStop(0.8, '#321840');
      skyGrad.addColorStop(1, '#160920');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars & Ash in sky
    ctx.fillStyle = level.isBossStage ? 'rgba(239, 68, 68, 0.4)' : 'rgba(226, 232, 240, 0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 73 + this.globalTime * 3) % w;
      const sy = (i * 37) % (h * 0.5);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
    }

    // Distant Blood Moon / Celestial Orb
    const moonX = Math.round(w * 0.72 - this.cameraX * 0.02);
    const moonY = Math.round(h * 0.26);
    ctx.save();
    if (level.isBossStage) {
      // Eclipsed Bleeding Eye Moon
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 100);
      moonGlow.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      moonGlow.addColorStop(0.4, 'rgba(185, 28, 28, 0.35)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - 100, moonY - 100, 200, 200);

      // Moon outer rim
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Eclipse shadow
      ctx.fillStyle = '#080103';
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY, 34, 0, Math.PI * 2);
      ctx.fill();

      // Bleeding corona tendrils
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fillRect(moonX - 44, moonY - 2, 6, 4);
      ctx.fillRect(moonX + 38, moonY - 4, 8, 4);
      ctx.fillRect(moonX - 4, moonY + 38, 4, 10);
    } else {
      // Pale moonlight with misty halo
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
      moonGlow.addColorStop(0, 'rgba(226, 232, 240, 0.7)');
      moonGlow.addColorStop(0.5, 'rgba(148, 163, 184, 0.2)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - 90, moonY - 90, 180, 180);

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 34, 0, Math.PI * 2);
      ctx.fill();

      // Crater details
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(moonX - 8, moonY - 6, 7, 0, Math.PI * 2);
      ctx.arc(moonX + 10, moonY + 8, 10, 0, Math.PI * 2);
      ctx.arc(moonX - 12, moonY + 12, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Far Layer: Mountain Silhouettes with Pixel Peaks (Parallax 0.05)
    ctx.save();
    ctx.fillStyle = level.isBossStage ? '#16040a' : '#080e19';
    const farOffset = -this.cameraX * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 60; x += 32) {
      const worldX = x - (farOffset % 800);
      const peakY = Math.round(h * 0.48 + Math.sin(worldX * 0.008) * 45 + Math.cos(worldX * 0.02) * 25);
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Mid Layer: Ruined Castles, Pagodas & Withered Pines (Parallax 0.15)
    ctx.save();
    ctx.fillStyle = level.isBossStage ? '#1a050d' : '#0d1525';
    const midOffset = -this.cameraX * 0.15;
    const spacing = 280;
    const startIdx = Math.floor((-midOffset - 200) / spacing);
    const endIdx = startIdx + Math.ceil(w / spacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = Math.round(i * spacing + midOffset);
      const basePy = Math.round(h * 0.65);

      if (i % 2 === 0) {
        // Detailed Pagoda Tower Silhouette
        ctx.fillRect(px, basePy - 100, 52, 130);
        // Roof eaves
        ctx.fillRect(px - 14, basePy - 45, 80, 10);
        ctx.fillRect(px - 20, basePy - 85, 92, 12);
        ctx.fillRect(px - 10, basePy - 118, 72, 10);
        // Spire
        ctx.fillRect(px + 24, basePy - 138, 4, 20);
      } else {
        // Withered Pine Tree Silhouette
        ctx.fillRect(px + 18, basePy - 120, 12, 140);
        ctx.beginPath();
        ctx.arc(px + 12, basePy - 105, 26, 0, Math.PI * 2);
        ctx.arc(px + 40, basePy - 90, 22, 0, Math.PI * 2);
        ctx.arc(px + 8, basePy - 70, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Near Background Layer: Torii Gates & Broken Battlements (Parallax 0.35)
    ctx.save();
    const nearOffset = -this.cameraX * 0.35;
    const nearSpacing = 380;
    const nStart = Math.floor((-nearOffset - 200) / nearSpacing);
    const nEnd = nStart + Math.ceil(w / nearSpacing) + 2;

    for (let i = nStart; i <= nEnd; i++) {
      const nx = Math.round(i * nearSpacing + nearOffset);
      const baseNy = Math.round(h * 0.72);
      ctx.drawImage(envTileset.toriiGate, nx, baseNy - 110);
    }
    ctx.restore();
  }

  // --- LEVEL GEOMETRY USING PIXEL TILESETS ---

  private renderLevelGeometry(ctx: CanvasRenderingContext2D, level: LevelData): void {
    const tileW = 32;
    const tileH = 32;

    for (const plat of level.platforms) {
      if (
        plat.x + plat.w < this.cameraX - 60 ||
        plat.x > this.cameraX + this.canvasWidth + 60
      ) {
        continue;
      }

      if (plat.isHazard) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(plat.x, plat.y, plat.w, plat.h + 64);
        ctx.clip();

        // Dark chasm stone foundation below the spikes
        const baseY = plat.y + 24;
        ctx.fillStyle = PALETTE.stoneBrickDark;
        ctx.fillRect(plat.x, baseY, plat.w, 60);
        const cols = Math.ceil(plat.w / tileW);
        for (let c = 0; c < cols; c++) {
          ctx.drawImage(envTileset.wallTile, plat.x + c * tileW, baseY);
        }

        // Hazard Spikes strictly clipped within chasm width
        const spikeCount = Math.ceil(plat.w / tileW);
        for (let i = 0; i < spikeCount; i++) {
          ctx.drawImage(envTileset.spikedHazard, plat.x + i * tileW, plat.y);
        }

        ctx.restore();
        continue;
      }

      // Solid stone platforms using tileset (clipped strictly to platform bounds)
      const cols = Math.ceil(plat.w / tileW);
      const rows = Math.ceil(plat.h / tileH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(plat.x, plat.y, plat.w, plat.h);
      ctx.clip();

      // Draw surface row (mossy brick)
      for (let c = 0; c < cols; c++) {
        const tx = plat.x + c * tileW;
        ctx.drawImage(envTileset.groundTile, tx, plat.y);
      }

      // Draw sub-surface rows (stone bricks)
      if (rows > 1 && !plat.isOneWay) {
        for (let r = 1; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const tx = plat.x + c * tileW;
            const ty = plat.y + r * tileH;
            ctx.drawImage(envTileset.wallTile, tx, ty);
          }
        }
      }

      ctx.restore();

      // If one-way elevated platform, draw hanging foliage/vines
      if (plat.isOneWay) {
        ctx.fillStyle = PALETTE.mossGreenDark;
        for (let vx = plat.x + 8; vx < plat.x + plat.w - 8; vx += 20) {
          const vlen = 6 + ((vx * 7) % 12);
          ctx.fillRect(vx, plat.y + plat.h, 2, vlen);
          ctx.fillStyle = PALETTE.mossGreenMid;
          ctx.fillRect(vx + 1, plat.y + plat.h, 1, Math.max(2, vlen - 3));
          ctx.fillStyle = PALETTE.mossGreenDark;
        }
      }

      // Platform dark borders
      ctx.strokeStyle = PALETTE.stoneBrickDark;
      ctx.lineWidth = 1;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      // In boss stage, add glowing demonic runes across platform top
      if (level.isBossStage) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
        for (let rx = plat.x + 16; rx < plat.x + plat.w - 16; rx += 48) {
          ctx.fillRect(rx, plat.y + 1, 8, 2);
          ctx.fillRect(rx + 3, plat.y - 1, 2, 5);
        }
      }
    }
  }

  // --- PROPS & CHECKPOINTS ---

  private renderProps(ctx: CanvasRenderingContext2D, props: DestructibleProp[]): void {
    for (const prop of props) {
      if (prop.destroyed) continue;

      if (prop.type === 'urn') {
        ctx.drawImage(envTileset.soulUrn, prop.x, prop.y);
      } else if (prop.type === 'lantern') {
        ctx.drawImage(envTileset.shrineLantern, prop.x, prop.y);
        // Dynamic flame glow
        const glow = ctx.createRadialGradient(prop.x + 18, prop.y + 20, 4, prop.x + 18, prop.y + 20, 40);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(prop.x - 22, prop.y - 20, 80, 80);
      } else {
        // Crate
        ctx.fillStyle = PALETTE.leatherDark;
        ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
        ctx.strokeStyle = PALETTE.goldDark;
        ctx.lineWidth = 2;
        ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
      }
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D, checkpoints: Checkpoint[]): void {
    for (const cp of checkpoints) {
      // Draw Jizo Shrine
      ctx.drawImage(envTileset.shrineLantern, cp.x - 18, cp.y - 56);

      if (cp.activated) {
        // Sacred Spirit Glow
        const glow = ctx.createRadialGradient(cp.x, cp.y - 36, 6, cp.x, cp.y - 36, 50);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        glow.addColorStop(0.6, 'rgba(2, 132, 199, 0.15)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cp.x - 50, cp.y - 86, 100, 100);

        // Rising sacred blue embers
        for (let i = 0; i < 3; i++) {
          const ey = cp.y - 45 - ((this.globalTime * 25 + i * 15) % 35);
          const ex = cp.x + Math.sin(this.globalTime * 4 + i) * 8;
          ctx.fillStyle = PALETTE.sacredBlueWhite;
          ctx.fillRect(Math.floor(ex), Math.floor(ey), 2, 2);
        }
      }
    }
  }

  // --- YOSUKE (PLAYER) SPRITE ANIMATION ---

  private renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      facing: 1 | -1;
      action: PlayerAction;
      actionTimer: number;
      isInvulnerable: boolean;
      hitFlashTimer: number;
      scarfPoints: Array<{ x: number; y: number }>;
    }
  ): void {
    ctx.save();
    ctx.translate(Math.round(player.x), Math.round(player.y));
    ctx.scale(player.facing, 1);

    // Hit flash or invulnerability flicker
    if (player.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.4) contrast(1.2)';
    } else if (player.isInvulnerable && Math.floor(this.globalTime * 30) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const action = player.action;

    // Draw corresponding combat slash arcs / VFX
    if (action === 'light_attack_1') {
      this.drawSlashCrescent(ctx, 1);
    } else if (action === 'light_attack_2') {
      this.drawSlashCrescent(ctx, 2);
    } else if (action === 'light_attack_3') {
      this.drawSlashCrescent(ctx, 3);
    } else if (action === 'heavy_attack') {
      this.drawSlashCrescent(ctx, 'heavy');
    } else if (action === 'air_attack') {
      this.drawSlashCrescent(ctx, 'air');
    } else if (action === 'air_heavy') {
      this.drawSlashCrescent(ctx, 'air_heavy');
    } else if (action === 'parry') {
      this.drawParryBurst(ctx);
    } else if (action === 'counter') {
      this.drawCounterSlashLine(ctx);
    }

    // Try rendering from the high quality Golden Knight sprite sheet
    const knightFrame = goldenKnightManager.getFrame(
      action,
      this.globalTime,
      player.actionTimer
    );

    if (knightFrame && knightFrame.canvas) {
      ctx.drawImage(
        knightFrame.canvas,
        Math.round(-knightFrame.originX),
        Math.round(-knightFrame.originY)
      );
    } else {
      // Fallback to procedural sprite atlas
      let sprite: PixelSprite | undefined;
      if (action === 'run') {
        const frames = yosukeAtlas.runFrames;
        const f = Math.abs(Math.floor(this.globalTime * 12)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      } else if (action === 'jump') {
        sprite = yosukeAtlas.jumpFrame;
      } else if (action === 'fall') {
        sprite = yosukeAtlas.fallFrame;
      } else if (action === 'land') {
        sprite = yosukeAtlas.landFrame;
      } else if (action === 'light_attack_1') {
        sprite = yosukeAtlas.light1Frame;
      } else if (action === 'light_attack_2') {
        sprite = yosukeAtlas.light2Frame;
      } else if (action === 'light_attack_3') {
        sprite = yosukeAtlas.light3Frame;
      } else if (action === 'heavy_attack') {
        sprite = yosukeAtlas.heavyFrame;
      } else if (action === 'air_attack') {
        sprite = yosukeAtlas.airAttackFrame;
      } else if (action === 'air_heavy') {
        sprite = yosukeAtlas.airHeavyFrame;
      } else if (action === 'dash') {
        sprite = yosukeAtlas.dashFrame;
      } else if (action === 'block') {
        sprite = yosukeAtlas.blockFrame;
      } else if (action === 'parry') {
        sprite = yosukeAtlas.parryFrame;
      } else if (action === 'counter') {
        sprite = yosukeAtlas.counterFrame;
      } else if (action === 'hurt') {
        sprite = yosukeAtlas.hurtFrame;
      } else if (action === 'defeat') {
        sprite = yosukeAtlas.defeatFrame;
      } else {
        const frames = yosukeAtlas.idleFrames;
        const f = Math.abs(Math.floor(this.globalTime * 5)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      }

      if (!sprite || !sprite.canvas) {
        sprite = yosukeAtlas.idleFrames?.[0];
      }

      if (sprite && sprite.canvas) {
        ctx.drawImage(
          sprite.canvas,
          Math.round(-sprite.originX),
          Math.round(-sprite.originY)
        );
      }
    }

    ctx.restore();
  }

  private drawSlashCrescent(ctx: CanvasRenderingContext2D, type: number | string): void {
    ctx.save();
    if (type === 1) {
      // Horizontal Cyan Slash Arc
      ctx.strokeStyle = PALETTE.wraithCyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(8, -28, 38, -0.6, 0.8);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, -28, 37, -0.4, 0.6);
      ctx.stroke();
    } else if (type === 2) {
      // Reverse Upward Arc
      ctx.strokeStyle = PALETTE.sacredBlueLight;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(6, -26, 42, 1.0, -0.5, true);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, -26, 41, 0.8, -0.3, true);
      ctx.stroke();
    } else if (type === 3) {
      // 360 Whirlwind Amber Arc
      ctx.strokeStyle = PALETTE.goldMid;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, -26, 46, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -26, 45, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'heavy' || type === 'air_heavy') {
      // Crushing Golden Blade Cleave Arc
      ctx.strokeStyle = PALETTE.goldMid;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(8, -16, 52, -1.6, 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(8, -16, 51, -1.4, 0.4);
      ctx.stroke();
    } else if (type === 'air') {
      ctx.strokeStyle = PALETTE.wraithCyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -24, 40, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawParryBurst(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Radiant cyan/gold cross burst
    ctx.strokeStyle = PALETTE.wraithCyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, -28, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, -28);
    ctx.lineTo(35, -28);
    ctx.moveTo(10, -53);
    ctx.lineTo(10, -3);
    ctx.stroke();
    ctx.restore();
  }

  private drawCounterSlashLine(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = PALETTE.scarfMid;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-40, -10);
    ctx.lineTo(90, -45);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-30, -12);
    ctx.lineTo(80, -43);
    ctx.stroke();
    ctx.restore();
  }

  // --- ENEMIES SPRITES ---

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    ctx.save();
    ctx.translate(Math.round(enemy.x), Math.round(enemy.y));
    ctx.scale(enemy.facing, 1);

    // Hit flash
    if (enemy.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
    }

    // Telegraph exclamation
    if (enemy.telegraphTimer > 0) {
      this.renderEnemyTelegraph(ctx, enemy);
    }

    // Pick sprite frame based on state safely
    let sprite: PixelSprite | { canvas: HTMLCanvasElement; originX: number; originY: number } | null | undefined;
    const isAttacking = enemy.state === 'attack';
    const isBlocking = enemy.isBlocking;
    const isHurt = enemy.state === 'hurt' || enemy.state === 'staggered';

    if (enemy.type === 'basic_monster') {
      const ghoulFrame = ashGhoulAtlas.getFrame(
        enemy.state,
        enemy.stateTimer,
        this.globalTime,
        enemy.vx,
        enemy.animDistanceTraveled || 0
      );
      if (ghoulFrame) {
        sprite = ghoulFrame;
      } else {
        const frames = enemyAtlas.ghoulFrames;
        const f = isAttacking ? 2 : isHurt ? 3 : Math.abs(Math.floor(this.globalTime * 6)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      }
    } else if (enemy.type === 'demon_warrior') {
      const oniFrame = oniWarriorAtlas.getFrame(
        enemy.state,
        enemy.stateTimer,
        this.globalTime,
        enemy.isBlocking,
        enemy.vx,
        enemy.animDistanceTraveled || 0
      );
      if (oniFrame) {
        sprite = oniFrame;
      } else {
        const frames = enemyAtlas.warriorFrames;
        const f = isBlocking ? 3 : isAttacking ? 2 : isHurt ? 3 : Math.abs(Math.floor(this.globalTime * 5)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      }
    } else if (enemy.type === 'heavy_demon') {
      const heavyFrame = heavyDemonAtlas.getFrame(
        enemy.state,
        enemy.stateTimer,
        this.globalTime,
        enemy.vx,
        enemy.animDistanceTraveled || 0
      );
      if (heavyFrame) {
        sprite = heavyFrame;
      } else {
        const frames = enemyAtlas.goliathFrames;
        const f = isAttacking ? 2 : isHurt ? 3 : Math.abs(Math.floor(this.globalTime * 4)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      }
    } else {
      // Agile Demon (Espectro Asesino) or fallback
      const agileFrame = agileDemonAtlas.getFrame(
        enemy.state,
        enemy.stateTimer,
        this.globalTime,
        enemy.vx,
        enemy.vy,
        enemy.isGrounded,
        enemy.animDistanceTraveled || 0
      );
      if (agileFrame) {
        sprite = agileFrame;
      } else {
        const frames = enemyAtlas.wraithFrames;
        const f = isAttacking ? 2 : isHurt ? 3 : Math.abs(Math.floor(this.globalTime * 6)) % Math.max(1, frames.length);
        sprite = frames[f] || frames[0];
      }
    }

    // Safety fallback
    if (!sprite || !sprite.canvas) {
      sprite = enemyAtlas.ghoulFrames?.[0];
    }

    if (sprite && sprite.canvas) {
      ctx.drawImage(
        sprite.canvas,
        Math.round(-sprite.originX),
        Math.round(-sprite.originY)
      );
    }

    // Health bar above enemy
    this.renderEnemyHealthBar(ctx, enemy);

    ctx.restore();
  }

  private renderEnemyTelegraph(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    ctx.save();
    // Un-flip scale so text is never mirrored when enemy faces left (-1)
    ctx.scale(enemy.facing, 1);
    const isUnblockable = enemy.telegraphType === 'unblockable';
    const progress = 1 - enemy.telegraphTimer / enemy.telegraphDuration;

    // Warning exclamation icon
    ctx.fillStyle = isUnblockable ? '#ef4444' : '#f59e0b';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -enemy.height - 20);

    if (isUnblockable) {
      ctx.font = 'bold 10px monospace';
      ctx.fillText('UNBLOCKABLE', 0, -enemy.height - 34);
    }

    // Ground circle pulse
    ctx.strokeStyle = isUnblockable ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.round((enemy.width / 2) * (1 + progress)), 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private renderEnemyHealthBar(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    if (enemy.hp >= enemy.maxHp && enemy.state !== 'hurt') return;

    const barW = Math.max(30, enemy.width);
    const barH = 4;
    const barX = Math.round(-barW / 2);
    const barY = Math.round(-enemy.height - 12);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX, barY, barW, barH);

    const fillRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = enemy.type === 'heavy_demon' ? '#f97316' : '#ef4444';
    ctx.fillRect(barX, barY, Math.round(barW * fillRatio), barH);
  }

  // --- GIANT FINAL BOSS: MALAKOR PIXEL ART ---

  private renderBoss(ctx: CanvasRenderingContext2D, boss: BossData): void {
    const isPhase3 = boss.phase === 3 || boss.phase === 'scripted_defeat';

    // Boss breathing & walking stride offset
    const speed = Math.abs(boss.vx || 0);
    const strideBob = speed > 15 && boss.isGrounded !== false ? Math.sin(this.globalTime * 10) * 4 : 0;
    const breath = Math.sin(this.globalTime * 3) * 3 + strideBob;

    // 1. Render Boss Body in Local (Facing-Aware) Coordinates
    ctx.save();
    ctx.translate(Math.round(boss.x), Math.round(boss.y));
    // Native boss procedural art faces left (-1); flip horizontally when facing right (+1)
    if (boss.facing === 1) {
      ctx.scale(-1, 1);
    }

    // Underfoot anti-camping charge warning ring when player stays underneath him
    if ((boss.underfootTimer || 0) > 1.0 && boss.phase !== 'scripted_defeat') {
      const chargeRatio = Math.min(1, (boss.underfootTimer || 0) / 5.0);
      ctx.save();
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.35 + chargeRatio * 0.6})`;
      ctx.lineWidth = 2 + Math.round(chargeRatio * 3);
      ctx.beginPath();
      ctx.ellipse(0, -4, Math.round(145 * chargeRatio), 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Colossal Torso & Abyssal Core
    const torso = bossAtlas.torsoSprite;
    if (torso && torso.canvas) {
      ctx.drawImage(
        torso.canvas,
        Math.round(-torso.originX),
        Math.round(-torso.originY + breath)
      );
    }

    // Head & Ram Horns
    const head = bossAtlas.headSprite;
    if (head && head.canvas) {
      ctx.drawImage(
        head.canvas,
        Math.round(-head.originX),
        Math.round(-head.originY - 110 + breath)
      );
    }

    // Blazing eye trails (embers dripping)
    for (let e = 0; e < 3; e++) {
      const ey = -210 + breath + ((this.globalTime * 35 + e * 18) % 40);
      ctx.fillStyle = isPhase3 ? '#f43f5e' : '#dc2626';
      ctx.fillRect(Math.round(-18 + (e % 2) * 32), Math.round(ey), 3, 3);
    }

    // Attack Visuals (Slam fist / Greatsword / Leap Crush)
    if (boss.currentAttack === 'slam' || boss.currentAttack === 'leap_crush') {
      // Massive fist smash
      ctx.fillStyle = PALETTE.bossObsidianDark;
      ctx.fillRect(-140, -150 + breath, 55, 150);
      ctx.fillStyle = PALETTE.bossRuneDark;
      ctx.fillRect(-160, -20, 95, 28);
    } else if (boss.currentAttack === 'cleave' || boss.phase === 'scripted_defeat') {
      // Greatsword of Cataclysm
      ctx.strokeStyle = PALETTE.bossRuneDark;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(50, -170);
      ctx.lineTo(-200, -20);
      ctx.stroke();

      ctx.strokeStyle = PALETTE.bossRuneLight;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(45, -170);
      ctx.lineTo(-195, -20);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, -170);
      ctx.lineTo(-190, -20);
      ctx.stroke();
    } else {
      // Resting / Striding arms
      ctx.fillStyle = PALETTE.bossObsidianDark;
      ctx.fillRect(-125, -190 + breath, 45, 150);
      ctx.fillRect(80, -190 - breath * 0.5, 45, 150);
    }
    ctx.restore();

    // 2. Render Ground Shockwaves & Directed Projectiles in World Space
    ctx.save();
    for (const sw of boss.shockwaves) {
      const sx = Math.round(sw.x);
      const sy = Math.round(sw.y);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(sx, sy, sw.width, sw.height);
      ctx.fillStyle = '#ffffff';
      const leadX = sw.vx >= 0 ? sx + Math.round(sw.width * 0.65) : sx;
      ctx.fillRect(leadX, sy, Math.round(sw.width * 0.35), sw.height);
    }

    for (const p of boss.projectiles) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      if (p.type === 'meteor') {
        const m = bossAtlas.bloodMeteorSprite;
        if (m && m.canvas) {
          ctx.drawImage(m.canvas, px - m.originX, py - m.originY);
        }
      } else if (p.type === 'orb') {
        // Directed Abyssal Soul-Fire Orb
        ctx.fillStyle = 'rgba(225, 29, 72, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, p.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(4, Math.round(p.radius * 0.45)), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'beam') {
        // Aimed Abyssal Beam in direction of protagonist
        const bWidth = p.beamWidth || 780;
        const bDir = p.dir || -1;
        const startX = bDir === 1 ? px : px - bWidth;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.95)';
        ctx.fillRect(startX, py - 18, bWidth, 36);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX, py - 6, bWidth, 12);
      }
    }
    ctx.restore();
  }

  // --- PARTICLES ---

  private renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      const px = Math.round(p.x);
      const py = Math.round(p.y);

      if (p.shape === 'spark') {
        ctx.fillRect(px, py, p.size, p.size * 2);
      } else if (p.shape === 'ember' || p.shape === 'smoke') {
        ctx.fillRect(px, py, p.size, p.size);
      } else {
        ctx.fillRect(px, py, p.size, p.size);
      }
      ctx.restore();
    }
  }

  // --- FLOATING COMBAT DAMAGE & COMBO NUMBERS ---

  private renderDamageNumbers(ctx: CanvasRenderingContext2D, numbers: DamageNumber[]): void {
    ctx.save();
    for (const dn of numbers) {
      const progress = dn.life / dn.maxLife;
      // Crisp fade-out in final 30% of lifetime
      const alpha = progress > 0.7 ? Math.max(0, (1 - progress) / 0.3) : 1;
      if (alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Pop bounce effect in initial 0.14 seconds of appearance
      const popT = Math.min(1, dn.life / 0.14);
      const popBounce = 1 + 0.35 * Math.sin(popT * Math.PI);

      const baseScale = dn.scale || (dn.isCrit ? 1.3 : 1.0);
      const totalScale = baseScale * popBounce;
      const fontSize = Math.max(11, Math.round((dn.isCrit ? 15 : 13) * totalScale));

      ctx.font = `900 ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const px = Math.round(dn.x);
      const py = Math.round(dn.y);

      // Deep dark stroke for contrast against dark fantasy backgrounds
      ctx.strokeStyle = '#050508';
      ctx.lineWidth = totalScale >= 1.5 ? 4 : 2.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(dn.text, px, py);

      // Tier glow shadow
      ctx.shadowColor = dn.shadowColor || 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = totalScale >= 1.5 ? 10 : 4;
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, px, py);

      // Extra incandescent core pass for high tiers (Soul Violet & Blood Ember)
      if (dn.tier && dn.tier >= 3) {
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillText(dn.text, px, py);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // --- FOREGROUND ATMOSPHERIC OVERLAY ---

  private renderAtmosphericOverlay(ctx: CanvasRenderingContext2D, isHeavyHitstop: boolean): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    if (isHeavyHitstop) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(0, 0, w, h);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.85);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
}
