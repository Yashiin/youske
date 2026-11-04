import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MALAKOR_SPRITE_COORDS,
  MalakorSpriteAtlas,
  isMalakorCheckerboardPixel,
} from './malakorSprites';

const SHEET_WIDTH = 1408;
const SHEET_HEIGHT = 768;

describe('Malakor Boss (boss_malakor) Sprite Sheet Verification', () => {
  it('points to the uploaded boss_final_4_2f289ee0.jpg asset', () => {
    assert.equal(MalakorSpriteAtlas.IMAGE_SRC, '/assets/aistudio/boss_final_4_2f289ee0.jpg');
  });

  it('has valid, in-bounds frame coordinates across all 10 animation states', () => {
    const states = Object.entries(MALAKOR_SPRITE_COORDS);
    assert.equal(states.length, 10);

    for (const [stateName, frames] of states) {
      assert.ok(frames.length >= 2, `State ${stateName} must have at least 2 frames`);
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        assert.ok(f.x >= 0 && f.y >= 0, `${stateName}[${i}] must have positive origin`);
        assert.ok(f.w >= 70, `${stateName}[${i}].w (${f.w}) must be a full boss width`);
        assert.ok(f.h >= 90, `${stateName}[${i}].h (${f.h}) must be a full boss height`);
        assert.ok(
          f.x + f.w <= SHEET_WIDTH,
          `${stateName}[${i}] exceeds sheet width (${f.x + f.w} > ${SHEET_WIDTH})`
        );
        assert.ok(
          f.y + f.h <= SHEET_HEIGHT,
          `${stateName}[${i}] exceeds sheet height (${f.y + f.h} > ${SHEET_HEIGHT})`
        );
      }
    }
  });

  it('maintains consistent foot baselines within horizontal animation rows', () => {
    for (const f of MALAKOR_SPRITE_COORDS.idle) {
      assert.equal(f.y + f.h, 131, 'Idle frames must share foot baseline Y = 131');
    }
    for (const f of MALAKOR_SPRITE_COORDS.walk) {
      assert.equal(f.y + f.h, 256, 'Walk frames must share foot baseline Y = 256');
    }
    for (const f of MALAKOR_SPRITE_COORDS.cleave) {
      assert.equal(f.y + f.h, 518, 'Cleave frames must share foot baseline Y = 518');
    }
  });

  it('strips neutral gray checkerboard tiles while preserving obsidian armor, blazing core, and crimson horns', () => {
    assert.equal(isMalakorCheckerboardPixel(55, 55, 55), true);
    assert.equal(isMalakorCheckerboardPixel(142, 142, 142), true);

    // Obsidian purple armor
    assert.equal(isMalakorCheckerboardPixel(52, 34, 68), false);
    // Blazing chest core
    assert.equal(isMalakorCheckerboardPixel(255, 165, 30), false);
    // Crimson horns & hellfire arc
    assert.equal(isMalakorCheckerboardPixel(220, 38, 38), false);
  });
});
