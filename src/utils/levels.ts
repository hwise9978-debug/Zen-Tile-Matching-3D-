import { BoardTile, LevelConfig, ThemeId } from '../types/game';
import { TILE_THEMES } from './tileThemes';

/**
 * Checks if a tile is covered/blocked by any active tile on a higher layer.
 * A tile is covered if a tile on layer > this.layer overlaps within 0.88 grid units.
 */
export const isTileCovered = (
  target: { layer: number; gridX: number; gridY: number },
  activeTiles: Array<{ id: string; layer: number; gridX: number; gridY: number; state: string }>,
  targetId?: string
): boolean => {
  for (const other of activeTiles) {
    if (other.state !== 'BOARD') continue;
    if (targetId && other.id === targetId) continue;
    if (other.layer > target.layer) {
      const dx = Math.abs(other.gridX - target.gridX);
      const dy = Math.abs(other.gridY - target.gridY);
      // Standard tile width/height coverage threshold
      if (dx < 0.88 && dy < 0.88) {
        return true;
      }
    }
  }
  return false;
};

// Helper to generate coordinates in standard geometric templates
function makeGrid(
  layer: number,
  startX: number,
  startY: number,
  cols: number,
  rows: number,
  stepX = 1,
  stepY = 1
): Array<{ layer: number; gridX: number; gridY: number }> {
  const result: Array<{ layer: number; gridX: number; gridY: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result.push({
        layer,
        gridX: startX + c * stepX,
        gridY: startY + r * stepY
      });
    }
  }
  return result;
}

// Helper to generate diamond / pyramid shapes
function makePyramid(
  layer: number,
  centerX: number,
  centerY: number,
  size: number
): Array<{ layer: number; gridX: number; gridY: number }> {
  const result: Array<{ layer: number; gridX: number; gridY: number }> = [];
  for (let dy = -size; dy <= size; dy++) {
    const span = size - Math.abs(dy);
    for (let dx = -span; dx <= span; dx++) {
      result.push({
        layer,
        gridX: centerX + dx,
        gridY: centerY + dy
      });
    }
  }
  return result;
}

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    id: 1,
    worldId: 1,
    worldName: 'Zen Garden',
    title: 'Pebble Path',
    theme: 'ZEN_GARDEN',
    layoutName: 'Twin Columns',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern'],
    totalTiles: 18, // 6 trios
    targetScore: 2500,
    starScores: [1000, 2000, 2500],
    presetLayout: [
      // Layer 0: base 4x3
      ...makeGrid(0, 1.5, 1, 4, 3), // 12 tiles
      // Layer 1: overlapping center 2x3
      ...makeGrid(1, 2.5, 1, 2, 3)  // 6 tiles -> 18 total
    ]
  },
  {
    id: 2,
    worldId: 1,
    worldName: 'Zen Garden',
    title: 'Lotus Bloom',
    theme: 'ZEN_GARDEN',
    layoutName: 'Concentric Bloom',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern', 'koi'],
    totalTiles: 24, // 8 trios
    targetScore: 4000,
    starScores: [2000, 3200, 4000],
    presetLayout: [
      // Layer 0: 4x4
      ...makeGrid(0, 1.5, 1, 4, 4), // 16 tiles
      // Layer 1: 3x2 center
      ...makeGrid(1, 2.0, 1.5, 3, 2), // 6 tiles
      // Layer 2: top cap
      { layer: 2, gridX: 3.0, gridY: 1.5 },
      { layer: 2, gridX: 3.0, gridY: 2.5 } // 2 tiles -> 24 total
    ]
  },
  {
    id: 3,
    worldId: 1,
    worldName: 'Zen Garden',
    title: 'Twin Pagodas',
    theme: 'ZEN_GARDEN',
    layoutName: 'Dual Towers',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern', 'koi', 'bamboo'],
    totalTiles: 36, // 12 trios
    targetScore: 6500,
    starScores: [3500, 5000, 6500],
    presetLayout: [
      // Left tower Layer 0: 3x4
      ...makeGrid(0, 0.5, 1, 3, 4), // 12
      // Right tower Layer 0: 3x4
      ...makeGrid(0, 4.5, 1, 3, 4), // 12 -> 24
      // Left tower Layer 1: 2x2
      ...makeGrid(1, 1.0, 1.5, 2, 2), // 4
      // Right tower Layer 1: 2x2
      ...makeGrid(1, 5.0, 1.5, 2, 2), // 4 -> 32
      // Tower tops Layer 2
      ...makeGrid(2, 1.5, 2.0, 1, 2), // 2
      ...makeGrid(2, 5.5, 2.0, 1, 2)  // 2 -> 36 total
    ]
  },
  {
    id: 4,
    worldId: 1,
    worldName: 'Zen Garden',
    title: 'Torii Sanctuary',
    theme: 'ZEN_GARDEN',
    layoutName: 'Archway Portal',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern', 'koi', 'bamboo', 'fan'],
    totalTiles: 42, // 14 trios
    targetScore: 8000,
    starScores: [4000, 6500, 8000],
    presetLayout: [
      // Base layer pillars & crossbeam
      ...makeGrid(0, 1.0, 1, 2, 5), // 10 left pillar
      ...makeGrid(0, 5.0, 1, 2, 5), // 10 right pillar
      ...makeGrid(0, 3.0, 1, 2, 2), // 4 center lintel -> 24
      // Layer 1 crossbeam & steps
      ...makeGrid(1, 1.5, 0.5, 5, 2), // 10 lintel roof -> 34
      // Layer 2 roof peak
      ...makeGrid(2, 2.0, 0.5, 4, 1), // 4 -> 38
      // Layer 3 top crown
      ...makeGrid(3, 2.5, 0.5, 3, 1), // 3
      { layer: 3, gridX: 3.5, gridY: 2.5 } // 1 -> 42 total
    ]
  },
  {
    id: 5,
    worldId: 2,
    worldName: 'Cosmic Temple',
    title: 'Celestial Diamond',
    theme: 'COSMIC_GEMS',
    layoutName: 'Stellar Diamond',
    tileTypes: ['ruby', 'emerald', 'sapphire', 'saturn', 'sun', 'moon'],
    totalTiles: 48, // 16 trios
    targetScore: 10000,
    starScores: [5000, 8000, 10000],
    presetLayout: [
      // Layer 0: large 6x5 grid
      ...makeGrid(0, 1.0, 1.0, 6, 5), // 30
      // Layer 1: diamond ring
      ...makeGrid(1, 2.0, 1.5, 4, 3), // 12 -> 42
      // Layer 2: diamond center
      ...makeGrid(2, 2.5, 2.0, 3, 2)  // 6 -> 48 total
    ]
  },
  {
    id: 6,
    worldId: 2,
    worldName: 'Cosmic Temple',
    title: 'Supernova Spiral',
    theme: 'COSMIC_GEMS',
    layoutName: 'Spiral Vortex',
    tileTypes: ['ruby', 'emerald', 'sapphire', 'saturn', 'sun', 'moon', 'nova', 'comet'],
    totalTiles: 54, // 18 trios
    targetScore: 12500,
    starScores: [6000, 9500, 12500],
    presetLayout: [
      // Layer 0: outer frame
      ...makeGrid(0, 1.0, 0.5, 6, 1), // 6
      ...makeGrid(0, 1.0, 5.5, 6, 1), // 6
      ...makeGrid(0, 0.5, 1.5, 1, 4), // 4
      ...makeGrid(0, 6.5, 1.5, 1, 4), // 4 -> 20
      // Layer 1: inner block 4x4
      ...makeGrid(1, 1.5, 1.5, 4, 4), // 16 -> 36
      // Layer 2: stepped diamond
      ...makeGrid(2, 2.0, 2.0, 3, 3), // 9 -> 45
      // Layer 3: center cross
      ...makeGrid(3, 2.5, 2.5, 2, 2), // 4 -> 49
      // Layer 4: pinnacle
      ...makeGrid(4, 2.0, 3.0, 1, 2), // 2
      ...makeGrid(4, 4.0, 3.0, 1, 2), // 2
      { layer: 5, gridX: 3.0, gridY: 3.0 } // 1 -> 54 total
    ]
  },
  {
    id: 7,
    worldId: 3,
    worldName: 'Sweet Palace',
    title: 'Sugar Fortress',
    theme: 'SWEET_TREATS',
    layoutName: 'Multi-tiered Cake',
    tileTypes: ['donut', 'cupcake', 'strawberry', 'macaron', 'icecream', 'boba', 'lollipop'],
    totalTiles: 60, // 20 trios
    targetScore: 15000,
    starScores: [7500, 12000, 15000],
    presetLayout: [
      // Base layer 6x5
      ...makeGrid(0, 1.0, 1.0, 6, 5), // 30
      // Tier 1 4x4
      ...makeGrid(1, 2.0, 1.5, 4, 4), // 16 -> 46
      // Tier 2 3x3
      ...makeGrid(2, 2.5, 2.0, 3, 3), // 9 -> 55
      // Tier 3 cake topper
      ...makeGrid(3, 3.0, 2.5, 2, 2), // 4 -> 59
      { layer: 4, gridX: 3.5, gridY: 3.0 } // 1 -> 60 total
    ]
  },
  {
    id: 8,
    worldId: 4,
    worldName: 'Safari Kingdom',
    title: 'Primal Totem',
    theme: 'CUTE_SAFARI',
    layoutName: 'Towering Totem',
    tileTypes: ['panda', 'fox', 'koala', 'lion', 'owl', 'frog', 'bunny', 'tiger'],
    totalTiles: 72, // 24 trios
    targetScore: 20000,
    starScores: [10000, 16000, 20000],
    presetLayout: [
      // Layer 0: foundation wings and core
      ...makeGrid(0, 0.5, 1.0, 2, 5), // 10
      ...makeGrid(0, 5.5, 1.0, 2, 5), // 10
      ...makeGrid(0, 2.5, 0.5, 3, 6), // 18 -> 38
      // Layer 1: inner totem column
      ...makeGrid(1, 2.0, 1.0, 4, 4), // 16 -> 54
      // Layer 2: stepped column
      ...makeGrid(2, 2.5, 1.5, 3, 3), // 9 -> 63
      // Layer 3: crown
      ...makeGrid(3, 3.0, 1.5, 2, 3), // 6 -> 69
      // Layer 4: apex
      { layer: 4, gridX: 3.5, gridY: 1.5 },
      { layer: 4, gridX: 3.5, gridY: 2.5 },
      { layer: 4, gridX: 3.5, gridY: 3.5 }  // 3 -> 72 total
    ]
  },
  {
    id: 9,
    worldId: 5,
    worldName: 'Golden Sanctuary',
    title: 'Imperial Labyrinth',
    theme: 'ZEN_GARDEN',
    layoutName: 'Concentric Labyrinth',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern', 'koi', 'bamboo', 'pebble', 'fan', 'cherry'],
    totalTiles: 81, // 27 trios
    targetScore: 24000,
    starScores: [12000, 18000, 24000],
    presetLayout: [
      // Base outer square 7x6
      ...makeGrid(0, 0.5, 0.5, 7, 5), // 35
      // Tier 1 inner ring 5x4
      ...makeGrid(1, 1.5, 1.0, 5, 4), // 20 -> 55
      // Tier 2 stepped core 4x3
      ...makeGrid(2, 2.0, 1.5, 4, 3), // 12 -> 67
      // Tier 3 altar 3x3
      ...makeGrid(3, 2.5, 1.5, 3, 3), // 9 -> 76
      // Tier 4 pinnacle
      ...makeGrid(4, 3.0, 2.0, 2, 2), // 4
      { layer: 5, gridX: 3.5, gridY: 2.5 } // 1 -> 81 total
    ]
  },
  {
    id: 10,
    worldId: 5,
    worldName: 'Golden Sanctuary',
    title: 'Celestial Spire',
    theme: 'COSMIC_GEMS',
    layoutName: 'Nebula Spire',
    tileTypes: ['ruby', 'emerald', 'sapphire', 'saturn', 'sun', 'moon', 'nova', 'comet'],
    totalTiles: 90, // 30 trios
    targetScore: 28000,
    starScores: [14000, 21000, 28000],
    presetLayout: [
      // Base layer 8x5
      ...makeGrid(0, 0.0, 0.5, 8, 5), // 40
      // Tier 1 6x4
      ...makeGrid(1, 1.0, 1.0, 6, 4), // 24 -> 64
      // Tier 2 4x3
      ...makeGrid(2, 2.0, 1.5, 4, 3), // 12 -> 76
      // Tier 3 3x3
      ...makeGrid(3, 2.5, 1.5, 3, 3), // 9 -> 85
      // Tier 4 spire
      ...makeGrid(4, 3.0, 2.0, 2, 2), // 4
      { layer: 5, gridX: 3.5, gridY: 2.5 } // 1 -> 90 total
    ]
  },
  {
    id: 11,
    worldId: 6,
    worldName: 'Mythic Citadel',
    title: 'Dragon Gateway',
    theme: 'ZEN_GARDEN',
    layoutName: 'Twin Dragon Gates',
    tileTypes: ['bonsai', 'lotus', 'matcha', 'lantern', 'koi', 'bamboo', 'pebble', 'fan', 'cherry', 'crane'],
    totalTiles: 99, // 33 trios
    targetScore: 32000,
    starScores: [16000, 24000, 32000],
    presetLayout: [
      // Twin gate foundations
      ...makeGrid(0, 0.0, 0.5, 3, 6), // 18 left
      ...makeGrid(0, 5.0, 0.5, 3, 6), // 18 right
      ...makeGrid(0, 2.5, 1.5, 3, 3), // 9 center bridge -> 45
      // Tier 1 bridge & towers
      ...makeGrid(1, 1.0, 1.0, 6, 4), // 24 -> 69
      // Tier 2 dragon crests
      ...makeGrid(2, 1.5, 1.5, 5, 3), // 15 -> 84
      // Tier 3 upper arches
      ...makeGrid(3, 2.0, 1.5, 4, 2), // 8 -> 92
      // Tier 4 spires
      ...makeGrid(4, 2.5, 2.0, 3, 2), // 6
      { layer: 5, gridX: 3.5, gridY: 2.5 } // 1 -> 99 total
    ]
  },
  {
    id: 12,
    worldId: 6,
    worldName: 'Mythic Citadel',
    title: 'Grand Celestial Mandala',
    theme: 'COSMIC_GEMS',
    layoutName: 'The Master Mandala',
    tileTypes: ['ruby', 'emerald', 'sapphire', 'saturn', 'sun', 'moon', 'nova', 'comet'],
    totalTiles: 108, // 36 trios
    targetScore: 36000,
    starScores: [18000, 27000, 36000],
    presetLayout: [
      // Layer 0: foundation 8x6
      ...makeGrid(0, 0.0, 0.5, 8, 6), // 48
      // Layer 1: diamond ring 6x4
      ...makeGrid(1, 1.0, 1.0, 6, 4), // 24 -> 72
      // Layer 2: middle tiers
      ...makeGrid(2, 1.5, 1.5, 5, 3), // 15 -> 87
      // Layer 3: inner shrine
      ...makeGrid(3, 2.0, 1.5, 4, 3), // 12 -> 99
      // Layer 4: stepped altar
      ...makeGrid(4, 2.5, 2.0, 3, 2), // 6 -> 105
      // Layer 5: pinnacle
      { layer: 5, gridX: 3.0, gridY: 2.5 },
      { layer: 5, gridX: 4.0, gridY: 2.5 },
      { layer: 6, gridX: 3.5, gridY: 2.5 } // 3 -> 108 total
    ]
  }
];

/**
 * Initializes a game level by populating the layout with guaranteed triplets of matching tiles.
 */
export const buildLevelTiles = (level: LevelConfig): BoardTile[] => {
  const totalSlots = level.presetLayout.length;
  // Ensure total is divisible by 3
  const validTotal = totalSlots - (totalSlots % 3);
  const layout = level.presetLayout.slice(0, validTotal);

  const numTriplets = validTotal / 3;
  const tilePool: string[] = [];

  // Cycle through allowed tile types to fill exact triplets
  for (let i = 0; i < numTriplets; i++) {
    const type = level.tileTypes[i % level.tileTypes.length];
    tilePool.push(type, type, type);
  }

  // Shuffle the tile types with Fisher-Yates
  for (let i = tilePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tilePool[i], tilePool[j]] = [tilePool[j], tilePool[i]];
  }

  // Assign to slots
  const tiles: BoardTile[] = layout.map((pos, index) => ({
    id: `tile_${level.id}_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: pos.type || tilePool[index],
    layer: pos.layer,
    gridX: pos.gridX,
    gridY: pos.gridY,
    state: 'BOARD',
    isCovered: false
  }));

  // Calculate initial coverage status
  tiles.forEach(tile => {
    tile.isCovered = isTileCovered(tile, tiles, tile.id);
  });

  return tiles;
};

/**
 * Generates a procedural level for Zen Mode or Time Attack with progressive difficulty curve.
 * Each successive level number increases:
 * 1. Triplet count (more tiles on board)
 * 2. Tile type pool (more distinct colors/symbols, tighter 7-slot tray management!)
 * 3. Layer stacking depth (more obscured covered lower tiles)
 */
export const generateProceduralLevel = (
  levelNumber: number,
  themeId: ThemeId = 'ZEN_GARDEN'
): LevelConfig => {
  const theme = TILE_THEMES[themeId] || TILE_THEMES.ZEN_GARDEN;
  const availableTypes = Object.keys(theme.tiles);

  // Progressive difficulty scaling:
  // Level 1: 3 types, 18 tiles
  // Level 2: 4 types, 24 tiles
  // Level 3: 5 types, 30 tiles
  // Level 4: 6 types, 36 tiles
  // Level 5: 7 types, 45 tiles
  // Level 6+: up to 9-10 types and 72+ tiles!
  const numTypesToUse = Math.min(
    availableTypes.length,
    Math.min(10, 3 + Math.floor(levelNumber * 0.75))
  );
  const selectedTypes = availableTypes.slice(0, numTypesToUse);

  const tripletsCount = Math.min(36, 6 + Math.floor(levelNumber * 2));
  const totalTiles = tripletsCount * 3;
  const layout: Array<{ layer: number; gridX: number; gridY: number }> = [];

  const baseCols = Math.min(7, 4 + Math.floor(levelNumber / 3));
  const baseRows = Math.ceil((totalTiles * 0.45) / baseCols);

  // Layer 0: foundation
  for (let r = 0; r < baseRows; r++) {
    for (let c = 0; c < baseCols; c++) {
      if (layout.length < totalTiles * 0.48) {
        layout.push({ layer: 0, gridX: 1.0 + c, gridY: 0.8 + r });
      }
    }
  }

  // Layer 1: overlapping tier
  const remainingL1 = Math.min(totalTiles - layout.length, Math.floor(totalTiles * 0.28));
  for (let i = 0; i < remainingL1; i++) {
    const c = i % (baseCols - 1);
    const r = Math.floor(i / (baseCols - 1));
    layout.push({ layer: 1, gridX: 1.5 + c, gridY: 1.3 + r });
  }

  // Layer 2: intermediate apex
  const remainingL2 = Math.min(totalTiles - layout.length, Math.floor(totalTiles * 0.16));
  for (let i = 0; i < remainingL2; i++) {
    const c = i % (baseCols - 2);
    const r = Math.floor(i / (baseCols - 2));
    layout.push({ layer: 2, gridX: 2.0 + c, gridY: 1.8 + r });
  }

  // Layer 3 & 4: high spires for level >= 3
  while (layout.length < totalTiles) {
    const idx = layout.length % 6;
    const l = levelNumber >= 5 && layout.length > totalTiles - 4 ? 4 : 3;
    layout.push({
      layer: l,
      gridX: 2.5 + (idx % 3) * 0.5,
      gridY: 2.2 + Math.floor(idx / 3) * 0.5
    });
  }

  return {
    id: 1000 + levelNumber,
    worldId: Math.min(6, 1 + Math.floor(levelNumber / 2)),
    worldName: levelNumber <= 2 ? 'Zen Chamber' : levelNumber <= 4 ? 'Pagoda Sanctum' : 'Master Citadel',
    title: `Sanctuary Stage ${levelNumber}`,
    theme: themeId,
    layoutName: `Progressive Mandala ${levelNumber}`,
    tileTypes: selectedTypes,
    totalTiles,
    targetScore: totalTiles * (150 + levelNumber * 20),
    starScores: [
      totalTiles * (80 + levelNumber * 10),
      totalTiles * (120 + levelNumber * 15),
      totalTiles * (150 + levelNumber * 20)
    ],
    presetLayout: layout
  };
};
