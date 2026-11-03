export type ThemeId = 'ZEN_GARDEN' | 'COSMIC_GEMS' | 'SWEET_TREATS' | 'CUTE_SAFARI';

export type GameplayStyle = 'BUBBLE_SHOOTER' | 'ZEN_STACK';

export type GameMode = 'CAMPAIGN' | 'ZEN' | 'TIME_ATTACK' | 'DAILY';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER' | 'LEVEL_SELECT';

export interface ShooterBubbleData {
  id: string;
  row: number;
  col: number;
  color: string;
  symbol: string;
  name: string;
  x: number;
  y: number;
  popping?: boolean;
  falling?: boolean;
  vx?: number;
  vy?: number;
}

export type BoosterType = 'UNDO' | 'SHUFFLE' | 'AUTO_MATCH' | 'EXTRA_SLOT';

export interface BoosterInventory {
  undo: number;
  shuffle: number;
  autoMatch: number;
  extraSlot: number;
}

export type TileState = 'BOARD' | 'FLYING' | 'DOCK' | 'MATCHING' | 'REMOVED';

export interface TileDefinition {
  type: string;
  name: string;
  symbol: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
}

export interface BoardTile {
  id: string;
  type: string;
  layer: number;     // 0 = bottom, 1, 2, 3...
  gridX: number;     // column offset (supports 0.5 for staggered bricks)
  gridY: number;     // row offset
  state: TileState;
  isCovered: boolean; // computed: covered by higher active tiles?
  dockIndex?: number; // position inside dock tray
}

export interface LevelConfig {
  id: number;
  worldId: number;
  worldName: string;
  title: string;
  theme: ThemeId;
  layoutName: string;
  tileTypes: string[];
  totalTiles: number;
  targetScore: number;
  starTimes?: [number, number]; // seconds for 3-star and 2-star
  starScores: [number, number, number];
  timeLimit?: number;           // for Time Rush mode (e.g. 90s)
  presetLayout: Array<{
    type?: string;              // if omitted, assigned from pool of 3s
    layer: number;
    gridX: number;
    gridY: number;
  }>;
}

export interface UndoStep {
  tileId: string;
  originalLayer: number;
  originalGridX: number;
  originalGridY: number;
  previousDockTiles: BoardTile[];
}

export interface DailyCheckInData {
  lastClaimTimestamp: number;
  currentStreak: number; // 0 to 7 (0 = never claimed, 1 = day 1 claimed, etc.)
  totalClaimsCount: number;
  integrityHash: string; // Anti-tamper token
  lastCheckedClientTime: number;
}

export interface PlayerStats {
  score: number;
  highScores: Record<GameMode, number>;
  unlockedLevel: number;
  starsEarned: Record<number, number>; // levelId -> stars (1-3)
  coins: number;
  boosters: BoosterInventory;
  totalMatches: number;
  zenRoundsCleared: number;
  dailyCompletedDate: string;
  selectedTheme: ThemeId;
  soundEnabled: boolean;
  ambientMusicEnabled: boolean;
  hapticsEnabled: boolean;
  mobileFrameMode: boolean; // on desktop: show phone bezel or full screen
  dailyCheckIn?: DailyCheckInData;
}
