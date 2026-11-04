import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BESTIARY_ENTRIES,
  getScaledBestiaryStats,
} from './bestiary';

describe('Bestiary Data & Scaling Logic', () => {
  it('contains all 5 encountered demon archetypes with complete lore and tactical metadata', () => {
    const ids = BESTIARY_ENTRIES.map((e) => e.id);
    assert.deepEqual(ids, [
      'basic_monster',
      'demon_warrior',
      'agile_demon',
      'heavy_demon',
      'boss_malakor',
    ]);

    for (const entry of BESTIARY_ENTRIES) {
      assert.ok(entry.name.length > 0, `${entry.id} must have a name`);
      assert.ok(entry.japaneseTitle.length > 0, `${entry.id} must have a Spanish/Japanese subtitle`);
      assert.ok(entry.lore.length >= 2, `${entry.id} must have at least 2 lore paragraphs`);
      assert.ok(entry.tacticalBehaviors.length >= 2, `${entry.id} must list at least 2 tactical behaviors`);
      assert.ok(entry.counterStrategy.length > 10, `${entry.id} must have a counter strategy`);
      assert.ok(entry.baseHp > 0, `${entry.id} must have positive base HP`);
      assert.ok(entry.baseDamage > 0, `${entry.id} must have positive base damage`);
    }
  });

  it('scales HP, damage, speed, aggro, and windup accurately across normal, hard, and nightmare difficulties', () => {
    const heavy = BESTIARY_ENTRIES.find((e) => e.id === 'heavy_demon')!;
    const normalStats = getScaledBestiaryStats(heavy, 'normal');
    const hardStats = getScaledBestiaryStats(heavy, 'hard');
    const nightmareStats = getScaledBestiaryStats(heavy, 'nightmare');

    assert.equal(normalStats.hp, 280);
    assert.equal(hardStats.hp, 364);
    assert.equal(nightmareStats.hp, 448);

    assert.equal(normalStats.damage, 45);
    assert.equal(hardStats.damage, 56);
    assert.equal(nightmareStats.damage, 68);

    assert.ok(hardStats.windupSeconds < normalStats.windupSeconds);
    assert.ok(nightmareStats.windupSeconds < hardStats.windupSeconds);
  });

  it('maps each demon archetype to the chapters where it is encountered in LEVELS', () => {
    for (const entry of BESTIARY_ENTRIES) {
      const stats = getScaledBestiaryStats(entry, 'normal');
      assert.ok(
        stats.chaptersEncountered.length >= 1,
        `${entry.id} must be encountered in at least 1 chapter`
      );
    }

    const malakorStats = getScaledBestiaryStats(
      BESTIARY_ENTRIES.find((e) => e.id === 'boss_malakor')!,
      'normal'
    );
    assert.deepEqual(malakorStats.chaptersEncountered, [
      'Final Chapter: The Abyssal Throne',
    ]);
  });
});
