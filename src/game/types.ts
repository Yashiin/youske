/**
 * Core type definitions for Yosuke: The Last Battle
 */

export type GameState = 'title' | 'playing' | 'paused' | 'stage_transition' | 'prologue_ending' | 'gameover';

export type Difficulty = 'normal' | 'hard' | 'nightmare';

export type PlayerAction =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'light_attack_1'
  | 'light_attack_2'
  | 'light_attack_3'
  | 'heavy_attack'
  | 'air_attack'
  | 'air_heavy'
  | 'dash'
  | 'block'
  | 'parry'
  | 'counter'
  | 'hurt'
  | 'defeat'
  | 'scripted_clash';

export type EnemyType = 'basic_monster' | 'demon_warrior' | 'heavy_demon' | 'agile_demon' | 'boss_malakor';

export type EnemyAction =
  | 'idle'
  | 'patrol'
  | 'chase'
  | 'windup'
  | 'attack'
  | 'block'
  | 'staggered'
  | 'hurt'
  | 'dead'
  | 'special';

export type BossPhase = 1 | 2 | 3 | 'scripted_defeat';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Hitbox {
  id: string;
  source: 'player' | 'enemy' | 'hazard';
  rect: Rect;
  damage: number;
  stagger: number; // Duration of stagger inflicted
  knockback: { x: number; y: number };
  unblockable?: boolean;
  isParryable?: boolean;
  canCounter?: boolean;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  spirit: number; // Charge for special / counter potency
  maxSpirit: number;
  comboCount: number;
  comboTimer: number;
  score: number;
  parrySuccessCount: number;
  counterCount: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  state: EnemyAction;
  stateTimer: number;
  isGrounded: boolean;
  isBlocking: boolean;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  hitFlashTimer: number;
  activeHitbox: Hitbox | null;
  telegraphTimer: number;
  telegraphDuration: number;
  telegraphType?: 'normal' | 'unblockable';
  targetAttack?: string;
  attackCooldown: number;
  patrolStartX: number;
  patrolRange: number;
  aggroDistance: number;
  attackDistance: number;
  dodgeCooldown?: number;
}

export interface BossData {
  name: string;
  title: string;
  phase: BossPhase;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  actionTimer: number;
  currentAttack: string;
  hitFlashTimer: number;
  isVulnerable: boolean;
  projectiles: BossProjectile[];
  shockwaves: Shockwave[];
  summonTimer: number;
  scriptedSequenceStep: number;
  scriptedTimer: number;
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: 'meteor' | 'orb' | 'beam';
  duration: number;
}

export interface Shockwave {
  id: string;
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  damage: number;
  duration: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  shape: 'circle' | 'square' | 'line' | 'spark' | 'ember' | 'smoke';
  angle?: number;
  length?: number;
}

export interface DamageNumber {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
  scale?: number;
  tier?: 1 | 2 | 3 | 4;
  comboCount?: number;
  shadowColor?: string;
}

export interface DestructibleProp {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'urn' | 'lantern' | 'crate';
  destroyed: boolean;
  hp: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  activated: boolean;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
  isHazard?: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  bounds: { width: number; height: number };
  playerSpawn: { x: number; y: number };
  platforms: Platform[];
  destructibles: DestructibleProp[];
  checkpoints: Checkpoint[];
  enemies: Array<{ type: EnemyType; x: number; y: number }>;
  stageClearX: number;
  isBossStage?: boolean;
}

export interface KeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  jump: string;
  lightAttack: string;
  heavyAttack: string;
  dash: string;
  block: string;
  interact: string;
}

export type DialoguePortrait = 'yosuke_normal' | 'yosuke_grim' | 'yosuke_hurt' | 'malakor_menacing';

export interface DialogueLine {
  id: string;
  speaker: 'yosuke' | 'malakor' | 'narrator';
  speakerName: string;
  speakerTitle?: string;
  text: string;
  portrait?: DialoguePortrait;
  duration?: number; // duration in seconds before auto-advancing
}
