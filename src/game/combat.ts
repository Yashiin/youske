/**
 * Pure combat rules, timing, and collision calculations for Yosuke: The Last Battle.
 * Independent of DOM and React rendering for fast unit testing.
 */

import { Hitbox, Rect, PlayerAction, PlayerStats, Difficulty } from './types';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  subtitle: string;
  hpMult: number;
  damageMult: number;
  speedMult: number;
  windupMult: number;
  cooldownMult: number;
  aggroMult: number;
  badgeColor: string;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  normal: {
    id: 'normal',
    label: 'GUERRERO (Normal)',
    subtitle: 'Equilibrio clásico de reflejos, bloqueo y contraataque.',
    hpMult: 1.0,
    damageMult: 1.0,
    speedMult: 1.0,
    windupMult: 1.0,
    cooldownMult: 1.0,
    aggroMult: 1.0,
    badgeColor: '#38bdf8',
  },
  hard: {
    id: 'hard',
    label: 'SANGRIENTO (Difícil)',
    subtitle: 'Enemigos +30% vida, +25% daño, guardia reactiva y ataques más veloces.',
    hpMult: 1.3,
    damageMult: 1.25,
    speedMult: 1.15,
    windupMult: 0.82,
    cooldownMult: 0.8,
    aggroMult: 1.15,
    badgeColor: '#f59e0b',
  },
  nightmare: {
    id: 'nightmare',
    label: 'ABISMO (Pesadilla)',
    subtitle: 'Enemigos +60% vida, +50% daño, IA implacable, élites extra y jefe frenético.',
    hpMult: 1.6,
    damageMult: 1.5,
    speedMult: 1.28,
    windupMult: 0.68,
    cooldownMult: 0.65,
    aggroMult: 1.3,
    badgeColor: '#ef4444',
  },
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;
}

// Constants for combat tuning
export const PARRY_WINDOW_SECONDS = 0.22; // Challenging but fair parry window
export const COMBO_RESET_SECONDS = 1.2;
export const COUNTER_DAMAGE_MULTIPLIER = 2.5;
export const BLOCK_DAMAGE_REDUCTION = 0.75; // 75% damage blocked on standard block
export const STAMINA_DASH_COST = 20;
export const STAMINA_HEAVY_COST = 25;
export const STAMINA_RECOVERY_RATE = 35; // per second

/**
 * Check if two AABB rectangles intersect
 */
export function rectsOverlap(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

/**
 * Determine next attack action in combo chain
 */
export function getNextComboAction(
  currentAction: PlayerAction,
  isAirborne: boolean
): PlayerAction {
  if (isAirborne) {
    return 'air_attack';
  }
  switch (currentAction) {
    case 'light_attack_1':
      return 'light_attack_2';
    case 'light_attack_2':
      return 'light_attack_3';
    case 'light_attack_3':
      return 'light_attack_1';
    default:
      return 'light_attack_1';
  }
}

/**
 * Compute damage and reaction when a player hits an enemy
 */
export interface PlayerHitResult {
  damage: number;
  isCrit: boolean;
  enemyStaggerDuration: number;
  spiritGained: number;
  screenShake: number;
  hitstopDuration: number;
  knockback: { x: number; y: number };
}

export function calculatePlayerHit(
  action: PlayerAction,
  isCounter: boolean,
  facing: 1 | -1
): PlayerHitResult {
  if (isCounter) {
    return {
      damage: 120,
      isCrit: true,
      enemyStaggerDuration: 1.5,
      spiritGained: 40,
      screenShake: 12,
      hitstopDuration: 0.1,
      knockback: { x: facing * 350, y: -180 },
    };
  }

  switch (action) {
    case 'light_attack_1':
      return {
        damage: 25,
        isCrit: false,
        enemyStaggerDuration: 0.35,
        spiritGained: 10,
        screenShake: 3,
        hitstopDuration: 0.04,
        knockback: { x: facing * 120, y: -40 },
      };
    case 'light_attack_2':
      return {
        damage: 32,
        isCrit: false,
        enemyStaggerDuration: 0.4,
        spiritGained: 12,
        screenShake: 4,
        hitstopDuration: 0.045,
        knockback: { x: facing * 160, y: -60 },
      };
    case 'light_attack_3':
      return {
        damage: 48,
        isCrit: true,
        enemyStaggerDuration: 0.7,
        spiritGained: 20,
        screenShake: 7,
        hitstopDuration: 0.06,
        knockback: { x: facing * 280, y: -120 },
      };
    case 'heavy_attack':
      return {
        damage: 75,
        isCrit: true,
        enemyStaggerDuration: 1.1,
        spiritGained: 25,
        screenShake: 10,
        hitstopDuration: 0.08,
        knockback: { x: facing * 320, y: -160 },
      };
    case 'air_attack':
      return {
        damage: 28,
        isCrit: false,
        enemyStaggerDuration: 0.35,
        spiritGained: 12,
        screenShake: 4,
        hitstopDuration: 0.04,
        knockback: { x: facing * 140, y: -50 },
      };
    case 'air_heavy':
      return {
        damage: 80,
        isCrit: true,
        enemyStaggerDuration: 1.2,
        spiritGained: 25,
        screenShake: 11,
        hitstopDuration: 0.08,
        knockback: { x: facing * 150, y: 350 },
      };
    default:
      return {
        damage: 20,
        isCrit: false,
        enemyStaggerDuration: 0.3,
        spiritGained: 8,
        screenShake: 2,
        hitstopDuration: 0.03,
        knockback: { x: facing * 100, y: -30 },
      };
  }
}

/**
 * Handle incoming enemy attack against player:
 * Returns whether damage was parried, blocked, or taken directly.
 */
export interface DefenseResolution {
  result: 'parried' | 'blocked' | 'hit' | 'dodged_invulnerable';
  damageTaken: number;
  playerStagger: number;
  counterWindowGranted: boolean;
  hitstop: number;
  screenShake: number;
}

export function resolveIncomingAttack(
  incomingHitbox: Hitbox,
  playerState: {
    action: PlayerAction;
    blockDuration: number; // time since block button was pressed
    isInvulnerable: boolean; // during dash i-frames
  }
): DefenseResolution {
  // If player is in dash i-frames:
  if (playerState.isInvulnerable) {
    return {
      result: 'dodged_invulnerable',
      damageTaken: 0,
      playerStagger: 0,
      counterWindowGranted: false,
      hitstop: 0,
      screenShake: 0,
    };
  }

  const isGuarding = playerState.action === 'block' || playerState.action === 'parry';

  // Unblockable attack check
  if (incomingHitbox.unblockable) {
    // Unblockable cannot be blocked or parried (e.g. giant shockwave or demon cataclysm)
    return {
      result: 'hit',
      damageTaken: incomingHitbox.damage,
      playerStagger: incomingHitbox.stagger,
      counterWindowGranted: false,
      hitstop: 0.08,
      screenShake: 12,
    };
  }

  if (isGuarding) {
    // Check parry timing: if block was engaged recently within the parry window
    if (playerState.blockDuration <= PARRY_WINDOW_SECONDS && incomingHitbox.isParryable !== false) {
      return {
        result: 'parried',
        damageTaken: 0,
        playerStagger: 0,
        counterWindowGranted: true,
        hitstop: 0.12, // Distinctive time-freeze for parry!
        screenShake: 8,
      };
    }

    // Standard block
    const reducedDamage = Math.round(incomingHitbox.damage * (1 - BLOCK_DAMAGE_REDUCTION));
    return {
      result: 'blocked',
      damageTaken: Math.max(1, reducedDamage),
      playerStagger: 0.2,
      counterWindowGranted: false,
      hitstop: 0.04,
      screenShake: 4,
    };
  }

  // Direct hit
  return {
    result: 'hit',
    damageTaken: incomingHitbox.damage,
    playerStagger: incomingHitbox.stagger,
    counterWindowGranted: false,
    hitstop: 0.06,
    screenShake: 9,
  };
}

export interface ComboVisualTier {
  tier: 1 | 2 | 3 | 4;
  color: string;
  scale: number;
  vy: number;
  label: string;
  shadowColor: string;
}

/**
 * Get visual tier, scaling factor, and Blood & Soul color for floating combat text
 */
export function getComboVisualTier(comboCount: number): ComboVisualTier {
  if (comboCount >= 15) {
    return {
      tier: 4,
      color: '#ef4444', // Blood Ember / Crimson
      scale: 2.0,
      vy: -85,
      label: 'BLOOD CATACLYSM',
      shadowColor: 'rgba(239, 68, 68, 0.85)',
    };
  }
  if (comboCount >= 10) {
    return {
      tier: 3,
      color: '#c084fc', // Soul Violet / Amethyst
      scale: 1.6,
      vy: -70,
      label: 'SOUL REAVER',
      shadowColor: 'rgba(192, 132, 252, 0.75)',
    };
  }
  if (comboCount >= 5) {
    return {
      tier: 2,
      color: '#38bdf8', // Spectral Blue
      scale: 1.3,
      vy: -55,
      label: 'SPECTRAL SURGE',
      shadowColor: 'rgba(56, 189, 248, 0.65)',
    };
  }
  return {
    tier: 1,
    color: '#e2e8f0', // Pale Ash
    scale: 1.0,
    vy: -40,
    label: 'PALE ASH',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
  };
}

/**
 * Calculate combo multiplier and rating
 */
export function getComboRating(comboCount: number): {
  rating: string;
  multiplier: number;
  color: string;
  tier: 1 | 2 | 3 | 4;
} {
  const tierData = getComboVisualTier(comboCount);
  if (comboCount >= 15) {
    return { rating: 'BLOOD CATACLYSM', multiplier: 2.0, color: tierData.color, tier: 4 };
  }
  if (comboCount >= 10) {
    return { rating: 'SOUL REAVER', multiplier: 1.6, color: tierData.color, tier: 3 };
  }
  if (comboCount >= 5) {
    return { rating: 'SPECTRAL SURGE', multiplier: 1.3, color: tierData.color, tier: 2 };
  }
  if (comboCount >= 2) {
    return { rating: 'STRIKE CHAIN', multiplier: 1.15, color: tierData.color, tier: 1 };
  }
  return { rating: '', multiplier: 1.0, color: '#e2e8f0', tier: 1 };
}

/**
 * Regenerate player stamina
 */
export function updatePlayerStamina(stats: PlayerStats, dt: number, isDashing: boolean): void {
  if (!isDashing && stats.stamina < stats.maxStamina) {
    stats.stamina = Math.min(stats.maxStamina, stats.stamina + STAMINA_RECOVERY_RATE * dt);
  }
  if (stats.comboTimer > 0) {
    stats.comboTimer -= dt;
    if (stats.comboTimer <= 0) {
      stats.comboCount = 0;
    }
  }
}
