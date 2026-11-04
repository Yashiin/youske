/**
 * 60 FPS Game Engine & State Manager for Yosuke: The Last Battle
 */

import {
  GameState,
  Difficulty,
  PlayerAction,
  PlayerStats,
  Enemy,
  BossData,
  Particle,
  DamageNumber,
  Hitbox,
  Rect,
  LevelData,
  KeyBindings,
  BossPhase,
  DialogueLine,
} from './types';
import {
  rectsOverlap,
  getNextComboAction,
  calculatePlayerHit,
  resolveIncomingAttack,
  getComboRating,
  getComboVisualTier,
  updatePlayerStamina,
  getDifficultyConfig,
  PARRY_WINDOW_SECONDS,
  STAMINA_DASH_COST,
  STAMINA_HEAVY_COST,
} from './combat';
import { audio } from './audio';
import { LEVELS } from './levels';

export class GameEngine {
  public state: GameState = 'title';
  public difficulty: Difficulty = 'normal';
  public currentLevelIndex: number = 0;
  public level: LevelData = LEVELS[0];

  // Player state
  public player = {
    x: 100,
    y: 550,
    vx: 0,
    vy: 0,
    width: 28,
    height: 52,
    facing: 1 as 1 | -1,
    action: 'idle' as PlayerAction,
    actionTimer: 0,
    isGrounded: false,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    hitFlashTimer: 0,
    blockDuration: 0,
    counterWindowTimer: 0,
    dashCooldown: 0,
    hasAirDashed: false,
    scarfPoints: [] as Array<{ x: number; y: number }>,
  };

  public stats: PlayerStats = {
    hp: 150,
    maxHp: 150,
    stamina: 100,
    maxStamina: 100,
    spirit: 50,
    maxSpirit: 100,
    comboCount: 0,
    comboTimer: 0,
    score: 0,
    parrySuccessCount: 0,
    counterCount: 0,
  };

  // World entities
  public enemies: Enemy[] = [];
  public boss: BossData | null = null;
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public activePlayerHitbox: Hitbox | null = null;

  // Physics constants
  private readonly GRAVITY = 1200;
  private readonly MOVE_SPEED = 280;
  private readonly JUMP_VELOCITY = -520;
  private readonly DASH_SPEED = 600;
  private readonly DASH_DURATION = 0.18;

  // Jump feel & Combo chaining
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private comboChainTimer = 0;
  private lastComboAction: PlayerAction = 'idle';

  // Hitstop & screen impact
  public hitstopTimer = 0;
  public screenShakeRequest = 0;

  // Input tracking
  public keysHeld: Set<string> = new Set();
  public keysJustPressed: Set<string> = new Set();
  public keyBindings: KeyBindings = {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    lightAttack: 'KeyJ',
    heavyAttack: 'KeyK',
    dash: 'ShiftLeft',
    block: 'KeyL',
    interact: 'KeyE',
  };

  // Scripted prologue sequence state
  public prologueEndingTimer = 0;
  public prologueEndingStep = 0;

  // Dialogue system state
  public activeDialogue: DialogueLine | null = null;
  public dialogueQueue: DialogueLine[] = [];
  public hasTriggeredBossDialogue = false;
  private onDialogueUpdate?: (dialogue: DialogueLine | null) => void;

  // Callbacks for UI updates
  private onStateChange?: (state: GameState) => void;
  private onStatsChange?: (stats: PlayerStats) => void;
  private onBossUpdate?: (boss: BossData | null) => void;

  constructor() {
    this.initLevel(0);
  }

  private setDomState(state: string): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.state = state;
    }
  }

  public setCallbacks(
    onState: (state: GameState) => void,
    onStats: (stats: PlayerStats) => void,
    onBoss: (boss: BossData | null) => void,
    onDialogue?: (dialogue: DialogueLine | null) => void
  ): void {
    this.onStateChange = onState;
    this.onStatsChange = onStats;
    this.onBossUpdate = onBoss;
    if (onDialogue) this.onDialogueUpdate = onDialogue;
  }

  public queueDialogue(dialogues: DialogueLine[]): void {
    if (dialogues.length === 0) return;
    this.dialogueQueue.push(...dialogues);
    if (!this.activeDialogue) {
      this.advanceDialogue();
    }
  }

  public advanceDialogue(): void {
    if (this.dialogueQueue.length > 0) {
      this.activeDialogue = this.dialogueQueue.shift() || null;
      if (this.onDialogueUpdate) {
        this.onDialogueUpdate(this.activeDialogue);
      }
    } else {
      const wasDying = this.activeDialogue?.id === 'dlg-player-death';
      this.activeDialogue = null;
      if (this.onDialogueUpdate) {
        this.onDialogueUpdate(null);
      }
      if (wasDying) {
        this.state = 'gameover';
        this.setDomState('gameover');
        if (this.onStateChange) this.onStateChange(this.state);
      }
    }
  }

  public skipDialogue(): void {
    const wasDying =
      this.activeDialogue?.id === 'dlg-player-death' ||
      this.dialogueQueue.some((d) => d.id === 'dlg-player-death');
    this.dialogueQueue = [];
    this.activeDialogue = null;
    if (this.onDialogueUpdate) {
      this.onDialogueUpdate(null);
    }
    if (wasDying) {
      this.state = 'gameover';
      this.setDomState('gameover');
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public triggerLevelStartDialogue(levelIdx: number): void {
    if (levelIdx === 0) {
      this.queueDialogue([
        {
          id: 'dlg-level-1-start',
          speaker: 'yosuke',
          speakerName: 'YOSUKE',
          speakerTitle: 'GUERRERO ESPADACHÍN',
          text: '¿Dónde estoy...?',
          portrait: 'yosuke_normal',
          duration: 4.2,
        },
      ]);
    } else if (levelIdx === 1) {
      this.queueDialogue([
        {
          id: 'dlg-level-2-start',
          speaker: 'yosuke',
          speakerName: 'YOSUKE',
          speakerTitle: 'GUERRERO ESPADACHÍN',
          text: 'Las murallas malditas... El hedor demoníaco es cada vez más fuerte.',
          portrait: 'yosuke_grim',
          duration: 4.5,
        },
      ]);
    }
  }

  public setDifficulty(diff: Difficulty): void {
    this.difficulty = diff;
  }

  public initLevel(levelIdx: number): void {
    this.currentLevelIndex = levelIdx;
    this.level = JSON.parse(JSON.stringify(LEVELS[levelIdx]));
    const diffCfg = getDifficultyConfig(this.difficulty);
    this.hasTriggeredBossDialogue = false;
    this.activeDialogue = null;
    this.dialogueQueue = [];
    if (this.onDialogueUpdate) this.onDialogueUpdate(null);

    // Spawn player
    this.player.x = this.level.playerSpawn.x;
    this.player.y = this.level.playerSpawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.action = 'idle';
    this.player.actionTimer = 0;
    this.player.isInvulnerable = false;
    this.player.counterWindowTimer = 0;
    this.player.dashCooldown = 0;
    this.player.hasAirDashed = false;

    // Clear pools
    this.particles = [];
    this.damageNumbers = [];
    this.activePlayerHitbox = null;

    // Add bonus elite enemies on Hard / Nightmare difficulty
    const enemyConfigs = [...this.level.enemies];
    if (!this.level.isBossStage) {
      if (this.difficulty === 'hard' || this.difficulty === 'nightmare') {
        if (levelIdx === 0) {
          enemyConfigs.push({ type: 'agile_demon', x: 1620, y: 570 });
        } else if (levelIdx === 1) {
          enemyConfigs.push({ type: 'demon_warrior', x: 1180, y: 630 });
        }
      }
      if (this.difficulty === 'nightmare') {
        if (levelIdx === 0) {
          enemyConfigs.push({ type: 'demon_warrior', x: 2420, y: 570 });
        } else if (levelIdx === 1) {
          enemyConfigs.push({ type: 'heavy_demon', x: 2960, y: 630 });
        }
      }
    }

    // Spawn enemies with difficulty scaling
    this.enemies = enemyConfigs.map((e, idx) =>
      this.createEnemy(e.type, e.x, e.y, `enemy-${idx}`)
    );

    // Spawn boss if boss stage
    if (this.level.isBossStage) {
      const scaledBossHp = Math.round(1200 * diffCfg.hpMult);
      this.boss = {
        name: 'MALAKOR',
        title: 'Lord of the Demonic Abyss',
        phase: 1,
        hp: scaledBossHp,
        maxHp: scaledBossHp,
        x: 1150,
        y: 620,
        actionTimer: 2.0 * diffCfg.cooldownMult,
        currentAttack: 'idle',
        hitFlashTimer: 0,
        isVulnerable: true,
        projectiles: [],
        shockwaves: [],
        summonTimer: 0,
        scriptedSequenceStep: 0,
        scriptedTimer: 0,
      };
      audio.setMusicMode('boss');
    } else {
      this.boss = null;
      audio.setMusicMode('ambient');
    }

    if (this.onBossUpdate) this.onBossUpdate(this.boss);
  }

  public startGame(stageIdx: number = 0, difficulty?: Difficulty): void {
    if (difficulty) {
      this.difficulty = difficulty;
    }
    this.initLevel(stageIdx);
    this.stats.hp = this.stats.maxHp;
    this.stats.stamina = this.stats.maxStamina;
    this.stats.spirit = 50;
    this.stats.comboCount = 0;
    this.stats.score = 0;
    this.state = 'playing';
    this.setDomState('playing');

    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onStatsChange) this.onStatsChange(this.stats);

    // Trigger opening dialogue for this stage
    this.triggerLevelStartDialogue(stageIdx);
  }

  public pauseGame(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.setDomState('paused');
      audio.setPausedState(true);
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public resumeGame(): void {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.setDomState('playing');
      audio.setPausedState(false);
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public respawnAtCheckpoint(): void {
    // Clear active dialogue on respawn
    this.activeDialogue = null;
    this.dialogueQueue = [];
    if (this.onDialogueUpdate) this.onDialogueUpdate(null);

    // Find active checkpoint
    const cp = this.level.checkpoints.find((c) => c.activated) || {
      x: this.level.playerSpawn.x,
      y: this.level.playerSpawn.y,
    };
    this.player.x = cp.x;
    this.player.y = cp.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.action = 'idle';
    this.stats.hp = this.stats.maxHp;
    this.stats.stamina = this.stats.maxStamina;
    this.state = 'playing';
    this.setDomState('playing');
    audio.setMusicMode(this.level.isBossStage ? 'boss' : 'ambient');
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onStatsChange) this.onStatsChange(this.stats);
  }

  // --- MAIN TICK LOOP ---

  public update(rawDt: number): void {
    const dt = Math.min(rawDt, 0.05);

    // If dialogue is active, freeze player movement & combat for dramatic effect
    if (this.activeDialogue) {
      this.updateParticles(dt);
      this.updateDamageNumbers(dt);
      this.keysJustPressed.clear();
      return;
    }

    // If in hitstop freeze, tick hitstop timer but skip physics
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      // Consume edge presses so they don't get lost
      this.keysJustPressed.clear();
      return;
    }

    if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'prologue_ending') {
      this.updatePrologueEnding(dt);
    }

    // Always clear edge inputs at end of frame
    this.keysJustPressed.clear();
  }

  private updatePlaying(dt: number): void {
    // 0. Check boss encounter dialogue trigger
    if (
      this.level.isBossStage &&
      this.boss &&
      !this.hasTriggeredBossDialogue &&
      this.player.x >= 240
    ) {
      this.hasTriggeredBossDialogue = true;
      this.queueDialogue([
        {
          id: 'dlg-boss-yosuke',
          speaker: 'yosuke',
          speakerName: 'YOSUKE',
          speakerTitle: 'GUERRERO ESPADACHÍN',
          text: 'No sé quién eres, mas me estorbas.',
          portrait: 'yosuke_grim',
          duration: 4.5,
        },
        {
          id: 'dlg-boss-malakor',
          speaker: 'malakor',
          speakerName: 'MALAKOR',
          speakerTitle: 'SEÑOR DEL ABISMO DEMONÍACO',
          text: 'Un simple mortal no desafía al Señor del Abismo... Tu sangre alimentará mi reino.',
          portrait: 'malakor_menacing',
          duration: 5.0,
        },
      ]);
    }

    // 1. Process Player Input & State
    this.updatePlayerMovementAndCombat(dt);

    // 2. Update Stamina & Combo
    const isDashing = this.player.action === 'dash';
    updatePlayerStamina(this.stats, dt, isDashing);

    // 3. Update Enemies
    this.updateEnemies(dt);

    // 4. Update Boss if present
    if (this.boss) {
      this.updateBoss(dt);
    }

    // 5. Update Particles
    this.updateParticles(dt);

    // 6. Update Damage Numbers
    this.updateDamageNumbers(dt);

    // 7. Check Stage Clear transition
    if (!this.level.isBossStage && this.player.x >= this.level.stageClearX) {
      this.advanceToNextLevel();
    }

    // Notify UI of stats change
    if (this.onStatsChange) {
      this.onStatsChange(this.stats);
    }
  }

  private advanceToNextLevel(): void {
    const nextIdx = this.currentLevelIndex + 1;
    if (nextIdx < LEVELS.length) {
      this.initLevel(nextIdx);
      this.triggerLevelStartDialogue(nextIdx);
    }
  }

  // --- PLAYER COMBAT & MOVEMENT ---

  private updatePlayerMovementAndCombat(dt: number): void {
    const p = this.player;

    // Timers
    if (p.invulnerabilityTimer > 0) {
      p.invulnerabilityTimer -= dt;
      if (p.invulnerabilityTimer <= 0) p.isInvulnerable = false;
    }
    if (p.hitFlashTimer > 0) p.hitFlashTimer -= dt;
    if (p.counterWindowTimer > 0) p.counterWindowTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    p.actionTimer += dt;

    // Input flags
    const wantsUp = this.isInputHeld('up');
    const wantsDown = this.isInputHeld('down');
    const wantsLeft = this.isInputHeld('left');
    const wantsRight = this.isInputHeld('right');
    const wantsJump = this.isInputJustPressed('jump');
    const wantsLight = this.isInputJustPressed('lightAttack');
    const wantsHeavy = this.isInputJustPressed('heavyAttack');
    const wantsDash = this.isInputJustPressed('dash');
    const wantsBlock = this.isInputHeld('block');
    const justBlocked = this.isInputJustPressed('block');
    const wantsInteract = this.isInputJustPressed('interact');

    // Handle Checkpoint Interaction
    if (wantsInteract) {
      for (const cp of this.level.checkpoints) {
        if (!cp.activated && Math.abs(p.x - cp.x) < 50 && Math.abs(p.y - cp.y) < 60) {
          cp.activated = true;
          this.stats.hp = this.stats.maxHp;
          this.stats.stamina = this.stats.maxStamina;
          audio.playCheckpoint();
          this.spawnParticleRing(cp.x, cp.y - 35, '#38bdf8', 25);
          this.addDamageNumber(cp.x, cp.y - 65, 'SANCTUARY SAVED', '#38bdf8', true);
        }
      }
    }

    // Jump Buffering & Coyote Time
    if (p.isGrounded) {
      this.coyoteTimer = 0.12;
      p.hasAirDashed = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (wantsJump) {
      this.jumpBufferTimer = 0.12;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // --- ACTIONS PRIORITY ---

    // 0. ACTIVE DASH DURATION LIMIT
    if (p.action === 'dash') {
      if (p.actionTimer >= this.DASH_DURATION) {
        p.vx *= 0.25;
        if (p.vy < 0) {
          p.vy *= 0.35;
        }
        p.action = p.isGrounded ? (wantsLeft || wantsRight ? 'run' : 'idle') : 'fall';
        p.actionTimer = 0;
      }
    }

    // 1. MULTI-DIRECTIONAL DASH (Left, Right, Up, Down, Diagonals)
    const canAirDash = p.isGrounded || !p.hasAirDashed;
    if (
      wantsDash &&
      p.action !== 'dash' &&
      p.action !== 'defeat' &&
      p.dashCooldown <= 0 &&
      canAirDash &&
      this.stats.stamina >= STAMINA_DASH_COST
    ) {
      this.stats.stamina -= STAMINA_DASH_COST;
      p.action = 'dash';
      p.actionTimer = 0;
      p.dashCooldown = 0.6;
      p.isInvulnerable = true;
      p.invulnerabilityTimer = 0.22; // i-frames
      this.activePlayerHitbox = null;

      let dirX = (wantsRight ? 1 : 0) - (wantsLeft ? 1 : 0);
      let dirY = (wantsDown ? 1 : 0) - (wantsUp ? 1 : 0);

      // If airborne and holding Jump (Space) with no vertical key, allow dashing upward
      if (!p.isGrounded && dirY === 0 && dirX === 0 && this.isInputHeld('jump')) {
        dirY = -1;
      }

      // Prevent dashing downward into the floor when already grounded
      if (p.isGrounded && dirY > 0) {
        dirY = 0;
      }

      // Default to horizontal facing direction if no directional input is held
      if (dirX === 0 && dirY === 0) {
        dirX = p.facing;
      }

      if (dirX !== 0) {
        p.facing = dirX > 0 ? 1 : -1;
      }

      const mag = Math.hypot(dirX, dirY) || 1;
      const nx = dirX / mag;
      const ny = dirY / mag;

      p.vx = nx * this.DASH_SPEED;
      p.vy = ny * this.DASH_SPEED;

      if (ny < 0) {
        p.isGrounded = false;
      }
      if (!p.isGrounded) {
        p.hasAirDashed = true;
      }

      audio.playDash();
      this.spawnDashAfterimages(p.x, p.y, nx, ny);
    }

    // 2. BLOCK & PARRY
    if (justBlocked) {
      p.action = 'parry';
      p.actionTimer = 0;
      p.blockDuration = 0;
      p.vx *= 0.2;
    } else if (wantsBlock && (p.action === 'block' || p.action === 'parry')) {
      p.blockDuration += dt;
      if (p.blockDuration > PARRY_WINDOW_SECONDS) {
        p.action = 'block';
      }
      p.vx *= 0.5;
    } else if (!wantsBlock && (p.action === 'block' || p.action === 'parry')) {
      p.action = 'idle';
      p.blockDuration = 0;
    }

    // 3. COUNTERATTACK (After successful parry)
    if (p.counterWindowTimer > 0 && (wantsLight || wantsHeavy)) {
      p.counterWindowTimer = 0;
      p.action = 'counter';
      p.actionTimer = 0;
      p.vx = p.facing * 420;
      audio.playSwordSwing('counter');
      this.triggerHitbox('counter', true);
      this.stats.counterCount++;
      return;
    }

    // 4. ATTACKS
    const isAttackAction = (act: PlayerAction) =>
      act.startsWith('light_attack') ||
      act === 'heavy_attack' ||
      act === 'air_attack' ||
      act === 'air_heavy' ||
      act === 'counter';

    if (p.action === 'hurt' && p.actionTimer >= 0.35) {
      p.action = p.isGrounded ? 'idle' : 'fall';
    }

    if (this.comboChainTimer > 0) {
      this.comboChainTimer = Math.max(0, this.comboChainTimer - dt);
      if (this.comboChainTimer <= 0) {
        this.lastComboAction = 'idle';
      }
    }

    let isAttacking = isAttackAction(p.action);

    if (isAttacking) {
      // Allow chaining into the next light combo step after minimum swing time
      if (
        p.isGrounded &&
        p.action.startsWith('light_attack') &&
        p.actionTimer >= 0.09 &&
        wantsLight
      ) {
        p.action = getNextComboAction(p.action, false);
        this.lastComboAction = p.action;
        this.comboChainTimer = 0.55;
        p.actionTimer = 0;
        p.vx = p.facing * 95;
        audio.playSwordSwing('light');
        this.triggerHitbox(p.action, false);
      } else {
        // Check if current attack animation finished
        const attackDuration =
          p.action === 'heavy_attack' || p.action === 'air_heavy'
            ? 0.38
            : p.action === 'counter'
            ? 0.35
            : 0.28;

        if (p.isGrounded) {
          p.vx *= 0.86;
        }

        if (p.actionTimer >= attackDuration) {
          p.action = p.isGrounded ? 'idle' : 'fall';
          this.activePlayerHitbox = null;
          isAttacking = false;
        }
      }
    } else if (
      p.action !== 'block' &&
      p.action !== 'parry' &&
      p.action !== 'dash' &&
      p.action !== 'hurt' &&
      p.action !== 'defeat'
    ) {
      // Can initiate attack
      if (wantsLight) {
        const baseAction =
          p.isGrounded && this.comboChainTimer > 0 ? this.lastComboAction : p.action;
        p.action = getNextComboAction(baseAction, !p.isGrounded);
        if (p.isGrounded) {
          this.lastComboAction = p.action;
          this.comboChainTimer = 0.55;
        }
        p.actionTimer = 0;
        p.vx = p.isGrounded ? p.facing * 90 : p.vx;
        audio.playSwordSwing(p.isGrounded ? 'light' : 'air');
        this.triggerHitbox(p.action, false);
        isAttacking = true;
      } else if (wantsHeavy && this.stats.stamina >= STAMINA_HEAVY_COST) {
        this.stats.stamina -= STAMINA_HEAVY_COST;
        p.action = p.isGrounded ? 'heavy_attack' : 'air_heavy';
        this.lastComboAction = 'idle';
        this.comboChainTimer = 0;
        p.actionTimer = 0;
        p.vx = p.isGrounded ? p.facing * 120 : p.vx;
        if (!p.isGrounded) p.vy = 400; // Diving strike
        audio.playSwordSwing('heavy');
        this.triggerHitbox(p.action, false);
        isAttacking = true;
      }
    }

    // 5. JUMP
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !isAttacking && p.action !== 'dash') {
      p.vy = this.JUMP_VELOCITY;
      p.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      p.action = 'jump';
      audio.playJump();
      this.spawnDustPuff(p.x, p.y);
    }

    // Variable jump cut (only applies to normal jumps, not upward dashes)
    if (!this.isInputHeld('jump') && p.vy < -150 && p.action !== 'dash') {
      p.vy *= 0.55;
    }

    // 6. HORIZONTAL MOVEMENT
    if (
      p.action !== 'dash' &&
      !isAttacking &&
      p.action !== 'block' &&
      p.action !== 'parry' &&
      p.action !== 'hurt' &&
      p.action !== 'defeat'
    ) {
      if (wantsLeft && !wantsRight) {
        p.vx = -this.MOVE_SPEED;
        p.facing = -1;
        if (p.isGrounded) p.action = 'run';
      } else if (wantsRight && !wantsLeft) {
        p.vx = this.MOVE_SPEED;
        p.facing = 1;
        if (p.isGrounded) p.action = 'run';
      } else {
        p.vx *= 0.65;
        if (p.isGrounded) p.action = 'idle';
      }
    }

    // 7. GRAVITY & PHYSICS INTEGRATION
    if (p.action !== 'dash') {
      p.vy += this.GRAVITY * dt;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Platform collisions
    this.resolvePlatformCollisions(dt);

    // Keep within level bounds
    p.x = Math.max(20, Math.min(this.level.bounds.width - 20, p.x));

    // Bottom pit check
    if (p.y > this.level.bounds.height + 50) {
      this.handlePlayerDeath();
    }
  }

  private resolvePlatformCollisions(dt: number): void {
    const p = this.player;
    const playerBox: Rect = {
      x: p.x - p.width / 2,
      y: p.y - p.height,
      w: p.width,
      h: p.height,
    };

    let wasGrounded = p.isGrounded;
    p.isGrounded = false;

    for (const plat of this.level.platforms) {
      if (!rectsOverlap(playerBox, plat)) continue;

      if (plat.isHazard) {
        if (!p.isInvulnerable) {
          this.damagePlayer(40, 'hazard');
          p.vy = -350;
        }
        continue;
      }

      // One-way platform: only land on top when falling downwards
      if (plat.isOneWay) {
        const prevY = p.y - p.vy * dt;
        if (p.vy > 0 && prevY <= plat.y + 4) {
          p.y = plat.y;
          p.vy = 0;
          p.isGrounded = true;
          p.hasAirDashed = false;
          if (!wasGrounded) audio.playLand();
        }
        continue;
      }

      // Solid platform collision resolution
      const overlapLeft = playerBox.x + playerBox.w - plat.x;
      const overlapRight = plat.x + plat.w - playerBox.x;
      const overlapTop = playerBox.y + playerBox.h - plat.y;
      const overlapBottom = plat.y + plat.h - playerBox.y;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop && p.vy >= 0) {
        p.y = plat.y;
        p.vy = 0;
        p.isGrounded = true;
        p.hasAirDashed = false;
        if (!wasGrounded) audio.playLand();
      } else if (minOverlap === overlapBottom && p.vy < 0) {
        p.y = plat.y + plat.h + p.height;
        p.vy = 0;
      } else if (minOverlap === overlapLeft && p.vx > 0) {
        p.x = plat.x - p.width / 2;
        p.vx = 0;
      } else if (minOverlap === overlapRight && p.vx < 0) {
        p.x = plat.x + plat.w + p.width / 2;
        p.vx = 0;
      }
    }
  }

  // --- HITBOX TRIGGER & RESOLUTION ---

  private triggerHitbox(action: PlayerAction, isCounter: boolean): void {
    const p = this.player;
    const hitData = calculatePlayerHit(action, isCounter, p.facing);

    const hitWidth = isCounter ? 90 : action === 'heavy_attack' ? 75 : 55;
    const hitHeight = action === 'air_heavy' ? 70 : 45;

    const hitRect: Rect = {
      x: p.facing === 1 ? p.x : p.x - hitWidth,
      y: p.y - p.height * 0.75,
      w: hitWidth,
      h: hitHeight,
    };

    this.activePlayerHitbox = {
      id: `p-hit-${Date.now()}`,
      source: 'player',
      rect: hitRect,
      damage: hitData.damage,
      stagger: hitData.enemyStaggerDuration,
      knockback: hitData.knockback,
      canCounter: isCounter,
    };

    // Check hit against destructibles
    for (const prop of this.level.destructibles) {
      if (!prop.destroyed && rectsOverlap(hitRect, prop)) {
        prop.destroyed = true;
        this.spawnPropDebris(prop.x + prop.w / 2, prop.y + prop.h / 2, prop.type);
        audio.playHit('flesh');
        // Drop spirit / health essence
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 20);
        this.stats.spirit = Math.min(this.stats.maxSpirit, this.stats.spirit + 25);
        this.addDamageNumber(prop.x, prop.y, '+20 HP', '#10b981');
      }
    }

    // Check hit against normal enemies
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;

      const enemyRect: Rect = {
        x: enemy.x - enemy.width / 2,
        y: enemy.y - enemy.height,
        w: enemy.width,
        h: enemy.height,
      };

      if (rectsOverlap(hitRect, enemyRect)) {
        this.applyPlayerHitToEnemy(enemy, hitData, isCounter);
      }
    }

    // Check hit against Giant Boss
    if (this.boss && this.boss.isVulnerable) {
      const bossCoreRect: Rect = {
        x: this.boss.x - 70,
        y: this.boss.y - 200,
        w: 140,
        h: 180,
      };

      if (rectsOverlap(hitRect, bossCoreRect)) {
        this.applyPlayerHitToBoss(hitData, isCounter);
      }
    }
  }

  private applyPlayerHitToEnemy(
    enemy: Enemy,
    hitData: ReturnType<typeof calculatePlayerHit>,
    isCounter: boolean
  ): void {
    // If enemy is blocking, check guard (and trigger tactical counter-riposte cooldown reduction)
    if (enemy.isBlocking && !isCounter && hitData.damage < 60) {
      audio.playHit('block');
      this.hitstopTimer = 0.04;
      this.screenShakeRequest = 3;
      enemy.isBlocking = false;
      enemy.attackCooldown = 0.12; // Immediate tactical riposte after blocking!
      this.spawnSparks(enemy.x, enemy.y - enemy.height / 2, 8, '#f59e0b');
      this.addDamageNumber(enemy.x, enemy.y - enemy.height, 'BLOCKED', '#94a3b8');
      return;
    }

    // Heavy Demon Hyper-Armor (Poise) during windup: light attacks deal reduced damage without interrupting windup
    const hasHyperArmor =
      enemy.type === 'heavy_demon' &&
      enemy.state === 'windup' &&
      !isCounter &&
      hitData.damage < 60;

    const finalDamage = hasHyperArmor ? Math.round(hitData.damage * 0.7) : hitData.damage;
    enemy.hp -= finalDamage;
    enemy.hitFlashTimer = 0.08;

    if (!hasHyperArmor) {
      enemy.vx = hitData.knockback.x;
      enemy.vy = hitData.knockback.y;
      enemy.state = 'hurt';
      enemy.stateTimer = 0;
      enemy.isBlocking = false;
    } else {
      this.addDamageNumber(enemy.x, enemy.y - enemy.height - 28, 'POISE!', '#f59e0b');
    }

    // Hitstop & Juice
    this.hitstopTimer = hitData.hitstopDuration;
    this.screenShakeRequest = hitData.screenShake;
    audio.playHit(isCounter || hitData.isCrit ? 'crit' : 'flesh');

    // Stats & Combo
    this.stats.comboCount++;
    this.stats.comboTimer = 1.6;
    this.stats.spirit = Math.min(this.stats.maxSpirit, this.stats.spirit + hitData.spiritGained);
    this.stats.score += hitData.damage * 10;

    const currentCombo = this.stats.comboCount;
    const tierData = getComboVisualTier(currentCombo);

    // Spawn blood & spark particles with tier-accented sparks
    this.spawnBloodParticles(enemy.x, enemy.y - enemy.height / 2, 14);
    this.spawnSparks(enemy.x, enemy.y - enemy.height / 2, 10, isCounter ? '#ef4444' : tierData.color);

    // Damage Number with world-space pop and scatter
    const textColor = isCounter ? '#ef4444' : hitData.isCrit ? '#f59e0b' : tierData.color;
    const scatterX = enemy.x + (Math.random() * 26 - 13);
    const scatterY = enemy.y - enemy.height - 12 + (Math.random() * 8 - 4);
    const displayText = currentCombo >= 5 ? `${hitData.damage} • ${currentCombo}x` : `${hitData.damage}`;

    this.addDamageNumber(
      scatterX,
      scatterY,
      displayText,
      textColor,
      hitData.isCrit,
      tierData.scale,
      tierData.tier,
      currentCombo,
      tierData.shadowColor,
      tierData.vy
    );

    // Milestone announcement banner in world-space on reaching a new tier threshold
    if (currentCombo === 5 || currentCombo === 10 || currentCombo === 15) {
      const bannerSymbol = currentCombo === 15 ? '☠' : currentCombo === 10 ? '⚡' : '✦';
      this.addDamageNumber(
        enemy.x,
        enemy.y - enemy.height - 38,
        `${bannerSymbol} ${tierData.label} ${bannerSymbol}`,
        tierData.color,
        true,
        tierData.scale * 1.15,
        tierData.tier,
        currentCombo,
        tierData.shadowColor,
        tierData.vy - 15
      );
    }

    // Death check
    if (enemy.hp <= 0) {
      enemy.state = 'dead';
      enemy.stateTimer = 0;
      this.spawnDeathBurst(enemy.x, enemy.y - enemy.height / 2);
    }
  }

  private applyPlayerHitToBoss(
    hitData: ReturnType<typeof calculatePlayerHit>,
    isCounter: boolean
  ): void {
    if (!this.boss) return;

    this.boss.hp = Math.max(0, this.boss.hp - hitData.damage);
    this.boss.hitFlashTimer = 0.08;

    this.hitstopTimer = hitData.hitstopDuration;
    this.screenShakeRequest = hitData.screenShake * 1.5;
    audio.playHit(isCounter || hitData.isCrit ? 'crit' : 'heavy');

    this.stats.comboCount++;
    this.stats.comboTimer = 1.6;
    this.stats.spirit = Math.min(this.stats.maxSpirit, this.stats.spirit + hitData.spiritGained);
    this.stats.score += hitData.damage * 25;

    const currentCombo = this.stats.comboCount;
    const tierData = getComboVisualTier(currentCombo);

    this.spawnSparks(this.boss.x, this.boss.y - 120, 20, isCounter ? '#ef4444' : tierData.color);

    const scatterX = this.boss.x - 30 + Math.random() * 60;
    const scatterY = this.boss.y - 180 + (Math.random() * 12 - 6);
    const textColor = isCounter ? '#ef4444' : hitData.isCrit ? '#f59e0b' : tierData.color;
    const displayText = currentCombo >= 5 ? `${hitData.damage} • ${currentCombo}x` : `${hitData.damage}`;

    this.addDamageNumber(
      scatterX,
      scatterY,
      displayText,
      textColor,
      hitData.isCrit,
      tierData.scale,
      tierData.tier,
      currentCombo,
      tierData.shadowColor,
      tierData.vy
    );

    if (currentCombo === 5 || currentCombo === 10 || currentCombo === 15) {
      const bannerSymbol = currentCombo === 15 ? '☠' : currentCombo === 10 ? '⚡' : '✦';
      this.addDamageNumber(
        this.boss.x,
        this.boss.y - 215,
        `${bannerSymbol} ${tierData.label} ${bannerSymbol}`,
        tierData.color,
        true,
        tierData.scale * 1.15,
        tierData.tier,
        currentCombo,
        tierData.shadowColor,
        tierData.vy - 15
      );
    }

    // Phase Transitions for Final Boss
    if (this.boss.phase === 1 && this.boss.hp <= this.boss.maxHp * 0.66) {
      this.boss.phase = 2;
      audio.playBossRoar();
      this.screenShakeRequest = 18;
      this.addDamageNumber(this.boss.x, this.boss.y - 240, 'PHASE II: SUPERNATURAL FURY', '#ef4444', true);
    } else if (this.boss.phase === 2 && this.boss.hp <= this.boss.maxHp * 0.25) {
      this.boss.phase = 3;
      audio.playBossRoar();
      this.screenShakeRequest = 22;
      this.addDamageNumber(this.boss.x, this.boss.y - 240, 'PHASE III: CATACLYSMIC SURGE', '#f43f5e', true);
    } else if (this.boss.phase === 3 && this.boss.hp <= this.boss.maxHp * 0.08) {
      // Trigger Scripted Prologue Narrative Defeat
      this.triggerScriptedDefeatSequence();
    }
  }

  // --- ENEMIES UPDATE & TACTICAL AI ---

  private createEnemy(type: Enemy['type'], x: number, y: number, id: string): Enemy {
    const isWarrior = type === 'demon_warrior';
    const isHeavy = type === 'heavy_demon';
    const isAgile = type === 'agile_demon';
    const diffCfg = getDifficultyConfig(this.difficulty);

    const baseHp = isHeavy ? 280 : isWarrior ? 160 : isAgile ? 110 : 80;
    const scaledHp = Math.round(baseHp * diffCfg.hpMult);
    const baseAggro = isAgile ? 440 : 350;

    return {
      id,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      facing: -1,
      width: isHeavy ? 44 : isWarrior ? 36 : isAgile ? 26 : 38,
      height: isHeavy ? 68 : isWarrior ? 56 : isAgile ? 46 : 42,
      hp: scaledHp,
      maxHp: scaledHp,
      state: 'patrol',
      stateTimer: 0,
      isGrounded: true,
      isBlocking: false,
      isInvulnerable: false,
      invulnerabilityTimer: 0,
      hitFlashTimer: 0,
      activeHitbox: null,
      telegraphTimer: 0,
      telegraphDuration: 0,
      attackCooldown: 0.8 * diffCfg.cooldownMult,
      patrolStartX: x,
      patrolRange: isHeavy ? 120 : 180,
      aggroDistance: Math.round(baseAggro * diffCfg.aggroMult),
      attackDistance: isHeavy ? 95 : isWarrior ? 78 : isAgile ? 95 : 70,
      dodgeCooldown: 0,
      animDistanceTraveled: 0,
    };
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    const diffCfg = getDifficultyConfig(this.difficulty);
    const isPlayerAttacking =
      p.action.startsWith('light_attack') ||
      p.action === 'heavy_attack' ||
      p.action === 'air_attack' ||
      p.action === 'air_heavy';

    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') {
        enemy.stateTimer += dt;
        continue;
      }

      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
      if (enemy.dodgeCooldown && enemy.dodgeCooldown > 0) {
        enemy.dodgeCooldown = Math.max(0, enemy.dodgeCooldown - dt);
      }
      enemy.stateTimer += dt;

      // Distance to player
      const dx = p.x - enemy.x;
      const dist = Math.abs(dx);
      const dy = p.y - enemy.y;

      // Face player if aggroed (unless mid-attack lunge)
      if (dist < enemy.aggroDistance && enemy.state !== 'attack') {
        enemy.facing = dx > 0 ? 1 : -1;
      }

      // State Machine with Tactical Archetype Intelligence
      switch (enemy.state) {
        case 'patrol':
          enemy.isBlocking = false;
          if (dist < enemy.aggroDistance && Math.abs(dy) < 160) {
            enemy.state = 'chase';
            enemy.stateTimer = 0;
          } else {
            // Patrol within range
            const patrolOffset = enemy.x - enemy.patrolStartX;
            if (Math.abs(patrolOffset) > enemy.patrolRange) {
              enemy.facing = patrolOffset > 0 ? -1 : 1;
            }
            enemy.vx = enemy.facing * 65 * diffCfg.speedMult;
          }
          break;

        case 'chase': {
          if (dist > enemy.aggroDistance * 1.35) {
            enemy.state = 'patrol';
            enemy.stateTimer = 0;
            enemy.isBlocking = false;
            break;
          }

          // TACTICAL AI 1: Agile Demon Evasive Backstep when player swings nearby
          if (
            enemy.type === 'agile_demon' &&
            enemy.isGrounded &&
            isPlayerAttacking &&
            dist < 115 &&
            (enemy.dodgeCooldown ?? 0) <= 0
          ) {
            enemy.vx = -enemy.facing * 310 * diffCfg.speedMult;
            enemy.vy = -175;
            enemy.isGrounded = false;
            enemy.dodgeCooldown = 2.0 * diffCfg.cooldownMult;
            enemy.attackCooldown = 0.1; // Ready to counter-lunge upon landing
            this.spawnDustPuff(enemy.x, enemy.y);
            break;
          }

          // TACTICAL AI 2: Demon Warrior Reactive Shield Guard when player attacks
          if (
            enemy.type === 'demon_warrior' &&
            isPlayerAttacking &&
            dist < 135 &&
            p.action !== 'heavy_attack' &&
            p.action !== 'air_heavy'
          ) {
            const guardChance =
              this.difficulty === 'nightmare' ? 0.9 : this.difficulty === 'hard' ? 0.75 : 0.5;
            if (enemy.isBlocking || Math.random() < guardChance) {
              enemy.isBlocking = true;
              enemy.vx = 0;
              break;
            }
          }

          // TACTICAL AI 3: Vertical Platform Pursuit Jump (leap up toward player on elevated platforms)
          if (
            enemy.isGrounded &&
            enemy.type !== 'heavy_demon' &&
            dy < -55 &&
            dy > -190 &&
            dist < 190 &&
            (enemy.dodgeCooldown ?? 0) <= 0
          ) {
            const hasOverheadPlatform = this.level.platforms.some(
              (plat) =>
                !plat.isHazard &&
                plat.y < enemy.y - 40 &&
                plat.y >= enemy.y - 180 &&
                enemy.x + enemy.facing * 40 >= plat.x &&
                enemy.x + enemy.facing * 40 <= plat.x + plat.w
            );
            if (hasOverheadPlatform) {
              enemy.vy = -500;
              enemy.isGrounded = false;
              enemy.dodgeCooldown = 1.6;
              this.spawnDustPuff(enemy.x, enemy.y);
            }
          }

          if (dist <= enemy.attackDistance && Math.abs(dy) < 75 && enemy.attackCooldown <= 0) {
            // Initiate attack windup telegraph scaled by difficulty
            enemy.state = 'windup';
            enemy.stateTimer = 0;
            enemy.vx = 0;
            enemy.isBlocking = false;
            const baseWindup =
              enemy.type === 'heavy_demon'
                ? 0.72
                : enemy.type === 'agile_demon'
                ? 0.34
                : 0.44;
            enemy.telegraphDuration = Math.max(0.22, baseWindup * diffCfg.windupMult);
            enemy.telegraphTimer = enemy.telegraphDuration;
            enemy.telegraphType = enemy.type === 'heavy_demon' ? 'unblockable' : 'normal';
          } else {
            // Move toward player with pack spacing so multiple enemies don't stack on 1 pixel
            const baseSpeed =
              enemy.type === 'agile_demon'
                ? 225
                : enemy.type === 'heavy_demon'
                ? 85
                : enemy.type === 'demon_warrior'
                ? 150
                : 140;

            let moveVx = enemy.facing * baseSpeed * diffCfg.speedMult;

            // Pack separation force
            for (const other of this.enemies) {
              if (other.id !== enemy.id && other.state !== 'dead' && Math.abs(other.y - enemy.y) < 30) {
                const sepX = enemy.x - other.x;
                if (Math.abs(sepX) < 30) {
                  moveVx += (sepX >= 0 ? 1 : -1) * 55;
                }
              }
            }

            enemy.vx = moveVx;

            // Demon Warrior cautious shield stance while closing distance
            if (enemy.type === 'demon_warrior' && dist < 125 && enemy.attackCooldown > 0.35) {
              enemy.isBlocking = true;
              enemy.vx *= 0.45;
            } else {
              enemy.isBlocking = false;
            }
          }
          break;
        }

        case 'windup':
          enemy.telegraphTimer -= dt;
          enemy.vx *= 0.7;
          if (enemy.telegraphTimer <= 0) {
            // Execute attack!
            enemy.state = 'attack';
            enemy.stateTimer = 0;
            this.executeEnemyAttack(enemy);
          }
          break;

        case 'attack':
          enemy.vx *= 0.88;
          if (enemy.activeHitbox) {
            const hitW = enemy.activeHitbox.rect.w;
            enemy.activeHitbox.rect.x = enemy.facing === 1 ? enemy.x : enemy.x - hitW;
            enemy.activeHitbox.rect.y = enemy.y - enemy.height * 0.8;
          }
          if (enemy.stateTimer > 0.38) {
            enemy.state = 'chase';
            enemy.stateTimer = 0;
            const baseCooldown =
              enemy.type === 'heavy_demon'
                ? 1.9
                : enemy.type === 'agile_demon'
                ? 0.85
                : 1.15;
            enemy.attackCooldown = baseCooldown * diffCfg.cooldownMult;
            enemy.activeHitbox = null;
          }
          break;

        case 'hurt':
        case 'staggered':
          enemy.vx *= 0.85;
          enemy.isBlocking = false;
          if (enemy.stateTimer > 0.48) {
            enemy.state = 'chase';
            enemy.stateTimer = 0;
          }
          break;
      }

      // Ledge check during patrol/chase: patrol turns around; chasing agile/warrior enemies can leap across chasms!
      if (enemy.isGrounded && (enemy.state === 'patrol' || enemy.state === 'chase') && enemy.vx !== 0) {
        const stepDir = enemy.vx > 0 ? 1 : -1;
        const nextFootX = enemy.x + enemy.vx * dt + stepDir * 16;
        const hasGroundAhead = this.level.platforms.some(
          (plat) =>
            !plat.isHazard &&
            nextFootX >= plat.x &&
            nextFootX <= plat.x + plat.w &&
            Math.abs(enemy.y - plat.y) <= 20
        );
        if (!hasGroundAhead) {
          if (enemy.state === 'patrol') {
            enemy.facing = (enemy.facing * -1) as 1 | -1;
            enemy.vx = enemy.facing * 65 * diffCfg.speedMult;
          } else {
            // Check if there is a platform across the 96px chasm to leap onto!
            const landingX = enemy.x + stepDir * 125;
            const canLeapChasm =
              enemy.type !== 'heavy_demon' &&
              dist > 70 &&
              dist < 280 &&
              this.level.platforms.some(
                (plat) =>
                  !plat.isHazard &&
                  landingX >= plat.x &&
                  landingX <= plat.x + plat.w &&
                  Math.abs(enemy.y - plat.y) <= 24
              );
            if (canLeapChasm) {
              enemy.vy = -450;
              enemy.vx = stepDir * 270;
              enemy.isGrounded = false;
              this.spawnDustPuff(enemy.x, enemy.y);
            } else {
              enemy.vx = 0;
            }
          }
        }
      }

      // Gravity and basic horizontal integration
      enemy.vy += this.GRAVITY * dt;
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;

      // Track distance traveled by velocity vector for footstep/animation synchronization
      if (enemy.animDistanceTraveled !== undefined) {
        enemy.animDistanceTraveled += Math.abs(enemy.vx) * dt;
      } else {
        enemy.animDistanceTraveled = Math.abs(enemy.vx) * dt;
      }

      // Enemy platform landing & spike hazard check
      enemy.isGrounded = false;
      for (const plat of this.level.platforms) {
        if (plat.isHazard) {
          const enemyRect: Rect = {
            x: enemy.x - enemy.width / 2,
            y: enemy.y - enemy.height,
            w: enemy.width,
            h: enemy.height,
          };
          if (rectsOverlap(enemyRect, plat)) {
            enemy.hp = 0;
            enemy.state = 'dead';
            enemy.stateTimer = 0;
            this.spawnDeathBurst(enemy.x, enemy.y - enemy.height / 2);
          }
          continue;
        }
        if (
          enemy.x > plat.x &&
          enemy.x < plat.x + plat.w &&
          enemy.y >= plat.y &&
          enemy.y <= plat.y + 25 &&
          enemy.vy >= 0
        ) {
          enemy.y = plat.y;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }
      }

      // Check if enemy active hitbox hits player
      if (enemy.activeHitbox) {
        const playerRect: Rect = {
          x: p.x - p.width / 2,
          y: p.y - p.height,
          w: p.width,
          h: p.height,
        };

        if (rectsOverlap(enemy.activeHitbox.rect, playerRect)) {
          this.resolveEnemyHitOnPlayer(enemy, enemy.activeHitbox);
          enemy.activeHitbox = null; // Single hit
        }
      }
    }
  }

  private executeEnemyAttack(enemy: Enemy): void {
    const isHeavy = enemy.type === 'heavy_demon';
    const isAgile = enemy.type === 'agile_demon';
    const isWarrior = enemy.type === 'demon_warrior';
    const isUnblockable = isHeavy;
    const diffCfg = getDifficultyConfig(this.difficulty);

    // Forward lunge momentum per enemy archetype
    if (isAgile) {
      enemy.vx = enemy.facing * 330 * diffCfg.speedMult;
    } else if (isWarrior) {
      enemy.vx = enemy.facing * 200 * diffCfg.speedMult;
    } else if (!isHeavy) {
      // Basic monster / ghoul pounce
      enemy.vx = enemy.facing * 210 * diffCfg.speedMult;
      if (enemy.isGrounded) {
        enemy.vy = -100;
        enemy.isGrounded = false;
      }
    }

    const hitW = isHeavy ? 80 : isWarrior ? 62 : 55;
    const hitH = isHeavy ? 60 : 42;
    const baseDamage = isHeavy ? 45 : isWarrior ? 28 : isAgile ? 26 : 22;
    const scaledDamage = Math.round(baseDamage * diffCfg.damageMult);

    enemy.activeHitbox = {
      id: `e-hit-${enemy.id}`,
      source: 'enemy',
      rect: {
        x: enemy.facing === 1 ? enemy.x : enemy.x - hitW,
        y: enemy.y - enemy.height * 0.8,
        w: hitW,
        h: hitH,
      },
      damage: scaledDamage,
      stagger: isHeavy ? 0.8 : 0.4,
      knockback: { x: enemy.facing * (isHeavy ? 350 : 210), y: -140 },
      unblockable: isUnblockable,
      isParryable: !isUnblockable,
    };

    if (isHeavy) {
      audio.playShockwave();
      this.screenShakeRequest = 8;
    } else {
      audio.playSwordSwing('heavy');
    }
  }

  private resolveEnemyHitOnPlayer(enemy: Enemy, hitbox: Hitbox): void {
    const p = this.player;

    const resolution = resolveIncomingAttack(hitbox, {
      action: p.action,
      blockDuration: p.blockDuration,
      isInvulnerable: p.isInvulnerable,
    });

    if (resolution.result === 'dodged_invulnerable') {
      // Safely passed through with dash i-frames!
      this.addDamageNumber(p.x, p.y - p.height, 'DODGED', '#38bdf8');
      return;
    }

    if (resolution.result === 'parried') {
      // ICONIC PARRY SUCCESS!
      this.stats.parrySuccessCount++;
      this.stats.spirit = Math.min(this.stats.maxSpirit, this.stats.spirit + 35);
      p.counterWindowTimer = 1.0; // 1 second to unleash counterattack
      this.hitstopTimer = resolution.hitstop;
      this.screenShakeRequest = resolution.screenShake;
      audio.playParry();

      // Enemy gets stunned
      enemy.state = 'staggered';
      enemy.stateTimer = 0;
      enemy.vx = -enemy.facing * 140;

      // Visual fanfare
      this.spawnParticleRing(p.x + p.facing * 18, p.y - p.height * 0.6, '#38bdf8', 25);
      this.addDamageNumber(p.x, p.y - p.height - 15, 'PARRY!', '#38bdf8', true);
      return;
    }

    if (resolution.result === 'blocked') {
      // Guard held, damage reduced
      this.stats.hp = Math.max(0, this.stats.hp - resolution.damageTaken);
      this.stats.stamina = Math.max(0, this.stats.stamina - 20);
      this.hitstopTimer = resolution.hitstop;
      this.screenShakeRequest = resolution.screenShake;
      audio.playHit('block');
      p.vx = hitbox.knockback.x * 0.4;
      this.spawnSparks(p.x + p.facing * 10, p.y - p.height * 0.6, 12, '#f59e0b');
      this.addDamageNumber(p.x, p.y - p.height, `-${resolution.damageTaken} (BLOCKED)`, '#f59e0b');

      if (this.stats.hp <= 0) {
        this.handlePlayerDeath();
      }
      return;
    }

    // Direct hit taken
    this.damagePlayer(resolution.damageTaken, 'enemy', hitbox.knockback);
  }

  public damagePlayer(amount: number, source: string, knockback?: { x: number; y: number }): void {
    const p = this.player;
    if (p.isInvulnerable) return;

    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.stats.comboCount = 0; // combo broke
    p.hitFlashTimer = 0.12;
    p.isInvulnerable = true;
    p.invulnerabilityTimer = 0.6; // post-hit recovery
    p.action = 'hurt';
    p.actionTimer = 0;

    if (knockback) {
      p.vx = knockback.x;
      p.vy = knockback.y;
    }

    this.hitstopTimer = 0.08;
    this.screenShakeRequest = 10;
    audio.playHit('flesh');
    this.spawnBloodParticles(p.x, p.y - p.height / 2, 18);
    this.addDamageNumber(p.x, p.y - p.height, `-${amount}`, '#ef4444', true);

    if (this.stats.hp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath(): void {
    this.player.action = 'defeat';
    this.player.actionTimer = 0;
    audio.setMusicMode('none');

    // Trigger dying dialogue with Yosuke hurt portrait: "¿Qué rayos...?"
    this.dialogueQueue = [];
    this.activeDialogue = {
      id: 'dlg-player-death',
      speaker: 'yosuke',
      speakerName: 'YOSUKE',
      speakerTitle: 'AGONÍA',
      text: '¿Qué rayos...?',
      portrait: 'yosuke_hurt',
      duration: 3.2,
    };
    if (this.onDialogueUpdate) {
      this.onDialogueUpdate(this.activeDialogue);
    }
  }

  // --- GIANT FINAL BOSS AI & ATTACK CYCLES ---

  private updateBoss(dt: number): void {
    const boss = this.boss;
    if (!boss) return;

    if (boss.hitFlashTimer > 0) boss.hitFlashTimer -= dt;
    boss.actionTimer -= dt;

    const p = this.player;

    // Check boss shockwaves moving across the floor
    for (let i = boss.shockwaves.length - 1; i >= 0; i--) {
      const sw = boss.shockwaves[i];
      sw.x += sw.vx * dt;
      sw.duration -= dt;

      // Collision with player
      const playerRect: Rect = {
        x: p.x - p.width / 2,
        y: p.y - p.height,
        w: p.width,
        h: p.height,
      };

      const swRect: Rect = {
        x: sw.x,
        y: sw.y,
        w: sw.width,
        h: sw.height,
      };

      if (rectsOverlap(playerRect, swRect) && !p.isInvulnerable) {
        // Shockwaves are unblockable (must be jumped over!)
        this.damagePlayer(sw.damage, 'boss_shockwave', { x: -280, y: -240 });
      }

      if (sw.duration <= 0) {
        boss.shockwaves.splice(i, 1);
      }
    }

    // Check boss projectiles
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
      const proj = boss.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.duration -= dt;

      const playerRect: Rect = {
        x: p.x - p.width / 2,
        y: p.y - p.height,
        w: p.width,
        h: p.height,
      };

      const projRect: Rect = {
        x: proj.x - proj.radius,
        y: proj.y - proj.radius,
        w: proj.radius * 2,
        h: proj.radius * 2,
      };

      if (rectsOverlap(playerRect, projRect) && !p.isInvulnerable) {
        this.damagePlayer(proj.damage, 'boss_meteor', { x: -180, y: -160 });
        boss.projectiles.splice(i, 1);
        continue;
      }

      if (proj.duration <= 0 || proj.y >= 620) {
        this.spawnExplosion(proj.x, proj.y);
        boss.projectiles.splice(i, 1);
      }
    }

    // Boss Attack Scheduler
    if (boss.actionTimer <= 0 && boss.phase !== 'scripted_defeat') {
      this.executeBossAttack();
    }

    if (this.onBossUpdate) this.onBossUpdate(this.boss);
  }

  private executeBossAttack(): void {
    const boss = this.boss;
    if (!boss) return;

    const attacks =
      boss.phase === 1
        ? ['slam', 'cleave']
        : boss.phase === 2
        ? ['slam', 'meteor', 'beam']
        : ['slam', 'cleave', 'meteor', 'beam'];

    const pick = attacks[Math.floor(Math.random() * attacks.length)];
    boss.currentAttack = pick;

    if (pick === 'slam') {
      // Tremor Slam: Colossal ground strike launching shockwaves
      boss.actionTimer = 2.4;
      audio.playBossRoar();
      setTimeout(() => {
        if (!this.boss) return;
        this.screenShakeRequest = 18;
        audio.playShockwave();
        // Spawn ground shockwave moving left toward player
        this.boss.shockwaves.push({
          id: `sw-${Date.now()}`,
          x: this.boss.x - 120,
          y: 590,
          vx: -360,
          width: 45,
          height: 35,
          damage: 35,
          duration: 3.5,
        });
      }, 500);
    } else if (pick === 'cleave') {
      // Hellfire Cleave
      boss.actionTimer = 2.2;
      audio.playSwordSwing('heavy');
      setTimeout(() => {
        if (!this.boss) return;
        this.screenShakeRequest = 12;
        // Hitbox across the lower floor
        const playerRect: Rect = {
          x: this.player.x - this.player.width / 2,
          y: this.player.y - this.player.height,
          w: this.player.width,
          h: this.player.height,
        };
        const cleaveRect: Rect = {
          x: this.boss.x - 220,
          y: 540,
          w: 220,
          h: 80,
        };
        if (rectsOverlap(playerRect, cleaveRect) && !this.player.isInvulnerable) {
          this.damagePlayer(40, 'boss_cleave', { x: -350, y: -160 });
        }
      }, 400);
    } else if (pick === 'meteor') {
      // Blood Meteor Rain
      boss.actionTimer = 3.2;
      audio.playMeteor();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (!this.boss) return;
          this.boss.projectiles.push({
            id: `meteor-${Date.now()}-${i}`,
            x: 200 + Math.random() * 800,
            y: 50,
            vx: -50 + Math.random() * 100,
            vy: 320,
            radius: 18,
            damage: 30,
            type: 'meteor',
            duration: 3.0,
          });
        }, i * 350);
      }
    } else if (pick === 'beam') {
      // Abyssal Laser Beam
      boss.actionTimer = 2.8;
      audio.playBeam();
      this.screenShakeRequest = 15;
      setTimeout(() => {
        if (!this.boss) return;
        this.boss.projectiles.push({
          id: `beam-${Date.now()}`,
          x: this.boss.x - 300,
          y: 560,
          vx: 0,
          vy: 0,
          radius: 25,
          damage: 45,
          type: 'beam',
          duration: 0.8,
        });
      }, 600);
    }
  }

  // --- SCRIPTED PROLOGUE ENDING SEQUENCE ---

  public triggerScriptedDefeatSequence(): void {
    if (!this.boss) {
      // In case called outside boss stage, setup minimal boss state
      this.boss = {
        name: 'MALAKOR',
        title: 'Lord of the Demonic Abyss',
        phase: 'scripted_defeat',
        hp: 0,
        maxHp: 1200,
        x: 1150,
        y: 620,
        actionTimer: 0,
        currentAttack: 'cleave',
        hitFlashTimer: 0,
        isVulnerable: false,
        projectiles: [],
        shockwaves: [],
        summonTimer: 0,
        scriptedSequenceStep: 0,
        scriptedTimer: 0,
      };
    } else {
      this.boss.phase = 'scripted_defeat';
    }
    this.state = 'prologue_ending';
    this.setDomState('prologue_ending');
    this.prologueEndingStep = 0;
    this.prologueEndingTimer = 0;
    audio.setMusicMode('ending');
    if (this.onStateChange) this.onStateChange(this.state);
  }

  private updatePrologueEnding(dt: number): void {
    this.prologueEndingTimer += dt;
    const p = this.player;
    const boss = this.boss;

    // Step 0: Yosuke positions for final stance against the towering titan
    if (this.prologueEndingStep === 0) {
      p.x = 880;
      p.y = 620;
      p.facing = 1;
      p.action = 'parry'; // Stance: "Spirit Blade Aegis"
      p.isInvulnerable = true;

      if (this.prologueEndingTimer > 1.2) {
        this.prologueEndingStep = 1;
        this.prologueEndingTimer = 0;
        // Boss initiates Cataclysmic Reckoning
        audio.playBossRoar();
        this.screenShakeRequest = 20;
      }
    }
    // Step 1: The Titanic Clash!
    else if (this.prologueEndingStep === 1) {
      if (this.prologueEndingTimer > 0.8 && this.prologueEndingTimer < 1.0) {
        // Impact hitstop & sparks
        this.hitstopTimer = 0.15;
        this.screenShakeRequest = 25;
        audio.playHit('crit');
        this.spawnSparks(940, 560, 40, '#ffffff');
        this.spawnParticleRing(940, 560, '#f43f5e', 35);
      }

      if (this.prologueEndingTimer > 2.0) {
        this.prologueEndingStep = 2;
        this.prologueEndingTimer = 0;
        // Yosuke is overwhelmed and knocked down
        p.action = 'defeat';
        p.vx = -450;
        p.vy = -180;
        audio.playHit('heavy');
        this.screenShakeRequest = 22;
      }
    }
    // Step 2: Yosuke falls defeated
    else if (this.prologueEndingStep === 2) {
      p.vx *= 0.9;
      p.vy += this.GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y >= 620) {
        p.y = 620;
        p.vy = 0;
        p.vx = 0;
      }

      if (this.prologueEndingTimer > 2.5) {
        this.prologueEndingStep = 3; // Fade to black and show "END OF PROLOGUE"
      }
    }
  }

  // --- PARTICLES & DAMAGE NUMBERS ---

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  private updateDamageNumbers(dt: number): void {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life += dt;
      if (dn.life >= dn.maxLife) {
        this.damageNumbers.splice(i, 1);
        continue;
      }
      dn.y += dn.vy * dt;
    }
  }

  public addDamageNumber(
    x: number,
    y: number,
    text: string,
    color?: string,
    isCrit = false,
    scale?: number,
    tier?: 1 | 2 | 3 | 4,
    comboCount?: number,
    shadowColor?: string,
    vy?: number
  ): void {
    const tierData = getComboVisualTier(comboCount ?? this.stats.comboCount);
    const finalColor = color || (isCrit ? '#f59e0b' : tierData.color);
    const finalScale = scale ?? (isCrit ? Math.max(1.2, tierData.scale) : tierData.scale);
    const finalVy = vy ?? tierData.vy;
    const finalShadow = shadowColor ?? tierData.shadowColor;
    const finalTier = tier ?? tierData.tier;

    this.damageNumbers.push({
      id: `dn-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      vy: finalVy,
      color: finalColor,
      life: 0,
      maxLife: 0.85,
      isCrit,
      scale: finalScale,
      tier: finalTier,
      comboCount,
      shadowColor: finalShadow,
    });
  }

  public spawnSparks(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.2,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        shape: 'spark',
      });
    }
  }

  public spawnBloodParticles(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        size: 3 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#b91c1c' : '#7f1d1d',
        alpha: 1,
        shape: 'circle',
      });
    }
  }

  public spawnParticleRing(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35,
        size: 3,
        color,
        alpha: 1,
        shape: 'spark',
      });
    }
  }

  public spawnDustPuff(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y,
        vx: (Math.random() - 0.5) * 80,
        vy: -20 - Math.random() * 40,
        life: 0,
        maxLife: 0.4,
        size: 4 + Math.random() * 3,
        color: '#64748b',
        alpha: 0.7,
        shape: 'smoke',
      });
    }
  }

  public spawnDashAfterimages(x: number, y: number, dirX: number, dirY: number = 0): void {
    for (let i = 1; i <= 3; i++) {
      this.particles.push({
        x: x - i * 18 * dirX,
        y: y - 24 - i * 18 * dirY,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.22,
        size: 20,
        color: '#dc2626',
        alpha: 0.5 / i,
        shape: 'smoke',
      });
    }
  }

  public spawnDeathBurst(x: number, y: number): void {
    this.spawnBloodParticles(x, y, 25);
    this.spawnSparks(x, y, 15, '#a855f7');
  }

  public spawnExplosion(x: number, y: number): void {
    this.spawnSparks(x, y, 20, '#f97316');
    this.spawnParticleRing(x, y, '#ef4444', 16);
  }

  public spawnPropDebris(x: number, y: number, type: string): void {
    const color = type === 'urn' ? '#b45309' : type === 'lantern' ? '#64748b' : '#78350f';
    this.spawnSparks(x, y, 12, color);
    this.spawnParticleRing(x, y, '#38bdf8', 10);
  }

  // --- INPUT HELPER METHODS ---

  private getActionKeys(action: keyof KeyBindings): string[] {
    const primary = this.keyBindings[action];
    switch (action) {
      case 'up':
        return [primary, 'ArrowUp'];
      case 'down':
        return [primary, 'ArrowDown'];
      case 'left':
        return [primary, 'ArrowLeft'];
      case 'right':
        return [primary, 'ArrowRight'];
      case 'dash':
        return [primary, 'ShiftRight'];
      default:
        return [primary];
    }
  }

  private isInputHeld(action: keyof KeyBindings): boolean {
    return this.getActionKeys(action).some((k) => this.keysHeld.has(k));
  }

  private isInputJustPressed(action: keyof KeyBindings): boolean {
    return this.getActionKeys(action).some((k) => this.keysJustPressed.has(k));
  }

  public handleKeyDown(code: string): void {
    if (!this.keysHeld.has(code)) {
      this.keysJustPressed.add(code);
    }
    this.keysHeld.add(code);
  }

  public handleKeyUp(code: string): void {
    this.keysHeld.delete(code);
  }

  public clearInputs(): void {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
  }
}
