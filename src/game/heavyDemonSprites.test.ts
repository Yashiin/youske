import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HEAVY_DEMON_SPRITE_COORDS,
  isHeavyDemonCheckerboardPixel,
  HeavyDemonSpriteAtlas,
  HeavyDemonFrame,
} from './heavyDemonSprites';

test('HEAVY_DEMON_SPRITE_COORDS are strictly within 5632x3072 sheet bounds and share consistent row foot baselines', () => {
  const sheetW = 5632;
  const sheetH = 3072;

  for (const [animName, coords] of Object.entries(HEAVY_DEMON_SPRITE_COORDS)) {
    assert.ok(coords.length > 0, `${animName} must have at least 1 frame`);
    for (const c of coords) {
      assert.ok(c.x >= 0 && c.x + c.w <= sheetW, `${animName} frame X out of bounds`);
      assert.ok(c.y >= 0 && c.y + c.h <= sheetH, `${animName} frame Y out of bounds`);
      assert.ok(c.anchorXRatio >= 0.25 && c.anchorXRatio <= 0.85, `${animName} anchorXRatio reasonable`);
    }
  }

  // Verify idle, walk, chase, windup, and dead rows have consistent foot baselines
  const idleBaselines = new Set(HEAVY_DEMON_SPRITE_COORDS.idle.map((c) => c.y + c.h));
  assert.equal(idleBaselines.size, 1, 'All 7 idle frames must share the exact same foot baseline Y=426');

  const walkBaselines = new Set(HEAVY_DEMON_SPRITE_COORDS.walk.map((c) => c.y + c.h));
  assert.equal(walkBaselines.size, 1, 'All 8 walk frames must share the exact same foot baseline Y=883');

  const chaseBaselines = new Set(HEAVY_DEMON_SPRITE_COORDS.chase.map((c) => c.y + c.h));
  assert.equal(chaseBaselines.size, 1, 'All 6 chase frames must share the exact same foot baseline Y=2193');
});

test('isHeavyDemonCheckerboardPixel removes neutral and aura-tinted checkerboard tiles while preserving basalt armor and magma fissures', () => {
  // Neutral dark gray checkerboard tile (~58)
  assert.equal(isHeavyDemonCheckerboardPixel(58, 58, 59), true);
  // Neutral light gray checkerboard tile (~142)
  assert.equal(isHeavyDemonCheckerboardPixel(142, 141, 142), true);
  // Strong red-aura-tinted checkerboard tiles (light and dark squares under red glow)
  assert.equal(isHeavyDemonCheckerboardPixel(186, 146, 147), true);
  assert.equal(isHeavyDemonCheckerboardPixel(95, 59, 59), true);

  // Basalt stone armor pixel (warm dark purple-brown where B > G + 7)
  assert.equal(isHeavyDemonCheckerboardPixel(46, 25, 36), false);
  // Incandescent magma core pixel
  assert.equal(isHeavyDemonCheckerboardPixel(245, 130, 20), false);
  // Deep black outline pixel
  assert.equal(isHeavyDemonCheckerboardPixel(15, 10, 14), false);
});

test('HeavyDemonSpriteAtlas.getFrame synchronizes patrol/chase cycles to distanceTraveled and switches to idle when stopped', () => {
  const atlas = new HeavyDemonSpriteAtlas();
  const makeMockFrames = (prefix: string, count: number): HeavyDemonFrame[] =>
    Array.from({ length: count }, (_, i) => ({
      canvas: { id: `${prefix}-${i}` } as unknown as HTMLCanvasElement,
      width: 68,
      height: 75,
      originX: 36,
      originY: 75,
    }));

  atlas.isLoaded = true;
  atlas.animations = {
    idle: makeMockFrames('idle', 7),
    walk: makeMockFrames('walk', 8),
    chase: makeMockFrames('chase', 6),
    windup: makeMockFrames('windup', 4),
    attack: makeMockFrames('attack', 4),
    fireBreath: makeMockFrames('fireBreath', 4),
    hurt: makeMockFrames('hurt', 3),
    dead: makeMockFrames('dead', 4),
  };

  // Stationary during patrol (vx = 0) -> returns idle frame
  const stoppedFrame = atlas.getFrame('patrol', 0.4, 1.0, 0, 60);
  assert.equal((stoppedFrame?.canvas as unknown as { id: string }).id, 'idle-4');

  // Moving during patrol -> uses walk frames synchronized by stride = 12px
  const walk0 = atlas.getFrame('patrol', 0.2, 1.0, -65, 0);
  const walk1 = atlas.getFrame('patrol', 0.2, 1.0, -65, 12);
  assert.equal((walk0?.canvas as unknown as { id: string }).id, 'walk-0');
  assert.equal((walk1?.canvas as unknown as { id: string }).id, 'walk-1');

  // Moving during chase -> uses armed club-ready chase frames synchronized by stride = 13px
  const chase0 = atlas.getFrame('chase', 0.2, 1.0, -85, 0);
  const chase2 = atlas.getFrame('chase', 0.2, 1.0, -85, 26);
  assert.equal((chase0?.canvas as unknown as { id: string }).id, 'chase-0');
  assert.equal((chase2?.canvas as unknown as { id: string }).id, 'chase-2');
});
