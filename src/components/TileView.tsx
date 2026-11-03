import React from 'react';
import { BoardTile, ThemeId } from '../types/game';
import { getTileDefinition } from '../utils/tileThemes';

interface TileViewProps {
  tile: BoardTile;
  themeId: ThemeId;
  cellSize?: number; // size in pixels for grid units (default ~50px on mobile)
  boardOffsetX?: number;
  boardOffsetY?: number;
  onSelect: (tile: BoardTile) => void;
  onBlockedClick: () => void;
}

export const TileView: React.FC<TileViewProps> = ({
  tile,
  themeId,
  cellSize = 52,
  boardOffsetX = 0,
  boardOffsetY = 0,
  onSelect,
  onBlockedClick
}) => {
  const def = getTileDefinition(themeId, tile.type);

  if (tile.state === 'REMOVED' || tile.state === 'MATCHING') {
    return null;
  }

  // Calculate pixel coordinates
  const left = boardOffsetX + tile.gridX * cellSize;
  // Subtract layer * 4px for isometric 3D vertical elevation lift
  const top = boardOffsetY + tile.gridY * cellSize - tile.layer * 4;

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (tile.isCovered) {
      onBlockedClick();
    } else {
      onSelect(tile);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={tile.isCovered ? -1 : 0}
      aria-label={`${def.name} tile, ${tile.isCovered ? 'covered' : 'ready to pick'}`}
      className={`absolute transition-all duration-200 select-none cursor-pointer ${
        tile.isCovered ? 'cursor-not-allowed opacity-90' : 'active:scale-95 hover:-translate-y-0.5'
      }`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${cellSize * 0.94}px`,
        height: `${cellSize * 1.1}px`,
        zIndex: tile.layer * 10 + 2
      }}
    >
      {/* 3D Physical Tile Body */}
      <div
        className={`relative w-full h-full rounded-xl transition-all duration-150 flex flex-col items-center justify-between p-1 shadow-lg ${
          tile.isCovered
            ? 'brightness-75 contrast-90 shadow-black/40'
            : 'brightness-100 hover:shadow-cyan-500/20 shadow-black/50'
        }`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f4eee2 85%, #d6c6b2 100%)',
          borderTop: '2px solid rgba(255, 255, 255, 0.9)',
          borderLeft: '1.5px solid rgba(255, 255, 255, 0.6)',
          borderRight: '1.5px solid rgba(180, 160, 140, 0.7)',
          borderBottom: '4px solid #b8a690',
          boxShadow: tile.isCovered
            ? '0 3px 6px rgba(0,0,0,0.45)'
            : '0 6px 14px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {/* Subtle decorative inner bevel */}
        <div className="w-full h-full rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-white/40 border border-amber-900/10">
          {/* Tile Symbol / Emoji */}
          <span className="text-2xl sm:text-3xl filter drop-shadow-sm transform transition-transform group-hover:scale-110">
            {def.symbol}
          </span>

          {/* Micro Name Label (helps identify pairs instantly) */}
          <span className="text-[9px] font-semibold tracking-tight text-amber-950/70 truncate max-w-full px-0.5">
            {def.name}
          </span>

          {/* Locked / Covered Darkening Scrim */}
          {tile.isCovered && (
            <div className="absolute inset-0 bg-stone-900/35 rounded-lg flex items-center justify-center backdrop-brightness-90">
              <div className="w-3.5 h-3.5 rounded-full bg-black/40 flex items-center justify-center opacity-70">
                <span className="text-[8px] text-white/80">🔒</span>
              </div>
            </div>
          )}
        </div>

        {/* 3D Layer Elevation Accent Dot */}
        {tile.layer > 0 && !tile.isCovered && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-[8px] font-bold text-amber-950 flex items-center justify-center shadow-sm border border-white"
            title={`Layer ${tile.layer + 1}`}
          >
            {tile.layer + 1}
          </div>
        )}
      </div>
    </div>
  );
};
