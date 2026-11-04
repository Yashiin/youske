import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: 'Chapter I: The Ashen Forest',
    subtitle: 'Ruins of the Fallen Guardians',
    bounds: { width: 3200, height: 750 },
    playerSpawn: { x: 100, y: 550 },
    platforms: [
      // Ground segments (aligned to 32px tile grid)
      { x: 0, y: 620, w: 896, h: 160 },
      { x: 992, y: 620, w: 768, h: 160 },
      { x: 1856, y: 620, w: 1344, h: 160 },

      // Chasm hazards (96px = 3 tiles wide, flush between ground segments)
      { x: 896, y: 724, w: 96, h: 24, isHazard: true },
      { x: 1760, y: 724, w: 96, h: 24, isHazard: true },

      // Elevated platforms & ruins
      { x: 300, y: 490, w: 160, h: 24, isOneWay: true },
      { x: 550, y: 410, w: 192, h: 24, isOneWay: true },
      { x: 1100, y: 500, w: 160, h: 24, isOneWay: true },
      { x: 1350, y: 420, w: 160, h: 24, isOneWay: true },
      { x: 1580, y: 490, w: 160, h: 24, isOneWay: true },
      { x: 2000, y: 500, w: 192, h: 24, isOneWay: true },
      { x: 2280, y: 410, w: 192, h: 24, isOneWay: true },
      { x: 2580, y: 500, w: 192, h: 24, isOneWay: true },
    ],
    destructibles: [
      { id: 'urn-1', x: 250, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'urn-2', x: 700, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'lantern-1', x: 1200, y: 460, w: 28, h: 40, type: 'lantern', destroyed: false, hp: 1 },
      { id: 'urn-3', x: 1600, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'crate-1', x: 2200, y: 580, w: 36, h: 40, type: 'crate', destroyed: false, hp: 1 },
      { id: 'urn-4', x: 2750, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
    ],
    checkpoints: [
      { id: 'cp-1-1', x: 110, y: 570, activated: true },
      { id: 'cp-1-2', x: 1400, y: 570, activated: false },
    ],
    enemies: [
      { type: 'basic_monster', x: 480, y: 570 },
      { type: 'basic_monster', x: 720, y: 570 },
      { type: 'basic_monster', x: 1220, y: 570 },
      { type: 'agile_demon', x: 1480, y: 570 },
      { type: 'demon_warrior', x: 1950, y: 570 },
      { type: 'basic_monster', x: 2250, y: 570 },
      { type: 'demon_warrior', x: 2600, y: 570 },
      { type: 'heavy_demon', x: 2800, y: 570 },
    ],
    stageClearX: 3050,
  },
  {
    id: 2,
    name: 'Chapter II: The Cursed Ramparts',
    subtitle: 'Gate of Demonic Vengeance',
    bounds: { width: 3500, height: 800 },
    playerSpawn: { x: 120, y: 600 },
    platforms: [
      // Ground ramparts (aligned to 32px tile grid)
      { x: 0, y: 680, w: 992, h: 128 },
      { x: 1088, y: 680, w: 1088, h: 128 },
      { x: 2272, y: 680, w: 1248, h: 128 },

      // Spikes pit (96px = 3 tiles wide)
      { x: 992, y: 752, w: 96, h: 24, isHazard: true },
      { x: 2176, y: 752, w: 96, h: 24, isHazard: true },

      // Battlements & towers
      { x: 300, y: 540, w: 200, h: 26, isOneWay: true },
      { x: 600, y: 440, w: 220, h: 26, isOneWay: true },
      { x: 900, y: 530, w: 180, h: 26, isOneWay: true },
      { x: 1250, y: 560, w: 200, h: 26, isOneWay: true },
      { x: 1550, y: 460, w: 220, h: 26, isOneWay: true },
      { x: 1850, y: 380, w: 220, h: 26, isOneWay: true },
      { x: 2350, y: 540, w: 180, h: 26, isOneWay: true },
      { x: 2650, y: 450, w: 200, h: 26, isOneWay: true },
      { x: 2950, y: 530, w: 180, h: 26, isOneWay: true },
    ],
    destructibles: [
      { id: 'cp2-urn-1', x: 450, y: 640, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'cp2-crate-1', x: 800, y: 640, w: 36, h: 40, type: 'crate', destroyed: false, hp: 1 },
      { id: 'cp2-lantern-1', x: 1600, y: 420, w: 28, h: 40, type: 'lantern', destroyed: false, hp: 1 },
      { id: 'cp2-urn-2', x: 2050, y: 640, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'cp2-crate-2', x: 2850, y: 640, w: 36, h: 40, type: 'crate', destroyed: false, hp: 1 },
    ],
    checkpoints: [
      { id: 'cp-2-1', x: 120, y: 630, activated: true },
      { id: 'cp-2-2', x: 1500, y: 630, activated: false },
    ],
    enemies: [
      { type: 'demon_warrior', x: 500, y: 630 },
      { type: 'agile_demon', x: 750, y: 630 },
      { type: 'heavy_demon', x: 1400, y: 630 },
      { type: 'agile_demon', x: 1800, y: 630 },
      { type: 'demon_warrior', x: 2050, y: 630 },
      { type: 'heavy_demon', x: 2550, y: 630 },
      { type: 'agile_demon', x: 2800, y: 630 },
      { type: 'demon_warrior', x: 3100, y: 630 },
    ],
    stageClearX: 3350,
  },
  {
    id: 3,
    name: 'Final Chapter: The Abyssal Throne',
    subtitle: 'Encounter with Malakor, Lord of Despair',
    bounds: { width: 1500, height: 750 },
    playerSpawn: { x: 180, y: 550 },
    platforms: [
      // Boss arena floor
      { x: 0, y: 620, w: 1500, h: 130 },
      // Elevated battle pillars for dodging shockwaves
      { x: 220, y: 480, w: 140, h: 24, isOneWay: true },
      { x: 440, y: 410, w: 140, h: 24, isOneWay: true },
      { x: 680, y: 480, w: 140, h: 24, isOneWay: true },
    ],
    destructibles: [
      { id: 'boss-urn-1', x: 80, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
      { id: 'boss-urn-2', x: 350, y: 580, w: 32, h: 40, type: 'urn', destroyed: false, hp: 1 },
    ],
    checkpoints: [
      { id: 'cp-3-1', x: 150, y: 570, activated: true },
    ],
    enemies: [],
    stageClearX: 99999, // Cleared via narrative ending
    isBossStage: true,
  },
];
