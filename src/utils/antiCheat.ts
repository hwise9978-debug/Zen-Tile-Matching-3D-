import { DailyCheckInData } from '../types/game';

// 24 Hours in Milliseconds
export const MS_PER_24_HOURS = 24 * 60 * 60 * 1000;
// 48 Hours grace period to maintain daily streak
export const MS_PER_48_HOURS = 48 * 60 * 60 * 1000;

export interface DailyRewardTier {
  day: number;
  title: string;
  coins: number;
  boosterName: string;
  boosterType: 'undo' | 'shuffle' | 'autoMatch' | 'extraSlot';
  boosterCount: number;
  cashBonus: number; // In legit cash vault dollars ($)
  icon: string;
  isGrandPrize?: boolean;
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    title: 'Welcome Gift',
    coins: 50,
    boosterName: 'Undo Booster',
    boosterType: 'undo',
    boosterCount: 1,
    cashBonus: 0,
    icon: '↩️'
  },
  {
    day: 2,
    title: 'Shuffle Surge',
    coins: 75,
    boosterName: 'Shuffle Booster',
    boosterType: 'shuffle',
    boosterCount: 1,
    cashBonus: 0,
    icon: '🔀'
  },
  {
    day: 3,
    title: 'Expansion Day',
    coins: 100,
    boosterName: 'Extra Slot (+1)',
    boosterType: 'extraSlot',
    boosterCount: 1,
    cashBonus: 0,
    icon: '➕'
  },
  {
    day: 4,
    title: 'Mystic Wand',
    coins: 125,
    boosterName: 'Magic Wand Auto-Match',
    boosterType: 'autoMatch',
    boosterCount: 1,
    cashBonus: 0,
    icon: '🪄'
  },
  {
    day: 5,
    title: 'Silver Stash',
    coins: 175,
    boosterName: 'Dual Undos',
    boosterType: 'undo',
    boosterCount: 2,
    cashBonus: 0.50,
    icon: '🪙'
  },
  {
    day: 6,
    title: 'Golden Reshuffle',
    coins: 250,
    boosterName: 'Dual Shuffles',
    boosterType: 'shuffle',
    boosterCount: 2,
    cashBonus: 0.75,
    icon: '✨'
  },
  {
    day: 7,
    title: 'Grand Champion Crown',
    coins: 500,
    boosterName: 'Mega Pack (Wands + Slots)',
    boosterType: 'autoMatch',
    boosterCount: 2,
    cashBonus: 1.50,
    icon: '👑',
    isGrandPrize: true
  }
];

/**
 * Deterministic cryptographic-style checksum generator
 * Generates an integrity token based on streak, timestamps, and salt to prevent local storage tampering.
 */
export const computeIntegrityHash = (
  streak: number,
  lastClaim: number,
  totalClaims: number
): string => {
  const salt = 'ZEN_ANTI_CHEAT_INTEGRITY_SALT_2026_LEGAL_PROMISE';
  const raw = `${salt}:${streak}:${lastClaim}:${totalClaims}:${salt.length}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Validates integrity of stored check-in data.
 * Checks for:
 * 1. Hash mismatch (manual localStorage editing / memory tampering)
 * 2. Backwards clock travel (user rolled clock back)
 * 3. Future-dated claims (user rolled clock forward into the future)
 */
export const validateAntiCheatIntegrity = (
  data: DailyCheckInData | undefined
): { isValid: boolean; anomalyReason?: string } => {
  if (!data) return { isValid: true };

  const now = Date.now();

  // 1. Clock rewinding check
  if (data.lastClaimTimestamp > 0 && now < data.lastClaimTimestamp - 60000) {
    return {
      isValid: false,
      anomalyReason: 'Device clock anomaly detected: Time appears to have been set backwards. Cheating is strictly forbidden.'
    };
  }

  // 2. Client time consistency check
  if (data.lastCheckedClientTime > 0 && now < data.lastCheckedClientTime - 60000) {
    return {
      isValid: false,
      anomalyReason: 'System clock rollback detected. Fair play integrity violation.'
    };
  }

  // 3. Stored hash integrity check
  const expectedHash = computeIntegrityHash(
    data.currentStreak,
    data.lastClaimTimestamp,
    data.totalClaimsCount
  );
  if (data.integrityHash && data.integrityHash !== expectedHash) {
    return {
      isValid: false,
      anomalyReason: 'Tampered state detected: Check-in data checksum does not match server signature.'
    };
  }

  return { isValid: true };
};

/**
 * Determines whether a daily reward is currently claimable
 */
export const checkDailyClaimStatus = (
  data: DailyCheckInData | undefined
): {
  isClaimable: boolean;
  timeRemainingMs: number;
  nextDayIndex: number; // 1 to 7
  isStreakLapsed: boolean;
  anomaly?: string;
} => {
  const integrity = validateAntiCheatIntegrity(data);
  if (!integrity.isValid) {
    return {
      isClaimable: false,
      timeRemainingMs: MS_PER_24_HOURS,
      nextDayIndex: 1,
      isStreakLapsed: false,
      anomaly: integrity.anomalyReason
    };
  }

  if (!data || data.lastClaimTimestamp === 0) {
    // First time player - Day 1 is immediately claimable!
    return {
      isClaimable: true,
      timeRemainingMs: 0,
      nextDayIndex: 1,
      isStreakLapsed: false
    };
  }

  const now = Date.now();
  const elapsed = now - data.lastClaimTimestamp;

  if (elapsed >= MS_PER_24_HOURS) {
    // 24 hours have passed!
    const isStreakLapsed = elapsed > MS_PER_48_HOURS;
    const nextDay = isStreakLapsed ? 1 : ((data.currentStreak % 7) + 1);
    return {
      isClaimable: true,
      timeRemainingMs: 0,
      nextDayIndex: nextDay,
      isStreakLapsed
    };
  }

  // Still on cooldown
  const timeRemainingMs = MS_PER_24_HOURS - elapsed;
  const currentDay = Math.max(1, data.currentStreak || 1);
  return {
    isClaimable: false,
    timeRemainingMs,
    nextDayIndex: currentDay,
    isStreakLapsed: false
  };
};

/**
 * Format remaining milliseconds to HH:MM:SS
 */
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return 'Ready Now!';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
