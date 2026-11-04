import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine';
import { getComboVisualTier } from './combat';

test('GameEngine initializes with 0 combo and empty damage numbers', () => {
  const engine = new GameEngine();
  assert.equal(engine.stats.comboCount, 0);
  assert.equal(engine.damageNumbers.length, 0);
});

test('addDamageNumber attaches correct combo tier and scales', () => {
  const engine = new GameEngine();
  engine.stats.comboCount = 7; // Tier 2 (Spectral Blue)

  engine.addDamageNumber(100, 200, '35', undefined, false);
  assert.equal(engine.damageNumbers.length, 1);
  const dn = engine.damageNumbers[0];
  assert.equal(dn.text, '35');
  assert.equal(dn.tier, 2);
  assert.equal(dn.color, '#38bdf8');
  assert.equal(dn.scale, 1.3);
  assert.equal(dn.vy, -55);
});

test('addDamageNumber scales up to Tier 4 Blood Cataclysm at 15+ hits', () => {
  const engine = new GameEngine();
  engine.stats.comboCount = 16;

  engine.addDamageNumber(150, 250, '120', undefined, true);
  assert.equal(engine.damageNumbers.length, 1);
  const dn = engine.damageNumbers[0];
  assert.equal(dn.tier, 4);
  assert.equal(dn.scale, 2.0);
  assert.equal(dn.vy, -85);
  assert.ok(dn.shadowColor?.includes('239, 68, 68'));
});

test('ground light attack and 3-hit combo preserve attack animation action state on the ground', () => {
  const engine = new GameEngine();
  engine.startGame(0);
  engine.skipDialogue();

  // Settle player on ground platform at y = 620
  engine.player.y = 620;
  engine.update(0.016);
  assert.equal(engine.player.isGrounded, true);

  // Trigger light attack 1 on ground while standing still
  engine.keysJustPressed.add('KeyJ');
  engine.update(0.016);
  assert.equal(engine.player.action, 'light_attack_1');

  // Continue holding movement while attacking on ground: should stay in light_attack_1
  engine.keysHeld.add('KeyD');
  engine.update(0.05);
  engine.update(0.05);
  assert.equal(engine.player.action, 'light_attack_1');

  // Chain into light_attack_2 after 0.10s
  engine.keysJustPressed.add('KeyJ');
  engine.update(0.016);
  assert.equal(engine.player.action, 'light_attack_2');

  // Advance timer and chain into light_attack_3
  engine.update(0.05);
  engine.update(0.05);
  engine.keysJustPressed.add('KeyJ');
  engine.update(0.016);
  assert.equal(engine.player.action, 'light_attack_3');
});

test('ground heavy attack preserves heavy_attack action state on the ground', () => {
  const engine = new GameEngine();
  engine.startGame(0);
  engine.skipDialogue();

  engine.player.y = 620;
  engine.update(0.016);
  assert.equal(engine.player.isGrounded, true);

  engine.keysJustPressed.add('KeyK');
  engine.update(0.016);
  assert.equal(engine.player.action, 'heavy_attack');

  engine.update(0.05);
  engine.update(0.05);
  assert.equal(engine.player.action, 'heavy_attack');
});

test('dash is strictly bounded in duration and distance and does not run infinitely', () => {
  const engine = new GameEngine();
  engine.startGame(0);
  engine.skipDialogue();

  engine.player.y = 620;
  engine.update(0.016);
  const startX = engine.player.x;

  // Trigger right dash
  engine.keysJustPressed.add('ShiftLeft');
  engine.update(0.05);
  assert.equal(engine.player.action, 'dash');

  // Advance past 0.18s dash duration
  engine.update(0.05);
  engine.update(0.05);
  engine.update(0.05);
  engine.update(0.05);

  assert.notEqual(engine.player.action, 'dash');
  const distanceCovered = engine.player.x - startX;
  assert.ok(distanceCovered > 60 && distanceCovered < 160, `Expected bounded dash distance, got ${distanceCovered}`);
});

test('dash supports any direction: left, right, upward when jumping, and diagonal', () => {
  const engine = new GameEngine();
  engine.startGame(0);
  engine.skipDialogue();

  engine.player.y = 620;
  engine.update(0.016);

  // 1. Dash left
  engine.keysHeld.add('KeyA');
  engine.keysJustPressed.add('ShiftLeft');
  engine.update(0.016);
  assert.equal(engine.player.action, 'dash');
  assert.equal(engine.player.facing, -1);
  assert.ok(engine.player.vx < -500);
  engine.keysHeld.clear();

  // Wait for dash to finish and cooldown to expire
  for (let i = 0; i < 15; i++) engine.update(0.05);
  engine.stats.stamina = 100;

  // 2. Jump and dash upward (holding W or Space in air)
  engine.keysJustPressed.add('Space');
  engine.update(0.016);
  assert.equal(engine.player.isGrounded, false);

  engine.keysHeld.add('KeyW');
  engine.keysJustPressed.add('ShiftLeft');
  engine.update(0.016);
  assert.equal(engine.player.action, 'dash');
  assert.ok(engine.player.vy < -500, `Expected upward dash vy < -500, got ${engine.player.vy}`);
  assert.equal(engine.player.hasAirDashed, true);

  // 3. Cannot air dash a second time before landing
  for (let i = 0; i < 14; i++) engine.update(0.05);
  engine.player.isGrounded = false;
  engine.player.hasAirDashed = true;
  engine.player.dashCooldown = 0;
  engine.stats.stamina = 100;
  engine.keysJustPressed.add('ShiftLeft');
  engine.update(0.016);
  assert.notEqual(engine.player.action, 'dash');
});

test('difficulty modes (normal, hard, nightmare) scale enemy stats, spawn extra elites, and scale boss HP', () => {
  const engine = new GameEngine();

  engine.startGame(0, 'normal');
  const normalCount = engine.enemies.length;
  const normalGhoulHp = engine.enemies[0].maxHp;

  engine.startGame(0, 'hard');
  const hardCount = engine.enemies.length;
  const hardGhoulHp = engine.enemies[0].maxHp;

  engine.startGame(0, 'nightmare');
  const nightmareCount = engine.enemies.length;
  const nightmareGhoulHp = engine.enemies[0].maxHp;

  assert.ok(hardCount > normalCount, 'Hard difficulty should spawn extra elite enemies');
  assert.ok(nightmareCount > hardCount, 'Nightmare difficulty should spawn even more elite enemies');
  assert.ok(hardGhoulHp > normalGhoulHp, 'Hard difficulty should increase enemy maxHp');
  assert.ok(nightmareGhoulHp > hardGhoulHp, 'Nightmare difficulty should further increase enemy maxHp');

  // Boss stage scaling
  engine.startGame(2, 'nightmare');
  assert.equal(engine.boss?.maxHp, 1920);
});

test('tactical enemy AI: agile demon evasive backstep and heavy demon windup hyper-armor poise', () => {
  const engine = new GameEngine();
  engine.startGame(1, 'nightmare');
  engine.skipDialogue();

  const agile = engine.enemies.find((e) => e.type === 'agile_demon')!;
  assert.ok(agile);
  agile.state = 'chase';
  agile.isGrounded = true;
  agile.dodgeCooldown = 0;
  agile.x = engine.player.x + 80;
  agile.y = engine.player.y;

  // Player initiates light attack nearby -> agile demon performs evasive backstep jump
  engine.player.action = 'light_attack_1';
  engine.update(0.016);
  assert.ok(agile.vy < 0, 'Agile demon should jump backward evasively when player swings nearby');
  assert.ok((agile.dodgeCooldown ?? 0) > 0, 'Agile demon should set dodgeCooldown after backstep');

  // Heavy demon hyper-armor during windup
  const heavy = engine.enemies.find((e) => e.type === 'heavy_demon')!;
  assert.ok(heavy);
  heavy.state = 'windup';
  heavy.telegraphTimer = 0.5;
  heavy.x = engine.player.x + 30;
  heavy.y = engine.player.y;
  engine.player.facing = 1;
  engine.player.isGrounded = true;
  engine.player.action = 'idle';

  // Light attack hits heavy demon during windup -> takes damage but stays in windup (hyper-armor)
  const hpBefore = heavy.hp;
  engine.keysJustPressed.add('KeyJ');
  engine.update(0.016);
  assert.ok(heavy.hp < hpBefore, 'Heavy demon should take reduced damage during windup');
  assert.equal(heavy.state, 'windup', 'Heavy demon should maintain windup state due to hyper-armor against light attacks');
});

test('Stage 3 Final Boss battle activates boss music mode with Final_Boss_Battle__Alt__44ddcd07.mp3', async () => {
  const { audio } = await import('./audio');
  const engine = new GameEngine();

  engine.startGame(0, 'normal');
  assert.equal(audio.getMusicMode(), 'ambient');

  // Entering Stage 3 (Final Boss Battle) switches music mode to 'boss'
  engine.startGame(2, 'normal');
  assert.equal(audio.getMusicMode(), 'boss');
});

test('when protagonist dies and respawns, all level enemies (and boss) reset and reappear at full health', () => {
  const engine = new GameEngine();
  engine.startGame(0, 'hard');
  engine.skipDialogue();

  const initialEnemyCount = engine.enemies.length;
  const initialFirstEnemyX = engine.enemies[0].x;
  const initialFirstEnemyMaxHp = engine.enemies[0].maxHp;
  assert.ok(initialEnemyCount > 0);

  // Activate a checkpoint so we also verify checkpoint preservation
  const cp = engine.level.checkpoints[0];
  cp.activated = true;

  // Kill the first two enemies (remove one, mark one dead) and damage the third
  engine.enemies.splice(0, 1);
  engine.enemies[0].hp = 0;
  engine.enemies[0].state = 'dead';
  engine.enemies[1].hp = 5;
  engine.enemies[1].x += 250;
  assert.equal(engine.enemies.length, initialEnemyCount - 1);

  // Protagonist takes fatal damage and dies
  engine.player.isInvulnerable = false;
  engine.damagePlayer(9999, 'enemy');
  assert.equal(engine.player.action, 'defeat');

  // Immediately upon death, enemies have been reset and respawned
  assert.equal(engine.enemies.length, initialEnemyCount);
  assert.equal(engine.enemies[0].x, initialFirstEnemyX);
  assert.equal(engine.enemies[0].hp, initialFirstEnemyMaxHp);
  assert.ok(engine.enemies.every((e) => e.state === 'patrol' && e.hp === e.maxHp));

  // Respawn at checkpoint after Game Over
  engine.respawnAtCheckpoint();
  assert.equal(engine.state, 'playing');
  assert.equal(engine.player.x, cp.x);
  assert.equal(engine.player.y, cp.y);
  assert.equal(engine.stats.hp, engine.stats.maxHp);
  assert.equal(engine.enemies.length, initialEnemyCount);
  assert.ok(engine.enemies.every((e) => e.state === 'patrol' && e.hp === e.maxHp));

  // Also verify boss stage reset on player death & respawn
  engine.startGame(2, 'normal');
  engine.skipDialogue();
  assert.ok(engine.boss);
  engine.boss.hp = 300;
  engine.boss.phase = 2;
  engine.boss.x = 640;
  engine.enemies.push(engine.createEnemy('agile_demon', 700, 620, 'minion-test'));

  engine.player.isInvulnerable = false;
  engine.damagePlayer(9999, 'boss_cleave');
  engine.respawnAtCheckpoint();

  assert.equal(engine.boss?.hp, engine.boss?.maxHp);
  assert.equal(engine.boss?.phase, 1);
  assert.equal(engine.boss?.x, 1150);
  assert.equal(engine.enemies.length, 0);
});

