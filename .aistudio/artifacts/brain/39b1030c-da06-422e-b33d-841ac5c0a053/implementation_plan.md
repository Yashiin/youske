# Sistema de Banda Sonora Personalizada (MP3 / OGG) por Escenario

Permite cargar y reproducir archivos de música propios (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.webm`) o colocarlos directamente en la carpeta pública del juego para asignar una banda sonora distinta a la **Pantalla de Título**, **Capítulo I (Ashen Forest)**, **Capítulo II (Cursed Ramparts)** y **Capítulo III (Abyssal Throne - Jefe Malakor)**, manteniendo el sintetizador procedural japonés como respaldo automático cuando una pista no haya sido asignada.

## User Review & Critical Decisions

> [!IMPORTANT]
> Revisa las decisiones confirmadas antes de proceder con la implementación del gestor de música:

- **Decisión Confirmada 1 (Carga de Archivos Propios MP3/OGG)**: Se habilitará tanto la carga directa desde un modal **"Banda Sonora (MP3 / OGG)"** en la Pantalla de Título y Pausa (con persistencia local en el navegador mediante IndexedDB para que tus canciones sigan guardadas al recargar), como el soporte automático de archivos estáticos colocados en `/public/music/` (`title.mp3`, `stage1.mp3`, `stage2.mp3`, `boss.mp3` o `.ogg`).
- **Decisión Confirmada 2 (Música por Nivel y Pantalla de Título)**: Cada momento del juego tendrá su propia ranura musical independiente con transición suave (*crossfade*) y reproducción en bucle continuo (*seamless loop*).

---

## 1. Overview & Core Concept

- **What It Does**: Integra un reproductor de banda sonora híbrido que detecta y reproduce pistas de audio en formato `.mp3`, `.ogg`, `.wav` o `.m4a` para cada etapa del juego, permitiendo al usuario subir sus propios archivos desde la interfaz o alojarlos en el proyecto.
- **Target Audience / Persona**: Jugadores y creadores que desean personalizar la atmósfera oscura de *Yosuke: The Last Battle* con su propia música épica para cada nivel y combate de jefe.
- **Key Value**: Combina la comodidad de subir archivos `.mp3` / `.ogg` al instante desde el navegador con transiciones automáticas según el nivel activo, sin perder nunca los efectos de sonido (SFX) de combate ni el respaldo musical sintetizado si una pista está vacía.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Acceso desde Pantalla de Título o Pausa**: El jugador hace clic en el botón **"BANDA SONORA (MP3 / OGG)"** para abrir el panel de configuración musical.
  2. **Asignación por Escenario**: El panel muestra las 4 ranuras musicales del juego:
     - **Pantalla de Título** (*Menú Principal*)
     - **Capítulo I: The Ashen Forest** (*Nivel 1*)
     - **Capítulo II: The Cursed Ramparts** (*Nivel 2*)
     - **Capítulo III: The Abyssal Throne** (*Batalla contra Malakor*)
  3. **Subida, Preescucha y Restauración**: En cada ranura el usuario puede seleccionar un archivo `.mp3`, `.ogg`, `.wav` o `.m4a` desde su dispositivo, probar cómo suena en vivo, ajustar el volumen de Música y Efectos (SFX), o restaurar el sintetizador original con un clic.
  4. **Transición Automática en Partida**: Al iniciar el prólogo, avanzar de nivel o volver al título, el motor de audio cambia automáticamente a la pista asignada a esa fase con un fundido suave.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Fantasía oscura japonesa (*Blood & Soul*), sobria y afilada, en perfecta armonía con la interfaz actual.
  - *Color Palette & Mood*: Superficies de obsidiana (`bg-neutral-950`, `bg-neutral-900/90`), bordes sutiles de hierro (`border-neutral-800`) y acentos carmesí (`#dc2626`) y ámbar (`#f59e0b`) para indicar la pista activa en reproducción.
  - *Typography & Hierarchy*: Encabezados en `Cinzel` para títulos de capítulos y controles técnicos/formatos en `JetBrains Mono` (`tabular-nums`) para duraciones, formatos y niveles de volumen.
  - *Component Styling & Layout*: Modal limpio de una sola elevación con filas bien espaciadas para cada escenario, controles de una sola línea (`whitespace-nowrap`) y deslizadores de volumen independientes para Música y SFX.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Motor de Audio Híbrido (Archivos MP3/OGG + Respaldo Sintetizado)**
  - *Chosen Approach*: Si una ranura tiene un archivo `.mp3` / `.ogg` cargado (por el usuario o en `/public/music/`), se reproduce en bucle con `HTMLAudioElement` conectado al control de ganancia musical; si una ranura no tiene archivo personalizado, suena la melodía procedural japonesa correspondiente.
  - *Why*: Garantiza que el juego nunca quede en silencio aunque el usuario solo suba música para 1 o 2 niveles específicos.
  - *Alternatives Considered*: Reemplazar por completo el sintetizador con silencio cuando no hay archivo cargado (descartado porque empeora la experiencia inicial si falta alguna pista).

- **Decisión 2: Persistencia en IndexedDB del Navegador + Carpeta Pública**
  - *Chosen Approach*: Guardar los archivos `.mp3` / `.ogg` subidos por el usuario en `IndexedDB` del navegador, además de buscar automáticamente archivos en `/public/music/{title,stage1,stage2,boss}.{mp3,ogg}`.
  - *Why*: `localStorage` tiene un límite de ~5 MB (insuficiente para varios archivos MP3), mientras que `IndexedDB` almacena decenas de megabytes de audio sin problema entre sesiones.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Interfaz de Usuario (React)                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│  │   TitleScreen UI    │  │    PauseModal UI    │  │     HUD Bar     │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └────────┬────────┘  │
│             └───────────────────┬────┴──────────────────────┘           │
│                                 ▼                                       │
│                  ┌─────────────────────────────┐                        │
│                  │      SoundtrackModal        │                        │
│                  │ (Subida MP3/OGG & Volumen)  │                        │
│                  └──────────────┬──────────────┘                        │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Motor de Audio Híbrido (SoundEngine)                  │
│                                                                         │
│  ┌──────────────────────────────┐    ┌───────────────────────────────┐  │
│  │ Reproductor de Pistas Custom │    │ Sintetizador Web Audio (SFX & │  │
│  │ (HTMLAudioElement Loop/Fade) │    │   Respaldo Procedural BGM)    │  │
│  └──────────────┬───────────────┘    └───────────────┬───────────────┘  │
│                 ▼                                    ▼                  │
│  ┌──────────────────────────────┐    ┌───────────────────────────────┐  │
│  │ Almacenamiento IndexedDB +   │    │  Nodos de Ganancia (Master,   │  │
│  │ Rutas /public/music/*.mp3    │    │    Music Volume, SFX Volume)  │  │
│  └──────────────────────────────┘    └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `MusicTrackSlot`: `'title' | 'stage_1' | 'stage_2' | 'boss'`
  - `CustomTrackMeta`: `{ slot: MusicTrackSlot; fileName: string; mimeType: string; objectUrl: string; source: 'upload' | 'static' }`
  - `AudioVolumeState`: `{ musicVolume: number; sfxVolume: number; isMuted: boolean }`

- **Interactive Component & State Mapping**:
  - **Cambio de Estado del Juego (`title` vs `playing` + `stageIndex`)**: Notifica al `SoundEngine` qué ranura (`title`, `stage_1`, `stage_2`, `boss`) debe reproducirse.
  - **Subida de Archivo (`.mp3`, `.ogg`, `.wav`, `.m4a`, `.webm`)**: Valida el tipo MIME/extensión, guarda el `Blob` en `IndexedDB`, crea el `ObjectURL` y actualiza inmediatamente la reproducción si esa ranura está activa.
  - **Eliminación / Restauración de Pista**: Borra el archivo de `IndexedDB` para esa ranura y vuelve automáticamente al sintetizador original.
