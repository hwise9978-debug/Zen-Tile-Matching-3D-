import React from 'react';
import { BoosterInventory } from '../types/game';
import { RotateCcw, Shuffle, Wand2, PlusCircle } from 'lucide-react';

interface PowerUpBarProps {
  boosters: BoosterInventory;
  onUseUndo: () => void;
  onUseShuffle: () => void;
  onUseAutoMatch: () => void;
  onUseExtraSlot: () => void;
  canUndo: boolean;
  extraSlotActive: boolean;
}

export const PowerUpBar: React.FC<PowerUpBarProps> = ({
  boosters,
  onUseUndo,
  onUseShuffle,
  onUseAutoMatch,
  onUseExtraSlot,
  canUndo,
  extraSlotActive
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-2 flex items-center justify-between gap-2 select-none">
      {/* 1. Undo Button */}
      <button
        onClick={onUseUndo}
        disabled={!canUndo || boosters.undo <= 0}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative ${
          canUndo && boosters.undo > 0
            ? 'bg-stone-900/80 hover:bg-stone-800 text-amber-200 border border-amber-600/40 active:scale-95 shadow-lg'
            : 'bg-stone-900/40 text-stone-600 border border-stone-800/40 cursor-not-allowed opacity-60'
        }`}
        title="Undo last picked tile"
      >
        <RotateCcw className="w-4 h-4 mb-0.5 text-amber-400" />
        <span className="text-[11px] font-semibold">Undo</span>
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-amber-500 text-stone-950 text-[10px] font-bold rounded-full shadow-sm">
          {boosters.undo}
        </span>
      </button>

      {/* 2. Shuffle Button */}
      <button
        onClick={onUseShuffle}
        disabled={boosters.shuffle <= 0}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative ${
          boosters.shuffle > 0
            ? 'bg-stone-900/80 hover:bg-stone-800 text-emerald-200 border border-emerald-600/40 active:scale-95 shadow-lg'
            : 'bg-stone-900/40 text-stone-600 border border-stone-800/40 cursor-not-allowed opacity-60'
        }`}
        title="Shuffle remaining tiles on board"
      >
        <Shuffle className="w-4 h-4 mb-0.5 text-emerald-400" />
        <span className="text-[11px] font-semibold">Shuffle</span>
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-emerald-500 text-stone-950 text-[10px] font-bold rounded-full shadow-sm">
          {boosters.shuffle}
        </span>
      </button>

      {/* 3. Magic Wand / Auto-Match */}
      <button
        onClick={onUseAutoMatch}
        disabled={boosters.autoMatch <= 0}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative ${
          boosters.autoMatch > 0
            ? 'bg-stone-900/80 hover:bg-stone-800 text-purple-200 border border-purple-600/40 active:scale-95 shadow-lg'
            : 'bg-stone-900/40 text-stone-600 border border-stone-800/40 cursor-not-allowed opacity-60'
        }`}
        title="Auto-match 3 tiles instantly"
      >
        <Wand2 className="w-4 h-4 mb-0.5 text-purple-400" />
        <span className="text-[11px] font-semibold">Magic</span>
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-purple-500 text-white text-[10px] font-bold rounded-full shadow-sm">
          {boosters.autoMatch}
        </span>
      </button>

      {/* 4. Extra Slot (+1) */}
      <button
        onClick={onUseExtraSlot}
        disabled={extraSlotActive || boosters.extraSlot <= 0}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 relative ${
          !extraSlotActive && boosters.extraSlot > 0
            ? 'bg-stone-900/80 hover:bg-stone-800 text-cyan-200 border border-cyan-600/40 active:scale-95 shadow-lg'
            : 'bg-stone-900/40 text-stone-600 border border-stone-800/40 cursor-not-allowed opacity-60'
        }`}
        title={extraSlotActive ? 'Extra slot already unlocked' : 'Unlock +1 Dock Slot'}
      >
        <PlusCircle className="w-4 h-4 mb-0.5 text-cyan-400" />
        <span className="text-[11px] font-semibold">{extraSlotActive ? 'Active' : '+1 Slot'}</span>
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-cyan-500 text-stone-950 text-[10px] font-bold rounded-full shadow-sm">
          {boosters.extraSlot}
        </span>
      </button>
    </div>
  );
};
