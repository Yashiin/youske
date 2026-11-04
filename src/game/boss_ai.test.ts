import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine';

describe('Malakor 5s Slow Movement / 5s Stationary Cycle & Directed Attacks', () => {
  it('moves slowly for 5 seconds, stays still for 5 seconds, and then moves slowly again', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal'); // Stage 3: Boss Arena
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    const boss = engine.boss!;
    const initialX = boss.x; // 1150
    engine.player.x = 300;
    engine.player.y = 620;

    // 1. First 5 seconds (0.0s -> 4.9s): Malakor moves slowly toward Yosuke at 55 px/s
    for (let i = 0; i < 120; i++) {
      boss.actionTimer = 10;
      engine.update(0.04); // 120 * 0.04 = 4.8s
    }
    assert.ok((boss.vx || 0) < 0 && Math.abs(boss.vx || 0) === 55, `Expected slow movement speed 55 px/s, got ${boss.vx}`);
    assert.ok(boss.x < initialX - 240, `Expected Malakor to walk slowly toward player during first 5s (x=${boss.x})`);

    // Step across the 5.0s threshold into the stationary window [5.0s .. 10.0s)
    for (let i = 0; i < 10; i++) {
      boss.actionTimer = 10;
      engine.update(0.04); // now at 5.2s
    }
    assert.equal(boss.vx, 0, 'Malakor must stop and stay still (vx = 0) at 5 seconds');
    const pausedX = boss.x;

    // 2. Next ~4.5 seconds (5.2s -> 9.8s): Malakor remains completely stationary
    for (let i = 0; i < 115; i++) {
      boss.actionTimer = 10;
      engine.update(0.04); // 5.2 + 4.6 = 9.8s
    }
    assert.equal(boss.vx, 0, 'Malakor must remain still throughout the 5s pause window');
    assert.equal(boss.x, pausedX, 'Malakor X position must not change while standing still for 5s');

    // 3. After 10.0s (5s moving + 5s still): Malakor resumes slow movement again!
    for (let i = 0; i < 15; i++) {
      boss.actionTimer = 10;
      engine.update(0.04); // now at 10.4s -> wraps to 0.4s of next cycle
    }
    assert.ok(Math.abs(boss.vx || 0) === 55, 'Malakor must resume slow movement after 5 seconds of standing still');
    assert.ok(boss.x < pausedX, 'Malakor must advance again after his 5-second pause');
  });

  it('triggers Abyssal Reposition Leap when protagonist stays underneath Malakor for 10 seconds', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal');
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    const boss = engine.boss!;
    boss.x = 1150;
    boss.y = 620;

    let leapTriggered = false;
    let elapsedWhenTriggered = 0;

    // Keep protagonist directly underneath Malakor for up to 10.5 seconds
    for (let i = 1; i <= 265; i++) {
      engine.player.x = boss.x - 20;
      engine.player.y = 620;
      boss.actionTimer = 10;
      engine.update(0.04);

      if (boss.currentAttack === 'leap_crush' && !boss.isGrounded) {
        leapTriggered = true;
        elapsedWhenTriggered = i * 0.04;
        break;
      }
    }

    assert.equal(
      leapTriggered,
      true,
      'Malakor must trigger leap_crush reposition after player stays underneath him for 10 seconds'
    );
    assert.ok(
      elapsedWhenTriggered >= 9.95 && elapsedWhenTriggered <= 10.2,
      `Expected leap to trigger at ~10.0s, got ${elapsedWhenTriggered}s`
    );

    const takeoffX = boss.x;
    // Continue simulation until Malakor lands (~0.9s)
    for (let i = 0; i < 35; i++) {
      engine.update(0.04);
    }

    assert.equal(boss.isGrounded, true, 'Malakor must land back on the arena floor');
    assert.ok(
      Math.abs(boss.x - takeoffX) > 350,
      `Expected Malakor to leap across the arena (takeoffX=${takeoffX}, landX=${boss.x})`
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

  it('uses linear trajectories (vertical meteors, single slower shockwave, flat orbs) and periodically misses on every 2nd attack cycle', () => {
    const engine = new GameEngine();
    engine.startGame(2, 'normal');
    engine.hasTriggeredBossDialogue = true;
    engine.skipDialogue();

    const boss = engine.boss!;
    boss.phase = 2;
    boss.x = 1150;
    engine.player.x = 750;
    engine.player.y = 620;

    // Cycle 1: On-target snapshot at windup start
    boss.actionTimer = 0.01;
    engine.update(0.02);
    assert.equal(boss.attackCycleCount, 1);
    assert.equal(boss.lastAttackMissed, false);
    assert.equal(boss.attackTargetX, 750);

    // Clear pending attack and trigger Cycle 2: Periodic Intentional Miss!
    boss.pendingAttackTimer = 0;
    boss.actionTimer = 0.01;
    engine.update(0.02);
    assert.equal(boss.attackCycleCount, 2);
    assert.equal(boss.lastAttackMissed, true, 'Every 2nd boss attack cycle must intentionally miscalculate aim');

    // Verify that on a miss cycle, beam & cleave fire high (y=435) above a grounded player (y=564..620)
    boss.currentAttack = 'beam';
    boss.pendingAttackTimer = 0.02;
    boss.actionTimer = 5.0;
    const hpBefore = engine.stats.hp;
    engine.update(0.04);
    const missedBeam = boss.projectiles.find((p) => p.type === 'beam')!;
    assert.ok(missedBeam);
    assert.equal(missedBeam.y, 435, 'Missed beam must aim high over grounded protagonist');
    assert.equal(engine.stats.hp, hpBefore, 'Grounded protagonist must not take damage from a missed beam cycle');

    // Verify meteors fall in strictly vertical linear columns (vx === 0)
    boss.projectiles = [];
    boss.currentAttack = 'meteor';
    boss.lastAttackMissed = true;
    boss.attackTargetX = engine.player.x;
    boss.pendingAttackTimer = 0.02;
    boss.actionTimer = 5.0;
    engine.update(0.04);
    const meteors = boss.projectiles.filter((p) => p.type === 'meteor');
    assert.equal(meteors.length, 3);
    assert.ok(meteors.every((m) => m.vx === 0 && m.vy === 230), 'All meteors must fall vertically in straight lines (vx === 0)');
    assert.ok(
      meteors.every((m) => Math.abs(m.x - engine.player.x) >= 80),
      'Missed meteor columns must leave a wide safe gap around the protagonist'
    );

    // Verify slam spawns only a single forward linear shockwave at slower speed (230 px/s)
    boss.shockwaves = [];
    boss.currentAttack = 'slam';
    boss.pendingAttackTimer = 0.02;
    boss.actionTimer = 5.0;
    engine.update(0.04);
    assert.equal(boss.shockwaves.length, 1, 'Slam must emit only 1 forward linear shockwave');
    assert.equal(Math.abs(boss.shockwaves[0].vx), 230);
    assert.equal(boss.shockwaves[0].height, 22);
  });
});

