# Yosuke: The Last Battle — Documentación Completa del Juego

**Edición:** Prologue Edition  
**Género:** 2D Dark Fantasy Pixel Art Hack & Slash / Plataformas de Acción  
**Motor:** Motor propio a 60 FPS en HTML5 Canvas + React 19 + TypeScript + Web Audio API  

---

## 1. Sinopsis e Historia (Lore)

**Yosuke: The Last Battle** sigue el camino sombrío de **Yosuke**, un espadachín caído en desgracia que despierta en medio de unas ruinas cubiertas de ceniza sin recordar cómo llegó allí. A medida que avanza a través de bosques consumidos por la oscuridad y murallas malditas infestadas de hordas demoníacas, su espada espiritual se convierte en su única defensa frente al abismo.

En lo profundo del **Trono Abisal**, Yosuke se enfrenta a **Malakor, Señor del Abismo Demoníaco** (*Lord of the Demonic Abyss*). Tras llevar al coloso hasta el límite de sus fuerzas a través de tres fases cataclísmicas, se desata el clímax narrativo del prólogo: Yosuke canaliza toda su energía espiritual en una postura definitiva (*Spirit Blade Aegis*), pero el poder abisal de Malakor resulta absoluto y fragmenta su espada en brasas, dejando planteado el inicio de la verdadera guerra.

### Diálogos Cinemáticos del Juego
El juego cuenta con un sistema de diálogos cinemáticos con retratos animados en pixel art (`PortraitCanvas`), efectos de sonido por sílaba diferenciados por personaje y avance automático o manual:

- **Inicio del Capítulo I (The Ashen Forest):**
  - **YOSUKE** *(Guerrero Espadachín)*: `"¿Dónde estoy...?"` (Retrato: `yosuke_normal`)
- **Inicio del Capítulo II (The Cursed Ramparts):**
  - **YOSUKE** *(Guerrero Espadachín)*: `"Las murallas malditas... El hedor demoníaco es cada vez más fuerte."` (Retrato: `yosuke_grim`)
- **Encuentro en el Capítulo Final (The Abyssal Throne, al avanzar a X ≥ 240):**
  - **YOSUKE** *(Guerrero Espadachín)*: `"No sé quién eres, mas me estorbas."` (Retrato: `yosuke_grim`)
  - **MALAKOR** *(Señor del Abismo Demoníaco)*: `"Un simple mortal no desafía al Señor del Abismo... Tu sangre alimentará mi reino."` (Retrato: `malakor_menacing`)
- **Derrota del Jugador (Agonía):**
  - **YOSUKE** *(Agonía)*: `"¿Qué rayos...?"` (Retrato: `yosuke_hurt`)

---

## 2. Controles del Juego

| Acción | Tecla Principal | Tecla Alternativa | Descripción |
| :--- | :---: | :---: | :--- |
| **Moverse / Apuntar** | `W`, `A`, `S`, `D` | Flechas (`↑`, `←`, `↓`, `→`) | Movimiento horizontal y dirección de dash en 8 direcciones |
| **Saltar** | `Espacio` | — | Salto con altura variable, *Coyote Time* (0.12s) y *Jump Buffer* (0.12s) |
| **Ataque Ligero** | `J` | — | Cadena de 3 cortes rápidos en tierra o corte rápido en el aire |
| **Ataque Pesado** | `K` | — | Golpe devastador (rompe guardias en tierra / estocada en picado en el aire) |
| **Dash (8 Direcciones)** | `Shift Izquierdo` | `Shift Derecho` | Impulso evasivo con *i-frames* (1 dash aéreo permitido por salto) |
| **Bloquear / Parry** | `L` | — | Presionar justo antes del impacto ejecuta **Parry**; mantener bloquea |
| **Interactuar** | `E` | — | Activa santuarios (Checkpoints) para restaurar salud y resistencia |
| **Pausar / Saltar Diálogo**| `Esc` / `P` | — | Pausa la partida o salta el diálogo cinemático activo |
| **Silenciar Audio** | `M` | — | Activa o desactiva el sonido y la música en cualquier momento |
| **Reiniciar Nivel** | `R` *(en pausa)* | — | Reinicia inmediatamente el capítulo actual desde el menú de pausa |

---

## 3. Estadísticas y Física de Yosuke

### Atributos Base del Jugador
- **Salud (HP):** `150 / 150`
- **Resistencia (Stamina):** `100 / 100` (Regeneración pasiva: `35 puntos/segundo` cuando no está haciendo dash)
- **Espíritu (Spirit):** `50 / 100` al iniciar (Se carga al conectar golpes, romper objetos o ejecutar Parries exitosos)
- **Dimensiones de Colisión:** `28px` de ancho × `52px` de alto

### Constantes Físicas y Movimiento
- **Gravedad:** `1200 px/s²`
- **Velocidad de Carrera:** `280 px/s`
- **Velocidad de Salto:** `-520 px/s` (con corte de salto al soltar `Espacio` temprano: `vy *= 0.55`)
- **Dash en 8 Direcciones:**
  - **Velocidad:** `600 px/s`
  - **Duración:** `0.18s`
  - **Enfriamiento (Cooldown):** `0.6s`
  - **Invulnerabilidad (i-frames):** `0.22s`
  - **Costo de Stamina:** `20 puntos`
  - **Regla Aérea:** Permite 1 dash en el aire por salto, que se recarga al tocar cualquier plataforma.

---

## 4. Sistema de Combate

### Tabla de Ataques de Yosuke

| Acción | Código Interno | Daño | Crítico | Stagger Enemigo | Espíritu Ganado | Costo Stamina | Retroceso (Knockback X, Y) | Hitstop / Shake |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Corte Ligero 1** | `light_attack_1` | `25` | No | `0.35s` | `+10` | `0` | `(±120, -40)` | `0.04s` / `3` |
| **Corte Ligero 2** | `light_attack_2` | `32` | No | `0.40s` | `+12` | `0` | `(±160, -60)` | `0.045s` / `4` |
| **Corte Ligero 3 (Finisher)** | `light_attack_3` | `48` | **Sí** | `0.70s` | `+20` | `0` | `(±280, -120)` | `0.06s` / `7` |
| **Ataque Pesado** | `heavy_attack` | `75` | **Sí** | `1.10s` | `+25` | `25` | `(±320, -160)` | `0.08s` / `10` |
| **Ataque Aéreo Ligero** | `air_attack` | `28` | No | `0.35s` | `+12` | `0` | `(±140, -50)` | `0.04s` / `4` |
| **Estocada Aérea Pesada** | `air_heavy` | `80` | **Sí** | `1.20s` | `+25` | `25` | `(±150, +350)` | `0.08s` / `11` |
| **Contraataque (Riposte)** | `counter` | `120` | **Sí** | `1.50s` | `+40` | `0` | `(±350, -180)` | `0.10s` / `12` |

### Defensa, Bloqueo y Parry
1. **Parry Perfecto (`L`):**
   - **Ventana de Parry:** `0.22 segundos` desde el instante en que se presiona `L`.
   - **Efecto:** Anula el `100%` del daño (salvo ataques imbloqueables), congela el tiempo brevemente (`hitstop: 0.12s`), aturde al enemigo atacante (`staggered`), otorga `+35 de Espíritu` y abre una **ventana de contraataque de 1.0 segundo**.
   - **Contraataque:** Presionar `J` o `K` durante esa ventana de `1.0s` lanza el corte relámpago (`counter`) de **120 de daño crítico** que ignora escudos y armadura.
2. **Bloqueo Estándar (Mantener `L`):**
   - **Reducción de Daño:** Mitiga el `75%` del daño entrante (recibiendo solo el `25%`, mínimo `1 HP`).
   - **Costo:** Consume `20 de Stamina` al absorber un impacto.
3. **Ataques Imbloqueables (`UNBLOCKABLE`):**
   - Los ataques de los **Heavy Demons** y las ondas de choque de **Malakor** están marcados con aviso rojo y **no pueden ser bloqueados ni desviados con Parry**; deben esquivarse saltando o usando los *i-frames* del Dash.

### Sistema de Combos y Rangos Visuales ("Blood & Soul Tiers")
El contador de combo se mantiene activo durante `1.6 segundos` tras cada golpe conectado (se reinicia a `0` si el temporizador expira o si Yosuke recibe daño directo).

| Golpes (`Combo`) | Rango (Rating) | Multiplicador | Tier Visual | Color de Impacto | Escala de Texto |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **1 golpe** | — | `1.0x` | Tier 1 (*Pale Ash*) | Gris Ceniza (`#e2e8f0`) | `1.0x` |
| **2 – 4 golpes** | `STRIKE CHAIN` | `1.15x` | Tier 1 (*Pale Ash*) | Gris Ceniza (`#e2e8f0`) | `1.0x` |
| **5 – 9 golpes** | `SPECTRAL SURGE` | `1.30x` | Tier 2 (*Spectral Surge*) | Azul Espectral (`#38bdf8`) | `1.3x` |
| **10 – 14 golpes** | `SOUL REAVER` | `1.60x` | Tier 3 (*Soul Reaver*) | Violeta Alma (`#c084fc`) | `1.6x` |
| **15+ golpes** | `BLOOD CATACLYSM` | `2.00x` | Tier 4 (*Blood Cataclysm*) | Carmesí Sangriento (`#ef4444`) | `2.0x` |

---

## 5. Modos de Dificultad

El jugador puede elegir y cambiar la dificultad tanto desde la pantalla de título como desde el menú de pausa:

| Dificultad | Nombre en el Juego | Vida Enemiga | Daño Enemigo | Velocidad | Tiempo de Telegrafía (Windup) | Enfriamiento de Ataque | Distancia de Aggro | Características Adicionales |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Normal** | **GUERRERO (Normal)** | `1.0x` | `1.0x` | `1.0x` | `1.0x` (100%) | `1.0x` | `1.0x` | Equilibrio clásico de reflejos, bloqueo y contraataque. |
| **Hard** | **SANGRIENTO (Difícil)** | `1.3x` (+30%) | `1.25x` (+25%) | `1.15x` | `0.82x` (más rápido) | `0.80x` | `1.15x` | Guardia reactiva al 75% en guerreros y **+1 enemigo élite extra** en Capítulos I y II. |
| **Nightmare** | **ABISMO (Pesadilla)** | `1.6x` (+60%) | `1.50x` (+50%) | `1.28x` | `0.68x` (muy rápido) | `0.65x` | `1.30x` | Guardia reactiva al 90%, IA implacable y **+2 enemigos élite extra** por nivel. |

---

## 6. Bestiario: Arquetipos de Enemigos

Todos los enemigos cuentan con inteligencia táctica de separación de manada (para no superponerse en el mismo píxel), detección de bordes y comportamientos únicos:

### 1. Basic Monster (`basic_monster` — Necrófago de Ceniza)
- **HP Base:** `80` (Difícil: `104` | Pesadilla: `128`)
- **Daño Base:** `22` (Difícil: `28` | Pesadilla: `33`)
- **Velocidad de Persecución:** `140 px/s`
- **Dimensiones:** `28 × 38 px`
- **Comportamiento Táctico:** Realiza un salto voraz hacia adelante al atacar, puede saltar abismos de `96px` y trepar a plataformas elevadas para perseguir a Yosuke.

### 2. Demon Warrior (`demon_warrior` — Caballero Dorado / Guerrero Demoníaco)
- **HP Base:** `160` (Difícil: `208` | Pesadilla: `256`)
- **Daño Base:** `28` (Difícil: `35` | Pesadilla: `42`)
- **Velocidad de Persecución:** `150 px/s`
- **Dimensiones:** `32 × 54 px`
- **Comportamiento Táctico:**
  - **Guardia Reactiva con Escudo:** Levanta su escudo al acercarse o cuando detecta que Yosuke lanza ataques ligeros (`50%` prob. en Normal, `75%` en Difícil, `90%` en Pesadilla).
  - **Contraataque Táctico (Riposte):** Si bloquea un ataque ligero de Yosuke, reduce su enfriamiento de ataque a `0.12s` y contraataca de inmediato. Su guardia solo puede romperse con un **Ataque Pesado (`K`)** o un **Contraataque tras Parry**.

### 3. Agile Demon (`agile_demon` — Cazador Sombra Ágil)
- **HP Base:** `110` (Difícil: `143` | Pesadilla: `176`)
- **Daño Base:** `26` (Difícil: `33` | Pesadilla: `39`)
- **Velocidad de Persecución:** `225 px/s`
- **Dimensiones:** `26 × 46 px`
- **Comportamiento Táctico:**
  - **Paso Atrás Evasivo (Backstep):** Cuando Yosuke ataca cerca (`< 115px`), salta hacia atrás para esquivar el corte y prepara una estocada veloz al aterrizar.
  - **Telegrafía Corta:** Tiempo de preparación de ataque de solo `0.34s` y gran rango de detección (`440px`).

### 4. Heavy Demon (`heavy_demon` — Coloso Acorazado)
- **HP Base:** `280` (Difícil: `364` | Pesadilla: `448`)
- **Daño Base:** `45` (Difícil: `56` | Pesadilla: `68`)
- **Velocidad de Persecución:** `85 px/s`
- **Dimensiones:** `44 × 68 px`
- **Comportamiento Táctico:**
  - **Hiperarmadura (Poise):** Durante la preparación de su golpe (`windup`), los ataques ligeros de Yosuke no lo interrumpen (muestra el indicador `POISE!` y recibe un `30%` menos de daño). Solo los ataques pesados (`K`) o contraataques pueden aturdirlo.
  - **Golpe Imbloqueable:** Sus ataques son sísmicos e **imbloqueables** (`unblockable: true`), obligando a esquivar con Dash o salto.

---

## 7. Jefe Final: Malakor, Señor del Abismo Demoníaco

- **Nombre Completo:** `MALAKOR — Lord of the Demonic Abyss`
- **HP Base:** `1200` (Normal: `1200` | Difícil: `1560` | Pesadilla: `1920`)
- **Posición en la Arena:** `X = 1150, Y = 620` (Núcleo vulnerable de `140 × 180 px`)

### Fases del Combate
1. **Fase I (100% – 67% HP):**
   - Alterna entre **Tremor Slam** y **Hellfire Cleave**.
2. **Fase II: Supernatural Fury (66% – 26% HP):**
   - Malakor ruge haciendo temblar la pantalla y desbloquea **Blood Meteor Rain** y **Abyssal Laser Beam**.
3. **Fase III: Cataclysmic Surge (25% – 9% HP):**
   - Despliega su arsenal completo (`slam`, `cleave`, `meteor`, `beam`) de forma implacable.
4. **Secuencia Cinemática Final (≤ 8% HP — `scripted_defeat`):**
   - Activa el clímax narrativo del prólogo donde Yosuke adopta la postura *Spirit Blade Aegis*, choca contra el golpe cataclísmico de Malakor en una lluvia de chispas y cae derrotado dando paso al cierre **"END OF PROLOGUE"**.

### Ataques de Malakor
| Ataque | Código | Daño | Características |
| :--- | :--- | :---: | :--- |
| **Tremor Slam** | `slam` | `35` | Golpea el suelo tras `0.5s` y lanza una onda de choque rasante (`vx = -360`) **imbloqueable** que debe saltarse. |
| **Hellfire Cleave** | `cleave` | `40` | Tajo infernal de corto/medio alcance (`220 × 80 px`) frente al trono tras `0.4s`. |
| **Blood Meteor Rain** | `meteor` | `30` c/u | Invoca 4 meteoros de sangre desde el cielo que caen a `vy = 320` y explotan contra el suelo. |
| **Abyssal Laser Beam** | `beam` | `45` | Dispara un haz abisal concentrado frente a él (`X = 850, Y = 560`) durante `0.8s`. |

---

## 8. Capítulos, Niveles y Entorno

### Objetos Interactivos del Mundo
- **Santuarios (Checkpoints):** Puntos de control que se activan con la tecla `E`. Curan el `100%` del HP y la Stamina de Yosuke (`SANCTUARY SAVED`) y sirven como punto de reaparición en caso de caer en combate.
- **Objetos Destructibles (`urn`, `lantern`, `crate`):** Urnas, faroles y cajas repartidas por los niveles. Al romperlos de un espadazo otorgan **`+20 HP`** y **`+25 de Espíritu`**.
- **Fosos de Espinas / Abismos (`isHazard`):** Trampas mortales de `96px` de ancho. Quitan **`40 HP`** al jugador e impulsan hacia arriba; si un enemigo cae en ellas, muere instantáneamente.

### Desglose de Capítulos

#### Capítulo I: The Ashen Forest *(Ruins of the Fallen Guardians)*
- **Dimensiones:** `3200 × 750 px` (Meta en `X = 3050`)
- **Terreno:** 3 segmentos de suelo separados por 2 fosos peligrosos (`X = 896` y `X = 1760`) y 8 plataformas elevadas de ruinas (`isOneWay`).
- **Checkpoints:** Inicial en `X = 110` y Santuario intermedio en `X = 1400`.
- **Destructibles:** 4 urnas, 1 farol y 1 caja (total: `6` objetos = hasta `+120 HP` recuperables).
- **Enemigos:**
  - Normal (8): `6 Basic Monsters`, `2 Demon Warriors`.
  - Difícil (9): Añade `1 Agile Demon` en `X = 1620`.
  - Pesadilla (10): Añade además `1 Demon Warrior` en `X = 2420`.

#### Capítulo II: The Cursed Ramparts *(Gate of Demonic Vengeance)*
- **Dimensiones:** `3500 × 800 px` (Meta en `X = 3350`)
- **Terreno:** 3 grandes murallas divididas por 2 fosos de espinas (`X = 992` y `X = 2176`) y 9 plataformas de almenas y torres a distintas alturas.
- **Checkpoints:** Inicial en `X = 120` y Santuario intermedio en `X = 1500`.
- **Destructibles:** 2 urnas, 2 cajas y 1 farol (total: `5` objetos = hasta `+100 HP` recuperables).
- **Enemigos:**
  - Normal (8): `3 Demon Warriors`, `3 Agile Demons`, `2 Heavy Demons`.
  - Difícil (9): Añade `1 Demon Warrior` en `X = 1180`.
  - Pesadilla (10): Añade además `1 Heavy Demon` en `X = 2960`.

#### Capítulo Final: The Abyssal Throne *(Encounter with Malakor, Lord of Despair)*
- **Dimensiones:** `1500 × 750 px` (Arena cerrada de jefe)
- **Terreno:** Suelo continuo del salón del trono con 3 pilares de batalla elevados (`Y = 480`, `410`, `480`) ideales para esquivar ondas de choque y meteoros.
- **Checkpoints:** Inicial en `X = 150`.
- **Destructibles:** 2 urnas de emergencia (`X = 80` y `X = 350`) que permiten recuperar `+40 HP` durante el duelo contra Malakor.
- **Jefe:** **Malakor, Lord of the Demonic Abyss**.

---

## 9. Sistema de Audio y Arquitectura Técnica

### Audio Procedural e Híbrido (`src/game/audio.ts`)
- **Efectos de Sonido (Web Audio API):** Síntesis en tiempo real sin latencia para cortes ligeros, pesados y aéreos, impacto en carne, bloqueo metálico, campana armónica de Parry (`1760 Hz` + `2640 Hz`), rugido sub-armónico del jefe, meteoros, láser y voces de diálogo.
- **Música Dinámica:**
  - **Modo Ambiental / Combate:** Secuenciador procedural basado en la escala japonesa **D Hirajoshi** (`146.83 Hz` a `392.0 Hz`).
  - **Modo Jefe Final (`boss`):** Reproduce en bucle la pista dedicada `/assets/aistudio/Final_Boss_Battle__Alt__44ddcd07.mp3` (con atenuación automática de volumen al pausar el juego y sintetizador de respaldo).
  - **Modo Desenlace (`ending`):** Acordes solemnes en Re menor y Do mayor tras la caída de Yosuke.

### Estructura de Archivos del Proyecto
```text
├── src/
│   ├── App.tsx                         # Bucle principal a 60 FPS y orquestación de estados React
│   ├── components/
│   │   ├── TitleScreen.tsx             # Pantalla de título, selector de dificultad y capítulo
│   │   ├── HUD.tsx                     # Barras de HP, Stamina, Espíritu, Combo, Score y HP del Jefe
│   │   ├── CinematicDialogueBox.tsx    # Cuadro de diálogo cinemático con efecto máquina de escribir
│   │   ├── PortraitCanvas.tsx          # Renderizador pixel art de retratos de Yosuke y Malakor
│   │   ├── ControlsModal.tsx           # Guía interactiva de controles y mecánicas de combate
│   │   ├── PauseModal.tsx              # Menú de pausa y cambio rápido de dificultad
│   │   ├── GameOverModal.tsx           # Pantalla de derrota con reaparición en el último Santuario
│   │   └── EndPrologueModal.tsx        # Clímax narrativo del prólogo con estadísticas de la partida
│   └── game/
│       ├── types.ts                    # Definiciones de tipos e interfaces del motor
│       ├── combat.ts                   # Reglas puras de combate, daño, Parry, combos y dificultades
│       ├── engine.ts                   # Simulación física, IA táctica enemiga, jefe y colisiones
│       ├── levels.ts                   # Diseño de los 3 capítulos, plataformas, trampas y spawns
│       ├── renderer.ts                 # Cámara con suavizado, parallax, partículas y renderizado 2D
│       ├── pixelArt.ts                 # Sprites procedurales de Yosuke, demonios, Malakor y entorno
│       ├── goldenKnightSprites.ts      # Sprites detallados del arquetipo Demon Warrior
│       ├── audio.ts                    # Sintetizador Web Audio API y gestor de banda sonora
│       ├── combat.test.ts              # Pruebas unitarias de reglas de combate
│       ├── engine_combo.test.ts        # Pruebas unitarias de encadenamiento de combos y dash
│       └── dialogue.test.ts            # Pruebas unitarias del sistema de diálogos cinemáticos
```
