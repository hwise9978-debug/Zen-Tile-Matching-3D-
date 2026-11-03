import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ShooterBubbleData, ThemeId } from '../types/game';
import { getTileDefinition, TILE_THEMES } from '../utils/tileThemes';
import { sound } from '../utils/audio';
import { RefreshCw, Sparkles, Plus, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BubbleShooterBoardProps {
  themeId: ThemeId;
  levelNumber: number;
  onVictory: () => void;
  onScoreGain: (points: number) => void;
  isPaused: boolean;
  onGameOver: () => void;
}

const GRID_COLS = 8;
const GRID_ROWS = 12;
const BUBBLE_RADIUS = 20; // 40px diameter

export const BubbleShooterBoard: React.FC<BubbleShooterBoardProps> = ({
  themeId,
  levelNumber,
  onVictory,
  onScoreGain,
  isPaused,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active grid bubbles (row, col)
  const [bubbles, setBubbles] = useState<ShooterBubbleData[]>([]);
  // Dock launcher bubbles
  const [currentBubble, setCurrentBubble] = useState<{ type: string; color: string; symbol: string; name: string } | null>(null);
  const [nextBubble, setNextBubble] = useState<{ type: string; color: string; symbol: string; name: string } | null>(null);
  const [shotsRemaining, setShotsRemaining] = useState<number>(45);

  // Synchronized refs to decouple high-speed 60fps animation loop from React render cycle
  const bubblesRef = useRef<ShooterBubbleData[]>(bubbles);
  bubblesRef.current = bubbles;

  const currentBubbleRef = useRef(currentBubble);
  currentBubbleRef.current = currentBubble;

  const aimAngleRef = useRef<number>(-Math.PI / 2);

  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  const onScoreGainRef = useRef(onScoreGain);
  onScoreGainRef.current = onScoreGain;

  const onVictoryRef = useRef(onVictory);
  onVictoryRef.current = onVictory;

  // Projectile in flight
  const projectileRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: string;
    color: string;
    symbol: string;
    name: string;
    active: boolean;
  } | null>(null);

  // Aiming angle (radians, 0 is straight up: -PI/2)
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 2);
  const isDraggingRef = useRef<boolean>(false);

  // Progressive Difficulty Scaling based on levelNumber
  const theme = TILE_THEMES[themeId] || TILE_THEMES.ZEN_GARDEN;

  // Memoize activeTypes so its array reference is stable and doesn't trigger effect loops
  const activeTypes = useMemo(() => {
    const availableTypes = Object.keys(theme.tiles);
    const colorsCount = Math.min(availableTypes.length, Math.min(8, 3 + Math.floor((levelNumber - 1) * 0.75)));
    return availableTypes.slice(0, colorsCount);
  }, [theme, levelNumber]);

  // Rows count scales up: Level 1 = 3 rows, Level 2 = 4, Level 3 = 5, Level 4 = 6, Level 5+ = 7
  const rowsToFill = Math.min(7, 3 + Math.floor((levelNumber - 1) * 0.65));

  // Shots allocated get tighter as difficulty increases
  const initialShots = Math.max(30, 52 - (levelNumber - 1) * 3);

  // Difficulty Tier Label
  const difficultyTier =
    levelNumber === 1
      ? { label: 'Beginner', stars: '⭐', color: 'text-emerald-400' }
      : levelNumber === 2
      ? { label: 'Casual', stars: '⭐⭐', color: 'text-cyan-400' }
      : levelNumber <= 4
      ? { label: 'Skilled', stars: '⭐⭐⭐', color: 'text-amber-400' }
      : levelNumber <= 6
      ? { label: 'Expert', stars: '⭐⭐⭐⭐', color: 'text-purple-400' }
      : { label: 'Master', stars: '🔥 Master', color: 'text-rose-400' };

  // Helper to generate a random shooter bubble based on colors still on the board
  const getNextShooterColor = useCallback((currentGrid: ShooterBubbleData[]) => {
    const presentTypes = Array.from(new Set(currentGrid.map(b => b.color)));
    const pool = presentTypes.length > 0 ? presentTypes : activeTypes;
    const chosenType = pool[Math.floor(Math.random() * pool.length)] || activeTypes[0];
    const def = getTileDefinition(themeId, chosenType);
    return {
      type: chosenType,
      color: chosenType,
      symbol: def?.symbol || '●',
      name: def?.name || chosenType
    };
  }, [activeTypes, themeId]);

  // Initialize Board
  const initBoard = useCallback(() => {
    const initialGrid: ShooterBubbleData[] = [];

    for (let r = 0; r < rowsToFill; r++) {
      const colsInRow = r % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
      for (let c = 0; c < colsInRow; c++) {
        // Group in clusters with tighter mix on higher levels
        const clusterSize = levelNumber <= 2 ? 2 : 1;
        const typeIndex = Math.floor((r * GRID_COLS + c) / clusterSize) % activeTypes.length;
        const type = activeTypes[typeIndex];
        const def = getTileDefinition(themeId, type);

        initialGrid.push({
          id: `bubble_${r}_${c}_${Date.now()}_${Math.random()}`,
          row: r,
          col: c,
          color: type,
          symbol: def.symbol,
          name: def.name,
          x: 0,
          y: 0
        });
      }
    }

    bubblesRef.current = initialGrid;
    setBubbles(initialGrid);
    setShotsRemaining(initialShots);

    const b1 = getNextShooterColor(initialGrid);
    const b2 = getNextShooterColor(initialGrid);
    currentBubbleRef.current = b1;
    setCurrentBubble(b1);
    setNextBubble(b2);
    projectileRef.current = null;
  }, [rowsToFill, activeTypes, initialShots, themeId, getNextShooterColor, levelNumber]);

  // Only run board initialization when the level number or theme actually changes
  useEffect(() => {
    initBoard();
  }, [levelNumber, themeId, initBoard]);

  // Swap current and next bubbles in launcher
  const handleSwap = () => {
    if (!currentBubble || !nextBubble || projectileRef.current?.active) return;
    const temp = currentBubble;
    currentBubbleRef.current = nextBubble;
    setCurrentBubble(nextBubble);
    setNextBubble(temp);
    sound.playTileSelect();
  };

  // Convert (row, col) to (x, y) coordinates
  const getHexCoords = (row: number, col: number, canvasWidth: number): { x: number; y: number } => {
    const spacingX = BUBBLE_RADIUS * 2;
    const spacingY = BUBBLE_RADIUS * Math.sqrt(3);
    const offsetX = (row % 2 === 1) ? BUBBLE_RADIUS + 4 : 4;
    const startX = (canvasWidth - (GRID_COLS * spacingX)) / 2 + BUBBLE_RADIUS;
    const startY = BUBBLE_RADIUS + 8;

    return {
      x: startX + col * spacingX + (row % 2 === 1 ? BUBBLE_RADIUS : 0),
      y: startY + row * spacingY
    };
  };

  // Find neighbors of a hex cell
  const getNeighbors = (row: number, col: number, grid: ShooterBubbleData[]): ShooterBubbleData[] => {
    const isOdd = row % 2 === 1;
    const neighborDeltas = isOdd
      ? [
          { r: 0, c: -1 }, { r: 0, c: 1 },
          { r: -1, c: 0 }, { r: -1, c: 1 },
          { r: 1, c: 0 }, { r: 1, c: 1 }
        ]
      : [
          { r: 0, c: -1 }, { r: 0, c: 1 },
          { r: -1, c: -1 }, { r: -1, c: 0 },
          { r: 1, c: -1 }, { r: 1, c: 0 }
        ];

    const neighbors: ShooterBubbleData[] = [];
    for (const d of neighborDeltas) {
      const nr = row + d.r;
      const nc = col + d.c;
      const found = grid.find(b => b.row === nr && b.col === nc && !b.popping && !b.falling);
      if (found) neighbors.push(found);
    }
    return neighbors;
  };

  // Flood fill to find all connected bubbles of the same color
  const findMatches = (startBubble: ShooterBubbleData, grid: ShooterBubbleData[]): ShooterBubbleData[] => {
    const targetColor = startBubble.color;
    const matched: ShooterBubbleData[] = [startBubble];
    const queue: ShooterBubbleData[] = [startBubble];
    const visited = new Set<string>([startBubble.id]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current.row, current.col, grid);

      for (const n of neighbors) {
        if (!visited.has(n.id) && n.color === targetColor) {
          visited.add(n.id);
          matched.push(n);
          queue.push(n);
        }
      }
    }
    return matched;
  };

  // Find floating orphan bubbles that have no connection to row 0
  const findFloatingOrphans = (grid: ShooterBubbleData[]): ShooterBubbleData[] => {
    const anchored = new Set<string>();
    const queue: ShooterBubbleData[] = [];

    // All bubbles in row 0 are anchored
    grid.filter(b => b.row === 0 && !b.popping && !b.falling).forEach(b => {
      anchored.add(b.id);
      queue.push(b);
    });

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = getNeighbors(curr.row, curr.col, grid);
      for (const n of neighbors) {
        if (!anchored.has(n.id)) {
          anchored.add(n.id);
          queue.push(n);
        }
      }
    }

    // Any bubble not anchored is a floating orphan
    return grid.filter(b => !anchored.has(b.id) && !b.popping && !b.falling);
  };

  // Fire the current projectile
  const fireBubble = () => {
    const cur = currentBubbleRef.current;
    if (!cur || projectileRef.current?.active || isPausedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const speed = 18;
    const launchX = canvas.width / 2;
    const launchY = canvas.height - 50;
    const angle = aimAngleRef.current;

    projectileRef.current = {
      x: launchX,
      y: launchY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      type: cur.type,
      color: cur.color,
      symbol: cur.symbol,
      name: cur.name,
      active: true
    };

    sound.playTileSelect();

    // Deduct shot count
    setShotsRemaining(prev => Math.max(0, prev - 1));

    // Advance launcher bubbles
    currentBubbleRef.current = nextBubble;
    setCurrentBubble(nextBubble);
    setNextBubble(getNextShooterColor(bubblesRef.current));
  };

  // Aiming pointer handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPausedRef.current) return;
    isDraggingRef.current = true;
    updateAim(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updateAim(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      fireBubble();
    }
  };

  const updateAim = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const originX = canvas.width / 2;
    const originY = canvas.height - 50;

    let angle = Math.atan2(y - originY, x - originX);
    // Clamp to upper hemisphere (avoid shooting straight down)
    const minAngle = -Math.PI + 0.2;
    const maxAngle = -0.2;
    angle = Math.max(minAngle, Math.min(maxAngle, angle));
    aimAngleRef.current = angle;
    setAimAngle(angle);
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const activeBubbles = bubblesRef.current;
      const angle = aimAngleRef.current;
      const launcherBubble = currentBubbleRef.current;

      // 1. Draw Safety Deadline (danger line near bottom)
      const deadlineY = canvas.height - 110;
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, deadlineY);
      ctx.lineTo(canvas.width - 20, deadlineY);
      ctx.stroke();
      ctx.restore();

      // 2. Draw Grid Bubbles
      activeBubbles.forEach(b => {
        const coords = getHexCoords(b.row, b.col, canvas.width);
        b.x = coords.x;
        b.y = coords.y;

        ctx.save();
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, BUBBLE_RADIUS, 0, Math.PI * 2);

        // 3D Glass / Wooden Sphere Gradient
        const grad = ctx.createRadialGradient(
          coords.x - 5,
          coords.y - 6,
          2,
          coords.x,
          coords.y,
          BUBBLE_RADIUS
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fef3c7');
        grad.addColorStop(1, '#d97706');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b45309';
        ctx.stroke();

        // Draw Symbol
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1c1917';
        ctx.fillText(b.symbol, coords.x, coords.y + 1);

        ctx.restore();
      });

      // 3. Draw Trajectory Aiming Line with Wall Bounce Reflection
      if (!projectileRef.current?.active && launcherBubble) {
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);

        let startX = canvas.width / 2;
        let startY = canvas.height - 50;
        let dirX = Math.cos(angle);
        let dirY = Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Raycast steps
        let rayX = startX;
        let rayY = startY;
        const maxDist = 380;
        let traveled = 0;

        while (traveled < maxDist && rayY > BUBBLE_RADIUS) {
          rayX += dirX * 5;
          rayY += dirY * 5;
          traveled += 5;

          // Wall bounce check
          if (rayX <= BUBBLE_RADIUS + 4) {
            dirX = -dirX;
            rayX = BUBBLE_RADIUS + 4;
            ctx.lineTo(rayX, rayY);
          } else if (rayX >= canvas.width - BUBBLE_RADIUS - 4) {
            dirX = -dirX;
            rayX = canvas.width - BUBBLE_RADIUS - 4;
            ctx.lineTo(rayX, rayY);
          }
        }
        ctx.lineTo(rayX, rayY);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Update & Draw Active Projectile
      const proj = projectileRef.current;
      if (proj && proj.active) {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Wall Bouncing
        if (proj.x <= BUBBLE_RADIUS + 4) {
          proj.x = BUBBLE_RADIUS + 4;
          proj.vx = -proj.vx;
          sound.playTileSelect();
        } else if (proj.x >= canvas.width - BUBBLE_RADIUS - 4) {
          proj.x = canvas.width - BUBBLE_RADIUS - 4;
          proj.vx = -proj.vx;
          sound.playTileSelect();
        }

        // Draw projectile
        ctx.save();
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(proj.x - 5, proj.y - 6, 2, proj.x, proj.y, BUBBLE_RADIUS);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.3, '#fef3c7');
        pGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = pGrad;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b45309';
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1c1917';
        ctx.fillText(proj.symbol, proj.x, proj.y + 1);
        ctx.restore();

        // Collision Check against Ceiling or Existing Grid Bubbles
        let hit = false;
        if (proj.y <= BUBBLE_RADIUS + 10) {
          hit = true;
        } else {
          for (const b of activeBubbles) {
            const dist = Math.hypot(b.x - proj.x, b.y - proj.y);
            if (dist < BUBBLE_RADIUS * 1.85) {
              hit = true;
              break;
            }
          }
        }

        // Handle Projectile Landing / Snapping
        if (hit) {
          proj.active = false;

          // Find closest open grid slot
          let bestRow = 0;
          let bestCol = 0;
          let bestDist = Infinity;

          for (let r = 0; r < GRID_ROWS; r++) {
            const colsInRow = r % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
            for (let c = 0; c < colsInRow; c++) {
              const alreadyFilled = activeBubbles.some(b => b.row === r && b.col === c);
              if (!alreadyFilled) {
                const coords = getHexCoords(r, c, canvas.width);
                const d = Math.hypot(coords.x - proj.x, coords.y - proj.y);
                if (d < bestDist) {
                  bestDist = d;
                  bestRow = r;
                  bestCol = c;
                }
              }
            }
          }

          const newBubble: ShooterBubbleData = {
            id: `bubble_${bestRow}_${bestCol}_${Date.now()}`,
            row: bestRow,
            col: bestCol,
            color: proj.color,
            symbol: proj.symbol,
            name: proj.name,
            x: 0,
            y: 0
          };

          const nextGrid = [...activeBubbles, newBubble];

          // Check matches
          const matches = findMatches(newBubble, nextGrid);

          if (matches.length >= 3) {
            // MATCH SUCCESS!
            sound.playMatch(matches.length - 2);
            onScoreGainRef.current(matches.length * 150);

            const matchIds = new Set(matches.map(m => m.id));
            const afterMatchGrid = nextGrid.filter(b => !matchIds.has(b.id));

            // Check for floating orphan drops
            const orphans = findFloatingOrphans(afterMatchGrid);
            if (orphans.length > 0) {
              const orphanIds = new Set(orphans.map(o => o.id));
              const finalGrid = afterMatchGrid.filter(b => !orphanIds.has(b.id));
              bubblesRef.current = finalGrid;
              setBubbles(finalGrid);
              onScoreGainRef.current(orphans.length * 200);

              // Check victory
              if (finalGrid.length === 0) {
                setTimeout(() => onVictoryRef.current(), 300);
              }
            } else {
              bubblesRef.current = afterMatchGrid;
              setBubbles(afterMatchGrid);
              if (afterMatchGrid.length === 0) {
                setTimeout(() => onVictoryRef.current(), 300);
              }
            }
          } else {
            // NO MATCH: Bubble connects to grid
            sound.playTileSelect();
            bubblesRef.current = nextGrid;
            setBubbles(nextGrid);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-between select-none touch-none px-2"
    >
      {/* Shots & Difficulty Tier Banner */}
      <div className="w-full flex items-center justify-between px-3 py-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-semibold text-stone-300">
            <span>Shots:</span>
            <span className="font-mono text-amber-400 font-bold text-sm">
              {shotsRemaining}
            </span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 border border-white/10 ${difficultyTier.color}`}>
            {difficultyTier.stars} {difficultyTier.label}
          </span>
        </div>

        {/* Free Refill button so players never fail */}
        <button
          onClick={() => setShotsRemaining(s => s + 15)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold transition-all shadow-sm"
          title="Add +15 free shots"
        >
          <Plus className="w-3 h-3 text-emerald-400" />
          <span>+15 Shots</span>
        </button>
      </div>

      {/* Main Interactive Canvas (Full-Screen Responsive) */}
      <div className="relative w-full aspect-[9/13] max-h-[calc(100dvh-230px)] sm:max-h-[560px] bg-stone-950/70 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full cursor-crosshair"
        />

        {/* Launcher Chamber Base at the Bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-stone-900/90 border border-amber-500/30 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md pointer-events-auto">
          {/* Next Bubble Preview */}
          <div
            onClick={handleSwap}
            className="flex flex-col items-center cursor-pointer group"
            title="Next Bubble (Tap to Swap)"
          >
            <span className="text-[9px] text-stone-400 font-bold mb-0.5">NEXT</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-white/30 flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
              {nextBubble?.symbol}
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-all active:scale-95"
            title="Swap Current and Next Bubble"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Current Shooter Bubble Ready to Fire */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-amber-400 font-bold mb-0.5">READY</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 border-2 border-white flex items-center justify-center text-lg shadow-lg shadow-amber-500/30 animate-pulse">
              {currentBubble?.symbol}
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Instructions */}
      <div className="py-1 text-[11px] text-stone-400 font-mono flex items-center gap-2">
        <span>Drag to Aim</span>
        <span aria-hidden="true">·</span>
        <span>Release to Shoot</span>
        <span aria-hidden="true">·</span>
        <span>Match 3 to Pop</span>
      </div>
    </div>
  );
};
