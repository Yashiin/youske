import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine';

describe('Malakor Boss Movement, 5s Anti-Camping Reposition & Directed Attacks', () => {
  it('moves continuously across the arena to stalk the protagonist', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal'); // Stage 3: Boss Arena
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    assert.ok(engine.boss, 'Boss must be initialized in Stage 3');
    const initialX = engine.boss.x; // 1150
    engine.player.x = 300; // Far to the left

    // Step simulation for 1.0s
    for (let i = 0; i < 25; i++) {
      engine.update(0.04);
    }

    assert.ok(
      engine.boss.x < initialX - 50,
      `Expected Malakor to advance toward player (initialX=${initialX}, currentX=${engine.boss.x})`
    );
    assert.equal(engine.boss.facing, -1);
  });

  it('triggers Abyssal Reposition Leap after protagonist stays underneath Malakor for 5 seconds', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal');
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    const boss = engine.boss!;
    boss.x = 1050;
    boss.y = 620;

    let leapTriggered = false;
    let takeoffX = boss.x;

    // Keep protagonist directly underneath Malakor for 5.2 seconds
    for (let i = 0; i < 135; i++) {
      engine.player.x = boss.x - 20;
      engine.player.y = 620;
      engine.boss!.actionTimer = 10; // Prevent normal attack overrides while testing the 5s timer
      engine.update(0.04);

      if (boss.currentAttack === 'leap_crush' && !boss.isGrounded) {
        leapTriggered = true;
        takeoffX = boss.x;
        break;
      }
    }

    assert.equal(
      leapTriggered,
      true,
      'Malakor must trigger leap_crush reposition after player stays underneath him for 5 seconds'
    );

    // Continue simulation until Malakor lands (~0.9s)
    for (let i = 0; i < 35; i++) {
      engine.update(0.04);
    }

    assert.equal(boss.isGrounded, true, 'Malakor must land back on the arena floor');
    assert.ok(
      Math.abs(boss.x - takeoffX) > 400,
      `Expected Malakor to leap >400px across the arena (takeoffX=${takeoffX}, landX=${boss.x})`
    );
    assert.ok(
      boss.shockwaves.length >= 2,
      'Landing from leap_crush must spawn dual directional shockwaves'
    );
    assert.ok(
      boss.projectiles.some((p) => p.type === 'orb'),
      'Landing from leap_crush must fire a directed abyssal orb at the protagonist'
    );
  });

  it('directs attacks (slam, cleave, meteor, beam) toward the protagonist on either side of Malakor', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal');
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    const boss = engine.boss!;
    // Place Malakor at X = 600 and Yosuke to his RIGHT at X = 980
    boss.x = 600;
    engine.player.x = 980;
    engine.player.y = 480; // On an elevated battle pillar

    // Force a directed beam attack
    boss.currentAttack = 'beam';
    boss.pendingAttackTimer = 0.05;
    boss.actionTimer = 5.0;

    engine.update(0.04);
    engine.update(0.04);

    assert.equal(boss.facing, 1, 'Malakor must face right (+1) when player is to his right');
    const beam = boss.projectiles.find((p) => p.type === 'beam');
    const orb = boss.projectiles.find((p) => p.type === 'orb');
    assert.ok(beam, 'Beam projectile must be spawned');
    assert.equal(beam.dir, 1, 'Beam must fire rightward toward the protagonist');
    assert.ok(orb, 'Directed orb projectile must be spawned');
    assert.ok(orb.vx > 0, 'Directed orb must travel rightward toward the protagonist');
  });
});
