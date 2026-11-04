import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeImpactPoint,
  createHitImpactParticles,
  createParryImpactParticles,
} from './impactParticles';
import { GameEngine } from './engine';

describe('Blood & Soul Impact Particle System', () => {
  it('computes the exact intersection midpoint of overlapping hitboxes', () => {
    const swordHitbox = { x: 110, y: 500, w: 60, h: 40 };
    const enemyBox = { x: 140, y: 510, w: 40, h: 50 };

    // Overlap X: [140, 170] -> center 155
    // Overlap Y: [510, 540] -> center 525
    const pt = computeImpactPoint(swordHitbox, enemyBox);
    assert.deepEqual(pt, { x: 155, y: 525 });
  });

  it('spawns both blood and soul particles around the impact point on a successful hit', () => {
    const particles = createHitImpactParticles({
      impactX: 320,
      impactY: 480,
      attackDirection: 1,
      isCrit: true,
      isCounter: false,
      comboTier: 2,
    });

    const bloodParticles = particles.filter((p) => p.shape === 'blood');
    const soulParticles = particles.filter((p) => p.shape === 'soul');

    assert.ok(bloodParticles.length >= 14, 'Should spawn a burst of blood droplets');
    assert.ok(soulParticles.length >= 8, 'Should spawn rising soul essence wisps');

    for (const p of bloodParticles) {
      assert.ok(Math.abs(p.x - 320) <= 5, 'Blood particle must originate at impactX');
      assert.ok(Math.abs(p.y - 480) <= 5, 'Blood particle must originate at impactY');
      assert.ok((p.gravity ?? 0) > 0, 'Blood droplets must experience downward gravity');
    }

    for (const p of soulParticles) {
      assert.ok(Math.abs(p.x - 320) <= 6, 'Soul particle must originate at impactX');
      assert.ok(Math.abs(p.y - 480) <= 6, 'Soul particle must originate at impactY');
      assert.ok((p.gravity ?? 0) < 0, 'Soul wisps must have upward negative buoyancy');
    }
  });

  it('spawns a burst of soul particles at the clash point on a successful parry', () => {
    const particles = createParryImpactParticles({
      impactX: 250,
      impactY: 510,
      facing: 1,
    });

    const soulParticles = particles.filter((p) => p.shape === 'soul');
    assert.ok(soulParticles.length >= 25, 'Parry should spawn radial and rising soul particles');
    for (const p of soulParticles) {
      assert.ok(Math.abs(p.x - 250) <= 4);
      assert.ok(Math.abs(p.y - 510) <= 4);
    }
  });

  it('integrates with GameEngine when landing a player hit and when executing a parry', () => {
    const engine = new GameEngine();
    engine.startGame(0, 'normal');
    engine.skipDialogue();

    const target = engine.enemies[0];
    assert.ok(target, 'Expected enemy in Level 1');

    // Position player right next to target enemy and execute a light attack
    engine.player.x = target.x - 30;
    engine.player.y = target.y;
    engine.player.facing = 1;
    engine.particles = [];

    engine.handleKeyDown('KeyJ');
    engine.update(0.016);
    engine.handleKeyUp('KeyJ');

    const hitBlood = engine.particles.filter((p) => p.shape === 'blood');
    const hitSoul = engine.particles.filter((p) => p.shape === 'soul');
    assert.ok(hitBlood.length > 0, 'Landing a hit in GameEngine must spawn blood particles');
    assert.ok(hitSoul.length > 0, 'Landing a hit in GameEngine must spawn soul particles');

    // Now test a Perfect Parry against an incoming enemy attack
    engine.particles = [];
    engine.player.action = 'block';
    engine.player.blockDuration = 0.05; // Within 0.22s parry window
    engine.player.isInvulnerable = false;

    target.state = 'attack';
    target.facing = -1;
    target.activeHitbox = {
      id: 'test-enemy-strike',
      source: 'enemy',
      rect: {
        x: engine.player.x - 10,
        y: engine.player.y - 40,
        w: 30,
        h: 30,
      },
      damage: 25,
      stagger: 0.4,
      knockback: { x: -180, y: -100 },
      isParryable: true,
    };

    engine.update(0.016);

    const parrySoul = engine.particles.filter((p) => p.shape === 'soul');
    assert.ok(parrySoul.length > 0, 'Executing a parry in GameEngine must spawn soul particles at the clash point');
  });
});
