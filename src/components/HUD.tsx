import React from 'react';
import { GameMode } from '../types/game';
import { Volume2, VolumeX, Pause, Play, DollarSign, Sparkles, Trophy, Gift, Maximize, Minimize } from 'lucide-react';

interface HUDProps {
  levelTitle: string;
  worldName: string;
  score: number;
  combo: number;
  tilesRemaining: number;
  totalLevelTiles: number;
  gameMode: GameMode;
  timeRemaining?: number; // for time rush mode
  cashBalance: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenCashModal: () => void;
  onOpenMenu: () => void;
  onOpenDailyModal: () => void;
  isDailyClaimable: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelTitle,
  worldName,
  score,
  combo,
  tilesRemaining,
  totalLevelTiles,
  gameMode,
  timeRemaining,
  cashBalance,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  onOpenCashModal,
  onOpenMenu,
  onOpenDailyModal,
  isDailyClaimable,
  isFullscreen,
  onToggleFullscreen
}) => {
  const progressPct = Math.round(
    ((totalLevelTiles - tilesRemaining) / Math.max(1, totalLevelTiles)) * 100
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 select-none z-30">
      {/* Top Row: World / Level Name + Control Actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Mode / Level Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <span>{worldName}</span>
            <span aria-hidden="true">·</span>
            <span>{gameMode === 'CAMPAIGN' ? 'Stage' : gameMode}</span>
          </div>
          <h1 className="text-base font-bold text-white tracking-tight font-display truncate max-w-[170px] sm:max-w-none">
            {levelTitle}
          </h1>
        </div>

        {/* Right: Cash Vault Quick Button + Sound + Fullscreen + Pause */}
        <div className="flex items-center gap-1.5">
          {/* Daily Check-In Gift Button */}
          <button
            onClick={onOpenDailyModal}
            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDailyClaimable
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-stone-900/80 text-stone-400 border-white/10 hover:text-white'
            }`}
            title="Daily Check-In Rewards (Anti-Cheat 24h Cooldown)"
          >
            <Gift className={`w-3.5 h-3.5 ${isDailyClaimable ? 'text-amber-400' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Daily</span>
            <span>Gift</span>
            {isDailyClaimable && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-stone-950 animate-ping" />
            )}
          </button>

          {/* Real Cash Vault Button */}
          <button
            onClick={onOpenCashModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/40 text-amber-300 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/10 font-mono text-xs font-bold"
            title="Open Cash Prize Vault & Instant Free Payouts"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>${cashBalance.toFixed(2)}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Full Screen Toggle in HUD */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'Play in Full Screen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-amber-400" />
              ) : (
                <Maximize className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="w-8 h-8 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Second Row: Score, Remaining Tiles, and Combo Streak */}
      <div className="mt-2.5 p-2 rounded-2xl bg-stone-900/70 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs">
        {/* Score & Combo */}
        <div className="flex items-center gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block font-sans">Score</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{combo}x Combo!</span>
            </div>
          )}
        </div>

        {/* Center: Time Remaining if Time Rush Mode */}
        {gameMode === 'TIME_ATTACK' && timeRemaining !== undefined && (
          <div className="text-center">
            <span className="text-[10px] text-stone-400 block">Time</span>
            <span
              className={`text-sm font-bold font-mono ${
                timeRemaining <= 15 ? 'text-rose-400 animate-ping' : 'text-amber-400'
              }`}
            >
              {timeRemaining}s
            </span>
          </div>
        )}

        {/* Right: Remaining Tiles Progress */}
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block">Remaining</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {tilesRemaining} / {totalLevelTiles}
          </span>
        </div>
      </div>

      {/* Thin Level Completion Progress Bar */}
      <div className="w-full h-1 bg-stone-950 rounded-full mt-1.5 overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};
