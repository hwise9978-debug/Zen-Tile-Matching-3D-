import React, { useRef, useEffect, useState } from 'react';
import { BoardTile, ThemeId } from '../types/game';
import { TileView } from './TileView';
import { sound } from '../utils/audio';

interface GameBoardProps {
  tiles: BoardTile[];
  themeId: ThemeId;
  onTilePick: (tile: BoardTile) => void;
  isPaused: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  themeId,
  onTilePick,
  isPaused
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({
    width: 360,
    height: 380,
    cellSize: 48,
    offsetX: 10,
    offsetY: 20
  });

  // Calculate bounding box and scale to center board tiles nicely
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerW = rect.width || 360;
      const containerH = rect.height || 380;

      // Find bounds of current tiles
      const activeTiles = tiles.filter(t => t.state === 'BOARD');
      if (activeTiles.length === 0) return;

      const minX = Math.min(...activeTiles.map(t => t.gridX));
      const maxX = Math.max(...activeTiles.map(t => t.gridX)) + 1;
      const minY = Math.min(...activeTiles.map(t => t.gridY));
      const maxY = Math.max(...activeTiles.map(t => t.gridY)) + 1.2;

      const gridSpanX = Math.max(4, maxX - minX);
      const gridSpanY = Math.max(4, maxY - minY);

      // Fit inside container with comfortable margins
      const maxCellW = (containerW - 32) / gridSpanX;
      const maxCellH = (containerH - 40) / gridSpanY;
      const cellSize = Math.min(54, Math.max(38, Math.min(maxCellW, maxCellH)));

      const totalW = gridSpanX * cellSize;
      const totalH = gridSpanY * cellSize;

      const offsetX = (containerW - totalW) / 2 - minX * cellSize;
      const offsetY = Math.max(16, (containerH - totalH) / 2 - minY * cellSize);

      setBoardDimensions({
        width: containerW,
        height: containerH,
        cellSize,
        offsetX,
        offsetY
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [tiles]);

  const handleBlockedClick = () => {
    sound.playTileBlocked();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full max-w-md mx-auto min-h-[340px] flex items-center justify-center overflow-hidden select-none touch-manipulation"
      style={{
        perspective: '1000px'
      }}
    >
      {/* Background Soft Glow Center */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Tiles Container */}
      <div className="relative w-full h-full">
        {tiles
          .filter(t => t.state === 'BOARD')
          .map(tile => (
            <TileView
              key={tile.id}
              tile={tile}
              themeId={themeId}
              cellSize={boardDimensions.cellSize}
              boardOffsetX={boardDimensions.offsetX}
              boardOffsetY={boardDimensions.offsetY}
              onSelect={onTilePick}
              onBlockedClick={handleBlockedClick}
            />
          ))}
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center p-4">
            <span className="text-xl font-bold text-white tracking-wide block font-display">
              Game Paused
            </span>
            <span className="text-xs text-stone-400 mt-1 block">
              Tap the play button in top right to resume
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
