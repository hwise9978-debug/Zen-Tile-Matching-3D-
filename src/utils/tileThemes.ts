import { ThemeId, TileDefinition } from '../types/game';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  bgImage: string;
  bgGradient: string;
  accentColor: string;
  tileFaceStyle: string;
  tiles: Record<string, TileDefinition>;
}

export const TILE_THEMES: Record<ThemeId, ThemeConfig> = {
  ZEN_GARDEN: {
    id: 'ZEN_GARDEN',
    name: 'Zen Garden',
    tagline: 'Tranquil pebbles, moss stones & bonsai',
    bgImage: '/src/assets/images/game_bg_zen_garden_1793549121089.jpg',
    bgGradient: 'from-[#101b13] via-[#0d1710] to-[#070e0a]',
    accentColor: '#10b981',
    tileFaceStyle: 'bg-gradient-to-b from-[#fbf8f1] to-[#ede3d1] text-emerald-950 border-[#d8c8b0] shadow-[#1a2c1f]/40',
    tiles: {
      bonsai: {
        type: 'bonsai',
        name: 'Bonsai',
        symbol: '🪴',
        color: '#059669',
        bgGradient: 'from-emerald-100 to-emerald-200',
        borderColor: '#a7f3d0',
        accentColor: '#047857'
      },
      lotus: {
        type: 'lotus',
        name: 'Lotus',
        symbol: '🪷',
        color: '#ec4899',
        bgGradient: 'from-pink-100 to-pink-200',
        borderColor: '#fbcfe8',
        accentColor: '#be185d'
      },
      matcha: {
        type: 'matcha',
        name: 'Matcha',
        symbol: '🍵',
        color: '#15803d',
        bgGradient: 'from-green-100 to-lime-200',
        borderColor: '#bbf7d0',
        accentColor: '#166534'
      },
      lantern: {
        type: 'lantern',
        name: 'Lantern',
        symbol: '🏮',
        color: '#dc2626',
        bgGradient: 'from-red-100 to-amber-200',
        borderColor: '#fecaca',
        accentColor: '#b91c1c'
      },
      koi: {
        type: 'koi',
        name: 'Koi Fish',
        symbol: '🐟',
        color: '#ea580c',
        bgGradient: 'from-orange-100 to-amber-200',
        borderColor: '#fed7aa',
        accentColor: '#c2410c'
      },
      bamboo: {
        type: 'bamboo',
        name: 'Bamboo',
        symbol: '🎍',
        color: '#16a34a',
        bgGradient: 'from-emerald-100 to-green-200',
        borderColor: '#a7f3d0',
        accentColor: '#15803d'
      },
      pebble: {
        type: 'pebble',
        name: 'River Stone',
        symbol: '🪨',
        color: '#475569',
        bgGradient: 'from-slate-100 to-stone-200',
        borderColor: '#cbd5e1',
        accentColor: '#334155'
      },
      fan: {
        type: 'fan',
        name: 'Silk Fan',
        symbol: '🪭',
        color: '#9333ea',
        bgGradient: 'from-purple-100 to-pink-200',
        borderColor: '#e9d5ff',
        accentColor: '#7e22ce'
      },
      cherry: {
        type: 'cherry',
        name: 'Cherry Blossom',
        symbol: '🌸',
        color: '#db2777',
        bgGradient: 'from-rose-100 to-pink-200',
        borderColor: '#fecdd3',
        accentColor: '#be123c'
      },
      crane: {
        type: 'crane',
        name: 'Origami Crane',
        symbol: '🕊️',
        color: '#0284c7',
        bgGradient: 'from-sky-100 to-cyan-200',
        borderColor: '#bae6fd',
        accentColor: '#0369a1'
      }
    }
  },

  COSMIC_GEMS: {
    id: 'COSMIC_GEMS',
    name: 'Cosmic Gems',
    tagline: 'Crystalline constellations & stellar relics',
    bgImage: '/src/assets/images/game_bg_cosmic_gems_1793549121518.jpg',
    bgGradient: 'from-[#120e24] via-[#1a1435] to-[#0a0718]',
    accentColor: '#a855f7',
    tileFaceStyle: 'bg-gradient-to-b from-[#f3e8ff] to-[#e9d5ff] text-purple-950 border-[#c084fc] shadow-[#2b184f]/50',
    tiles: {
      ruby: {
        type: 'ruby',
        name: 'Star Ruby',
        symbol: '💎',
        color: '#e11d48',
        bgGradient: 'from-rose-100 to-rose-200',
        borderColor: '#fecdd3',
        accentColor: '#be123c'
      },
      emerald: {
        type: 'emerald',
        name: 'Void Emerald',
        symbol: '❇️',
        color: '#059669',
        bgGradient: 'from-emerald-100 to-teal-200',
        borderColor: '#a7f3d0',
        accentColor: '#047857'
      },
      sapphire: {
        type: 'sapphire',
        name: 'Sapphire',
        symbol: '🔮',
        color: '#3b82f6',
        bgGradient: 'from-blue-100 to-indigo-200',
        borderColor: '#bfdbfe',
        accentColor: '#1d4ed8'
      },
      saturn: {
        type: 'saturn',
        name: 'Saturn Ring',
        symbol: '🪐',
        color: '#d97706',
        bgGradient: 'from-amber-100 to-yellow-200',
        borderColor: '#fde68a',
        accentColor: '#b45309'
      },
      sun: {
        type: 'sun',
        name: 'Golden Sun',
        symbol: '☀️',
        color: '#eab308',
        bgGradient: 'from-amber-100 to-orange-200',
        borderColor: '#fef08a',
        accentColor: '#ca8a04'
      },
      moon: {
        type: 'moon',
        name: 'Crescent Moon',
        symbol: '🌙',
        color: '#8b5cf6',
        bgGradient: 'from-violet-100 to-indigo-200',
        borderColor: '#ddd6fe',
        accentColor: '#6d28d9'
      },
      comet: {
        type: 'comet',
        name: 'Comet Core',
        symbol: '☄️',
        color: '#06b6d4',
        bgGradient: 'from-cyan-100 to-sky-200',
        borderColor: '#a5f3fc',
        accentColor: '#0891b2'
      },
      nova: {
        type: 'nova',
        name: 'Supernova',
        symbol: '⭐',
        color: '#f59e0b',
        bgGradient: 'from-yellow-100 to-amber-200',
        borderColor: '#fde68a',
        accentColor: '#d97706'
      }
    }
  },

  SWEET_TREATS: {
    id: 'SWEET_TREATS',
    name: 'Sweet Treats',
    tagline: 'Delicious bakery pastries & candies',
    bgImage: '/src/assets/images/tile_game_app_icon_1793549121515.jpg',
    bgGradient: 'from-[#2a131b] via-[#3d1927] to-[#1d0d14]',
    accentColor: '#f43f5e',
    tileFaceStyle: 'bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] text-pink-950 border-[#fda4af] shadow-[#38111e]/40',
    tiles: {
      donut: {
        type: 'donut',
        name: 'Glazed Donut',
        symbol: '🍩',
        color: '#db2777',
        bgGradient: 'from-pink-100 to-rose-200',
        borderColor: '#fbcfe8',
        accentColor: '#be185d'
      },
      cupcake: {
        type: 'cupcake',
        name: 'Cupcake',
        symbol: '🧁',
        color: '#e11d48',
        bgGradient: 'from-rose-100 to-pink-200',
        borderColor: '#fecdd3',
        accentColor: '#9f1239'
      },
      strawberry: {
        type: 'strawberry',
        name: 'Strawberry',
        symbol: '🍓',
        color: '#ef4444',
        bgGradient: 'from-red-100 to-rose-200',
        borderColor: '#fca5a5',
        accentColor: '#b91c1c'
      },
      macaron: {
        type: 'macaron',
        name: 'Macaron',
        symbol: '🍪',
        color: '#d97706',
        bgGradient: 'from-amber-100 to-yellow-200',
        borderColor: '#fde68a',
        accentColor: '#b45309'
      },
      icecream: {
        type: 'icecream',
        name: 'Soft Serve',
        symbol: '🍦',
        color: '#06b6d4',
        bgGradient: 'from-cyan-100 to-blue-200',
        borderColor: '#a5f3fc',
        accentColor: '#0e7490'
      },
      boba: {
        type: 'boba',
        name: 'Boba Milk',
        symbol: '🧋',
        color: '#b45309',
        bgGradient: 'from-amber-100 to-stone-200',
        borderColor: '#fde68a',
        accentColor: '#78350f'
      },
      lollipop: {
        type: 'lollipop',
        name: 'Lollipop',
        symbol: '🍭',
        color: '#a855f7',
        bgGradient: 'from-purple-100 to-fuchsia-200',
        borderColor: '#e9d5ff',
        accentColor: '#7e22ce'
      },
      pancake: {
        type: 'pancake',
        name: 'Pancakes',
        symbol: '🥞',
        color: '#eab308',
        bgGradient: 'from-amber-100 to-orange-200',
        borderColor: '#fef08a',
        accentColor: '#ca8a04'
      }
    }
  },

  CUTE_SAFARI: {
    id: 'CUTE_SAFARI',
    name: 'Wild Safari',
    tagline: 'Friendly critters & forest companions',
    bgImage: '/src/assets/images/game_bg_zen_garden_1793549121089.jpg',
    bgGradient: 'from-[#141e15] via-[#1b261b] to-[#0f1710]',
    accentColor: '#84cc16',
    tileFaceStyle: 'bg-gradient-to-b from-[#f7fee7] to-[#ecfccb] text-lime-950 border-[#bef264] shadow-[#1b2b11]/40',
    tiles: {
      panda: {
        type: 'panda',
        name: 'Panda',
        symbol: '🐼',
        color: '#334155',
        bgGradient: 'from-slate-100 to-slate-200',
        borderColor: '#cbd5e1',
        accentColor: '#1e293b'
      },
      fox: {
        type: 'fox',
        name: 'Red Fox',
        symbol: '🦊',
        color: '#ea580c',
        bgGradient: 'from-orange-100 to-amber-200',
        borderColor: '#fed7aa',
        accentColor: '#c2410c'
      },
      koala: {
        type: 'koala',
        name: 'Koala',
        symbol: '🐨',
        color: '#64748b',
        bgGradient: 'from-slate-100 to-stone-200',
        borderColor: '#cbd5e1',
        accentColor: '#475569'
      },
      lion: {
        type: 'lion',
        name: 'Lion',
        symbol: '🦁',
        color: '#d97706',
        bgGradient: 'from-amber-100 to-yellow-200',
        borderColor: '#fde68a',
        accentColor: '#b45309'
      },
      owl: {
        type: 'owl',
        name: 'Wise Owl',
        symbol: '🦉',
        color: '#78350f',
        bgGradient: 'from-amber-100 to-orange-200',
        borderColor: '#fde68a',
        accentColor: '#451a03'
      },
      frog: {
        type: 'frog',
        name: 'Tree Frog',
        symbol: '🐸',
        color: '#16a34a',
        bgGradient: 'from-emerald-100 to-lime-200',
        borderColor: '#a7f3d0',
        accentColor: '#15803d'
      },
      bunny: {
        type: 'bunny',
        name: 'Bunny',
        symbol: '🐰',
        color: '#db2777',
        bgGradient: 'from-pink-100 to-rose-200',
        borderColor: '#fbcfe8',
        accentColor: '#be185d'
      },
      tiger: {
        type: 'tiger',
        name: 'Tiger',
        symbol: '🐯',
        color: '#f97316',
        bgGradient: 'from-orange-100 to-amber-200',
        borderColor: '#fed7aa',
        accentColor: '#ea580c'
      }
    }
  }
};

export const getTileDefinition = (themeId: ThemeId, type: string): TileDefinition => {
  const theme = TILE_THEMES[themeId] || TILE_THEMES.ZEN_GARDEN;
  if (theme.tiles[type]) {
    return theme.tiles[type];
  }
  // Fallback to first available tile in theme
  const firstKey = Object.keys(theme.tiles)[0];
  return theme.tiles[firstKey] || {
    type,
    name: type,
    symbol: '✨',
    color: '#10b981',
    bgGradient: 'from-slate-100 to-slate-200',
    borderColor: '#cbd5e1',
    accentColor: '#059669'
  };
};
