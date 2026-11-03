import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine';

test('Level 1 start dialogue triggers "¿Dónde estoy...?"', () => {
  const engine = new GameEngine();
  engine.startGame(0);

  assert.ok(engine.activeDialogue, 'Active dialogue should be set upon starting Level 1');
  assert.equal(engine.activeDialogue.speaker, 'yosuke');
  assert.equal(engine.activeDialogue.speakerName, 'YOSUKE');
  assert.equal(engine.activeDialogue.text, '¿Dónde estoy...?');
  assert.equal(engine.activeDialogue.portrait, 'yosuke_normal');
});

test('Level 2 start dialogue triggers contextual opening line', () => {
  const engine = new GameEngine();
  engine.startGame(1);

  assert.ok(engine.activeDialogue, 'Active dialogue should be set upon starting Level 2');
  assert.equal(engine.activeDialogue.speaker, 'yosuke');
  assert.equal(engine.activeDialogue.text, 'Las murallas malditas... El hedor demoníaco es cada vez más fuerte.');
  assert.equal(engine.activeDialogue.portrait, 'yosuke_grim');
});

test('Boss arena encounter triggers "No sé quién eres, mas me estorbas."', () => {
  const engine = new GameEngine();
  // Start boss level (level 2)
  engine.startGame(2);

  // Clear opening dialogue if any
  engine.skipDialogue();
  assert.equal(engine.activeDialogue === null, true);

  // Move player into boss trigger range (x >= 240)
  engine.player.x = 250;
  engine.update(0.016);

  const bossDialogue = engine.activeDialogue;
  assert.ok(bossDialogue, 'Boss dialogue should trigger in boss arena');
  assert.equal(bossDialogue.speaker, 'yosuke');
  assert.equal(bossDialogue.text, 'No sé quién eres, mas me estorbas.');
  assert.equal(bossDialogue.portrait, 'yosuke_grim');

  // Next in queue should be Malakor
  assert.equal(engine.dialogueQueue.length, 1);
  assert.equal(engine.dialogueQueue[0].speaker, 'malakor');
  assert.ok(engine.dialogueQueue[0].text.includes('Señor del Abismo'));

  // Advance to Malakor
  engine.advanceDialogue();
  const malakorDialogue = engine.activeDialogue;
  assert.ok(malakorDialogue);
  assert.equal(malakorDialogue.speaker, 'malakor');
  assert.equal(malakorDialogue.portrait, 'malakor_menacing');

  // Advance past Malakor to resume combat
  engine.advanceDialogue();
  assert.equal(engine.activeDialogue, null);
  assert.equal(engine.state, 'playing');
});

test('Player death triggers "¿Qué rayos...?" dialogue', () => {
  const engine = new GameEngine();
  engine.startGame(0);
  engine.skipDialogue(); // skip opening dialogue

  // Inflict fatal damage
  engine.damagePlayer(999, 'fatal_strike');

  assert.ok(engine.activeDialogue, 'Death dialogue should be active upon fatal damage');
  assert.equal(engine.activeDialogue.id, 'dlg-player-death');
  assert.equal(engine.activeDialogue.speaker, 'yosuke');
  assert.equal(engine.activeDialogue.text, '¿Qué rayos...?');
  assert.equal(engine.activeDialogue.portrait, 'yosuke_hurt');

  // Advancing from death dialogue triggers game over state
  engine.advanceDialogue();
  assert.equal(engine.activeDialogue, null);
  assert.equal(engine.state, 'gameover');
});

test('Skipping dialogue clears all pending lines and proceeds', () => {
  const engine = new GameEngine();
  engine.startGame(2);
  engine.skipDialogue();

  engine.player.x = 250;
  engine.update(0.016);
  assert.ok(engine.activeDialogue);

  // Skip both lines in one press
  engine.skipDialogue();
  assert.equal(engine.activeDialogue, null);
  assert.equal(engine.dialogueQueue.length, 0);
  assert.equal(engine.state, 'playing');
});
