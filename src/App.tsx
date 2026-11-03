import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BoardTile, BoosterInventory, GameMode, GameState, LevelConfig, PlayerStats, ThemeId, UndoStep } from './types/game';
import { CAMPAIGN_LEVELS, buildLevelTiles, generateProceduralLevel, isTileCovered } from './utils/levels';
import { TILE_THEMES } from './utils/tileThemes';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { GameBoard } from './components/GameBoard';
import { BubbleShooterBoard } from './components/BubbleShooterBoard';
import { CollectorDock } from './components/CollectorDock';
import { PowerUpBar } from './components/PowerUpBar';
import { Modals } from './components/Modals';
import { CashTournamentModal } from './components/CashTournamentModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { PublishModal } from './components/PublishModal';
import { GooglePlayPublishModal } from './components/GooglePlayPublishModal';
import { MobileFrame } from './components/MobileFrame';
import confetti from 'canvas-confetti';
import { Sparkles, DollarSign, Trophy, Smartphone, Target, Layers, Share2, Gift, Maximize, Minimize, ShoppingBag } from 'lucide-react';
import { GameplayStyle, DailyCheckInData } from './types/game';
import { checkDailyClaimStatus, computeIntegrityHash, DailyRewardTier } from './utils/antiCheat';

const INITIAL_BOOSTERS: BoosterInventory = {
  undo: 5,
  shuffle: 4,
  autoMatch: 3,
  extraSlot: 2
};

const INITIAL_STATS: PlayerStats = {
  score: 0,
  highScores: {
    CAMPAIGN: 0,
    ZEN: 0,
    TIME_ATTACK: 0,
    DAILY: 0
  },
  unlockedLevel: 1,
  starsEarned: {},
  coins: 500,
  boosters: INITIAL_BOOSTERS,
  totalMatches: 0,
  zenRoundsCleared: 0,
  dailyCompletedDate: '',
  selectedTheme: 'ZEN_GARDEN',
  soundEnabled: true,
  ambientMusicEnabled: true,
  hapticsEnabled: true,
  mobileFrameMode: typeof window !== 'undefined' ? window.innerWidth > 640 : true
};

export default function App() {
  // Full Screen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(
        !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  // Gameplay Style (Bubble Shooter Matcher vs 3D Zen Tile Stack)
  const [gameplayStyle, setGameplayStyle] = useState<GameplayStyle>('BUBBLE_SHOOTER');

  // Game State
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);

  // Active Level Config memoized to avoid procedural recomputation on unrelated renders
  const currentLevel: LevelConfig = useMemo(() => {
    return gameMode === 'CAMPAIGN'
      ? CAMPAIGN_LEVELS[currentLevelIndex] || CAMPAIGN_LEVELS[0]
      : generateProceduralLevel(currentLevelIndex + 1, 'ZEN_GARDEN');
  }, [gameMode, currentLevelIndex]);

  // Board & Dock State
  const [boardTiles, setBoardTiles] = useState<BoardTile[]>([]);
  const [dockTiles, setDockTiles] = useState<BoardTile[]>([]);
  const [matchingIds, setMatchingIds] = useState<string[]>([]);
  const [maxDockCapacity, setMaxDockCapacity] = useState<number>(7);
  const [undoHistory, setUndoHistory] = useState<UndoStep[]>([]);

  // Scores, Combos & Rush Timer
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(90);

  // Legit Prize Cash Balance & Transaction History
  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tile_match_cash_vault');
      return saved !== null ? parseFloat(saved) : 15.00; // Welcome reward of $15.00 to start!
    } catch {
      return 15.00;
    }
  });

  const [withdrawalHistory, setWithdrawalHistory] = useState<Array<{
    id: string;
    amount: number;
    method: string;
    recipient: string;
    status: 'COMPLETED' | 'PENDING';
    date: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('tile_match_payouts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isPlayPublishModalOpen, setIsPlayPublishModalOpen] = useState<boolean>(false);

  // Daily Check-In State with Anti-Cheat Tamper Protection
  const [dailyCheckInData, setDailyCheckInData] = useState<DailyCheckInData>(() => {
    try {
      const saved = localStorage.getItem('tile_match_daily_checkin');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      lastClaimTimestamp: 0,
      currentStreak: 0,
      totalClaimsCount: 0,
      integrityHash: computeIntegrityHash(0, 0, 0),
      lastCheckedClientTime: Date.now()
    };
  });

  // Automatically prompt daily check-in reward on launch if available
  useEffect(() => {
    const status = checkDailyClaimStatus(dailyCheckInData);
    if (status.isClaimable) {
      const timer = setTimeout(() => setIsDailyModalOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Claim Daily Check-In Reward Handler
  const handleClaimDailyReward = (reward: DailyRewardTier) => {
    const now = Date.now();
    const nextStreak = reward.day;
    const nextTotal = (dailyCheckInData?.totalClaimsCount || 0) + 1;
    const newHash = computeIntegrityHash(nextStreak, now, nextTotal);

    const updatedCheckIn: DailyCheckInData = {
      lastClaimTimestamp: now,
      currentStreak: nextStreak,
      totalClaimsCount: nextTotal,
      integrityHash: newHash,
      lastCheckedClientTime: now
    };

    setDailyCheckInData(updatedCheckIn);
    try {
      localStorage.setItem('tile_match_daily_checkin', JSON.stringify(updatedCheckIn));
    } catch {
      // Ignore
    }

    // Award Coins + Free Booster
    setPlayerStats(prev => ({
      ...prev,
      coins: prev.coins + reward.coins,
      boosters: {
        ...prev.boosters,
        [reward.boosterType]: (prev.boosters[reward.boosterType] || 0) + reward.boosterCount
      }
    }));

    // Award cash bonus if applicable
    if (reward.cashBonus > 0) {
      setCashBalance(c => c + reward.cashBonus);
    }
  };

  // Player Stats & Customization
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('tile_match_player_stats');
      return saved ? { ...INITIAL_STATS, ...JSON.parse(saved) } : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Active theme configuration
  const currentTheme = TILE_THEMES[playerStats.selectedTheme] || TILE_THEMES.ZEN_GARDEN;

  // Save Stats
  useEffect(() => {
    try {
      localStorage.setItem('tile_match_player_stats', JSON.stringify(playerStats));
      localStorage.setItem('tile_match_cash_vault', cashBalance.toFixed(2));
      localStorage.setItem('tile_match_payouts', JSON.stringify(withdrawalHistory));
    } catch {
      // Ignore
    }
  }, [playerStats, cashBalance, withdrawalHistory]);

  // Recalculate board coverage helper
  const recomputeCoverage = (tiles: BoardTile[]): BoardTile[] => {
    return tiles.map(tile => {
      if (tile.state !== 'BOARD') return tile;
      const covered = isTileCovered(tile, tiles, tile.id);
      return { ...tile, isCovered: covered };
    });
  };

  // Initialize a Level
  const initGame = useCallback(
    (mode: GameMode = gameMode, levelIndex: number = currentLevelIndex) => {
      setGameMode(mode);
      setCurrentLevelIndex(levelIndex);

      let config: LevelConfig;
      if (mode === 'CAMPAIGN') {
        config = CAMPAIGN_LEVELS[levelIndex] || CAMPAIGN_LEVELS[0];
      } else if (mode === 'TIME_ATTACK') {
        config = generateProceduralLevel(levelIndex + 1, playerStats.selectedTheme);
        setTimeRemaining(90);
      } else {
        // ZEN
        config = generateProceduralLevel(levelIndex + 1, playerStats.selectedTheme);
      }

      const generated = buildLevelTiles(config);
      setBoardTiles(generated);
      setDockTiles([]);
      setMatchingIds([]);
      setUndoHistory([]);
      setMaxDockCapacity(7);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setGameState('PLAYING');

      // Start gentle ambient chime if enabled
      if (playerStats.ambientMusicEnabled && !sound.isMuted) {
        sound.toggleAmbientMusic(true);
      }
    },
    [gameMode, currentLevelIndex, playerStats.selectedTheme, playerStats.ambientMusicEnabled]
  );

  // Initialize board tiles once on mount
  useEffect(() => {
    initGame('CAMPAIGN', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Time Attack 90s countdown clock
  useEffect(() => {
    if (gameState !== 'PLAYING' || gameMode !== 'TIME_ATTACK') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          sound.playGameOver();
          setGameState('GAME_OVER');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameMode]);

  // Handle Tile Pick (Move from board to dock)
  const handleTilePick = (tile: BoardTile) => {
    if (tile.isCovered || tile.state !== 'BOARD') return;
    if (dockTiles.length >= maxDockCapacity) {
      sound.playTileBlocked();
      return;
    }

    sound.playTileSelect();

    // 1. Save Undo snapshot
    const undoStep: UndoStep = {
      tileId: tile.id,
      originalLayer: tile.layer,
      originalGridX: tile.gridX,
      originalGridY: tile.gridY,
      previousDockTiles: [...dockTiles]
    };
    setUndoHistory(prev => [...prev, undoStep]);

    // 2. Insert into dock (cluster identical types together for visual clarity)
    const newDock = [...dockTiles];
    const sameTypeIndex = newDock.findLastIndex(t => t.type === tile.type);

    const updatedTile: BoardTile = {
      ...tile,
      state: 'DOCK'
    };

    if (sameTypeIndex !== -1) {
      newDock.splice(sameTypeIndex + 1, 0, updatedTile);
    } else {
      newDock.push(updatedTile);
    }

    setDockTiles(newDock);

    // 3. Update board tiles coverage
    const updatedBoard = boardTiles.map(t => (t.id === tile.id ? updatedTile : t));
    const recomputedBoard = recomputeCoverage(updatedBoard);
    setBoardTiles(recomputedBoard);

    // 4. Check for 3-of-a-kind match in dock
    const matchesOfType = newDock.filter(t => t.type === tile.type);

    if (matchesOfType.length >= 3) {
      const matchIds = matchesOfType.slice(0, 3).map(t => t.id);
      setMatchingIds(matchIds);

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo(prev => Math.max(prev, nextCombo));
      sound.playMatch(nextCombo);

      // Score bonus
      const points = 150 * nextCombo;
      setScore(s => s + points);

      // Time attack bonus (+3 seconds per match)
      if (gameMode === 'TIME_ATTACK') {
        setTimeRemaining(t => Math.min(120, t + 3));
      }

      // Small confetti sparkle for combo $\ge 2$
      if (nextCombo >= 2) {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.85 }
        });
      }

      // Clear the matched 3 tiles after quick shimmer animation
      setTimeout(() => {
        setDockTiles(currentDock => {
          const filtered = currentDock.filter(t => !matchIds.includes(t.id));

          // Check if board is cleared and dock is empty
          const remainingOnBoard = recomputedBoard.filter(t => t.state === 'BOARD');
          if (remainingOnBoard.length === 0 && filtered.length === 0) {
            handleVictory();
          }

          return filtered;
        });

        setMatchingIds([]);
      }, 260);
    } else {
      // Check if dock is dangerously full
      if (newDock.length >= maxDockCapacity) {
        sound.playWarning();
        // Give 450ms leeway before declaring game over in case a quick match occurs
        setTimeout(() => {
          setDockTiles(latestDock => {
            if (latestDock.length >= maxDockCapacity) {
              sound.playGameOver();
              setGameState('GAME_OVER');
            }
            return latestDock;
          });
        }, 450);
      } else if (newDock.length >= maxDockCapacity - 1) {
        sound.playWarning();
      }
    }
  };

  // Victory Celebration
  const handleVictory = () => {
    sound.playVictory();
    setGameState('STAGE_CLEAR');

    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });

    // Credit legit cash prize reward
    const prizeWon = 1.50; // $1.50 per stage clear
    setCashBalance(prev => prev + prizeWon);

    // Save star rating
    let starsEarned = 1;
    if (score >= currentLevel.starScores[2]) starsEarned = 3;
    else if (score >= currentLevel.starScores[1]) starsEarned = 2;

    setPlayerStats(stats => ({
      ...stats,
      unlockedLevel: Math.max(stats.unlockedLevel, currentLevelIndex + 2),
      starsEarned: {
        ...stats.starsEarned,
        [currentLevel.id]: Math.max(stats.starsEarned[currentLevel.id] || 0, starsEarned)
      },
      coins: stats.coins + 150,
      totalMatches: stats.totalMatches + 1
    }));
  };

  // Booster: Undo last tile
  const handleUseUndo = () => {
    if (undoHistory.length === 0 || playerStats.boosters.undo <= 0) return;
    const lastStep = undoHistory[undoHistory.length - 1];
    setUndoHistory(prev => prev.slice(0, -1));

    // Remove tile from dock
    setDockTiles(currentDock => currentDock.filter(t => t.id !== lastStep.tileId));

    // Restore tile on board
    setBoardTiles(currentBoard => {
      const updated = currentBoard.map(t => {
        if (t.id === lastStep.tileId) {
          return {
            ...t,
            state: 'BOARD' as const,
            layer: lastStep.originalLayer,
            gridX: lastStep.originalGridX,
            gridY: lastStep.originalGridY
          };
        }
        return t;
      });
      return recomputeCoverage(updated);
    });

    sound.playUndo();

    // Decrement inventory
    setPlayerStats(s => ({
      ...s,
      boosters: { ...s.boosters, undo: s.boosters.undo - 1 }
    }));
  };

  // Booster: Shuffle remaining board tiles
  const handleUseShuffle = () => {
    if (playerStats.boosters.shuffle <= 0) return;
    sound.playShuffle();

    setBoardTiles(currentBoard => {
      const activeBoardTiles = currentBoard.filter(t => t.state === 'BOARD');
      const types = activeBoardTiles.map(t => t.type);

      // Shuffle types
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }

      let typeIdx = 0;
      const updated = currentBoard.map(t => {
        if (t.state === 'BOARD') {
          const newType = types[typeIdx++];
          return { ...t, type: newType };
        }
        return t;
      });

      return recomputeCoverage(updated);
    });

    setPlayerStats(s => ({
      ...s,
      boosters: { ...s.boosters, shuffle: s.boosters.shuffle - 1 }
    }));
  };

  // Booster: Auto Match (Magic Wand)
  const handleUseAutoMatch = () => {
    if (playerStats.boosters.autoMatch <= 0) return;

    // Find any tile type that exists in at least 3 instances on board + dock
    const allAvailable = [
      ...dockTiles,
      ...boardTiles.filter(t => t.state === 'BOARD' && !t.isCovered)
    ];

    const typeCounts: Record<string, number> = {};
    allAvailable.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });

    const candidateType = Object.keys(typeCounts).find(type => typeCounts[type] >= 3);

    if (candidateType) {
      sound.playMagicWand();

      // Pick up to 3 tiles of this candidate type
      const targetDockTiles = dockTiles.filter(t => t.type === candidateType);
      const neededFromBoard = 3 - targetDockTiles.length;
      const targetBoardTiles = boardTiles
        .filter(t => t.state === 'BOARD' && t.type === candidateType && !t.isCovered)
        .slice(0, neededFromBoard);

      const allTargets = [...targetDockTiles, ...targetBoardTiles];
      const matchIds = allTargets.map(t => t.id);

      setMatchingIds(matchIds);
      sound.playMatch(combo + 1);

      setTimeout(() => {
        // Clear from dock
        setDockTiles(dock => dock.filter(t => !matchIds.includes(t.id)));

        // Remove from board
        setBoardTiles(board => {
          const updated = board.map(t =>
            matchIds.includes(t.id) ? { ...t, state: 'REMOVED' as const } : t
          );
          return recomputeCoverage(updated);
        });

        setMatchingIds([]);
        setScore(s => s + 450);

        // Check stage clear
        const remainingBoard = boardTiles.filter(
          t => t.state === 'BOARD' && !matchIds.includes(t.id)
        );
        if (remainingBoard.length === 0) {
          handleVictory();
        }
      }, 250);

      setPlayerStats(s => ({
        ...s,
        boosters: { ...s.boosters, autoMatch: s.boosters.autoMatch - 1 }
      }));
    } else {
      sound.playTileBlocked();
    }
  };

  // Booster: Extra Slot (+1)
  const handleUseExtraSlot = () => {
    if (maxDockCapacity >= 8 || playerStats.boosters.extraSlot <= 0) return;
    setMaxDockCapacity(8);
    sound.playMagicWand();
    setPlayerStats(s => ({
      ...s,
      boosters: { ...s.boosters, extraSlot: s.boosters.extraSlot - 1 }
    }));
  };

  // Revive & Undo from Game Over
  const handleReviveUndo = () => {
    // Return 3 tiles from dock back to board
    if (dockTiles.length === 0) {
      setGameState('PLAYING');
      return;
    }

    const tilesToReturn = dockTiles.slice(-3);
    const returnIds = tilesToReturn.map(t => t.id);

    setDockTiles(current => current.filter(t => !returnIds.includes(t.id)));

    setBoardTiles(current => {
      const updated = current.map(t => {
        if (returnIds.includes(t.id)) {
          return { ...t, state: 'BOARD' as const };
        }
        return t;
      });
      return recomputeCoverage(updated);
    });

    sound.playUndo();
    setGameState('PLAYING');
  };

  // Handle Instant Cash Payout
  const handleWithdrawal = (amount: number, method: string, recipient: string) => {
    setCashBalance(prev => Math.max(0, prev - amount));
    const newTx = {
      id: `TX-${Date.now().toString(36).toUpperCase()}`,
      amount,
      method,
      recipient,
      status: 'COMPLETED' as const,
      date: new Date().toISOString()
    };
    setWithdrawalHistory(prev => [newTx, ...prev]);
  };

  // Progression to next level
  const handleNextLevel = () => {
    if (gameMode === 'CAMPAIGN') {
      const nextIdx = (currentLevelIndex + 1) % CAMPAIGN_LEVELS.length;
      initGame('CAMPAIGN', nextIdx);
    } else {
      initGame(gameMode, currentLevelIndex + 1);
    }
  };

  const remainingTilesCount = boardTiles.filter(t => t.state === 'BOARD').length;

  return (
    <div
      className={`min-h-screen w-full text-slate-100 flex flex-col font-sans overflow-x-hidden ${currentTheme.bgGradient}`}
    >
      {/* Background Thematic Illustration Wallpaper with CSS fallback scrim */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={currentTheme.bgImage}
          alt={currentTheme.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 mix-blend-screen scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e0b] via-[#090e0b]/80 to-[#090e0b]/90" />
      </div>

      {/* Top Bar Contract (Section 2): 1-line Wordmark — 4-5 text Nav Links — 1 Primary Action */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-white/10 glass-panel">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => setGameState('TITLE_MENU')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-stone-950 rounded-md flex items-center justify-center">
              <span className="text-sm">🪷</span>
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-white font-display">
            Zen Tile Match 3D
          </span>
        </div>

        {/* Zone 2: 4-5 Concise Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-400">
          <button
            onClick={() => initGame('CAMPAIGN', 0)}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'CAMPAIGN' && gameState === 'PLAYING' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Adventure
          </button>
          <button
            onClick={() => initGame('ZEN')}
            className={`hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'ZEN' && gameState === 'PLAYING' ? 'text-emerald-400 font-bold' : ''
            }`}
          >
            Zen Sanctuary
          </button>
          <button
            onClick={() => initGame('TIME_ATTACK')}
            className={`hover:text-rose-300 transition-colors whitespace-nowrap shrink-0 ${
              gameMode === 'TIME_ATTACK' && gameState === 'PLAYING' ? 'text-rose-400 font-bold' : ''
            }`}
          >
            Time Rush
          </button>
          <button
            onClick={() => setIsPlayPublishModalOpen(true)}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-emerald-400 font-bold"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sell on Google Play</span>
          </button>
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-amber-400/90"
          >
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span>Prize Vault ($0 Fee)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA & Style Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-stone-900 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setGameplayStyle('BUBBLE_SHOOTER')}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                gameplayStyle === 'BUBBLE_SHOOTER'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Bubble Match Shooter"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bubble</span>
              <span>Match</span>
            </button>
            <button
              onClick={() => setGameplayStyle('ZEN_STACK')}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                gameplayStyle === 'ZEN_STACK'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="3D Tile Stack"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tile</span>
              <span>Stack</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-400/30 text-amber-300 transition-all whitespace-nowrap shrink-0 shadow-sm"
            title={isFullscreen ? 'Exit Full Screen' : 'Play in Full Screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPlayPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/50 text-emerald-300 transition-all whitespace-nowrap shrink-0 shadow-md shadow-emerald-500/15"
            title="Officially Sell this Mobile Game on Google Play Store ($25 developer account, 85% revenue payout)"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sell on</span>
            <span>Google Play</span>
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-all whitespace-nowrap shrink-0 shadow-sm"
            title="Publish & Share to Facebook & Social Media"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => setIsCashModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all whitespace-nowrap shrink-0 shadow-sm font-mono"
            title="Instant Legit Cash Withdrawals"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>${cashBalance.toFixed(2)} Cash</span>
          </button>

          <button
            onClick={() => setGameState('TITLE_MENU')}
            className="px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-500/20 transition-all whitespace-nowrap shrink-0"
          >
            Menu
          </button>
        </div>
      </header>

      {/* Immersive Edge-to-Edge Full Screen Game Container */}
      <MobileFrame isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen}>
        <div className="relative flex-1 flex flex-col justify-between w-full h-full pb-3">
          {/* Top In-Game HUD */}
          <HUD
            levelTitle={gameplayStyle === 'BUBBLE_SHOOTER' ? `Bubble Stage ${currentLevelIndex + 1}` : currentLevel.title}
            worldName={gameplayStyle === 'BUBBLE_SHOOTER' ? 'Bubble Match 3' : currentLevel.worldName}
            score={score}
            combo={combo}
            tilesRemaining={gameplayStyle === 'BUBBLE_SHOOTER' ? 0 : remainingTilesCount}
            totalLevelTiles={boardTiles.length}
            gameMode={gameMode}
            timeRemaining={timeRemaining}
            cashBalance={cashBalance}
            isMuted={sound.isMuted}
            onToggleMute={() => {
              const nextMute = !sound.isMuted;
              sound.setMuted(nextMute);
              setPlayerStats(s => ({ ...s, soundEnabled: !nextMute }));
            }}
            isPaused={gameState === 'PAUSED'}
            onTogglePause={() =>
              setGameState(st => (st === 'PAUSED' ? 'PLAYING' : 'PAUSED'))
            }
            onOpenCashModal={() => setIsCashModalOpen(true)}
            onOpenMenu={() => setGameState('TITLE_MENU')}
            onOpenDailyModal={() => setIsDailyModalOpen(true)}
            isDailyClaimable={checkDailyClaimStatus(dailyCheckInData).isClaimable}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          {/* Central Game Arena: Bubble Shooter OR 3D Zen Tile Stack */}
          {gameplayStyle === 'BUBBLE_SHOOTER' ? (
            <BubbleShooterBoard
              themeId={playerStats.selectedTheme}
              levelNumber={currentLevelIndex + 1}
              onVictory={handleVictory}
              onScoreGain={(pts) => setScore(s => s + pts)}
              isPaused={gameState !== 'PLAYING'}
              onGameOver={() => setGameState('GAME_OVER')}
            />
          ) : (
            <>
              {/* Central 3D Layered Game Board */}
              <GameBoard
                tiles={boardTiles}
                themeId={playerStats.selectedTheme}
                onTilePick={handleTilePick}
                isPaused={gameState !== 'PLAYING'}
              />

              {/* Bottom Thumb Zone: Collector Dock + Tactile Power-ups */}
              <div className="w-full flex flex-col gap-2.5 z-20">
                <CollectorDock
                  dockTiles={dockTiles}
                  maxCapacity={maxDockCapacity}
                  themeId={playerStats.selectedTheme}
                  matchingIds={matchingIds}
                />

                <PowerUpBar
                  boosters={playerStats.boosters}
                  onUseUndo={handleUseUndo}
                  onUseShuffle={handleUseShuffle}
                  onUseAutoMatch={handleUseAutoMatch}
                  onUseExtraSlot={handleUseExtraSlot}
                  canUndo={dockTiles.length > 0 && undoHistory.length > 0}
                  extraSlotActive={maxDockCapacity > 7}
                />
              </div>
            </>
          )}
        </div>
      </MobileFrame>

      {/* Game Modals (Victory, Game Over, Pause, Title Menu) */}
      <Modals
        gameState={gameState}
        gameMode={gameMode}
        currentLevel={currentLevel}
        score={score}
        combo={combo}
        playerStats={playerStats}
        cashBalance={cashBalance}
        isMuted={sound.isMuted}
        volume={sound.volume}
        ambientEnabled={playerStats.ambientMusicEnabled}
        hapticsEnabled={sound.hapticsEnabled}
        onSelectMode={(mode, lvlId) => {
          const idx = lvlId ? lvlId - 1 : 0;
          initGame(mode, idx);
        }}
        onResume={() => setGameState('PLAYING')}
        onRestart={() => initGame(gameMode, currentLevelIndex)}
        onNextLevel={handleNextLevel}
        onReturnToMenu={() => setGameState('TITLE_MENU')}
        onToggleMute={() => {
          const nextMute = !sound.isMuted;
          sound.setMuted(nextMute);
          setPlayerStats(s => ({ ...s, soundEnabled: !nextMute }));
        }}
        onVolumeChange={vol => sound.setVolume(vol)}
        onToggleAmbient={() => {
          const nextVal = !playerStats.ambientMusicEnabled;
          sound.toggleAmbientMusic(nextVal);
          setPlayerStats(s => ({ ...s, ambientMusicEnabled: nextVal }));
        }}
        onToggleHaptics={() => {
          const nextVal = !sound.hapticsEnabled;
          sound.setHaptics(nextVal);
          setPlayerStats(s => ({ ...s, hapticsEnabled: nextVal }));
        }}
        onSelectTheme={tid => {
          setPlayerStats(s => ({ ...s, selectedTheme: tid }));
        }}
        onReviveUndo={handleReviveUndo}
        onOpenCashModal={() => setIsCashModalOpen(true)}
        onOpenPlayPublish={() => setIsPlayPublishModalOpen(true)}
        gameplayStyle={gameplayStyle}
        onSelectGameplayStyle={setGameplayStyle}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Prize Vault & Instant Payout Hub Modal */}
      <CashTournamentModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        balance={cashBalance}
        onWithdraw={handleWithdrawal}
        withdrawalHistory={withdrawalHistory}
      />

      {/* Daily Check-In 24h Reward System Modal with Anti-Cheat Protection */}
      <DailyCheckInModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        checkInData={dailyCheckInData}
        onClaimReward={handleClaimDailyReward}
      />

      {/* Google Play Store & Facebook Social Share Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Official Google Play Store Publishing & Monetization Console Modal */}
      <GooglePlayPublishModal
        isOpen={isPlayPublishModalOpen}
        onClose={() => setIsPlayPublishModalOpen(false)}
        onSimulatePurchase={(itemName, cost, coins, boosters) => {
          setPlayerStats(prev => ({
            ...prev,
            coins: prev.coins + coins,
            boosters: {
              ...prev.boosters,
              undo: prev.boosters.undo + boosters,
              shuffle: prev.boosters.shuffle + boosters,
              autoMatch: prev.boosters.autoMatch + boosters,
              extraSlot: prev.boosters.extraSlot + boosters
            }
          }));
        }}
      />
    </div>
  );
}
