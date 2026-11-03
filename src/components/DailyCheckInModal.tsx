import React, { useState, useEffect } from 'react';
import { DailyCheckInData } from '../types/game';
import {
  DAILY_REWARD_TIERS,
  DailyRewardTier,
  checkDailyClaimStatus,
  formatTimeRemaining
} from '../utils/antiCheat';
import {
  Calendar,
  Gift,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Coins,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInData: DailyCheckInData | undefined;
  onClaimReward: (reward: DailyRewardTier) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  checkInData,
  onClaimReward
}) => {
  const [claimStatus, setClaimStatus] = useState(() => checkDailyClaimStatus(checkInData));
  const [countdownText, setCountdownText] = useState(() =>
    formatTimeRemaining(checkDailyClaimStatus(checkInData).timeRemainingMs)
  );

  // Live 1-second interval to update cooldown clock
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const status = checkDailyClaimStatus(checkInData);
      setClaimStatus(status);
      setCountdownText(formatTimeRemaining(status.timeRemainingMs));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, checkInData]);

  if (!isOpen) return null;

  const currentStreak = checkInData?.currentStreak || 0;
  const targetDayTier = DAILY_REWARD_TIERS.find(t => t.day === claimStatus.nextDayIndex) || DAILY_REWARD_TIERS[0];

  const handleClaim = () => {
    if (!claimStatus.isClaimable) return;

    sound.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClaimReward(targetDayTier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-md bg-stone-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                Daily Check-In Rewards
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-medium">
                  24h Cooldown
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Log in every 24 hours to claim coins & free boosters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Anti-Cheat Compliance Badge */}
        <div className="px-5 pt-3 pb-1">
          {claimStatus.anomaly ? (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">ANTI-CHEAT ALERT: Fair Play Violation</span>
                <span className="text-[11px] text-rose-300/80">{claimStatus.anomaly}</span>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-stone-900/80 border border-white/5 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Cheat Protected · Cryptographic Integrity Hash</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                Streak: {currentStreak} / 7 Days
              </span>
            </div>
          )}
        </div>

        {/* 7-Day Reward Grid */}
        <div className="px-5 py-3 grid grid-cols-4 gap-2">
          {DAILY_REWARD_TIERS.map(tier => {
            const isClaimed = tier.day <= currentStreak && !claimStatus.isStreakLapsed;
            const isReadyToClaim = claimStatus.isClaimable && tier.day === claimStatus.nextDayIndex;
            const isLocked = !isClaimed && !isReadyToClaim;

            return (
              <div
                key={`day_${tier.day}`}
                className={`relative rounded-2xl p-2 flex flex-col items-center justify-between text-center transition-all ${
                  tier.isGrandPrize ? 'col-span-2 aspect-[2/1] sm:aspect-auto' : 'aspect-square'
                } ${
                  isClaimed
                    ? 'bg-stone-900/60 border border-emerald-500/40 opacity-75'
                    : isReadyToClaim
                    ? 'bg-gradient-to-b from-amber-500/20 to-stone-900 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] animate-pulse'
                    : 'bg-stone-900/80 border border-white/10 opacity-60'
                }`}
              >
                {/* Day Tag */}
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-stone-400">
                  <span>Day {tier.day}</span>
                  {isClaimed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isLocked && <Lock className="w-3 h-3 text-stone-600" />}
                </div>

                {/* Big Reward Icon */}
                <span className="text-xl sm:text-2xl filter drop-shadow-sm my-0.5">
                  {tier.icon}
                </span>

                {/* Reward Summary */}
                <div className="w-full">
                  <span className="text-[10px] font-bold text-amber-300 block font-mono truncate">
                    +{tier.coins} Coins
                  </span>
                  <span className="text-[9px] text-stone-300 font-medium truncate block">
                    +{tier.boosterCount} {tier.boosterType}
                  </span>
                  {tier.cashBonus > 0 && (
                    <span className="text-[9px] font-bold text-emerald-400 block font-mono">
                      +${tier.cashBonus.toFixed(2)} Cash
                    </span>
                  )}
                </div>

                {/* Claimed overlay badge */}
                {isClaimed && (
                  <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Claimed
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action / Cooldown Display */}
        <div className="px-5 pb-4 pt-1 space-y-3">
          {claimStatus.isClaimable ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Claim Day {claimStatus.nextDayIndex} Reward Now!</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next Check-In Cooldown:</span>
              </div>
              <div className="text-sm font-bold text-amber-400 font-mono tracking-wider tabular-nums bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                {countdownText}
              </div>
            </div>
          )}

          {/* Strict Anti-Cheat & Legal Compliance Notice */}
          <div className="p-2.5 rounded-xl bg-stone-900/50 border border-white/5 text-[10px] text-stone-400 leading-relaxed text-center">
            <span className="font-semibold text-stone-300 block mb-0.5">
              🛡️ Zero-Tolerance Anti-Cheat Policy
            </span>
            Cheating, clock alteration, and memory manipulation are strictly forbidden and monitor-checked via cryptographic state hashes to ensure 100% fair coin and prize rewards for all players.
          </div>
        </div>
      </div>
    </div>
  );
};
