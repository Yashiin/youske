/**
 * Bestiary Data & Pure Stat Scaling Logic for Yosuke: The Last Battle
 * Centralizes demon archetype lore, tactical behaviors, countermeasures,
 * and real-time difficulty-scaled combat parameters from the game engine.
 */

import { Difficulty, EnemyType } from './types';
import { getDifficultyConfig } from './combat';
import { LEVELS } from './levels';

export type BestiaryPreviewAction = 'idle' | 'patrol' | 'chase' | 'windup' | 'attack' | 'hurt' | 'dead';

export interface BestiaryAbility {
  name: string;
  tag: string;
  description: string;
}

export interface BestiaryEntry {
  id: EnemyType;
  index: string;
  name: string;
  japaneseTitle: string;
  subtitle: string;
  classification: string;
  threatLevel: string;
  accentColor: string;
  baseHp: number;
  baseDamage: number;
  chaseSpeed: number;
  aggroDistance: number;
  windupSeconds: number;
  dimensions: { width: number; height: number };
  isUnblockable: boolean;
  canBlock: boolean;
  hasHyperArmor: boolean;
  canEvade: boolean;
  lore: string[];
  tacticalBehaviors: BestiaryAbility[];
  counterStrategy: string;
}

export interface ScaledBestiaryStats {
  hp: number;
  damage: number;
  chaseSpeed: number;
  aggroDistance: number;
  windupSeconds: number;
  chaptersEncountered: string[];
}

export const BESTIARY_ENTRIES: BestiaryEntry[] = [
  {
    id: 'basic_monster',
    index: '01',
    name: 'Ash Ghoul',
    japaneseTitle: 'Necrófago de Ceniza',
    subtitle: 'Ravenous Stalker of the Fallen Woods',
    classification: 'Lesser Abyssal Fiend',
    threatLevel: 'Moderate · Pack Predator',
    accentColor: '#a855f7',
    baseHp: 80,
    baseDamage: 22,
    chaseSpeed: 140,
    aggroDistance: 350,
    windupSeconds: 0.48,
    dimensions: { width: 38, height: 42 },
    isUnblockable: false,
    canBlock: false,
    hasHyperArmor: false,
    canEvade: false,
    lore: [
      'Born from the calcified remains of forest guardians consumed by Malakor’s eclipse, Ash Ghouls prowl the ruined shrines on all fours with bestial hunger.',
      'Their spines bristle with jagged bone shards and their jaws glow with violet abyssal rot. Though individually fragile, they hunt in packs and leap across chasms to corner stragglers.',
    ],
    tacticalBehaviors: [
      {
        name: 'Voracious Lunge',
        tag: 'Parryable Strike',
        description:
          'Coils low before springing forward with a claw-and-fang bite that covers medium ground rapidly.',
      },
      {
        name: 'Chasm & Platform Vault',
        tag: 'Terrain Pursuit',
        description:
          'Capable of leaping across 96px spike pits and climbing onto elevated ruin ledges to pursue Yosuke.',
      },
    ],
    counterStrategy:
      'Wait for the golden telegraph flash and press L for a 0.22s Parry + Counterattack, or sweep multiple ghouls simultaneously with Yosuke’s 3-hit Light Combo.',
  },
  {
    id: 'demon_warrior',
    index: '02',
    name: 'Oni Demon Warrior',
    japaneseTitle: 'Guerrero Demoníaco / Oni',
    subtitle: 'Crimson-Armored Vanguard of the Ramparts',
    classification: 'Armored Martial Demon',
    threatLevel: 'High · Reactive Blocker',
    accentColor: '#ef4444',
    baseHp: 160,
    baseDamage: 28,
    chaseSpeed: 150,
    aggroDistance: 350,
    windupSeconds: 0.52,
    dimensions: { width: 36, height: 56 },
    isUnblockable: false,
    canBlock: true,
    hasHyperArmor: false,
    canEvade: false,
    lore: [
      'Once proud samurai retainers who swore fealty to the Abyss in exchange for undying martial might, the Oni Warriors stand guard along broken torii gates and cursed battlements.',
      'Clad in lacquered crimson plates and horned demonic masks, they wield blood-forged katanas with disciplined lethal precision, reading an opponent’s footwork before striking.',
    ],
    tacticalBehaviors: [
      {
        name: 'Iron Guard Stance',
        tag: 'Reactive Block',
        description:
          'Raises its blade in a defensive guard against incoming Light Attacks (50% rate on Normal, 75% on Hard, 90% on Nightmare).',
      },
      {
        name: 'Tactical Riposte',
        tag: 'Instant Counter',
        description:
          'Deflecting a light strike resets its attack cooldown to 0.12s, triggering an immediate crimson counter-slash.',
      },
    ],
    counterStrategy:
      'Never spam Light Attacks into its raised guard. Shatter its stance using a Heavy Strike (K) or bait its swing to execute a Perfect Parry (L) followed by a lethal Riposte.',
  },
  {
    id: 'agile_demon',
    index: '03',
    name: 'Shadow Wraith Assassin',
    japaneseTitle: 'Demonio Ágil / Espectro Asesino',
    subtitle: 'Phantom Twin-Blade Stalker',
    classification: 'Spectral Assassin',
    threatLevel: 'High · Evasive Skirmisher',
    accentColor: '#22d3ee',
    baseHp: 110,
    baseDamage: 26,
    chaseSpeed: 225,
    aggroDistance: 440,
    windupSeconds: 0.42,
    dimensions: { width: 26, height: 46 },
    isUnblockable: false,
    canBlock: false,
    hasHyperArmor: false,
    canEvade: true,
    lore: [
      'Draped in tattered indigo shrouds that dissolve into spectral mist, Shadow Wraiths are silent executioners who hunt along the Cursed Ramparts and moonlit forest ruins.',
      'Beneath their hoods burns a single cyan ocular sigil. They move faster than any mortal swordsman, striking with twin curved daggers imbued with freezing soul-fire.',
    ],
    tacticalBehaviors: [
      {
        name: 'Acrobatic Backstep',
        tag: 'Airborne Evasion',
        description:
          'When Yosuke initiates an attack within 115px, the Wraith vaults backward into the air and immediately queues a counter-lunge upon landing.',
      },
      {
        name: 'Spectral Cyan Thrust',
        tag: 'Fast Telegraph (0.42s)',
        description:
          'Flashes a four-point cyan star telegraph before launching a high-velocity piercing lunge and twin-dagger cross slash.',
      },
    ],
    counterStrategy:
      'Close the gap after its evasive backstep using an 8-directional Dash (Shift), or time a crisp Parry (L) right as the cyan four-point star flare appears.',
  },
  {
    id: 'heavy_demon',
    index: '04',
    name: 'Volcanic Goliath',
    japaneseTitle: 'Demonio Pesado / Coloso Demoníaco',
    subtitle: 'Magma-Bound Siege Juggernaut',
    classification: 'Abyssal Colossus',
    threatLevel: 'Extreme · Unblockable Brute',
    accentColor: '#f97316',
    baseHp: 280,
    baseDamage: 45,
    chaseSpeed: 85,
    aggroDistance: 350,
    windupSeconds: 0.78,
    dimensions: { width: 44, height: 68 },
    isUnblockable: true,
    canBlock: false,
    hasHyperArmor: true,
    canEvade: false,
    lore: [
      'Forged in the volcanic trenches beneath the Abyssal Throne, the Goliath is a towering mass of basalt skin and molten magma fissures bound together by iron chains.',
      'Hefting a colossal spiked kanabō iron club, each of its footsteps shakes the stonework. Neither shields nor parries can withstand the crushing weight of its overhead slam.',
    ],
    tacticalBehaviors: [
      {
        name: 'Molten Earthshaker Slam',
        tag: 'UNBLOCKABLE',
        description:
          'Slams its spiked iron club into the ground with volcanic fury. Cannot be blocked or parried—deals massive damage and knockback through guards.',
      },
      {
        name: 'Basalt Hyper-Armor (Poise)',
        tag: 'Unstoppable Windup',
        description:
          'During its overhead windup, Light Attacks cannot interrupt its swing (triggering POISE! and taking 30% reduced damage).',
      },
    ],
    counterStrategy:
      'Respect the red UNBLOCKABLE warning: evade through its slam using Dash (Shift) i-frames or jump over the swing, or interrupt its windup early with a Heavy Strike (K).',
  },
  {
    id: 'boss_malakor',
    index: '05',
    name: 'Malakor, Lord of Despair',
    japaneseTitle: 'Malakor, Señor del Abismo Demoníaco',
    subtitle: 'Sovereign of the Eclipsed Throne',
    classification: 'Abyssal Overlord · Final Boss',
    threatLevel: 'Cataclysmic · 3-Phase Sovereign',
    accentColor: '#e11d48',
    baseHp: 1200,
    baseDamage: 45,
    chaseSpeed: 125,
    aggroDistance: 1500,
    windupSeconds: 0.50,
    dimensions: { width: 140, height: 180 },
    isUnblockable: true,
    canBlock: false,
    hasHyperArmor: true,
    canEvade: true,
    lore: [
      'Ancient sovereign of the Demonic Abyss who shattered the mortal realms beneath a bleeding eclipse. Enthroned within the obsidian sanctum, Malakor stalks across the throne room as a six-horned titan of hellfire and despair.',
      'Even pushed to the brink across three cataclysmic combat phases, his abyssal dominion remains absolute—shattering Yosuke’s Spirit Blade Aegis to herald the true war beyond the Prologue.',
    ],
    tacticalBehaviors: [
      {
        name: 'Abyssal Reposition Leap',
        tag: '10s Underfoot Reposition',
        description:
          'Remains anchored until Yosuke stays underneath him for 10 consecutive seconds, then detonates a repulsion blast and leaps to the opposite side of the arena.',
      },
      {
        name: 'Directed Orbs, Meteors & Beam',
        tag: 'Targeted Barrage',
        description:
          'Locks onto Yosuke’s position to launch predictive blood meteors, soul-fire orbs, greatsword cleaves, and aimed abyssal laser beams.',
      },
    ],
    counterStrategy:
      'Watch the red charge ring at Malakor’s feet—if you stay underneath him for 10 seconds he will leap across the sanctum and slam the ground with dual shockwaves.',
  },
];

/**
 * Computes exact difficulty-scaled stats and chapter appearances for a Bestiary entry
 * directly from the engine's difficulty multipliers and level definitions.
 */
export function getScaledBestiaryStats(
  entry: BestiaryEntry,
  difficulty: Difficulty
): ScaledBestiaryStats {
  const diffCfg = getDifficultyConfig(difficulty);

  const chaptersEncountered: string[] = [];
  for (const level of LEVELS) {
    if (entry.id === 'boss_malakor') {
      if (level.isBossStage) {
        chaptersEncountered.push(level.name);
      }
    } else {
      const inBase = level.enemies.some((e) => e.type === entry.id);
      const inBonusHard =
        (difficulty === 'hard' || difficulty === 'nightmare') &&
        ((level.id === 1 && entry.id === 'agile_demon') ||
          (level.id === 2 && entry.id === 'demon_warrior'));
      const inBonusNightmare =
        difficulty === 'nightmare' &&
        ((level.id === 1 && entry.id === 'demon_warrior') ||
          (level.id === 2 && entry.id === 'heavy_demon'));

      if (inBase || inBonusHard || inBonusNightmare) {
        chaptersEncountered.push(level.name);
      }
    }
  }

  return {
    hp: Math.round(entry.baseHp * diffCfg.hpMult),
    damage: Math.round(entry.baseDamage * diffCfg.damageMult),
    chaseSpeed: Math.round(entry.chaseSpeed * diffCfg.speedMult),
    aggroDistance:
      entry.id === 'boss_malakor'
        ? entry.aggroDistance
        : Math.round(entry.aggroDistance * diffCfg.aggroMult),
    windupSeconds: Number((entry.windupSeconds * diffCfg.windupMult).toFixed(2)),
    chaptersEncountered,
  };
}
