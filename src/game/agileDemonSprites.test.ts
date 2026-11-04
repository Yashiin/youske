import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AGILE_DEMON_SPRITE_COORDS,
  AgileDemonSpriteAtlas,
  isAgileDemonCheckerboardPixel,
} from './agileDemonSprites';

const SHEET_WIDTH = 5632;
const SHEET_HEIGHT = 3072;

describe('Agile Demon / Espectro Asesino (agile_demon) Sprite Sheet Verification', () => {
  it('points to the uploaded enemi_4_24968989.jpg asset', () => {
    assert.equal(AgileDemonSpriteAtlas.IMAGE_SRC, '/assets/aistudio/enemi_4_24968989.jpg');
  });

  it('has valid, in-bounds, non-overlapping frame coordinates across all animation states', () => {
    const states = Object.entries(AGILE_DEMON_SPRITE_COORDS);
    assert.ok(states.length >= 8, 'Expected at least 8 animation states');

    for (const [stateName, frames] of states) {
      assert.ok(frames.length > 0, `State ${stateName} must have at least 1 frame`);

      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        assert.ok(f.x >= 0, `${stateName}[${i}].x must be >= 0`);
        assert.ok(f.y >= 0, `${stateName}[${i}].y must be >= 0`);
        assert.ok(f.w >= 200, `${stateName}[${i}].w (${f.w}) must be a full character width`);
        assert.ok(f.h >= 250, `${stateName}[${i}].h (${f.h}) must be a full character height`);
        assert.ok(
          f.x + f.w <= SHEET_WIDTH,
          `${stateName}[${i}] exceeds sheet width (${f.x + f.w} > ${SHEET_WIDTH})`
        );
        assert.ok(
          f.y + f.h <= SHEET_HEIGHT,
          `${stateName}[${i}] exceeds sheet height (${f.y + f.h} > ${SHEET_HEIGHT})`
        );
        assert.ok(
          f.anchorXRatio >= 0.25 && f.anchorXRatio <= 0.75,
          `${stateName}[${i}].anchorXRatio (${f.anchorXRatio}) must be centered near the torso`
        );
      }
    }
  });

  it('maintains consistent foot baselines within horizontal animation rows', () => {
    // Row 0 Idle frames share foot baseline Y = 432
    for (const f of AGILE_DEMON_SPRITE_COORDS.idle) {
      assert.equal(f.y + f.h, 432, 'Idle frames must share foot baseline Y = 432');
    }

    // Row 1 Walk & Run frames share foot baseline Y = 811
    for (const f of AGILE_DEMON_SPRITE_COORDS.walk) {
      assert.equal(f.y + f.h, 811, 'Walk frames must share foot baseline Y = 811');
    }
    for (const f of AGILE_DEMON_SPRITE_COORDS.run) {
      assert.equal(f.y + f.h, 811, 'Run frames must share foot baseline Y = 811');
    }
  });

  it('accurately strips neutral gray checkerboard tiles while preserving indigo cloak, cyan glow, steel blades, and dark outlines', () => {
    // Dark and light neutral gray checkerboard squares in enemi_4_24968989.jpg
    assert.equal(isAgileDemonCheckerboardPixel(55, 55, 55), true);
    assert.equal(isAgileDemonCheckerboardPixel(142, 142, 142), true);
    assert.equal(isAgileDemonCheckerboardPixel(100, 104, 102), true);

    // Wraith indigo/violet cloak (B > R > G with chroma diff > 19) must be preserved
    assert.equal(isAgileDemonCheckerboardPixel(48, 38, 76), false);
    assert.equal(isAgileDemonCheckerboardPixel(72, 54, 112), false);

    // Spectral cyan eye flare and blade energy trail must be preserved
    assert.equal(isAgileDemonCheckerboardPixel(34, 211, 238), false);
    assert.equal(isAgileDemonCheckerboardPixel(103, 232, 249), false);

    // Bright steel dagger highlights must be preserved
    assert.equal(isAgileDemonCheckerboardPixel(215, 225, 235), false);

    // Deep dark shadow / ink outlines must be preserved
    assert.equal(isAgileDemonCheckerboardPixel(15, 14, 22), false);
  });
});
