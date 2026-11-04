import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONI_SPRITE_COORDS,
  isOniCheckerboardPixel,
  OniWarriorSpriteAtlas,
  OniFrame,
} from './oniWarriorSprites';

test('ONI_SPRITE_COORDS are strictly within 5632x3072 sheet bounds and share consistent row foot baselines', () => {
  const sheetW = 5632;
  const sheetH = 3072;

  for (const [animName, coords] of Object.entries(ONI_SPRITE_COORDS)) {
    assert.ok(coords.length > 0, `${animName} must have at least 1 frame`);
    for (const c of coords) {
      assert.ok(c.x >= 0 && c.x + c.w <= sheetW, `${animName} frame X out of bounds`);
      assert.ok(c.y >= 0 && c.y + c.h <= sheetH, `${animName} frame Y out of bounds`);
      assert.ok(c.anchorXRatio >= 0.25 && c.anchorXRatio <= 0.75, `${animName} anchorXRatio reasonable`);
    }
  }

  // Verify idle and walk rows have identical foot baselines across all frames in their cycle
  const idleBaselines = new Set(ONI_SPRITE_COORDS.idle.map((c) => c.y + c.h));
  assert.equal(idleBaselines.size, 1, 'All 8 idle frames must share the exact same foot baseline Y=483');

  const walkBaselines = new Set(ONI_SPRITE_COORDS.walk.map((c) => c.y + c.h));
  assert.equal(walkBaselines.size, 1, 'All 8 walk frames must share the exact same foot baseline Y=1010');
});

test('isOniCheckerboardPixel removes neutral gray checkerboard tiles while preserving crimson armor and gold horns', () => {
  // Dark gray checkerboard square (#2e2e2e / ~46)
  assert.equal(isOniCheckerboardPixel(46, 46, 46), true);
  // Light gray checkerboard square (#808080 / ~128)
  assert.equal(isOniCheckerboardPixel(128, 129, 127), true);

  // Crimson Oni armor pixel
  assert.equal(isOniCheckerboardPixel(145, 32, 36), false);
  // Golden horn / crescent slash pixel
  assert.equal(isOniCheckerboardPixel(235, 195, 65), false);
  // Deep black armor outline
  assert.equal(isOniCheckerboardPixel(12, 10, 12), false);
});

test('OniWarriorSpriteAtlas.getFrame synchronizes walk cycle to distanceTraveled and switches to idle when stopped', () => {
  const atlas = new OniWarriorSpriteAtlas();
  const makeMockFrames = (prefix: string, count: number): OniFrame[] =>
    Array.from({ length: count }, (_, i) => ({
      canvas: { id: `${prefix}-${i}` } as unknown as HTMLCanvasElement,
      width: 32,
      height: 54,
      originX: 16,
      originY: 54,
    }));

  atlas.isLoaded = true;
  atlas.animations = {
    idle: makeMockFrames('idle', 8),
    walk: makeMockFrames('walk', 8),
    block: makeMockFrames('block', 4),
    windup: makeMockFrames('windup', 2),
    attack: makeMockFrames('attack', 4),
    dashThrust: makeMockFrames('dashThrust', 3),
    hurt: makeMockFrames('hurt', 3),
    dead: makeMockFrames('dead', 3),
  };

  // Stationary during patrol/chase (vx = 0) -> returns idle frame instead of sliding feet
  const stoppedFrame = atlas.getFrame('patrol', 0.5, 1.0, false, 0, 100);
  assert.equal((stoppedFrame?.canvas as unknown as { id: string }).id, 'idle-4');

  // Moving during chase -> advances walk frame strictly by distanceTraveled (stride = 14px)
  const walk0 = atlas.getFrame('chase', 0.2, 1.0, false, -150, 0);
  const walk1 = atlas.getFrame('chase', 0.2, 1.0, false, -150, 14);
  const walk2 = atlas.getFrame('chase', 0.2, 1.0, false, -150, 28);
  assert.equal((walk0?.canvas as unknown as { id: string }).id, 'walk-0');
  assert.equal((walk1?.canvas as unknown as { id: string }).id, 'walk-1');
  assert.equal((walk2?.canvas as unknown as { id: string }).id, 'walk-2');

  // Blocking overrides patrol/chase with tower shield guard frame
  const blockFrame = atlas.getFrame('chase', 0.2, 0.0, true, 0, 28);
  assert.equal((blockFrame?.canvas as unknown as { id: string }).id, 'block-2');

  // Heavy demon (isHeavy = true) uses crimson dashThrust on attack and 16px stride on walk
  const heavyAttack = atlas.getFrame('attack', 0.15, 1.0, false, 0, 0, true);
  assert.equal((heavyAttack?.canvas as unknown as { id: string }).id, 'dashThrust-1');
  const heavyWalk = atlas.getFrame('patrol', 0.2, 1.0, false, -65, 16, true);
  assert.equal((heavyWalk?.canvas as unknown as { id: string }).id, 'walk-1');
});

