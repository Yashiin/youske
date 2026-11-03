import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rectsOverlap,
  getNextComboAction,
  calculatePlayerHit,
  resolveIncomingAttack,
  getComboRating,
  getComboVisualTier,
  PARRY_WINDOW_SECONDS,
} from './combat';
import { Hitbox } from './types';

test('rectsOverlap detects collisions accurately', () => {
  const r1 = { x: 0, y: 0, w: 50, h: 50 };
  const r2 = { x: 40, y: 40, w: 50, h: 50 };
  const r3 = { x: 100, y: 100, w: 20, h: 20 };

  assert.equal(rectsOverlap(r1, r2), true, 'Overlapping rects should intersect');
  assert.equal(rectsOverlap(r1, r3), false, 'Separated rects should not intersect');
});

test('combo chain cycles 1 -> 2 -> 3 -> 1 on ground', () => {
  assert.equal(getNextComboAction('idle', false), 'light_attack_1');
  assert.equal(getNextComboAction('light_attack_1', false), 'light_attack_2');
  assert.equal(getNextComboAction('light_attack_2', false), 'light_attack_3');
  assert.equal(getNextComboAction('light_attack_3', false), 'light_attack_1');
  assert.equal(getNextComboAction('run', true), 'air_attack', 'Airborne attack should trigger air_attack');
});

test('counter attack calculates massive critical damage', () => {
  const normalHit = calculatePlayerHit('light_attack_1', false, 1);
  const counterHit = calculatePlayerHit('counter', true, 1);

  assert.equal(counterHit.isCrit, true);
  assert.ok(counterHit.damage > normalHit.damage * 3, 'Counter damage should be substantially higher');
  assert.ok(counterHit.enemyStaggerDuration > 1.0, 'Counter should heavily stagger enemy');
});

test('resolveIncomingAttack rewards precise parry within parry window', () => {
  const enemyAttack: Hitbox = {
    id: 'atk-1',
    source: 'enemy',
    rect: { x: 10, y: 10, w: 40, h: 40 },
    damage: 40,
    stagger: 0.5,
    knockback: { x: -100, y: 0 },
    isParryable: true,
  };

  // Precise block within parry window
  const parryResult = resolveIncomingAttack(enemyAttack, {
    action: 'block',
    blockDuration: PARRY_WINDOW_SECONDS - 0.05,
    isInvulnerable: false,
  });

  assert.equal(parryResult.result, 'parried');
  assert.equal(parryResult.damageTaken, 0);
  assert.equal(parryResult.counterWindowGranted, true);

  // Late block outside parry window
  const lateBlockResult = resolveIncomingAttack(enemyAttack, {
    action: 'block',
    blockDuration: PARRY_WINDOW_SECONDS + 0.3,
    isInvulnerable: false,
  });

  assert.equal(lateBlockResult.result, 'blocked');
  assert.ok(lateBlockResult.damageTaken > 0 && lateBlockResult.damageTaken < enemyAttack.damage);
  assert.equal(lateBlockResult.counterWindowGranted, false);
});

test('resolveIncomingAttack treats unblockable attacks properly', () => {
  const unblockableAttack: Hitbox = {
    id: 'boss-cleave',
    source: 'enemy',
    rect: { x: 0, y: 0, w: 100, h: 100 },
    damage: 60,
    stagger: 1.0,
    knockback: { x: -200, y: -50 },
    unblockable: true,
  };

  const attemptBlockResult = resolveIncomingAttack(unblockableAttack, {
    action: 'block',
    blockDuration: 0.05,
    isInvulnerable: false,
  });

  assert.equal(attemptBlockResult.result, 'hit', 'Unblockable attack penetrates guard');
  assert.equal(attemptBlockResult.damageTaken, 60);

  // But dash invulnerability dodges it safely!
  const dodgeResult = resolveIncomingAttack(unblockableAttack, {
    action: 'dash',
    blockDuration: 0,
    isInvulnerable: true,
  });
  assert.equal(dodgeResult.result, 'dodged_invulnerable');
  assert.equal(dodgeResult.damageTaken, 0);
});

test('getComboVisualTier maps combo counts to Blood & Soul visual tiers', () => {
  // Tier 1 (1-4 hits)
  const tier1 = getComboVisualTier(3);
  assert.equal(tier1.tier, 1);
  assert.equal(tier1.color, '#e2e8f0');
  assert.equal(tier1.scale, 1.0);

  // Tier 2 (5-9 hits)
  const tier2 = getComboVisualTier(7);
  assert.equal(tier2.tier, 2);
  assert.equal(tier2.color, '#38bdf8');
  assert.equal(tier2.scale, 1.3);
  assert.equal(tier2.label, 'SPECTRAL SURGE');

  // Tier 3 (10-14 hits)
  const tier3 = getComboVisualTier(12);
  assert.equal(tier3.tier, 3);
  assert.equal(tier3.color, '#c084fc');
  assert.equal(tier3.scale, 1.6);
  assert.equal(tier3.label, 'SOUL REAVER');

  // Tier 4 (15+ hits)
  const tier4 = getComboVisualTier(18);
  assert.equal(tier4.tier, 4);
  assert.equal(tier4.color, '#ef4444');
  assert.equal(tier4.scale, 2.0);
  assert.equal(tier4.label, 'BLOOD CATACLYSM');
});

test('combo rating increases with consecutive hits and aligns with visual tiers', () => {
  assert.equal(getComboRating(1).rating, '');
  assert.equal(getComboRating(3).rating, 'STRIKE CHAIN');
  assert.equal(getComboRating(6).rating, 'SPECTRAL SURGE');
  assert.equal(getComboRating(11).rating, 'SOUL REAVER');
  assert.equal(getComboRating(20).rating, 'BLOOD CATACLYSM');
});
