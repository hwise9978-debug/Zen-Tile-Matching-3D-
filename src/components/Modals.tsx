import React, { useState } from 'react';
import { GameMode, GameState, LevelConfig, PlayerStats, ThemeId } from '../types/game';
import { TILE_THEMES } from '../utils/tileThemes';
import { CAMPAIGN_LEVELS } from '../utils/levels';
import { Star, Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle, DollarSign, Palette, Check, ArrowRight, Maximize, Minimize, ShoppingBag } from 'lucide-react';

interface ModalsProps {
  gameState: GameState;
  gameMode: GameMode;
  currentLevel: LevelConfig;
  score: number;
  combo: number;
  playerStats: PlayerStats;
  cashBalance: number;
  isMuted: boolean;
  volume: number;
  ambientEnabled: boolean;
  hapticsEnabled: boolean;
  onSelectMode: (mode: GameMode, levelId?: number) => void;
  onResume: () => void;
  onRestart: () => void;
  onNextLevel: () => void;
  onReturnToMenu: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleAmbient: () => void;
  onToggleHaptics: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
  onReviveUndo: () => void;
  onOpenCashModal: () => void;
  onOpenPlayPublish?: () => void;
  gameplayStyle?: 'BUBBLE_SHOOTER' | 'ZEN_STACK';
  onSelectGameplayStyle?: (style: 'BUBBLE_SHOOTER' | 'ZEN_STACK') => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  gameState,
  gameMode,
  currentLevel,
  score,
  combo,
  playerStats,
  cashBalance,
  isMuted,
  volume,
  ambientEnabled,
  hapticsEnabled,
  onSelectMode,
  onResume,
  onRestart,
  onNextLevel,
  onReturnToMenu,
  onToggleMute,
  onVolumeChange,
  onToggleAmbient,
  onToggleHaptics,
  onSelectTheme,
  onReviveUndo,
  onOpenCashModal,
  onOpenPlayPublish,
  gameplayStyle = 'BUBBLE_SHOOTER',
  onSelectGameplayStyle,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // 1. Victory / Stage Clear Modal
  if (gameState === 'STAGE_CLEAR') {
    let starsEarned = 1;
    if (score >= currentLevel.starScores[2]) starsEarned = 3;
    else if (score >= currentLevel.starScores[1]) starsEarned = 2;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              Stage Completed!
            </span>
            <h2 className="text-2xl font-black text-white font-display mt-0.5">
              {currentLevel.title}
            </h2>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-8 h-8 transition-all ${
                  s <= starsEarned
                    ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
                    : 'text-stone-700'
                }`}
              />
            ))}
          </div>

          {/* Cash & Coin Rewards Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-400/30 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-amber-300 font-semibold block">
                  Legit Cash Prize Earned
                </span>
                <span className="text-sm font-bold text-white font-mono">+$1.50 USD</span>
              </div>
            </div>
            <button
              onClick={onOpenCashModal}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
            >
              View Vault
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-900 border border-white/5">
              <span className="text-stone-400 text-[10px] block">Final Score</span>
              <span className="font-bold text-white font-mono text-sm">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-900 border border-white/5">
              <span className="text-stone-400 text-[10px] block">Best Combo</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                {combo > 0 ? `${combo}x Streak` : 'Clear'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onNextLevel}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRestart}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors"
            >
              Replay Stage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Game Over Modal (Tray Full)
  if (gameState === 'GAME_OVER') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border border-rose-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
            <RotateCcw className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white font-display">
              {gameplayStyle === 'BUBBLE_SHOOTER' ? 'Shots Depleted!' : 'Tray is Full!'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {gameplayStyle === 'BUBBLE_SHOOTER'
                ? 'Non-matching shots safely connected to the grid. Grab +15 free shots to keep matching!'
                : '7 tiles accumulated without forming a 3-tile match.'}
            </p>
          </div>

          {/* Revive / Refill Option */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
            <span className="text-xs font-bold text-amber-300 block mb-0.5">
              Free Refill / Revive Available
            </span>
            <p className="text-[11px] text-stone-400">
              {gameplayStyle === 'BUBBLE_SHOOTER'
                ? 'Get +15 extra shots and continue clearing the board with zero penalty!'
                : 'Clear 3 tiles back to the board to continue your streak!'}
            </p>
            <button
              onClick={onReviveUndo}
              className="mt-2.5 w-full py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors"
            >
              {gameplayStyle === 'BUBBLE_SHOOTER' ? '+15 Free Shots & Continue' : 'Revive & Clear Tray'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-2 pt-1">
            <button
              onClick={onRestart}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onReturnToMenu}
              className="w-full py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition-colors"
            >
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Paused / Settings Modal
  if (gameState === 'PAUSED') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <div className="relative w-full max-w-sm bg-stone-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg font-bold text-white font-display">Game Paused</h2>
            <button
              onClick={onResume}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Sound & Ambient Toggles */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-white/5">
              <span className="text-stone-300 font-medium">Sound Effects</span>
              <button
                onClick={onToggleMute}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  !isMuted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'
                }`}
              >
                {!isMuted ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-white/5">
              <span className="text-stone-300 font-medium">Zen Singing Bowl Ambient</span>
              <button
                onClick={onToggleAmbient}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  ambientEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'
                }`}
              >
                {ambientEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-white/5">
              <span className="text-stone-300 font-medium">Haptic Touch Vibration</span>
              <button
                onClick={onToggleHaptics}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  hapticsEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-stone-800 text-stone-500'
                }`}
              >
                {hapticsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Theme Selector Button */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/5 text-stone-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Tile Theme</span>
              </div>
              <span className="text-[11px] text-stone-400 font-bold">
                {TILE_THEMES[playerStats.selectedTheme]?.name || 'Zen Garden'} →
              </span>
            </button>

            {/* Full Screen Mode Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/5 text-stone-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4 text-amber-400" />}
                  <span className="font-medium">Full Screen Mode</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isFullscreen ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-stone-400'}`}>
                  {isFullscreen ? 'Active' : 'Enable'}
                </span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onResume}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm transition-colors"
            >
              Resume Game
            </button>
            <button
              onClick={onRestart}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-xs transition-colors"
            >
              Restart Stage
            </button>
            <button
              onClick={onReturnToMenu}
              className="w-full py-2 rounded-xl text-stone-500 hover:text-stone-300 text-xs transition-colors"
            >
              Exit to Menu
            </button>
          </div>
        </div>

        {/* Nested Theme Picker Modal */}
        {showThemeModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-xs bg-stone-950 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Select Theme</h3>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="text-stone-400 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {(Object.keys(TILE_THEMES) as ThemeId[]).map(tid => {
                  const t = TILE_THEMES[tid];
                  const isSelected = playerStats.selectedTheme === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => {
                        onSelectTheme(tid);
                        setShowThemeModal(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left text-xs transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-white/5 bg-stone-900 text-stone-300 hover:bg-stone-850'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{t.name}</span>
                        <span className="text-[10px] text-stone-400">{t.tagline}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Title Menu & Mode Selector
  if (gameState === 'TITLE_MENU') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 my-auto">
          {/* Logo / Mascot Lockup */}
          <div className="text-center space-y-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 mx-auto shadow-xl shadow-amber-500/20">
              <img
                src="/src/assets/images/tile_game_app_icon_1793549121515.jpg"
                alt="Zen Tile Match 3D Icon"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight pt-2">
              Zen Tile Match 3D
            </h1>
            <p className="text-xs text-stone-400">
              Tactile mobile tile puzzle with real prize rewards
            </p>
          </div>

          {/* Cash Balance Quick Pill */}
          <div
            onClick={onOpenCashModal}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border border-amber-400/40 flex items-center justify-between cursor-pointer hover:brightness-110 transition-all shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
                $
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-semibold block uppercase">
                  Prize Vault Balance
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  ${cashBalance.toFixed(2)} USD
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              0% Fee Cashout →
            </span>
          </div>

          {/* Gameplay Style Toggle (Bubble Match vs 3D Tile Stack) */}
          {onSelectGameplayStyle && (
            <div className="p-1 bg-stone-900 border border-white/10 rounded-2xl flex gap-1">
              <button
                type="button"
                onClick={() => onSelectGameplayStyle('BUBBLE_SHOOTER')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  gameplayStyle === 'BUBBLE_SHOOTER'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🎯</span>
                <span>Bubble Matcher</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectGameplayStyle('ZEN_STACK')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  gameplayStyle === 'ZEN_STACK'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🪷</span>
                <span>3D Tile Stack</span>
              </button>
            </div>
          )}

          {/* Game Modes List */}
          <div className="space-y-2.5">
            {/* Campaign Journey */}
            <button
              onClick={() => onSelectMode('CAMPAIGN', 1)}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900 to-stone-900 hover:from-amber-500/30 border border-amber-500/40 text-left flex items-center justify-between group transition-all shadow-md active:scale-[0.98]"
            >
              <div>
                <span className="text-xs font-bold text-amber-300 block flex items-center gap-1">
                  <span>🗺️</span>
                  <span>Adventure Campaign</span>
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  24 stages across Zen Garden, Cosmic Temple & Safari
                </span>
              </div>
              <Play className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Zen Flow Sanctuary */}
            <button
              onClick={() => onSelectMode('ZEN')}
              className="w-full p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-left flex items-center justify-between group transition-all active:scale-[0.98]"
            >
              <div>
                <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1">
                  <span>🧘</span>
                  <span>Zen Flow Mode</span>
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Peaceful infinite puzzle with calming singing bowls
                </span>
              </div>
              <Play className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 90s Time Rush */}
            <button
              onClick={() => onSelectMode('TIME_ATTACK')}
              className="w-full p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-left flex items-center justify-between group transition-all active:scale-[0.98]"
            >
              <div>
                <span className="text-xs font-bold text-rose-400 block flex items-center gap-1">
                  <span>⏱️</span>
                  <span>90s Time Rush</span>
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  Frenzy combo multipliers and bonus seconds per match
                </span>
              </div>
              <Play className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Full Screen Mode Launch Button */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="w-full py-2.5 px-3 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-amber-400" />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 text-amber-400" />
                  <span>Play in Full Screen Mode</span>
                </>
              )}
            </button>
          )}

          {/* Sell on Google Play Store Action */}
          {onOpenPlayPublish && (
            <button
              type="button"
              onClick={onOpenPlayPublish}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-stone-900 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Sell Game on Google Play ($25 Account · 85% Cut)</span>
            </button>
          )}

          {/* Bottom Utility Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Play</span>
            </button>

            <button
              onClick={onOpenCashModal}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Legit Payouts</span>
            </button>
          </div>
        </div>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
            <div className="w-full max-w-sm bg-stone-950 border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  How to Play & Win
                </h3>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="text-stone-400 text-xs hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <p className="text-[11px] text-stone-300">
                    <strong>Tap free tiles</strong> on the board to move them into your bottom 7-slot tray.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Collect <strong>3 identical tiles</strong> to burst them, trigger score combos, and free up tray slots.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Use tactile power-ups like <strong>Undo</strong>, <strong>Shuffle</strong>, and <strong>Magic Wand</strong> to escape tight spots!
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Clear all tiles on the board to complete the stage and earn real cash prize rewards directly in your vault!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
              >
                Got It, Let's Play!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
