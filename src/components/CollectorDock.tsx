import React from 'react';
import { BoardTile, ThemeId } from '../types/game';
import { getTileDefinition } from '../utils/tileThemes';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface CollectorDockProps {
  dockTiles: BoardTile[];
  maxCapacity: number; // usually 7, can be 8 with Extra Slot
  themeId: ThemeId;
  matchingIds: string[]; // ids of tiles currently flashing before elimination
}

export const CollectorDock: React.FC<CollectorDockProps> = ({
  dockTiles,
  maxCapacity,
  themeId,
  matchingIds
}) => {
  const isNearFull = dockTiles.length >= maxCapacity - 1;
  const isFull = dockTiles.length >= maxCapacity;

  // Render slots array of length maxCapacity
  const slots = Array.from({ length: maxCapacity });

  return (
    <div className="w-full max-w-md mx-auto px-2 select-none">
      {/* Top Dock Header & Warning Alert */}
      <div className="flex items-center justify-between px-2 mb-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-200 tracking-wide text-[11px] uppercase">
            Collector Tray
          </span>
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded-full font-bold ${
              isFull
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isNearFull
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 bg-white/5'
            }`}
          >
            {dockTiles.length} / {maxCapacity}
          </span>
        </div>

        {isNearFull && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isFull ? 'TRAY FULL!' : '1 Slot Left!'}</span>
          </div>
        )}
      </div>

      {/* Dock Platform Container with Wooden / Obsidian Tray Bevel */}
      <div
        className={`relative w-full rounded-2xl p-2 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xl backdrop-blur-md ${
          isFull
            ? 'border-2 border-rose-500 shadow-rose-950/60 bg-rose-950/40'
            : isNearFull
            ? 'border-2 border-amber-500/80 shadow-amber-950/50 bg-amber-950/20'
            : 'border border-amber-800/40 shadow-black/80 bg-stone-900/85'
        }`}
        style={{
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5)',
          background: 'linear-gradient(180deg, #1e1b18 0%, #12100e 100%)'
        }}
      >
        {/* Render Each Slot */}
        {slots.map((_, index) => {
          const tile = dockTiles[index];
          const isMatching = tile && matchingIds.includes(tile.id);
          const def = tile ? getTileDefinition(themeId, tile.type) : null;

          return (
            <div
              key={`dock_slot_${index}`}
              className={`relative flex-1 aspect-[4/5] max-w-[48px] sm:max-w-[54px] rounded-xl flex items-center justify-center transition-all duration-200 ${
                tile
                  ? 'scale-100'
                  : 'border border-dashed border-white/10 bg-black/25'
              }`}
            >
              {tile && def && (
                <div
                  className={`relative w-full h-full rounded-xl transition-transform duration-200 flex flex-col items-center justify-between p-1 select-none ${
                    isMatching
                      ? 'animate-bounce scale-110 shadow-lg shadow-amber-400/80 z-20'
                      : 'shadow-md shadow-black/60'
                  }`}
                  style={{
                    background: isMatching
                      ? 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 70%, #fde68a 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #f4eee2 85%, #d6c6b2 100%)',
                    borderTop: isMatching
                      ? '2px solid #f59e0b'
                      : '2px solid rgba(255, 255, 255, 0.9)',
                    borderLeft: '1.5px solid rgba(255, 255, 255, 0.6)',
                    borderRight: '1.5px solid rgba(180, 160, 140, 0.7)',
                    borderBottom: isMatching ? '4px solid #d97706' : '3px solid #b8a690'
                  }}
                >
                  <div className="w-full h-full rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-white/40 border border-amber-900/10">
                    <span className="text-xl sm:text-2xl filter drop-shadow-sm">
                      {def.symbol}
                    </span>
                    <span className="text-[8px] font-bold text-amber-950/70 truncate max-w-full px-0.5">
                      {def.name}
                    </span>

                    {/* Sparkle burst on 3-match */}
                    {isMatching && (
                      <div className="absolute inset-0 bg-amber-400/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
