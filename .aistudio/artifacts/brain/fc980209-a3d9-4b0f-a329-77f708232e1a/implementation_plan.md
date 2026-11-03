# Level Clearance & Accessibility Overhaul Plan

Make clearing levels significantly more accessible, satisfying, and enjoyable across all sectors by expanding player ammo budgets, slowing ceiling descent pressure, condensing active color frequencies, dramatically increasing natural special orb spawns, and introducing an on-demand Quantum Booster Arsenal.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during the interactive interview and will be applied globally across all campaign, puzzle, and endless stages by default:

- **Expanded Shot Capacity**: Increase base shots from ~24–28 up to 40–50 shots per level (+65% ammo cushion).
- **Relaxed Ceiling Descent**: Double the countdown between ceiling drops (from every 4–5 shots to every 8–10 shots).
- **Condensed Color Frequencies**: Cap standard stages to 3–4 concurrent colors (down from 5–6), generating substantially larger natural match clusters and massive cascade chain reactions.
- **Amplified Special Orb Rate**: Increase natural spawn chance of Quantum Bombs, Prism Rainbows, and Gravity Vortexes in the launcher from 8% to 22%.
- **On-Demand Booster Arsenal**: Equip the player with ready-to-use tactical boosters right next to the launcher cannon:
  - **Quantum Nova Bomb**: Detonate any stubborn cluster with a radius-2 blast.
  - **Prism Chromatic**: Wildcard orb that links with any color.
  - **Photon Piercer**: Laser beam punching through vertical obstructions.
  - **Gravity Vortex**: Pull in and dissolve neighboring orbs into cosmic dust.

---

### 1. Overview & Core Concept

- **What It Does**: Rebalances stage parameters and supplies an on-demand booster dock so players consistently experience the thrill of clearing boards, triggering chain drops, and earning 3-star ratings without running out of shots or getting crushed by the descending ceiling.
- **Target Audience**: Casual arcade players and puzzle fans seeking an engaging, low-frustration flow state with high sensory rewards.
- **Key Value**: Eliminates artificial bottlenecks and tight ammo starvation, replacing them with explosive combo agency and accessible progression.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Stage Entry**: Player enters any sector with an expanded ammo reserve (40–50 shots clearly visible in the HUD).
2. **Tactical Planning**: Player views a cleaner board with 3–4 distinct color clusters, making 3+ matches immediately apparent and frequent.
3. **Emergency Booster Trigger**: If in a tricky pinch or blocked pocket, the player can click any of the 4 on-demand booster buttons below the shooter dock to immediately convert their loaded orb into a Quantum Bomb, Prism Rainbow, Photon Piercer, or Gravity Vortex!
4. **Relaxed Pacing**: The ceiling descent warning indicates a generous 8–10 shot breathing room before moving, allowing deliberate aim without panic.
5. **Stage Clear & Fanfare**: Faster, smoother clears with higher combo multipliers and instant 3-star celebration.

#### B. Component Layout & Visual Identity
- **Quantum Booster Arsenal Bar**: A sleek glass dock mounted just beneath the cannon displaying 4 high-tech booster buttons with luminous neon badges, cooldown/charge indicators, and hotkeys `[1]`, `[2]`, `[3]`, `[4]`.
- **HUD Rebalance Display**: Updated ammo meter with comfortable numbers and clear descent intervals.
- **Aesthetic Consistency**: Matches the 2026 cosmic obsidian and neon glass visual language with crisp typographic hierarchy and zero-pill discipline.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Global Default Rebalance vs. Difficulty Toggle**
  - *Chosen Approach*: Apply the easier parameters across all stages by default (as selected by the user), ensuring an immediate frictionless experience without requiring users to find a hidden menu switch.
  - *Why*: Immediate satisfaction; players who want extreme challenge still have Endless Surge and Puzzle Master.
- **Decision 2: On-Demand Booster Arsenal vs. Random Spawns Only**
  - *Chosen Approach*: Both! We boost random launcher spawns to 22% AND provide tactical on-demand booster buttons with recharge on combos.
  - *Why*: Gives players direct agency to solve tough board states rather than feeling dependent on random rolls.
- **Decision 3: Color Frequency Condensation**
  - *Chosen Approach*: Reduce early sectors to 3 colors and mid/late sectors to 4 colors max (reducing color entropy).
  - *Why*: Mathematically increases average cluster size by over 40%, generating frequent cascading cluster drops.

---

### 4. Technical Architecture & System Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Orbital Pop 2026                         │
├─────────────────────────────────────────────────────────────┤
│  HUD: 40-50 Shots Remaining · Ceiling Descent in 9 Shots   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Active Grid Canvas                       │
│           (3-4 Active Colors · High Cluster Density)        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                 Launcher Cannon & Reserve Dock              │
│                 (22% Natural Special Orb Spawns)            │
├─────────────────────────────────────────────────────────────┤
│                 On-Demand Booster Arsenal                   │
│   [1] Quantum Bomb  [2] Prism Rainbow  [3] Laser  [4] Vortex│
├─────────────────────────────────────────────────────────────┤
│                 Precision Aim & Micro-Nudge Deck            │
└─────────────────────────────────────────────────────────────┘
```

#### Proposed Changes Across Modules:
1. `src/utils/levels.ts`:
   - Increase `shotsAllowed` across all campaign levels (e.g., Level 1: 45 shots, Level 2: 42 shots, Level 8: 40 shots).
   - Increase `descentFrequency` from 4–5 shots to 8–10 shots.
   - Filter `colors` arrays to 3–4 colors per stage.
   - Increase procedural generation cluster cohesion so matching groups spawn closer together.
2. `src/components/GameBoard.tsx` & `src/App.tsx`:
   - Increase `generateShooterBubble` special spawn probability from 10% to 22%.
   - Add booster invocation handlers (`activateBooster(type)`).
   - Mount the `BoosterBar` interface directly adjacent to the launcher cannon with keyboard shortcuts (`1` for Bomb, `2` for Prism, `3` for Laser, `4` for Vortex).
3. `src/components/BoosterBar.tsx` (New Component):
   - 4 tactile on-demand booster triggers with visual icon previews, hotkey badges, and charge states.
