export interface User {
  email: string;
  uid: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  lastLoginDate: string; // YYYY-MM-DD
  dailyStreak: number;
  dailyBonusClaimedDate: string; // YYYY-MM-DD - New field to track when daily bonus was claimed
  lastAdWatch: number;
  spinsToday: number;
  lastSpinDate: string; // YYYY-MM-DD
  scratchesToday: number; // New: Number of scratch cards used today
  lastScratchDate: string; // New: YYYY-MM-DD
  isAdmin: boolean;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountPoints: number;
  amountPkr: number;
  method: 'Easypaisa' | 'Jazzcash' | 'Binance';
  details: string; // Phone or Binance ID
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export const POINTS_TO_PKR_RATE = 100; // 1000 points = 10 PKR -> 100 points = 1 PKR
export const MIN_WITHDRAW_POINTS = 1000;
export const REFERRAL_BONUS_PKR = 15;
export const REFERRAL_BONUS_POINTS = REFERRAL_BONUS_PKR * POINTS_TO_PKR_RATE; // 1500 points
export const AD_WATCH_POINTS = 10;
export const MAX_DAILY_SPINS = 30; // Changed from 5 to 30
export const MAX_DAILY_SCRATCHES = 30; // New: Max scratch cards per day

export const DAILY_REWARDS = [10, 25, 35, 45, 60, 65, 100];

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  SPIN = 'SPIN',
  SCRATCH = 'SCRATCH',
  SLOTS = 'SLOTS',
  REFER = 'REFER',
  WITHDRAW = 'WITHDRAW',
  ADMIN = 'ADMIN',
  GEMINI = 'GEMINI'
}