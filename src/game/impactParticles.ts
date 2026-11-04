/**
 * Pure Blood & Soul Impact Particle Generator for Yosuke: The Last Battle
 * Computes the exact hitbox intersection point of combat collisions and spawns
 * physically simulated 'blood' droplets and ethereal 'soul' wisps on hits and parries.
 */

import { Particle, Rect } from './types';

export interface HitImpactOptions {
  impactX: number;
  impactY: number;
  attackDirection: 1 | -1;
  isCrit: boolean;
  isCounter: boolean;
  comboTier: 1 | 2 | 3 | 4;
}

export interface ParryImpactOptions {
  impactX: number;
  impactY: number;
  facing: 1 | -1;
}

const BLOOD_PALETTE = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
const SOUL_CYAN_PALETTE = ['#e0f2fe', '#67e8f9', '#38bdf8', '#0284c7'];
const SOUL_VIOLET_PALETTE = ['#f3e8ff', '#d8b4fe', '#c084fc', '#9333ea'];
const PARRY_SOUL_PALETTE = ['#ffffff', '#67e8f9', '#38bdf8', '#fbbf24'];

/**
 * Computes the exact center point of intersection between an attack hitbox
 * and a target collision rectangle.
 */
export function computeImpactPoint(rectA: Rect, rectB: Rect): { x: number; y: number } {
  const overlapLeft = Math.max(rectA.x, rectB.x);
  const overlapRight = Math.min(rectA.x + rectA.w, rectB.x + rectB.w);
  const overlapTop = Math.max(rectA.y, rectB.y);
  const overlapBottom = Math.min(rectA.y + rectA.h, rectB.y + rectB.h);

  if (overlapRight >= overlapLeft && overlapBottom >= overlapTop) {
    return {
      x: Math.round((overlapLeft + overlapRight) / 2),
      y: Math.round((overlapTop + overlapBottom) / 2),
    };
  }

  // Fallback to midpoint between centers if rects are edge-touching
  const centerAX = rectA.x + rectA.w / 2;
  const centerAY = rectA.y + rectA.h / 2;
  const centerBX = rectB.x + rectB.w / 2;
  const centerBY = rectB.y + rectB.h / 2;
  return {
    x: Math.round((centerAX + centerBX) / 2),
    y: Math.round((centerAY + centerBY) / 2),
  };
}

/**
 * Spawns arterial 'blood' droplets and rising 'soul' essence wisps at the exact
 * point of impact when Yosuke lands a strike on an enemy or boss.
 */
export function createHitImpactParticles(
  opts: HitImpactOptions,
  rng: () => number = Math.random
): Particle[] {
  const { impactX, impactY, attackDirection, isCrit, isCounter, comboTier } = opts;
  const particles: Particle[] = [];

  const bloodCount = isCounter ? 22 : isCrit ? 18 : 14;
  const soulCount = isCounter ? 16 : isCrit ? 12 : 6 + comboTier * 2;

  // 1. Directional Blood Spray (arcs outward and falls with gravity)
  for (let i = 0; i < bloodCount; i++) {
    // Bias spray in the direction of the slash while keeping a visceral scatter
    const baseAngle = attackDirection === 1 ? -0.35 : Math.PI + 0.35;
    const spread = (rng() - 0.5) * 1.9;
    const angle = baseAngle + spread;
    const speed = (110 + rng() * 240) * (isCrit || isCounter ? 1.25 : 1.0);

    particles.push({
      x: impactX + (rng() - 0.5) * 8,
      y: impactY + (rng() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: 0,
      maxLife: 0.32 + rng() * 0.28,
      size: 2.5 + rng() * 3.5,
      color: BLOOD_PALETTE[Math.floor(rng() * BLOOD_PALETTE.length)],
      alpha: 1,
      shape: 'blood',
      gravity: 680,
      drag: 1.2,
    });
  }

  // 2. Harvested Soul Essence Wisps (burst outward then float upward as Spirit is absorbed)
  const soulPalette = comboTier >= 3 || isCounter ? SOUL_VIOLET_PALETTE : SOUL_CYAN_PALETTE;
  for (let i = 0; i < soulCount; i++) {
    const angle = rng() * Math.PI * 2;
    const speed = 55 + rng() * 145;

    particles.push({
      x: impactX + (rng() - 0.5) * 10,
      y: impactY + (rng() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 45,
      life: 0,
      maxLife: 0.42 + rng() * 0.32,
      size: 3 + rng() * 3,
      color: soulPalette[Math.floor(rng() * soulPalette.length)],
      alpha: 1,
      shape: 'soul',
      gravity: -240, // Rises upward like ethereal soul fire
      drag: 2.6,
    });
  }

  return particles;
}

/**
 * Spawns a radiant burst of 'soul' wisps and deflection sparks at the exact
 * weapon clash point when Yosuke executes a Perfect Parry.
 */
export function createParryImpactParticles(
  opts: ParryImpactOptions,
  rng: () => number = Math.random
): Particle[] {
  const { impactX, impactY, facing } = opts;
  const particles: Particle[] = [];

  const soulRingCount = 18;
  const soulWispCount = 14;

  // 1. Radial Soul Shockwave Ring
  for (let i = 0; i < soulRingCount; i++) {
    const angle = (i / soulRingCount) * Math.PI * 2;
    const speed = 190 + (i % 2) * 45;
    particles.push({
      x: impactX,
      y: impactY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 0.38,
      size: 3.5,
      color: PARRY_SOUL_PALETTE[i % PARRY_SOUL_PALETTE.length],
      alpha: 1,
      shape: 'soul',
      gravity: -80,
      drag: 3.0,
    });
  }

  // 2. Rising Soul Flame Wisps at the Clash Point
  for (let i = 0; i < soulWispCount; i++) {
    const angle = (facing === 1 ? 0 : Math.PI) + (rng() - 0.5) * 2.4;
    const speed = 80 + rng() * 180;
    particles.push({
      x: impactX + (rng() - 0.5) * 6,
      y: impactY + (rng() - 0.5) * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 70,
      life: 0,
      maxLife: 0.45 + rng() * 0.25,
      size: 3 + rng() * 3.5,
      color: PARRY_SOUL_PALETTE[Math.floor(rng() * PARRY_SOUL_PALETTE.length)],
      alpha: 1,
      shape: 'soul',
      gravity: -260,
      drag: 2.2,
    });
  }

  return particles;
}
