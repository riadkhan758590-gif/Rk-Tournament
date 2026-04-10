/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Component, useState, useEffect, useMemo, useCallback, cloneElement, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import gsap from 'gsap';
import { io } from 'socket.io-client';
import { 
  Eye,
  Edit,
  Trophy, 
  Zap, 
  Calendar,
  User, 
  Plus, 
  Check, 
  X, 
  LogOut, 
  LayoutDashboard, 
  LayoutGrid,
  MapPin, 
  Clock, 
  Coins, 
  Target,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  CreditCard,
  History,
  Users,
  UserPlus,
  Medal,
  Star,
  Award,
  MessageSquare,
  ShoppingBag,
  Ticket,
  Bot,
  Bell,
  Share2,
  Settings,
  Image as ImageIcon,
  ArrowUpRight,
  BarChart,
  Activity,
  BarChart3,
  Send,
  ExternalLink,
  Trash2,
  Edit2,
  Save,
  ChevronLeft,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Wallet,
  Download,
  Upload,
  FileText,
  TrendingUp,
  Flag,
  Layout,
  Megaphone,
  Radio,
  Globe,
  Ban,
  Facebook,
  Youtube,
  Instagram,
  Gift,
  Package,
  Cpu,
  Mic,
  RotateCcw,
  Handshake,
  Camera,
  Shirt,
  Edit3,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';

// --- Utils ---
const safeJSONParse = (val: string | null, fallback: any) => {
  if (!val || val === 'undefined') return fallback;
  try {
    const parsed = JSON.parse(val);
    return parsed === undefined || parsed === null ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
};

// --- Types ---
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'frame' | 'badge' | 'entry_card' | 'name_color';
  imageUrl?: string;
  color?: string; // For frames, badges, or name colors
}

interface Trophy {
  id: string;
  name: string;
  imageUrl: string;
  matchName: string;
  date: string;
  rank: number;
}

interface NFTBadge {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  ownerId: string;
  mintDate: string;
}

const DEFAULT_NFT_BADGES: NFTBadge[] = [
  { id: 'nft_1', name: 'Genesis Winner', image: 'https://picsum.photos/seed/nft1/200/200', rarity: 'Legendary', ownerId: 'user_1', mintDate: '2024-01-01' },
  { id: 'nft_2', name: 'Alpha Tester', image: 'https://picsum.photos/seed/nft2/200/200', rarity: 'Rare', ownerId: 'user_2', mintDate: '2024-01-05' },
];

const NFT_TEMPLATES = [
  { name: 'Tournament Champion', image: 'https://picsum.photos/seed/nft_champ/200/200', rarity: 'Legendary' },
  { name: 'Elite Warrior', image: 'https://picsum.photos/seed/nft_warrior/200/200', rarity: 'Epic' },
  { name: 'Loyal Supporter', image: 'https://picsum.photos/seed/nft_loyal/200/200', rarity: 'Rare' },
  { name: 'Rising Star', image: 'https://picsum.photos/seed/nft_star/200/200', rarity: 'Common' },
];

interface UserStory {
  id: string;
  userId: string;
  userName: string;
  contentUrl: string;
  type: 'image' | 'video';
  timestamp: number;
  expiresAt: number;
}

interface Squad {
  id: string;
  name: string;
  logo: string;
  leaderId: string;
  members: string[];
  description: string;
  createdAt: number;
  joinCode: string;
}

interface UserData {
  userId: string;
  gameName: string;
  password?: string;
  balance: number;
  winnings: number;
  role: 'user' | 'admin';
  achievements?: string[];
  referralCode: string;
  referredBy?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  lastCheckIn?: number;
  lastQuestCheck?: string;
  lastBirthdaySurprise?: number;
  totalMatches: number;
  totalWins: number;
  totalKills: number;
  referralCount: number;
  lastSpinDate?: string; // YYYY-MM-DD
  isBanned?: boolean;
  banReason?: string;
  inventory?: string[]; 
  equippedFrame?: string;
  equippedNameColor?: string;
  isVip?: boolean;
  entryCards?: number;
  missionProgress?: { [missionId: string]: number };
  claimedMissions?: string[];
  lastGameId?: string;
  hasToppedUp?: boolean;
  isSuspicious?: boolean;
  violationCount?: number;
  banUntil?: number; // timestamp
  registrationIp?: string;
  registrationDevice?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  bio?: string;
  socialLinks?: {
    youtube?: string;
    facebook?: string;
    instagram?: string;
  };
  trophies?: Trophy[];
  district?: string;
  isVerifiedPro?: boolean;
  isShadowBanned?: boolean;
  isLegendary?: boolean;
  squadId?: string;
  squadLogo?: string;
  squadName?: string;
  membershipGiftedBy?: string;
  language?: string;
  isFaceVerified?: boolean;
  location?: {
    city: string;
    country: string;
    page?: string; // Current page for live tracking
  };
  creditScore: number;
  loanAmount: number;
  isAffiliate?: boolean;
  affiliateStats?: {
    totalReferrals: number;
    totalEarnings: number;
  };
  avatarParts?: {
    skin: number;
    hair: number;
    shirt: number;
  };
  achievementNFTs?: NFTBadge[];
  birthday?: string; // YYYY-MM-DD
  permissions?: string[]; // For multi-admin
  loginStreak: number;
  lastLoginDate?: string; // YYYY-MM-DD
  stories?: UserStory[];
  cooldownUntil?: number; // timestamp for anti-spam
  isProContracted?: boolean;
  monthlyMatchesPlayed?: number;
  salaryAmount?: number;
  jerseyUrl?: string; // Generated jersey image
  fakeTrxCount?: number; // For Fraud Alert
  isPermanentlyBanned?: boolean;
  bannedIp?: string;
  bannedDeviceId?: string;
  fanTokens?: number;
  investments?: Investment[];
  lastMapVoteDate?: string; // YYYY-MM-DD
  lastVotedMapName?: string;
}

interface Investment {
  id: string;
  proPlayerId: string;
  amount: number;
  timestamp: number;
  status: 'active' | 'completed' | 'cancelled';
  returnAmount?: number;
}

interface FanToken {
  id: string;
  proPlayerId: string;
  tokenName: string;
  tokenSymbol: string;
  price: number;
  totalSupply: number;
  holders: { userId: string; amount: number }[];
}

interface StaffMember {
  userId: string;
  role: 'admin' | 'moderator' | 'support';
  permissions: {
    canManagePayments: boolean;
    canManageUsers: boolean;
    canManageMatches: boolean;
    canDeleteData: boolean;
    canViewSensitiveInfo: boolean;
  };
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // 'admin' or userId
  text: string;
  timestamp: number;
  isRead: boolean;
}

interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
}

interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  number: string;
  method: 'bKash' | 'Nagad';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  trxId?: string;
}

interface MatchResult {
  id: string;
  matchId: string;
  matchName: string;
  winnerName?: string;
  aiCommentary?: string;
  winners: { 
    rank: number; 
    gameName: string; 
    kills: number; 
    prize: number;
  }[];
  timestamp: number;
  date?: string;
  totalPrize?: number;
  blockchainHash?: string;
}

interface Notification {
  id: string;
  userId: string | 'all';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

interface MapDefinition {
  name: string;
  image: string;
  color: string;
}

interface Match {
  id: string;
  name: string;
  map: string;
  time: string;
  startTime: number;
  entryFee: number;
  totalPrize: number;
  perKill: number;
  totalSlots: number;
  joinedPlayers: { userId: string; joinedAt: number; slotNumber: number; squadName?: string; squadLogo?: string }[]; 
  imageUrl?: string;
  roomId?: string;
  roomPassword?: string;
  isRoomPublished?: boolean;
  game: 'Free Fire' | 'PUBG' | 'COD' | 'Ludo';
  category: 'Solo' | 'Duo' | 'Squad' | 'Classic' | 'Rush';
  isCompleted?: boolean;
  winnerId?: string;
  winnerName?: string;
  isScrim?: boolean;
  publishTime?: number; // timestamp to publish room id
  prizePoolType?: 'fixed' | 'dynamic';
  minPlayersForFullPrize?: number;
  isPPV?: boolean;
  viewerFee?: number;
  viewers?: string[];
  mapVotes?: { [mapName: string]: number };
  votedUserIds?: string[];
  isDynamicSlots?: boolean;
  reservedSlots?: { slotNumber: number; userId: string; expiresAt: number }[];
}

interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedWinner: string;
  points: number;
  status: 'pending' | 'won' | 'lost';
  timestamp: number;
}

interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  senderNumber: string;
  trxId: string;
  method: 'bKash' | 'Nagad';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  isFlagged?: boolean;
  flagReason?: string;
  receiptImageUrl?: string;
  aiVerification?: {
    trxId?: string;
    amount?: number;
    date?: string;
    confidence?: number;
    isMatch?: boolean;
  };
}

interface SpinPrize {
  type: 'balance' | 'xp';
  amount: number;
  color: string;
}

interface ScheduledAnnouncement {
  id: string;
  text: string;
  scheduledTime: number; // timestamp
  isSent: boolean;
}

interface AppConfig {
  bkash: string;
  nagad: string;
  whatsapp: string;
  telegram: string;
  referralBonus: number;
  matchRules: string;
  dailyRewardAmount: number;
  dailyRewardXP: number;
  isDiscussionEnabled: boolean;
  spinPrizes: SpinPrize[];
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  scrollingNotice: string;
  theme: 'light' | 'dark' | 'event';
  eventThemeConfig?: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
  };
  featureMaintenance: {
    topup: boolean;
    shop: boolean;
    spin: boolean;
    matches: boolean;
    withdraw: boolean;
    wallet: boolean;
    discussion: boolean;
    leaderboard: boolean;
    results: boolean;
    support: boolean;
    notifications: boolean;
  };
  scheduledAnnouncements: ScheduledAnnouncement[];
  ipBanList: string[];
  liveCommentaryUrl?: string;
  isLiveCommentaryActive?: boolean;
  featureToggles: {
    [key: string]: boolean;
  };
  isKillSwitchActive: boolean;
  deviceBanList: string[];
  adminDeviceLock?: string; // Authorized Device ID for /adminriad
  isAdminActive?: boolean;
  activeAdminSessionId?: string;
  staffMembers: StaffMember[];
  fanTokens: FanToken[];
}

interface AuditorLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: number;
}

interface MysteryBox {
  id: string;
  name: string;
  image?: string;
  price: number;
  prizes: {
    type: 'balance' | 'diamonds' | 'xp' | 'coupon' | 'nft' | 'badge' | 'frame' | 'skin' | 'custom';
    amount: number;
    chance: number;
    image?: string;
    name?: string;
  }[];
}

interface TeamSponsorship {
  id: string;
  teamName: string;
  ownerId: string;
  sponsorId?: string;
  sponsorName?: string;
  amount: number;
  status: 'open' | 'sponsored';
  description: string;
}

interface PromoCode {
  id: string;
  code: string;
  reward: number;
  discount?: number;
  bonusDiamonds?: number;
  usedBy: string[];
}

interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  gameName: string;
  text: string;
  timestamp: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  xpReward: number;
  requirement: number;
  type: 'matches' | 'wins' | 'kills' | 'spin' | 'checkin' | 'refer' | 'topup';
}

interface UserReport {
  id: string;
  userId: string;
  gameName: string;
  userName?: string;
  title?: string;
  type: string;
  description: string;
  reportedPlayerId?: string;
  status: 'pending' | 'resolved';
  timestamp: number;
}

interface TeamFinderPost {
  id: string;
  userId: string;
  gameName: string;
  game: 'Free Fire' | 'PUBG' | 'COD' | 'Ludo';
  role: string;
  description: string;
  contactInfo: string;
  timestamp: number;
  slotsNeeded: number;
  squadName?: string;
  squadLogo?: string;
}

interface MatchTemplate {
  id: string;
  name: string;
  map: string;
  entryFee: number;
  totalPrize: number;
  perKill: number;
  totalSlots: number;
  imageUrl?: string;
  isScrim?: boolean;
  publishTime?: number;
  game: 'Free Fire' | 'PUBG' | 'COD' | 'Ludo';
  category: 'Solo' | 'Duo' | 'Squad' | 'Classic' | 'Rush';
}

interface TransactionLog {
  id: string;
  userId: string;
  type: 'payment' | 'withdraw' | 'purchase' | 'topup' | 'loan' | 'ppv';
  amount: number;
  method: string;
  status: 'approved' | 'rejected';
  timestamp: number;
  details: string;
}

interface TopupCategory {
  id: string;
  label: string;
  imageUrl?: string;
  icon?: string;
}

interface TopupPackage {
  id: string;
  name: string;
  category: string;
  diamonds: number;
  price: number;
  bonus?: number;
  imageUrl?: string;
  tag?: string;
  status: 'Active' | 'Inactive';
}

interface TopupRequest {
  id: string;
  userId: string;
  gameId: string;
  packageId: string;
  diamonds: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

// --- Constants ---
const ADMIN_CREDENTIALS = {
  username: 'Riadkhan75',
  password: '205090'
};

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'mission_1', title: 'First Match', description: 'Join 1 match today.', reward: 5, xpReward: 50, requirement: 1, type: 'matches' },
  { id: 'mission_2', title: 'Warrior', description: 'Kill 5 players in total today.', reward: 10, xpReward: 100, requirement: 5, type: 'kills' },
  { id: 'mission_3', title: 'Champion', description: 'Win 1 match today.', reward: 20, xpReward: 200, requirement: 1, type: 'wins' },
  { id: 'mission_4', title: 'Daily Spinner', description: 'Spin the wheel 1 time today.', reward: 2, xpReward: 20, requirement: 1, type: 'spin' },
  { id: 'mission_5', title: 'Check-in', description: 'Check-in today.', reward: 2, xpReward: 20, requirement: 1, type: 'checkin' },
];

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: 'frame_gold', name: 'Golden Frame', description: 'A shiny golden frame for your profile.', price: 500, type: 'frame', color: '#FFD700' },
  { id: 'frame_neon', name: 'Neon Blue Frame', description: 'Glow in the dark with this neon blue frame.', price: 300, type: 'frame', color: '#00FFFF' },
  { id: 'frame_crimson', name: 'Crimson Fury', description: 'Intense red frame for aggressive players.', price: 400, type: 'frame', color: '#FF0000' },
  { id: 'frame_emerald', name: 'Emerald Guardian', description: 'A rare emerald green frame.', price: 600, type: 'frame', color: '#50C878' },
  { id: 'frame_obsidian', name: 'Obsidian Shadow', description: 'The darkest frame for the stealthiest players.', price: 800, type: 'frame', color: '#1A1A1A' },
  { id: 'frame_diamond', name: 'Diamond Frame', description: 'The rarest frame for the top players.', price: 2000, type: 'frame', color: '#B9F2FF' },
  { id: 'frame_ruby', name: 'Ruby Frame', description: 'A vibrant ruby red frame.', price: 1200, type: 'frame', color: '#E0115F' },
  { id: 'badge_vip', name: 'VIP Badge', description: 'Show everyone your VIP status.', price: 1000, type: 'badge', color: '#FF00FF' },
  { id: 'badge_pro', name: 'Pro Player', description: 'A badge for the elite competitors.', price: 1500, type: 'badge', color: '#FF4500' },
  { id: 'badge_legend', name: 'Legendary Badge', description: 'A badge for the true legends of RK Tournament.', price: 2500, type: 'badge', color: '#FFD700' },
  { id: 'card_entry', name: 'Special Entry Card', description: 'Use this to join any match for free.', price: 200, type: 'entry_card' },
  { id: 'name_red', name: 'Red Name', description: 'Make your name stand out in red.', price: 300, type: 'name_color', color: '#FF0000' },
  { id: 'name_gold', name: 'Gold Name', description: 'The ultimate prestige name color.', price: 500, type: 'name_color', color: '#FFD700' },
  { id: 'name_green', name: 'Green Name', description: 'A fresh green color for your name.', price: 300, type: 'name_color', color: '#00FF00' },
  { id: 'name_cyan', name: 'Cyan Name', description: 'A cool cyan color for your name.', price: 400, type: 'name_color', color: '#00FFFF' },
  { id: 'name_magenta', name: 'Magenta Name', description: 'A bold magenta color for your name.', price: 400, type: 'name_color', color: '#FF00FF' },
  { id: 'name_orange', name: 'Orange Name', description: 'A bright orange color for your name.', price: 400, type: 'name_color', color: '#FFA500' },
];

const DEFAULT_TOPUP_PACKAGES: TopupPackage[] = [
  { id: 'tp_1', name: '115 Diamonds', category: 'FF ID Topup', diamonds: 115, price: 85, bonus: 0, tag: 'Starter', status: 'Active' },
  { id: 'tp_2', name: '240 Diamonds', category: 'FF ID Topup', diamonds: 240, price: 165, bonus: 0, status: 'Active' },
  { id: 'tp_3', name: '355 Diamonds', category: 'FF ID Topup', diamonds: 355, price: 250, bonus: 0, tag: 'Best Value', status: 'Active' },
  { id: 'tp_4', name: '505 Diamonds', category: 'FF ID Topup', diamonds: 505, price: 340, bonus: 0, tag: 'Popular', status: 'Active' },
  { id: 'tp_5', name: '610 Diamonds', category: 'FF ID Topup', diamonds: 610, price: 420, bonus: 0, status: 'Active' },
  { id: 'tp_6', name: '1240 Diamonds', category: 'FF ID Topup', diamonds: 1240, price: 830, bonus: 0, tag: 'Pro', status: 'Active' },
  { id: 'tp_7', name: 'Weekly Membership', category: 'Weekly Membership', diamonds: 450, price: 190, bonus: 0, tag: 'Hot', status: 'Active' },
  { id: 'tp_8', name: 'Monthly Membership', category: 'Monthly Membership', diamonds: 2600, price: 790, bonus: 0, tag: 'Value', status: 'Active' },
];

const DEFAULT_TOPUP_CATEGORIES: TopupCategory[] = [
  { id: 'FF ID Topup', label: 'FF ID Topup', icon: 'Smartphone' },
  { id: 'Weekly Membership', label: 'Weekly Membership', icon: 'Calendar' },
  { id: 'Monthly Membership', label: 'Monthly Membership', icon: 'Calendar' },
  { id: 'Special Offers', label: 'Special Offers', icon: 'Zap' },
];

const DEFAULT_APP_CONFIG: AppConfig = {
  bkash: '01950-849094',
  nagad: '01939296244',
  whatsapp: 'https://wa.me/8801950849094',
  telegram: 'https://t.me/riad_topup',
  referralBonus: 10,
  matchRules: "1. No hacking allowed.\n2. Team up is strictly prohibited.\n3. Room ID & Password will be shared 15 mins before match.\n4. Decisions of admins are final.",
  dailyRewardAmount: 1,
  dailyRewardXP: 20,
  isDiscussionEnabled: true,
  spinPrizes: [
    { type: 'balance', amount: 5, color: '#dc2626' },
    { type: 'xp', amount: 50, color: '#0a0a0a' },
    { type: 'balance', amount: 2, color: '#dc2626' },
    { type: 'xp', amount: 20, color: '#0a0a0a' },
    { type: 'balance', amount: 10, color: '#dc2626' },
    { type: 'xp', amount: 100, color: '#0a0a0a' },
    { type: 'balance', amount: 1, color: '#dc2626' },
    { type: 'xp', amount: 10, color: '#0a0a0a' },
  ],
  isMaintenanceMode: false,
  maintenanceMessage: "App is under maintenance. Please check back later.",
  scrollingNotice: "Welcome to RK Tournament! Room ID & Password will be shared 15-20 mins before match starts.",
  theme: 'dark',
  eventThemeConfig: {
    name: 'Cyber Neon',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4'
  },
  featureMaintenance: {
    topup: false,
    shop: false,
    spin: false,
    matches: false,
    withdraw: false,
    wallet: false,
    discussion: false,
    leaderboard: false,
    results: false,
    support: false,
    notifications: false,
  },
  scheduledAnnouncements: [],
  ipBanList: [],
  liveCommentaryUrl: '',
  isLiveCommentaryActive: false,
  featureToggles: {
    loan: true,
    sponsorship: true,
    nft: true,
    ppv: true,
    affiliate: true,
    metaverse: true,
    dailyQuests: true,
    birthdaySurprise: true
  },
  isKillSwitchActive: false,
  deviceBanList: [],
  adminDeviceLock: undefined,
  isAdminActive: false,
  activeAdminSessionId: undefined,
  staffMembers: [],
  fanTokens: []
};

const BAD_WORDS = ['gali1', 'gali2', 'badword1', 'badword2', 'fuck', 'shit', 'bastard', 'slang1']; // Add more as needed

const checkChatModeration = (text: string) => {
  let censoredText = text;
  let hasViolation = false;
  
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(censoredText)) {
      censoredText = censoredText.replace(regex, '***');
      hasViolation = true;
    }
  });
  
  return { censoredText, hasViolation };
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_match', title: 'First Blood', description: 'Join your first tournament match.', icon: 'Zap', requirement: 'Join 1 match' },
  { id: 'high_roller', title: 'High Roller', description: 'Maintain a balance over ৳1000.', icon: 'Trophy', requirement: 'Balance > ৳1000' },
  { id: 'veteran', title: 'Veteran', description: 'Join 10 tournament matches.', icon: 'Medal', requirement: 'Join 10 matches' },
  { id: 'rich', title: 'Richie Rich', description: 'Add more than ৳5000 in total.', icon: 'Wallet', requirement: 'Total added > ৳5000' },
];

// --- UI Components ---
const Countdown = ({ targetTime, showLabel = true }: { targetTime: number; showLabel?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!targetTime || isNaN(targetTime)) {
      setTimeLeft(null);
      return;
    }
    
    const calculateTime = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return false;
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ h, m, s });
        return true;
      }
    };

    calculateTime();
    const timer = setInterval(() => {
      if (!calculateTime()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return (
    <div className="flex flex-col items-center justify-center bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl animate-pulse">
      <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em]">Live Now</span>
      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-end gap-1">
      {showLabel && <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest mr-1">Starts In</span>}
      <div className="flex gap-1.5 items-center font-mono font-black text-red-600 bg-red-600/5 border border-red-600/20 px-3 py-2 rounded-none shadow-inner shadow-red-600/5">
        <div className="flex flex-col items-center min-w-[24px]">
          <span className="text-base leading-none tracking-tighter">{timeLeft.h.toString().padStart(2, '0')}</span>
          <span className="text-[6px] uppercase tracking-tighter text-gray-500 mt-0.5">Hr</span>
        </div>
        <span className="text-xs text-red-600/30 mb-2">:</span>
        <div className="flex flex-col items-center min-w-[24px]">
          <span className="text-base leading-none tracking-tighter">{timeLeft.m.toString().padStart(2, '0')}</span>
          <span className="text-[6px] uppercase tracking-tighter text-gray-500 mt-0.5">Min</span>
        </div>
        <span className="text-xs text-red-600/30 mb-2">:</span>
        <div className="flex flex-col items-center min-w-[24px]">
          <span className="text-base leading-none tracking-tighter">{timeLeft.s.toString().padStart(2, '0')}</span>
          <span className="text-[6px] uppercase tracking-tighter text-gray-500 mt-0.5">Sec</span>
        </div>
      </div>
    </div>
  );
};

// --- Spin Wheel Component ---
const SpinWheel = ({ onSpin, lastSpinDate, prizes, isMaintenance }: { onSpin: (prize: { type: 'balance' | 'xp', amount: number }) => void, lastSpinDate?: string, prizes: SpinPrize[], isMaintenance?: boolean }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  if (isMaintenance) return <MaintenanceOverlay />;
  const [result, setResult] = useState<{ type: 'balance' | 'xp', amount: number } | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const hasSpunToday = lastSpinDate === today;

  const spin = () => {
    if (isSpinning || hasSpunToday) return;
    
    setIsSpinning(true);
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      const normalizedRotation = newRotation % 360;
      const prizeIndex = Math.floor((360 - normalizedRotation) / (360 / prizes.length)) % prizes.length;
      const prize = prizes[prizeIndex];
      setResult(prize);
      setIsSpinning(false);
      onSpin(prize);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white rounded-none shadow-xl flex items-center justify-center">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-600" />
        </div>
        
        {/* Wheel */}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="w-72 h-72 rounded-full border-8 border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]"
          style={{ background: 'conic-gradient(' + prizes.map((p, i) => `${p.color} ${i * (360 / prizes.length)}deg ${(i + 1) * (360 / prizes.length)}deg`).join(', ') + ')' }}
        >
          {prizes.map((prize, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-start justify-center pt-8"
              style={{ transform: `translate(-50%, -50%) rotate(${i * (360 / prizes.length) + (360 / prizes.length / 2)}deg)` }}
            >
              <div className={`flex flex-col items-center gap-1 font-black ${prize.color === '#0a0a0a' ? 'text-white' : 'text-black'}`}>
                <span className="text-lg leading-none">{prize.amount}</span>
                <span className="text-[8px] uppercase tracking-widest">{prize.type}</span>
              </div>
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl z-10 flex items-center justify-center">
            <div className="w-8 h-8 bg-black rounded-full" />
          </div>
        </motion.div>
      </div>

      <div className="text-center space-y-4">
        {result ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            <h3 className="text-3xl font-black uppercase italic text-red-600">Congratulations!</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest">You won {result.amount} {result.type === 'balance' ? '৳' : 'XP'}</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic">Spin & Win</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-glow-red">Try your luck today!</p>
          </div>
        )}

        <div className="pt-4">
          <NeonButton 
            onClick={spin}
            disabled={isSpinning || hasSpunToday}
            color="#dc2626"
            className="w-full px-12"
          >
            {isSpinning ? 'Spinning...' : hasSpunToday ? 'Come back tomorrow' : 'Spin Now'}
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

const MaintenanceOverlay = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-black/20 border border-white/5 rounded-3xl">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
      <ShieldAlert className="text-red-500" size={32} />
    </div>
    <h3 className="text-2xl font-black uppercase italic text-white">Coming Soon</h3>
    <p className="text-gray-400 text-sm max-w-xs">{message || "This feature is currently under maintenance. Please check back later."}</p>
  </div>
);

const generateGamingCV = (user: UserData) => {
  const doc = new jsPDF();
  
  // Modern Dark Theme
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 297, "F");

  // Accent Border
  doc.setDrawColor(20, 184, 166); // Teal-500
  doc.setLineWidth(2);
  doc.rect(5, 5, 200, 287, "D");

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(5, 5, 200, 50, "F");
  
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("GAMING PASSPORT", 105, 30, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("OFFICIAL PRO PLAYER CV", 105, 45, { align: "center" });

  // Player Profile Section
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(user.gameName || "WARRIOR", 20, 80);
  
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  doc.text(`Player ID: ${user.userId}`, 20, 90);
  doc.text(`Level: ${user.level}`, 20, 98);
  doc.text(`Rank: ${user.isLegendary ? 'LEGENDARY' : 'ELITE'}`, 20, 106);

  // Stats Grid
  doc.setFillColor(30, 30, 30);
  doc.roundedRect(20, 120, 170, 80, 5, 5, "F");
  
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(16);
  doc.text("CAREER STATISTICS", 105, 135, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Total Matches:`, 40, 155);
  doc.text(`${user.totalMatches || 0}`, 150, 155, { align: "right" });
  
  doc.text(`Total Wins:`, 40, 165);
  doc.text(`${user.totalWins || 0}`, 150, 165, { align: "right" });
  
  const winRate = user.totalMatches ? ((user.totalWins / user.totalMatches) * 100).toFixed(1) : '0';
  doc.text(`Win Rate:`, 40, 175);
  doc.text(`${winRate}%`, 150, 175, { align: "right" });
  
  doc.text(`Total Kills:`, 40, 185);
  doc.text(`${user.totalKills || 0}`, 150, 185, { align: "right" });

  // Achievements
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(16);
  doc.text("NOTABLE ACHIEVEMENTS", 105, 220, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  const achievements = (user.achievements || []).join(", ") || "No trophies yet.";
  doc.text(achievements, 105, 235, { align: "center", maxWidth: 160 });

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("VERIFIED BY RK TOURNAMENT SYSTEM", 105, 280, { align: "center" });
  doc.text("© 2026 RK TOURNAMENT. ALL RIGHTS RESERVED.", 105, 285, { align: "center" });

  doc.save(`${user.gameName}_Gaming_CV.pdf`);
};

const FanEconomy = ({ users, currentUser, onInvest }: { users: UserData[], currentUser: UserData, onInvest: (playerId: string, amount: number) => void }) => {
  const topPlayers = users.filter(u => u.isProContracted || (u.totalWins || 0) > 10).sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
          <TrendingUp className="text-primary" />
          Fan Economy
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Invest in your favorite warriors and earn commissions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topPlayers.map(player => (
          <div key={player.userId} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img src={player.avatarUrl || 'https://picsum.photos/seed/user/100/100'} className="w-16 h-16 rounded-2xl border border-white/10" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="text-lg font-black uppercase italic">{player.gameName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Win Rate: {player.totalMatches ? ((player.totalWins / player.totalMatches) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Token Price</div>
                <div className="text-xl font-black text-primary italic">৳{(player.totalWins || 0) * 10 + 100}</div>
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 flex justify-around text-center">
              <div>
                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Investors</div>
                <div className="text-sm font-black text-white">{Math.floor(Math.random() * 50) + 10}</div>
              </div>
              <div>
                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Commission</div>
                <div className="text-sm font-black text-teal-500">5%</div>
              </div>
              <div>
                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Yield</div>
                <div className="text-sm font-black text-orange-500">High</div>
              </div>
            </div>

            <button 
              onClick={() => onInvest(player.userId, (player.totalWins || 0) * 10 + 100)}
              className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
            >
              Buy Fan Token
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const BannedOverlay = ({ reason }: { reason?: string }) => (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center text-center p-8 space-y-8">
    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-pulse shadow-2xl shadow-red-500/20">
      <ShieldAlert size={56} />
    </div>
    <div className="space-y-3">
      <h2 className="text-5xl font-black uppercase italic tracking-tighter text-red-500 drop-shadow-lg">Account Banned</h2>
      <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto leading-relaxed">
        Your access to the arena has been revoked due to a violation of our terms of service.
      </p>
      {reason && (
        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl mt-4">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Reason</p>
          <p className="text-xs text-white font-bold italic">"{reason}"</p>
        </div>
      )}
    </div>
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <a 
        href="https://t.me/riad_support" 
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-teal-500/20"
      >
        Contact Support
      </a>
      <button 
        onClick={() => {
          localStorage.removeItem('currentUser');
          window.location.reload();
        }}
        className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
      >
        Logout
      </button>
    </div>
  </div>
);

const Shop = ({ items, onBuy, userBalance, userInventory, isMaintenance }: { items: ShopItem[], onBuy: (id: string) => void, userBalance: number, userInventory: string[], isMaintenance?: boolean }) => {
  if (isMaintenance) return <MaintenanceOverlay />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
          <ShoppingBag className="text-orange-500" />
          Store
        </h2>
        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
          <Coins className="text-orange-500" size={16} />
          <span className="text-sm font-black text-orange-500">৳{userBalance}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => {
          const isOwned = userInventory?.includes(item.id);
          return (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:border-orange-500/50 transition-all group relative overflow-hidden">
              {isOwned && (
                <div className="absolute top-4 right-4 bg-teal-500 text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded rotate-12 z-10">
                  Owned
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${
                    item.type === 'frame' ? 'bg-blue-500/20 text-blue-500' :
                    item.type === 'badge' ? 'bg-purple-500/20 text-purple-500' :
                    item.type === 'name_color' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-teal-500/20 text-teal-500'
                  }`}>
                    {item.type.replace('_', ' ')}
                  </div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">{item.name}</h3>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
                <div className="text-xl font-black text-orange-500 italic">৳{item.price}</div>
              </div>

              <div className="h-32 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                {item.type === 'frame' && (
                  <div className="w-20 h-20 rounded-full border-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]" style={{ borderColor: item.color }} />
                )}
                {item.type === 'badge' && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10" style={{ color: item.color }}>
                    <Award size={40} />
                  </div>
                )}
                {item.type === 'name_color' && (
                  <div className="text-2xl font-black uppercase italic" style={{ color: item.color }}>
                    Your Name
                  </div>
                )}
                
                {/* Decorative background elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />
              </div>

              <button 
                onClick={() => !isOwned && onBuy(item.id)}
                disabled={isOwned}
                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                  isOwned 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' 
                  : 'bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-black hover:border-orange-500'
                }`}
              >
                {isOwned ? 'Already Purchased' : 'Purchase Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TruckButton = ({ onClick, disabled, label, successLabel }: { onClick: () => void, disabled?: boolean, label: string, successLabel: string }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || isAnimating || isDone) return;

    const button = buttonRef.current;
    if (!button) return;

    const box = button.querySelector('.box');
    const truck = button.querySelector('.truck');

    setIsAnimating(true);
    button.classList.add('animation');

    gsap.to(button, {
      '--box-s': 1,
      '--box-o': 1,
      duration: 0.3,
      delay: 0.5
    });

    gsap.to(box, {
      x: 0,
      duration: 0.4,
      delay: 0.7
    });

    gsap.to(button, {
      '--hx': -5,
      '--bx': 50,
      duration: 0.18,
      delay: 0.92
    });

    gsap.to(box, {
      y: 0,
      duration: 0.1,
      delay: 1.15
    });

    gsap.set(button, {
      '--truck-y': 0,
      '--truck-y-n': -26
    });

    gsap.to(button, {
      '--truck-y': 1,
      '--truck-y-n': -25,
      duration: 0.2,
      delay: 1.25,
      onComplete() {
        gsap.timeline({
          onComplete() {
            button.classList.add('done');
            setIsDone(true);
            setIsAnimating(false);
            setTimeout(() => {
              onClick();
            }, 500);
          }
        }).to(truck, {
          x: 0,
          duration: 0.4
        }).to(truck, {
          x: 40,
          duration: 1
        }).to(truck, {
          x: 20,
          duration: 0.6
        }).to(truck, {
          x: 96,
          duration: 0.4
        });
        gsap.to(button, {
          '--progress': 1,
          duration: 2.4,
          ease: "power2.in"
        });
      }
    });
  };

  return (
    <button 
      ref={buttonRef}
      disabled={disabled || isAnimating}
      onClick={handleClick}
      className={`truck-button w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="default">{label}</span>
      <span className="success">
        {successLabel}
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>
      <div className="truck">
        <div className="wheel" />
        <div className="back" />
        <div className="front" />
        <div className="box" />
      </div>
    </button>
  );
};

const ElectricCard = ({ title, description, badge }: { title: string, description: string, badge: string }) => {
  return (
    <div className="card-container">
      <div className="background-glow" />
      <div className="glow-layer-1" />
      <div className="glow-layer-2" />
      <div className="overlay-1" />
      <div className="overlay-2" />
      <div className="inner-container">
        <div className="border-outer">
          <div className="main-card bg-black/80" />
        </div>
        <div className="content-container">
          <div className="content-top">
            <div className="scrollbar-glass">{badge}</div>
            <h2 className="title text-white">{title}</h2>
          </div>
          <hr className="divider" />
          <div className="content-bottom">
            <p className="description text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectricCard1 = ({ title, description, badge }: { title: string, description: string, badge: string }) => {
  return (
    <div className="card-container1">
      <div className="background-glow1" />
      <div className="glow-layer-11" />
      <div className="glow-layer-21" />
      <div className="overlay-11" />
      <div className="overlay-21" />
      <div className="inner-container1">
        <div className="border-outer1">
          <div className="main-card1 bg-black/80" />
        </div>
        <div className="content-container1">
          <div className="content-top1">
            <div className="scrollbar-glass1">{badge}</div>
            <h2 className="title1 text-white">{title}</h2>
          </div>
          <hr className="divider1" />
          <div className="content-bottom1">
            <p className="description1 text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const logoutButtonStates = {
  'default': {
    '--figure-duration': '100',
    '--transform-figure': 'none',
    '--walking-duration': '100',
    '--transform-arm1': 'none',
    '--transform-wrist1': 'none',
    '--transform-arm2': 'none',
    '--transform-wrist2': 'none',
    '--transform-leg1': 'none',
    '--transform-calf1': 'none',
    '--transform-leg2': 'none',
    '--transform-calf2': 'none'
  },
  'hover': {
    '--figure-duration': '100',
    '--transform-figure': 'translateX(1.5px)',
    '--walking-duration': '100',
    '--transform-arm1': 'rotate(-5deg)',
    '--transform-wrist1': 'rotate(-15deg)',
    '--transform-arm2': 'rotate(5deg)',
    '--transform-wrist2': 'rotate(6deg)',
    '--transform-leg1': 'rotate(-10deg)',
    '--transform-calf1': 'rotate(5deg)',
    '--transform-leg2': 'rotate(20deg)',
    '--transform-calf2': 'rotate(-20deg)'
  },
  'walking1': {
    '--figure-duration': '300',
    '--transform-figure': 'translateX(11px)',
    '--walking-duration': '300',
    '--transform-arm1': 'translateX(-4px) translateY(-2px) rotate(120deg)',
    '--transform-wrist1': 'rotate(-5deg)',
    '--transform-arm2': 'translateX(4px) rotate(-110deg)',
    '--transform-wrist2': 'rotate(-5deg)',
    '--transform-leg1': 'translateX(-3px) rotate(80deg)',
    '--transform-calf1': 'rotate(-30deg)',
    '--transform-leg2': 'translateX(4px) rotate(-60deg)',
    '--transform-calf2': 'rotate(20deg)'
  },
  'walking2': {
    '--figure-duration': '400',
    '--transform-figure': 'translateX(17px)',
    '--walking-duration': '300',
    '--transform-arm1': 'rotate(60deg)',
    '--transform-wrist1': 'rotate(-15deg)',
    '--transform-arm2': 'rotate(-45deg)',
    '--transform-wrist2': 'rotate(6deg)',
    '--transform-leg1': 'rotate(-5deg)',
    '--transform-calf1': 'rotate(10deg)',
    '--transform-leg2': 'rotate(10deg)',
    '--transform-calf2': 'rotate(-20deg)'
  },
  'falling1': {
    '--figure-duration': '1600',
    '--walking-duration': '400',
    '--transform-arm1': 'rotate(-60deg)',
    '--transform-wrist1': 'none',
    '--transform-arm2': 'rotate(30deg)',
    '--transform-wrist2': 'rotate(120deg)',
    '--transform-leg1': 'rotate(-30deg)',
    '--transform-calf1': 'rotate(-20deg)',
    '--transform-leg2': 'rotate(20deg)'
  },
  'falling2': {
    '--walking-duration': '300',
    '--transform-arm1': 'rotate(-100deg)',
    '--transform-arm2': 'rotate(-60deg)',
    '--transform-wrist2': 'rotate(60deg)',
    '--transform-leg1': 'rotate(80deg)',
    '--transform-calf1': 'rotate(20deg)',
    '--transform-leg2': 'rotate(-60deg)'
  },
  'falling3': {
    '--walking-duration': '500',
    '--transform-arm1': 'rotate(-30deg)',
    '--transform-wrist1': 'rotate(40deg)',
    '--transform-arm2': 'rotate(50deg)',
    '--transform-wrist2': 'none',
    '--transform-leg1': 'rotate(-30deg)',
    '--transform-leg2': 'rotate(20deg)',
    '--transform-calf2': 'none'
  }
};

const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const [state, setState] = useState('default');
  const [isClicked, setIsClicked] = useState(false);
  const [isDoorSlammed, setIsDoorSlammed] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateButtonState = (newState: string) => {
    if (logoutButtonStates[newState as keyof typeof logoutButtonStates]) {
      setState(newState);
      const styles = logoutButtonStates[newState as keyof typeof logoutButtonStates];
      if (buttonRef.current) {
        for (const key in styles) {
          buttonRef.current.style.setProperty(key, styles[key as keyof typeof styles]);
        }
      }
    }
  };

  const handleMouseEnter = () => {
    if (state === 'default') {
      updateButtonState('hover');
    }
  };

  const handleMouseLeave = () => {
    if (state === 'hover') {
      updateButtonState('default');
    }
  };

  const handleClick = () => {
    if (state === 'default' || state === 'hover') {
      setIsClicked(true);
      updateButtonState('walking1');
      
      setTimeout(() => {
        setIsDoorSlammed(true);
        updateButtonState('walking2');
        
        setTimeout(() => {
          setIsFalling(true);
          updateButtonState('falling1');
          
          setTimeout(() => {
            updateButtonState('falling2');
            
            setTimeout(() => {
              updateButtonState('falling3');
              
              setTimeout(() => {
                setIsClicked(false);
                setIsDoorSlammed(false);
                setIsFalling(false);
                updateButtonState('default');
                onLogout();
              }, 1000);
            }, parseInt(logoutButtonStates['falling2']['--walking-duration']));
          }, parseInt(logoutButtonStates['falling1']['--walking-duration']));
        }, parseInt(logoutButtonStates['walking2']['--figure-duration']));
      }, parseInt(logoutButtonStates['walking1']['--figure-duration']));
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`logoutButton ${isClicked ? 'clicked' : ''} ${isDoorSlammed ? 'door-slammed' : ''} ${isFalling ? 'falling' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="button-text">Logout</span>
      <svg className="doorway" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
      </svg>
      <svg className="figure" viewBox="0 0 100 100">
        <circle cx="52.1" cy="32.4" r="6.4" />
        <g className="arm1">
          <path d="M52.1 39.7l-3.7 13.2" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="wrist1" d="M48.4 52.9l-.8 5.8" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <g className="arm2">
          <path d="M52.1 39.7l7.3 11.8" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="wrist2" d="M59.4 51.5l4.9 3.2" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <g className="leg1">
          <path d="M52.1 58l-3.2 13.3" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="calf1" d="M48.9 71.3l-3.2 11.2" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <g className="leg2">
          <path d="M52.1 58l4.4 11.4" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="calf2" d="M56.5 69.4l-2.3 12.3" stroke="#4371f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
      <svg className="door" viewBox="0 0 100 100">
        <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
        <circle cx="66" cy="50" r="3.7" />
      </svg>
      <svg className="bang" viewBox="0 0 100 100">
        <path d="M100 50c0-27.6-22.4-50-50-50S0 22.4 0 50s22.4 50 50 50 50-22.4 50-50z" />
      </svg>
    </button>
  );
};

// --- Match Ticker Component ---
const MatchTicker = ({ matches }: { matches: Match[] }) => {
  return (
    <div className="w-full bg-black border-y border-red-600/30 py-3 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap items-center px-4"
      >
        {[...matches, ...matches].map((match, idx) => (
          <div key={idx} className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-none animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{match.name}</span>
            </div>
            <span className="text-[11px] font-black text-red-600 tracking-widest">৳{match.totalPrize} PRIZE POOL</span>
            <div className="h-5 w-px bg-red-600/20" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const NeonButton = ({ children, onClick, color = '#dc2626', className = '', type = 'button', disabled = false }: { children: React.ReactNode, onClick?: () => void, color?: string, className?: string, type?: 'button' | 'submit' | 'reset', disabled?: boolean }) => {
  return (
    <button 
      type={type}
      disabled={disabled}
      className={`neon-btn ${className} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`} 
      style={{ '--color': disabled ? '#444' : color } as React.CSSProperties}
      onClick={disabled ? undefined : onClick}
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      {children}
    </button>
  );
};

const CreepyButton = ({ onClick, children, className = "", type = "button" }: { onClick?: () => void, children: React.ReactNode, className?: string, type?: "button" | "submit" | "reset" }) => {
    const eyesRef = useRef<HTMLSpanElement>(null);
    const [eyeCoords, setEyeCoords] = useState({ x: 0, y: 0 });
    const translateX = `${-50 + eyeCoords.x * 50}%`;
    const translateY = `${-50 + eyeCoords.y * 50}%`;
    const eyeStyle = {
        "transform": `translate(${translateX}, ${translateY})`
    } as React.CSSProperties;

    const updateEyes = (e: React.MouseEvent | React.TouchEvent) => {
        const userEvent = "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
        const eyesRect = eyesRef.current?.getBoundingClientRect();
        if (!eyesRect) return;

        const eyes = {
            x: eyesRect.left + eyesRect.width / 2,
            y: eyesRect.top + eyesRect.height / 2
        };
        const cursor = {
            x: userEvent.clientX,
            y: userEvent.clientY
        };

        const dx = cursor.x - eyes.x;
        const dy = cursor.y - eyes.y;
        const angle = Math.atan2(-dy, dx) + Math.PI / 2;

        const visionRangeX = 180;
        const visionRangeY = 75;
        const distance = Math.hypot(dx, dy);
        const x = Math.sin(angle) * distance / visionRangeX;
        const y = Math.cos(angle) * distance / visionRangeY;
        setEyeCoords({ x, y });
    };

    return (
        <button 
          className={`creepy-btn ${className}`} 
          type={type} 
          onClick={onClick} 
          onMouseMove={updateEyes} 
          onTouchMove={updateEyes}
        >
            <span className="creepy-btn__eyes" ref={eyesRef}>
                <span className="creepy-btn__eye">
                    <span className="creepy-btn__pupil" style={eyeStyle}></span>
                </span>
                <span className="creepy-btn__eye">
                    <span className="creepy-btn__pupil" style={eyeStyle}></span>
                </span>
            </span>
            <span className="creepy-btn__cover">{children}</span>
        </button>
    );
};

const Topup = ({ packages, categories, onTopup, userBalance, history, currentUser, promoCodes, isMaintenance, showToast }: { packages: TopupPackage[], categories: TopupCategory[], onTopup: (pkg: TopupPackage, gameId: string, saveId: boolean, promoCode?: string) => void, userBalance: number, history: TopupRequest[], currentUser: UserData | null, promoCodes: PromoCode[], isMaintenance?: boolean, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || 'FF ID Topup');
  const [selectedPackage, setSelectedPackage] = useState<TopupPackage | null>(null);
  const [gameId, setGameId] = useState(currentUser?.lastGameId || '');
  const [saveId, setSaveId] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  if (isMaintenance) return <MaintenanceOverlay />;

  const handleApplyPromo = () => {
    const promo = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (!promo) {
      showToast('Invalid Promo Code', 'error');
      return;
    }
    if (promo.usedBy?.includes(currentUser?.userId || '')) {
      showToast('Promo Code already used', 'error');
      return;
    }
    setAppliedPromo(promo);
    showToast('Promo Code Applied!', 'success');
  };

  const calculateDiscountedPrice = (price: number) => {
    if (!appliedPromo?.discount) return price;
    return Math.floor(price * (1 - appliedPromo.discount / 100));
  };

  const calculateBonusDiamonds = (diamonds: number) => {
    let bonus = 0;
    if (appliedPromo?.bonusDiamonds) bonus += appliedPromo.bonusDiamonds;
    if (!currentUser?.hasToppedUp) bonus += Math.floor(diamonds * 0.1); // 10% First Topup Bonus
    return bonus;
  };

  const filteredPackages = packages.filter(p => p.status === 'Active' && p.category === selectedCategory);

  return (
    <div className="space-y-8 py-4">
      <header className="space-y-2">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-600">Free Fire Topup</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Instant Diamonds Delivery via Game ID</p>
      </header>

      {/* Category Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedPackage(null);
            }}
            className={`p-4 rounded-none border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden group ${
              selectedCategory === cat.id 
              ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
              : 'bg-black/40 border-white/10 text-white hover:border-primary/50'
            }`}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 blur-xl rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700" />
            <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-colors ${
              selectedCategory === cat.id ? 'bg-black/10' : 'bg-red-600/10'
            }`}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (() => {
                  const Icon = cat.icon === 'Calendar' ? Calendar : cat.icon === 'Zap' ? Zap : Smartphone;
                  return <Icon size={20} className={selectedCategory === cat.id ? 'text-black' : 'text-red-600'} />;
                })()
              )}
            </div>
            <div className="text-center">
              <div className="text-[10px] font-black uppercase italic leading-none tracking-tighter">{cat.label}</div>
            </div>
            
            {/* Cyber Accents */}
            <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l ${selectedCategory === cat.id ? 'border-black' : 'border-red-600'}`} />
            <div className={`absolute top-0 right-0 w-1 h-1 border-t border-r ${selectedCategory === cat.id ? 'border-black' : 'border-red-600'}`} />
            <div className={`absolute bottom-0 left-0 w-1 h-1 border-b border-l ${selectedCategory === cat.id ? 'border-black' : 'border-red-600'}`} />
            <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r ${selectedCategory === cat.id ? 'border-black' : 'border-red-600'}`} />
          </button>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-gray-600 text-xs font-black uppercase tracking-widest italic">No products available in this category.</p>
          </div>
        ) : (
          filteredPackages.map(pkg => (
            <motion.button
              key={pkg.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative p-4 rounded-none border-2 transition-all flex flex-col items-center gap-2 overflow-hidden group ${
                selectedPackage?.id === pkg.id 
                ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                : 'bg-black/40 border-white/10 text-white hover:border-red-600/50'
              }`}
            >
              {pkg.tag && (
                <div className="absolute top-0 left-0 bg-accent text-black text-[7px] font-black uppercase px-2 py-1 tracking-tighter z-10">
                  {pkg.tag}
                </div>
              )}
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 blur-xl rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700" />
              
              {pkg.imageUrl ? (
                <img src={pkg.imageUrl} alt={pkg.name} className="w-14 h-14 object-cover border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
              ) : (
                <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-colors ${
                  selectedPackage?.id === pkg.id ? 'bg-white/10' : 'bg-red-600/10'
                }`}>
                  <Smartphone size={20} className={selectedPackage?.id === pkg.id ? 'text-white' : 'text-red-600'} />
                </div>
              )}

              <div className="text-center">
                <div className="text-sm font-black italic leading-none truncate max-w-[100px]">{pkg.name}</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{pkg.diamonds} Diamonds</div>
              </div>
              <div className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${
                selectedPackage?.id === pkg.id ? 'bg-white text-red-600' : 'bg-red-600/20 text-red-600'
              }`}>
                ৳{pkg.price}
              </div>
              {pkg.bonus && pkg.bonus > 0 && (
                <div className="absolute top-2 right-2 bg-accent text-black text-[7px] font-black uppercase px-2 py-0.5 rounded-none tracking-tighter">
                  +{pkg.bonus} Bonus
                </div>
              )}

              {/* Cyber Accents */}
              <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l ${selectedPackage?.id === pkg.id ? 'border-black' : 'border-secondary'}`} />
              <div className={`absolute top-0 right-0 w-1 h-1 border-t border-r ${selectedPackage?.id === pkg.id ? 'border-black' : 'border-secondary'}`} />
              <div className={`absolute bottom-0 left-0 w-1 h-1 border-b border-l ${selectedPackage?.id === pkg.id ? 'border-black' : 'border-secondary'}`} />
              <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r ${selectedPackage?.id === pkg.id ? 'border-black' : 'border-secondary'}`} />
            </motion.button>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedPackage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Confirm Order</h3>
              <button 
                onClick={() => {
                  setSelectedPackage(null);
                  setAppliedPromo(null);
                  setPromoCode('');
                }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Player Game ID</label>
                <input 
                  type="text" 
                  placeholder="Enter Free Fire ID" 
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-none px-6 py-4 text-sm font-bold focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
                />
                <label className="flex items-center gap-2 mt-2 ml-1 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={saveId}
                    onChange={(e) => setSaveId(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${saveId ? 'bg-red-600 border-red-600' : 'border-white/20 group-hover:border-white/40'}`}>
                    {saveId && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Save Game ID for next time</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Promo Code (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-none px-4 py-3 text-xs font-bold focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-black/40 rounded-2xl p-4 space-y-2 border border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Package</span>
                  <span className="text-white">{selectedPackage.diamonds} Diamonds</span>
                </div>
                {calculateBonusDiamonds(selectedPackage.diamonds) > 0 && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Bonus Diamonds</span>
                    <span className="text-red-600">+{calculateBonusDiamonds(selectedPackage.diamonds)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Original Price</span>
                  <span className="text-white">৳{selectedPackage.price}</span>
                </div>
                {appliedPromo?.discount && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Promo Discount ({appliedPromo.discount}%)</span>
                    <span className="text-green-500">-৳{selectedPackage.price - calculateDiscountedPrice(selectedPackage.price)}</span>
                  </div>
                )}
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Final Price</span>
                  <span className="text-red-600">৳{calculateDiscountedPrice(selectedPackage.price)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Your Balance</span>
                  <span className={userBalance >= calculateDiscountedPrice(selectedPackage.price) ? 'text-green-500' : 'text-red-500'}>
                    ৳{userBalance}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <TruckButton 
                  disabled={!gameId || userBalance < calculateDiscountedPrice(selectedPackage.price)}
                  onClick={() => {
                    onTopup(selectedPackage, gameId, saveId, appliedPromo?.code);
                    setSelectedPackage(null);
                    setAppliedPromo(null);
                    setPromoCode('');
                  }}
                  label={userBalance < calculateDiscountedPrice(selectedPackage.price) ? 'Insufficient Balance' : 'Confirm Topup'}
                  successLabel="Order Placed"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topup History */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <History size={16} className="text-teal-500" />
          Topup History
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No topup history yet</p>
            </div>
          ) : (
            history.map(req => (
              <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase italic">{req.diamonds} Diamonds</div>
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">ID: {req.gameId} • {new Date(req.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs font-black italic text-teal-500">৳{req.price}</div>
                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {req.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- App Component ---
// --- Components ---
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -100 + "%"],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`s-${i}`}
          className="absolute w-px h-20 bg-gradient-to-b from-secondary/0 via-secondary/20 to-secondary/0"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "-20%",
            opacity: 0 
          }}
          animate={{ 
            y: "120%",
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: Math.random() * 2 + 2, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
};

const ESportsCard = ({ user, matchResult }: { user: UserData, matchResult: MatchResult }) => {
  const playerStats = matchResult.winners.find(w => w.gameName === user.gameName);
  const rank = playerStats?.rank || 'N/A';
  const kills = playerStats?.kills || 0;
  
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-64 h-96 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400/50 group"
    >
      {/* Verified Pro Badge */}
      {user.isVerifiedPro && (
        <div className="absolute top-4 right-4 z-20 bg-blue-500 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse border-2 border-white/20">
          <ShieldCheck size={16} />
        </div>
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
      
      {/* Card Content */}
      <div className="relative h-full flex flex-col items-center p-4">
        {/* Rank Badge */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-black/40 backdrop-blur-md rounded-lg flex flex-col items-center justify-center border border-white/20">
          <span className="text-[10px] text-yellow-400 font-bold uppercase">Rank</span>
          <span className="text-xl text-white font-black">#{rank}</span>
        </div>
        
        {/* Player Image */}
        <div className="mt-8 w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden bg-black/20 shadow-inner">
          <img 
            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`} 
            alt="Player" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Name */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{user.gameName}</h3>
          <div className="text-[10px] text-yellow-200 font-bold uppercase tracking-widest">Elite Competitor</div>
        </div>
        
        {/* Stats Grid */}
        <div className="mt-auto w-full grid grid-cols-2 gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-center">
            <div className="text-[8px] text-yellow-400 uppercase font-bold">Kills</div>
            <div className="text-lg text-white font-black">{kills}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-yellow-400 uppercase font-bold">Level</div>
            <div className="text-lg text-white font-black">{user.level}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-yellow-400 uppercase font-bold">XP</div>
            <div className="text-sm text-white font-bold">{user.xp}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-yellow-400 uppercase font-bold">Wins</div>
            <div className="text-sm text-white font-bold">{user.totalWins}</div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 flex items-center gap-2">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">RK Tournament Official</span>
        </div>
      </div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
    </motion.div>
  );
};

const TeamFinderView = ({ 
  posts, 
  onAddPost, 
  currentUser,
  onBack
}: { 
  posts: TeamFinderPost[], 
  onAddPost: (post: Omit<TeamFinderPost, 'id' | 'userId' | 'gameName' | 'timestamp'>) => void,
  currentUser: UserData,
  onBack: () => void
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({
    game: 'Free Fire' as const,
    role: '',
    description: '',
    contactInfo: '',
    slotsNeeded: 1
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 pb-24"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black uppercase italic">Squad Finder</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Find your perfect team</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 font-bold uppercase italic">No recruitment posts yet</p>
            <p className="text-xs text-gray-600 mt-1">Be the first to find a squad!</p>
          </div>
        ) : (
          posts.sort((a, b) => b.timestamp - a.timestamp).map(post => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                <div className="px-2 py-1 bg-orange-500/20 text-orange-500 text-[10px] font-bold rounded uppercase tracking-widest">
                  {post.game}
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black">
                  {post.gameName[0]}
                </div>
                <div>
                  <div className="font-bold uppercase italic text-sm flex items-center gap-2">
                    {post.gameName}
                    {post.squadName && (
                      <span className="text-[8px] px-1 bg-orange-500/20 text-orange-500 rounded font-black flex items-center gap-1">
                        {post.squadLogo && <img src={post.squadLogo} className="w-2 h-2 rounded-full" referrerPolicy="no-referrer" />}
                        {post.squadName}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase">Role: {post.role}</div>
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400 uppercase">Slots: {post.slotsNeeded}</div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">"{post.description}"</p>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-500">
                    <MessageSquare size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{post.contactInfo}</span>
                  </div>
                  <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Post Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 overflow-hidden"
            >
              <h3 className="text-xl font-black uppercase italic mb-6">Recruit Squad</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Select Game</label>
                  <select 
                    value={newPost.game}
                    onChange={(e) => setNewPost({...newPost, game: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="Free Fire">Free Fire</option>
                    <option value="PUBG">PUBG</option>
                    <option value="COD">COD</option>
                    <option value="Ludo">Ludo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Required Role</label>
                  <input 
                    type="text"
                    placeholder="e.g. Sniper, Rusher, IGL"
                    value={newPost.role}
                    onChange={(e) => setNewPost({...newPost, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Slots Needed</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={newPost.slotsNeeded}
                    onChange={(e) => setNewPost({...newPost, slotsNeeded: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Description</label>
                  <textarea 
                    placeholder="Tell us about your squad requirements..."
                    value={newPost.description}
                    onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Contact Info (WhatsApp/Telegram)</label>
                  <input 
                    type="text"
                    placeholder="e.g. +880123456789"
                    value={newPost.contactInfo}
                    onChange={(e) => setNewPost({...newPost, contactInfo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button 
                  onClick={() => {
                    onAddPost(newPost);
                    setShowAddModal(false);
                    setNewPost({
                      game: 'Free Fire',
                      role: '',
                      description: '',
                      contactInfo: '',
                      slotsNeeded: 1
                    });
                  }}
                  className="w-full py-4 bg-orange-500 text-white font-black uppercase italic rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Post Recruitment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const BANGLADESH_DISTRICTS = [
  { name: 'Dhaka', x: 50, y: 50 },
  { name: 'Chittagong', x: 70, y: 80 },
  { name: 'Sylhet', x: 80, y: 30 },
  { name: 'Rajshahi', x: 20, y: 40 },
  { name: 'Khulna', x: 30, y: 70 },
  { name: 'Barisal', x: 50, y: 80 },
  { name: 'Rangpur', x: 30, y: 15 },
  { name: 'Mymensingh', x: 60, y: 35 },
];

const ProfitGraph = ({ payments, withdraws }: { payments: PaymentRequest[], withdraws: WithdrawRequest[] }) => {
  const data = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const revenue = payments
        .filter(p => p.status === 'approved' && new Date(p.timestamp).toISOString().startsWith(date))
        .reduce((sum, p) => sum + p.amount, 0);
      const payout = withdraws
        .filter(w => w.status === 'approved' && new Date(w.timestamp).toISOString().startsWith(date))
        .reduce((sum, w) => sum + w.amount, 0);
      return { date, revenue, payout, profit: revenue - payout };
    });
  }, [payments, withdraws]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" fontSize={10} />
          <YAxis stroke="#666" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="payout" fill="#ef4444" radius={[4, 4, 0, 0]} name="Payout" />
          <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const NFTBadges = ({ badges }: { badges: NFTBadge[] }) => (
  <div className="grid grid-cols-3 gap-4">
    {badges.map(badge => (
      <motion.div 
        key={badge.id}
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40"
      >
        <img src={badge.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-white truncate">{badge.name}</p>
          <div className={`mt-1 h-1 w-full rounded-full ${
            badge.rarity === 'Legendary' ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]' :
            badge.rarity === 'Epic' ? 'bg-purple-500' :
            badge.rarity === 'Rare' ? 'bg-blue-500' : 'bg-gray-500'
          }`} />
        </div>
      </motion.div>
    ))}
  </div>
);

const MetaverseAvatar = ({ parts }: { parts: UserData['avatarParts'] }) => {
  const colors = {
    skin: ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'],
    hair: ['#090806', '#2C222B', '#71635A', '#B7A69E', '#D6C4C2', '#CABFB1', '#FFF5E1', '#E6BE8A', '#B87333', '#A52A2A'],
    shirt: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Base Body */}
      <div 
        className="w-3/4 h-3/4 rounded-full absolute" 
        style={{ backgroundColor: colors.skin[parts?.skin || 0] }} 
      />
      {/* Hair */}
      <div 
        className="w-4/5 h-1/3 rounded-t-full absolute top-2" 
        style={{ backgroundColor: colors.hair[parts?.hair || 0] }} 
      />
      {/* Eyes */}
      <div className="absolute top-1/2 -translate-y-4 flex gap-4">
        <div className="w-2 h-2 bg-black rounded-full" />
        <div className="w-2 h-2 bg-black rounded-full" />
      </div>
      {/* Shirt */}
      <div 
        className="w-full h-1/2 rounded-b-3xl absolute bottom-0" 
        style={{ backgroundColor: colors.shirt[parts?.shirt || 0] }} 
      />
    </div>
  );
};

const LiveUserHeatmap = ({ users }: { users: UserData[] }) => {
  const districtCounts = users.reduce((acc, user) => {
    if (user.district) {
      acc[user.district] = (acc[user.district] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(districtCounts), 1);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-teal-500 flex items-center gap-2">
          <MapPin size={16} /> Live User Heatmap
        </h3>
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Bangladesh</div>
      </div>
      <div className="relative aspect-[4/5] bg-black/40 rounded-2xl overflow-hidden border border-white/10 p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10">
          <path d="M30,10 L70,10 L90,40 L80,90 L20,90 L10,40 Z" fill="currentColor" className="text-teal-500" />
        </svg>
        
        {BANGLADESH_DISTRICTS.map((district) => {
          const count = districtCounts[district.name] || 0;
          const size = 10 + (count / maxCount) * 30;
          if (count === 0) return null;
          return (
            <motion.div
              key={district.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute flex flex-col items-center justify-center"
              style={{ left: `${district.x}%`, top: `${district.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div 
                className="rounded-full bg-teal-500/30 border border-teal-500/50 animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                style={{ width: size, height: size }}
              />
              <div className="mt-1 bg-black/80 border border-white/10 px-1.5 py-0.5 rounded text-center">
                <p className="text-[6px] font-black uppercase tracking-tighter text-white leading-none">{district.name}</p>
                <p className="text-[5px] font-bold text-teal-500 leading-none mt-0.5">{count} Warriors</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const PandaAnimation = ({ focusedField }: { focusedField: 'username' | 'password' | null }) => {
  return (
    <div className="panda-container">
      <div className="panda-ear-l" />
      <div className="panda-ear-r" />
      <div className="panda-face">
        <div className="panda-blush-l" />
        <div className="panda-blush-r" />
        <div className="panda-eye-l">
          <div 
            className="panda-eyeball-l" 
            style={focusedField === 'username' ? { left: '0.75em', top: '1.12em' } : {}}
          />
        </div>
        <div className="panda-eye-r">
          <div 
            className="panda-eyeball-r" 
            style={focusedField === 'username' ? { right: '0.75em', top: '1.12em' } : {}}
          />
        </div>
        <div className="panda-nose" />
        <div className="panda-mouth" />
      </div>
      <div 
        className="panda-hand-l" 
        style={focusedField === 'password' ? { height: '6.56em', top: '1em', left: '2.5em', transform: 'rotate(-155deg)' } : {}}
      />
      <div 
        className="panda-hand-r" 
        style={focusedField === 'password' ? { height: '6.56em', top: '1em', right: '2.5em', transform: 'rotate(155deg)' } : {}}
      />
    </div>
  );
};

const DEFAULT_MYSTERY_BOXES: MysteryBox[] = [
  {
    id: 'box-1',
    name: 'Starter Crate',
    image: 'https://picsum.photos/seed/box1/200/200',
    price: 50,
    prizes: [
      { type: 'balance', amount: 10, chance: 0.5 },
      { type: 'balance', amount: 100, chance: 0.1 },
      { type: 'xp', amount: 50, chance: 0.4 }
    ]
  }
];

export class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const self = this as any;
    if (self.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 text-red-500">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm max-w-md mb-8">
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-8 p-4 bg-black/40 border border-white/10 rounded-xl text-[10px] text-left overflow-auto max-w-full text-red-400">
              {self.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return self.props.children;
  }
}

export default function App() {
  // --- State ---
  const [users, setUsers] = useState<UserData[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [adminSession, setAdminSession] = useState<UserData | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [view, setView] = useState<'home' | 'wallet' | 'profile' | 'admin' | 'login' | 'signup' | 'adminLogin' | 'achievements' | 'results' | 'leaderboard' | 'support' | 'notifications' | 'spin' | 'report' | 'shop' | 'topup' | 'calendar' | 'teamfinder' | 'affiliate' | 'sponsorship' | 'mysterybox'>('home');
  const [lastAdminActivity, setLastAdminActivity] = useState<number>(Date.now());

  const socket = useMemo(() => io({
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 30000,
    autoConnect: true
  }), []);
  const isRemoteUpdate = React.useRef(false);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pendingSyncData = React.useRef<any>({});

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const syncData = useCallback((newData: any) => {
    if (isRemoteUpdate.current) return;
    
    pendingSyncData.current = { ...pendingSyncData.current, ...newData };
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      socket.emit('update_data', pendingSyncData.current);
      pendingSyncData.current = {};
      syncTimeoutRef.current = null;
    }, 500); // 500ms debounce
  }, [socket]);

  const handleAdminLogout = useCallback(() => {
    setAdminSession(null);
    localStorage.removeItem('ff_admin_session');
    localStorage.removeItem('ff_admin_session_id');
    setView('home');
    syncData({ 
      appConfig: { 
        ...appConfig, 
        isAdminActive: false, 
        activeAdminSessionId: undefined 
      } 
    });
    showToast('Admin logged out successfully.', 'success');
  }, [appConfig, syncData, showToast]);

  const handleAdminLogin = async (user: string, pass: string, pin?: string) => {
    const SECRET_PIN = "205090";
    const isMultiDevice = pin === SECRET_PIN;

    if (appConfig.isAdminActive && !isMultiDevice) {
      showToast('Admin is already logged in from another device. Use Secret PIN for multi-device access.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = isMultiDevice ? `multi_${Math.random().toString(36).substr(2, 9)}` : Math.random().toString(36).substr(2, 9);
        const adminUser: UserData = { 
          userId: user, 
          gameName: 'Admin', 
          balance: 0, 
          winnings: 0, 
          role: 'admin', 
          referralCode: 'ADMIN',
          xp: 0,
          level: 1,
          totalMatches: 0,
          totalWins: 0,
          totalKills: 0,
          referralCount: 0,
          creditScore: 100,
          loanAmount: 0,
          loginStreak: 0,
          lastLoginDate: ''
        };
        setAdminSession(adminUser);
        setView('admin');
        localStorage.setItem('ff_admin_session', JSON.stringify(adminUser));
        localStorage.setItem('ff_admin_session_id', sessionId);
        syncData({ 
          appConfig: { 
            ...appConfig, 
            isAdminActive: true, 
            activeAdminSessionId: sessionId 
          } 
        });
        showToast(isMultiDevice ? 'Multi-device Admin Access Granted!' : 'Admin Access Granted!', 'success');
      } else {
        showToast('Invalid Admin credentials', 'error');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      showToast('Login failed. Please try again.', 'error');
    }
  };
  useEffect(() => {
    if (currentUser) {
      const updatedUsers = users.map(u => u.userId === currentUser.userId ? { ...u, location: { ...u.location, page: view } } : u);
      setUsers(updatedUsers);
      socket.emit('update_data', { users: updatedUsers });
    }
    if (adminSession) {
      // Admin tracking logic if needed
    }
  }, [view, currentUser?.userId, adminSession?.userId]);
  const [teamFinderPosts, setTeamFinderPosts] = useState<TeamFinderPost[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedGame, setSelectedGame] = useState<'All' | 'Free Fire' | 'PUBG' | 'COD' | 'Ludo'>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Solo' | 'Duo' | 'Squad' | 'Classic' | 'Rush'>('All');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Handle Browser Back Button for PWA
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync browser history with view state
  useEffect(() => {
    if (window.history.state?.view !== view) {
      window.history.pushState({ view }, '', '');
    }
    window.scrollTo(0, 0);
  }, [view]);

  // Pull to Refresh handling (Visual only, or can trigger data refresh)
  useEffect(() => {
    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) touchStart = e.touches[0].pageY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEnd = e.changedTouches[0].pageY;
      if (window.scrollY === 0 && touchEnd - touchStart > 150) {
        // Trigger a refresh if pulled down enough
        // We can just reload the socket data or the whole page
        // window.location.reload(); 
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const [currentServer, setCurrentServer] = useState('Asia-East1');
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const checkTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) {
        setAppConfig(prev => ({ ...prev, theme: 'dark' }));
      } else {
        setAppConfig(prev => ({ ...prev, theme: 'light' }));
      }
    };
    checkTheme();
    const interval = setInterval(checkTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const playBattleHorn = () => {
    const audio = new Audio('https://www.soundjay.com/misc/sounds/horn-1.mp3');
    audio.play().catch(e => console.error('Audio play error:', e));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      matches.forEach(match => {
        if (match.startTime - now <= 5 * 60 * 1000 && match.startTime - now > 4 * 60 * 1000) {
          playBattleHorn();
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: 'all',
            title: 'Battle Horn!',
            message: `Match "${match.name}" starts in 5 minutes! Get ready!`,
            type: 'warning',
            timestamp: Date.now(),
            isRead: false
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [matches]);

  useEffect(() => {
    if (currentUser?.location?.country === 'USA') {
      setCurrentServer('US-West1');
    } else if (currentUser?.location?.country === 'UK') {
      setCurrentServer('Europe-West1');
    }
  }, [currentUser]);

  useEffect(() => {
    if (view === 'admin' && adminSession) {
      const timeout = 5 * 60 * 1000; // 5 minutes
      const interval = setInterval(() => {
        if (Date.now() - lastAdminActivity > timeout) {
          showToast('Admin session timed out due to inactivity.', 'info');
          handleAdminLogout();
        }
      }, 10000);
      
      const handleActivity = () => setLastAdminActivity(Date.now());
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
      };
    }
  }, [view, adminSession, lastAdminActivity]);


  const banUser = (userId: string) => {
    confirmAction(
      'Ban User',
      'Are you sure you want to permanently ban this user? This will block their IP and Device ID.',
      () => {
        const updatedUsers = users.map(u => u.userId === userId ? { ...u, isPermanentlyBanned: true, isBanned: true, banReason: 'Permanent Ban (IP/Device Blocked)' } : u);
        setUsers(updatedUsers);
        localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
        
        // In a real app, we would also store the IP/Device ID in a blacklist
        const user = users.find(u => u.userId === userId);
        if (user) {
          const blacklist = JSON.parse(localStorage.getItem('rk_blacklist') || '[]');
          blacklist.push({
            userId: user.userId,
            ip: '192.168.1.1', // Mock IP
            deviceId: 'mock-device-id', // Mock Device ID
            timestamp: Date.now()
          });
          localStorage.setItem('rk_blacklist', JSON.stringify(blacklist));
        }

        showToast(`User ${userId} has been permanently banned.`, 'success');
      }
    );
  };

  const updateModeratorPermissions = (userId: string, permissions: string[]) => {
    const updatedUsers = users.map(u => u.userId === userId ? { ...u, moderatorPermissions: permissions } : u);
    setUsers(updatedUsers);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    showToast('Moderator permissions updated!', 'success');
  };
  const cleanExpiredMatches = useCallback(() => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const activeMatches = matches.filter(m => m.startTime > thirtyDaysAgo);
    if (activeMatches.length !== matches.length && matches.length > 0) {
      setMatches(activeMatches);
      localStorage.setItem('ff_matches', JSON.stringify(activeMatches));
    }
  }, [matches]);

  useEffect(() => {
    cleanExpiredMatches();
  }, []);

  const handleGiftMembership = (friendId: string, membershipType: 'Elite' | 'Pro') => {
    if (!currentUser) return;
    const price = membershipType === 'Elite' ? 500 : 1000;
    if (currentUser.balance < price) {
      showToast('Insufficient balance to gift membership.', 'error');
      return;
    }
    
    const friend = users.find(u => u.userId === friendId);
    if (!friend) {
      showToast('Friend ID not found.', 'error');
      return;
    }
    
    const updatedUsers = users.map(u => {
      if (u.userId === friendId) {
        return { ...u, isVip: true, membershipGiftedBy: currentUser.userId };
      }
      if (u.userId === currentUser.userId) {
        return { ...u, balance: u.balance - price };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    setCurrentUser(updatedUsers.find(u => u.userId === currentUser.userId) || null);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    showToast(`Successfully gifted ${membershipType} Pass to ${friend.gameName}!`, 'success');
  };

  const generateAICommentary = async (matchName: string, winners: any[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a short, exciting e-sports match commentary for a match named "${matchName}". 
      The winners are: ${winners.map(w => `Rank ${w.rank}: ${w.gameName} with ${w.kills} kills`).join(', ')}. 
      Keep it under 100 words and make it sound professional and hype.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("AI Commentary Error:", error);
      return "The match was intense! Congratulations to all winners for their outstanding performance.";
    }
  };

  const generateInvoice = (payment: PaymentRequest, user: UserData) => {
    const doc = new jsPDF();
    
    // Background Color
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");

    // Border
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287, "D");

    // Header Design
    doc.setFillColor(249, 115, 22); // Orange-500
    doc.rect(5, 5, 200, 40, "F");
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("RK TOURNAMENT", 105, 25, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 35, { align: "center" });
    
    // Watermark
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("RK TOURNAMENT", 105, 150, { align: "center", angle: 45 });

    // Details Section
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Receipt ID:`, 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`${payment.id}`, 45, 60);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Date:`, 20, 68);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(payment.timestamp).toLocaleString()}`, 45, 68);
    
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 90);
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(user.gameName || "User", 20, 102);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(`User ID: ${user.userId}`, 20, 110);
    
    // Table Header
    doc.setFillColor(30, 30, 30);
    doc.rect(20, 125, 170, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(11);
    doc.text("Description", 25, 135);
    doc.text("Method", 100, 135);
    doc.text("TrxID", 130, 135);
    doc.text("Amount", 185, 135, { align: "right" });
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Wallet Top-up", 25, 155);
    doc.text(payment.method, 100, 155);
    doc.text(payment.trxId, 130, 155);
    doc.text(`৳${payment.amount}`, 185, 155, { align: "right" });
    
    // Divider
    doc.setDrawColor(50, 50, 50);
    doc.line(20, 165, 190, 165);

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(180, 180, 180);
    doc.text("Subtotal:", 130, 185);
    doc.text(`৳${payment.amount}`, 185, 185, { align: "right" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.text("TOTAL PAID:", 130, 205);
    doc.text(`৳${payment.amount}`, 185, 205, { align: "right" });
    
    // Status Badge
    doc.setFillColor(34, 197, 94, 0.1);
    doc.setDrawColor(34, 197, 94);
    doc.rect(20, 185, 60, 20, "FD");
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: APPROVED", 50, 197, { align: "center" });
    
    // QR Code Placeholder
    doc.setDrawColor(100, 100, 100);
    doc.rect(160, 230, 30, 30, "D");
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text("VERIFIED RECEIPT", 175, 265, { align: "center" });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RK TOURNAMENT", 105, 275, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for choosing RK Tournament! For any support, contact us through the app.", 105, 280, { align: "center" });
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, 284, { align: "center" });
    doc.text("© 2026 RK TOURNAMENT. All Rights Reserved.", 105, 288, { align: "center" });
    
    doc.save(`RK_Receipt_${payment.trxId}.pdf`);
  };

  const generateWithdrawalReceipt = (request: WithdrawRequest, user: UserData) => {
    const doc = new jsPDF();
    
    // Background Color
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, "F");

    // Border
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287, "D");

    // Header Design
    doc.setFillColor(249, 115, 22); // Orange-500
    doc.rect(5, 5, 200, 40, "F");
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("RK TOURNAMENT", 105, 25, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text("WITHDRAWAL RECEIPT", 105, 35, { align: "center" });
    
    // Watermark
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("WITHDRAWAL", 105, 150, { align: "center", angle: 45 });

    // Details Section
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Request ID:`, 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`${request.id}`, 45, 60);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Date:`, 20, 68);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(request.timestamp).toLocaleString()}`, 45, 68);
    
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.setFont("helvetica", "bold");
    doc.text("RECIPIENT:", 20, 90);
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(user.gameName || "User", 20, 102);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(`User ID: ${user.userId}`, 20, 110);
    
    // Table Header
    doc.setFillColor(30, 30, 30);
    doc.rect(20, 125, 170, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(11);
    doc.text("Description", 25, 135);
    doc.text("Method", 90, 135);
    doc.text("Account Number", 120, 135);
    doc.text("Amount", 185, 135, { align: "right" });
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Winnings Withdrawal", 25, 155);
    doc.text(request.method, 90, 155);
    doc.text(request.number, 120, 155);
    doc.text(`৳${request.amount}`, 185, 155, { align: "right" });
    
    // Divider
    doc.setDrawColor(50, 50, 50);
    doc.line(20, 165, 190, 165);

    // Summary
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.text("TOTAL WITHDRAWN:", 110, 205);
    doc.text(`৳${request.amount}`, 185, 205, { align: "right" });
    
    // Status Badge
    const statusColor = request.status === 'approved' ? [34, 197, 94] : request.status === 'pending' ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.1);
    doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(20, 185, 60, 20, "FD");
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`STATUS: ${request.status.toUpperCase()}`, 50, 197, { align: "center" });
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RK TOURNAMENT", 105, 275, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Withdrawals are processed within 24 hours. For any support, contact us through the app.", 105, 280, { align: "center" });
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, 284, { align: "center" });
    doc.text("© 2026 RK TOURNAMENT. All Rights Reserved.", 105, 288, { align: "center" });
    
    doc.save(`RK_Withdrawal_${request.id}.pdf`);
  };
  const LiveCommentaryPlayer = () => {
    if (!appConfig.isLiveCommentaryActive || !appConfig.liveCommentaryUrl) return null;

    return (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-24 right-4 z-50 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 group"
      >
        <div className="relative">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-black animate-pulse">
            <Radio size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">Live Commentary</div>
          <div className="text-xs font-black uppercase italic tracking-tight">Match in Progress</div>
          <audio 
            src={appConfig.liveCommentaryUrl} 
            controls 
            className="h-8 mt-2 opacity-50 hover:opacity-100 transition-all"
          />
        </div>
      </motion.div>
    );
  };

  const [shopItems, setShopItems] = useState<ShopItem[]>(DEFAULT_SHOP_ITEMS);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'notifications' | 'banners' | 'support' | 'results' | 'withdraws' | 'spin' | 'settings' | 'promo' | 'balance' | 'wallets' | 'payments' | 'matches' | 'users' | 'reports' | 'fraud_reports' | 'templates' | 'logs' | 'analytics' | 'shop' | 'topup' | 'topup_packages' | 'maintenance' | 'missions' | 'advanced' | 'roadmap' | 'leaderboard' | 'activity' | 'announcements' | 'comparison' | 'auditor' | 'moderator_activity' | 'nfts' | 'mystery_boxes' | 'sponsorships' | 'voting' | 'squads' | 'live_tracking' | 'pro_contracts' | 'theme' | 'staff' | 'ip_bans'>('dashboard');

  const generateTeamJersey = (squadName: string, squadLogo: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      // Draw Jersey Shape (Simple representation)
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, 800, 1000);

      // Gradient Background
      const grad = ctx.createLinearGradient(0, 0, 800, 1000);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(200, 100);
      ctx.lineTo(600, 100);
      ctx.lineTo(750, 300);
      ctx.lineTo(650, 400);
      ctx.lineTo(600, 350);
      ctx.lineTo(600, 900);
      ctx.lineTo(200, 900);
      ctx.lineTo(200, 350);
      ctx.lineTo(150, 400);
      ctx.lineTo(50, 300);
      ctx.closePath();
      ctx.fill();

      // Add Team Name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(squadName.toUpperCase(), 400, 600);

      // Add "PRO PLAYER" text
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('OFFICIAL SQUAD JERSEY', 400, 650);

      // Draw Logo
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = squadLogo || 'https://picsum.photos/seed/squad/200/200';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 350, 100, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 300, 250, 200, 200);
        ctx.restore();
        
        // Add border to logo
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(400, 350, 100, 0, Math.PI * 2);
        ctx.stroke();

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(canvas.toDataURL('image/png'));
      };
    });
  };

  const verifyPaymentWithAI = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || !payment.receiptImageUrl) {
      showToast('No receipt image found for this payment.', 'error');
      return;
    }

    showToast('AI is scanning receipt...', 'info');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Fetch the image and convert to base64
      const imgResponse = await fetch(payment.receiptImageUrl);
      const blob = await imgResponse.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Data = await base64Promise;
      const base64Image = base64Data.split(',')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract Transaction ID, Amount, and Date from this payment receipt. Return as JSON with keys: trxId, amount, date." },
              { inlineData: { data: base64Image, mimeType: "image/png" } }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      const isMatch = result.trxId === payment.trxId && Number(result.amount) === payment.amount;
      
      const updatedPayment: PaymentRequest = {
        ...payment,
        aiVerification: {
          trxId: result.trxId,
          amount: Number(result.amount),
          date: result.date,
          confidence: 0.95,
          isMatch
        }
      };

      setPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
      socket.emit('update_data', { payments: payments.map(p => p.id === paymentId ? updatedPayment : p) });
      
      if (isMatch) {
        showToast('AI verified: Payment matches!', 'success');
      } else {
        showToast('AI Warning: Payment details do not match!', 'error');
      }
    } catch (error) {
      console.error('AI Verification Error:', error);
      showToast('AI failed to scan receipt.', 'error');
    }
  };
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [matchTemplates, setMatchTemplates] = useState<MatchTemplate[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);

  const logTransaction = (userId: string, amount: number, type: TransactionLog['type'], details: string) => {
    const newLog: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      amount,
      type,
      details,
      status: 'approved',
      method: 'System',
      timestamp: Date.now()
    };
    setTransactionLogs(prev => [newLog, ...prev]);
    const storedLogs = localStorage.getItem('ff_logs');
    const logs = safeJSONParse(storedLogs, []);
    localStorage.setItem('ff_logs', JSON.stringify([newLog, ...logs]));
  };
  const [topupPackages, setTopupPackages] = useState<TopupPackage[]>(DEFAULT_TOPUP_PACKAGES);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [nftMarketplace, setNftMarketplace] = useState<{ id: string; nft: NFTBadge; price: number; sellerId: string; sellerName: string }[]>([]);

  const listNftForSale = (nftId: string, price: number) => {
    if (!currentUser) return;
    const nft = currentUser.achievementNFTs?.find(n => n.id === nftId);
    if (!nft) return;

    const newListing = {
      id: Math.random().toString(36).substr(2, 9),
      nft,
      price,
      sellerId: currentUser.userId,
      sellerName: currentUser.gameName
    };

    setNftMarketplace(prev => [newListing, ...prev]);
    
    // Remove from user inventory (achievementNFTs)
    const updatedUser = {
      ...currentUser,
      achievementNFTs: currentUser.achievementNFTs?.filter(n => n.id !== nftId)
    };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    showToast('NFT listed for sale!', 'success');
  };

  const buyNft = (listingId: string) => {
    if (!currentUser) return;
    const listing = nftMarketplace.find(l => l.id === listingId);
    if (!listing) return;

    if (currentUser.balance < listing.price) {
      showToast('Insufficient balance!', 'error');
      return;
    }

    // Update buyer
    const updatedBuyer = {
      ...currentUser,
      balance: currentUser.balance - listing.price,
      achievementNFTs: [...(currentUser.achievementNFTs || []), listing.nft]
    };

    // Update seller
    const updatedUsers = users.map(u => {
      if (u.userId === listing.sellerId) {
        return { ...u, balance: u.balance + listing.price };
      }
      if (u.userId === currentUser.userId) {
        return updatedBuyer;
      }
      return u;
    });

    setUsers(updatedUsers);
    setCurrentUser(updatedBuyer);
    setNftMarketplace(prev => prev.filter(l => l.id !== listingId));
    showToast(`Successfully purchased ${listing.nft.name}!`, 'success');
  };

  const Marketplace = () => (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">NFT Marketplace</h1>
          <p className="text-gray-400 text-sm font-medium">Trade your legendary achievements.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Your Balance</div>
          <div className="text-2xl font-black text-teal-500 tracking-tighter italic">৳{currentUser?.balance || 0}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {nftMarketplace.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem] opacity-50">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-sm font-black uppercase tracking-widest">No NFTs listed for sale yet.</p>
          </div>
        ) : (
          nftMarketplace.map(listing => (
            <motion.div 
              key={listing.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
                listing.nft.rarity === 'Legendary' ? 'bg-yellow-500 text-black' :
                listing.nft.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                listing.nft.rarity === 'Rare' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {listing.nft.rarity}
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <img src={listing.nft.image} alt={listing.nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black uppercase italic tracking-tighter">{listing.nft.name}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Seller: {listing.sellerName}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-black text-orange-500 italic">৳{listing.price}</div>
                <button 
                  onClick={() => buyNft(listing.id)}
                  disabled={currentUser?.userId === listing.sellerId}
                  className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [adminViewingMatchId, setAdminViewingMatchId] = useState<string | null>(null);
  const [adminAlert, setAdminAlert] = useState({ show: false, message: '' });
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedUserForNFT, setSelectedUserForNFT] = useState<string>('');
  const [selectedNFTTemplate, setSelectedNFTTemplate] = useState<any>(null);
  const [customNFT, setCustomNFT] = useState({ name: '', image: '', rarity: 'Common' as NFTBadge['rarity'] });
  const [newMysteryBox, setNewMysteryBox] = useState<Partial<MysteryBox>>({
    name: '',
    image: '',
    price: 0,
    prizes: [
      { type: 'balance', amount: 0, chance: 0.5, image: '', name: '' },
      { type: 'diamonds', amount: 0, chance: 0.3, image: '', name: '' },
      { type: 'xp', amount: 0, chance: 0.2, image: '', name: '' }
    ]
  });
  const [wonPrize, setWonPrize] = useState<{ boxName: string; prize: any } | null>(null);
  const [squads, setSquads] = useState<Squad[]>(() => {
    return safeJSONParse(localStorage.getItem('ff_squads'), []);
  });
  const [availableMaps, setAvailableMaps] = useState<MapDefinition[]>(() => {
    return safeJSONParse(localStorage.getItem('ff_available_maps'), [
      { name: 'Kalahari', image: 'https://picsum.photos/seed/kalahari/400/200', color: 'from-orange-500/20' },
      { name: 'Solara', image: 'https://picsum.photos/seed/solara/400/200', color: 'from-teal-500/20' },
      { name: 'Nexttara', image: 'https://picsum.photos/seed/nexttara/400/200', color: 'from-purple-500/20' },
      { name: 'Bermuda', image: 'https://picsum.photos/seed/bermuda/400/200', color: 'from-blue-500/20' },
      { name: 'Purgatory', image: 'https://picsum.photos/seed/purgatory/400/200', color: 'from-red-500/20' }
    ]);
  });
  const [mapVotes, setMapVotes] = useState<{ [key: string]: number }>(() => {
    return safeJSONParse(localStorage.getItem('ff_map_votes'), { Kalahari: 0, Solara: 0, Nexttara: 0, Bermuda: 0, Purgatory: 0 });
  });
  const [lastMapResetDate, setLastMapResetDate] = useState<string>(() => {
    return localStorage.getItem('ff_last_map_reset_date') || '';
  });
  const [userVotedMap, setUserVotedMap] = useState<string | null>(() => {
    return localStorage.getItem('ff_user_voted_map');
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastMapResetDate !== today) {
      const resetVotes = { Kalahari: 0, Solara: 0, Nexttara: 0, Bermuda: 0, Purgatory: 0 };
      setMapVotes(resetVotes);
      setUserVotedMap(null);
      setLastMapResetDate(today);
      localStorage.setItem('ff_map_votes', JSON.stringify(resetVotes));
      localStorage.removeItem('ff_user_voted_map');
      localStorage.setItem('ff_last_map_reset_date', today);
      socket.emit('update_data', { mapVotes: resetVotes });
    }
  }, [lastMapResetDate]);

  useEffect(() => {
    if (currentUser) {
      const today = new Date().toISOString().split('T')[0];
      if (currentUser.lastMapVoteDate === today) {
        setUserVotedMap(currentUser.lastVotedMapName || null);
      } else {
        setUserVotedMap(null);
      }
    } else {
      setUserVotedMap(null);
    }
  }, [currentUser]);

  const handleMapVote = (mapName: string) => {
    if (!currentUser) {
      showToast('Please login to vote!', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastMapVoteDate === today) {
      showToast('You already voted today!', 'info');
      return;
    }
    const newVotes = { ...mapVotes, [mapName]: (mapVotes[mapName] || 0) + 1 };
    setMapVotes(newVotes);
    
    const updatedUser = { ...currentUser, lastMapVoteDate: today, lastVotedMapName: mapName };
    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    
    setUserVotedMap(mapName);
    localStorage.setItem('ff_user_voted_map', mapName);
    socket.emit('update_data', { mapVotes: newVotes });
    showToast(`Voted for ${mapName}!`, 'success');
  };

  const [boxToDelete, setBoxToDelete] = useState<string | null>(null);
  const [newSponsorship, setNewSponsorship] = useState<Partial<TeamSponsorship>>({
    teamName: '',
    description: '',
    amount: 0,
    status: 'open'
  });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [matchComments, setMatchComments] = useState<MatchComment[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'winnings' | 'referrals' | 'kills'>('winnings');
  const [matchModalTab, setMatchModalTab] = useState<'details' | 'discussion' | 'predictions'>('details');
  const [isLoading, setIsLoading] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiChatMessages, setAIChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showAddTopupModal, setShowAddTopupModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [topupCategories, setTopupCategories] = useState<TopupCategory[]>(DEFAULT_TOPUP_CATEGORIES);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [auditorLogs, setAuditorLogs] = useState<AuditorLog[]>([]);
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>(DEFAULT_MYSTERY_BOXES);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [sponsorships, setSponsorships] = useState<TeamSponsorship[]>(() => {
    return safeJSONParse(localStorage.getItem('ff_sponsorships'), []);
  });
  const [nftBadges, setNftBadges] = useState<NFTBadge[]>(() => {
    return safeJSONParse(localStorage.getItem('ff_nft_badges'), DEFAULT_NFT_BADGES);
  });

  const handleGiveNFT = (isCustom: boolean = false) => {
    if (!selectedUserForNFT) {
      showToast('Please select a user', 'error');
      return;
    }

    if (isCustom && (!customNFT.name || !customNFT.image)) {
      showToast('Please fill in all custom NFT fields', 'error');
      return;
    }

    if (!isCustom && !selectedNFTTemplate) {
      showToast('Please select an NFT template', 'error');
      return;
    }

    const newNFT: NFTBadge = {
      id: `nft_${Date.now()}`,
      name: isCustom ? customNFT.name : selectedNFTTemplate.name,
      image: isCustom ? customNFT.image : selectedNFTTemplate.image,
      rarity: isCustom ? customNFT.rarity : selectedNFTTemplate.rarity,
      ownerId: selectedUserForNFT,
      mintDate: new Date().toISOString().split('T')[0],
    };

    setNftBadges(prev => [...prev, newNFT]);
    showToast(`NFT given to @${selectedUserForNFT} successfully!`, 'success');
    logAuditorAction('GIVE_NFT', `NFT ${newNFT.name} given to ${selectedUserForNFT}`);
    
    if (isCustom) {
      setCustomNFT({ name: '', image: '', rarity: 'Common' });
    } else {
      setSelectedNFTTemplate(null);
    }
    setSelectedUserForNFT('');
  };
  const handleCreateMysteryBox = () => {
    if (!newMysteryBox.name || !newMysteryBox.price || !newMysteryBox.prizes) {
      showToast('Please fill in all mystery box fields', 'error');
      return;
    }

    const box: MysteryBox = {
      id: `box-${Date.now()}`,
      name: newMysteryBox.name,
      image: newMysteryBox.image,
      price: Number(newMysteryBox.price),
      prizes: newMysteryBox.prizes as any
    };

    setMysteryBoxes(prev => [...prev, box]);
    showToast('Mystery Box created successfully!', 'success');
    logAuditorAction('CREATE_MYSTERY_BOX', `Created box: ${box.name}`);
    setNewMysteryBox({
      name: '',
      image: '',
      price: 0,
      prizes: [
        { type: 'balance', amount: 0, chance: 0.5, image: '', name: '' },
        { type: 'diamonds', amount: 0, chance: 0.3, image: '', name: '' },
        { type: 'xp', amount: 0, chance: 0.2, image: '', name: '' }
      ]
    });
  };

  const handleCreateSponsorship = () => {
    if (!newSponsorship.teamName || !newSponsorship.description || !newSponsorship.amount) {
      showToast('Please fill in all sponsorship fields', 'error');
      return;
    }

    if (!currentUser) return;

    const sponsorship: TeamSponsorship = {
      id: `sponsor_${Date.now()}`,
      teamName: newSponsorship.teamName,
      description: newSponsorship.description,
      amount: Number(newSponsorship.amount),
      status: 'open',
      ownerId: currentUser.userId
    };

    setSponsorships(prev => [...prev, sponsorship]);
    showToast('Sponsorship added successfully!', 'success');
    logAuditorAction('CREATE_SPONSORSHIP', `Created sponsorship for: ${sponsorship.teamName}`);
    setNewSponsorship({
      teamName: '',
      description: '',
      amount: 0,
      status: 'open'
    });
  };

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        callback(data.imageUrl);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Error uploading image', 'error');
    }
  };

  const [isSuspiciousActivity, setIsSuspiciousActivity] = useState(false);
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const [suspiciousUser, setSuspiciousUser] = useState<UserData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const InvisibleCaptcha = ({ onVerify }: { onVerify: () => void }) => {
    useEffect(() => {
      // Simulate invisible captcha verification
      const timer = setTimeout(() => {
        onVerify();
      }, 1000);
      return () => clearTimeout(timer);
    }, [onVerify]);
    return null;
  };
  const [playerComparison, setPlayerComparison] = useState<{ p1: UserData | null, p2: UserData | null }>({ p1: null, p2: null });

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleLoan = (amount: number) => {
    if (!currentUser) return;
    if (currentUser.creditScore < 500) {
      showToast("Your Gamer Credit Score is too low for a loan. Play more matches and behave well to increase it!", "error");
      return;
    }
    if (currentUser.loanAmount > 0) {
      showToast("You already have an active loan. Please pay it back first.", "error");
      return;
    }
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + amount,
      loanAmount: amount,
      creditScore: currentUser.creditScore - 50 // Taking a loan slightly reduces score
    };
    
    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    
    logTransaction(currentUser.userId, amount, 'loan', 'Loan credited to wallet');
    showToast(`৳${amount} loan has been credited to your wallet!`, "success");
  };

  const handlePPVJoin = (matchId: string) => {
    if (!currentUser) {
      setView('login');
      return;
    }
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.isPPV) return;
    
    if (match.viewers?.includes(currentUser.userId)) {
      showToast("You are already a viewer for this match.", "info");
      return;
    }
    
    const fee = match.viewerFee || 0;
    if (currentUser.balance < fee) {
      showToast("Insufficient balance to watch this match.", "error");
      return;
    }
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - fee
    };
    
    const updatedMatch = {
      ...match,
      viewers: [...(match.viewers || []), currentUser.userId]
    };
    
    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    const updatedMatches = matches.map(m => m.id === matchId ? updatedMatch : m);
    
    setUsers(updatedUsers);
    setMatches(updatedMatches);
    setCurrentUser(updatedUser);
    
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    localStorage.setItem('ff_matches', JSON.stringify(updatedMatches));
    
    logTransaction(currentUser.userId, -fee, 'ppv', `Paid for PPV: ${match.name}`);
    showToast("You now have access to watch this match!", "success");
  };

  const handleSponsorship = (teamId: string, sponsorName: string, amount: number) => {
    if (!currentUser) return;
    
    const updatedSponsorships = sponsorships.map(s => {
      if (s.id === teamId) {
        return {
          ...s,
          sponsorId: currentUser.userId,
          sponsorName: sponsorName,
          amount: amount,
          status: 'sponsored' as const
        };
      }
      return s;
    });
    
    setSponsorships(updatedSponsorships);
    localStorage.setItem('ff_sponsorships', JSON.stringify(updatedSponsorships));
    
    logAuditorAction('SPONSORSHIP', `Team ${teamId} sponsored by ${sponsorName} for ৳${amount}`);
    showToast(`You have successfully sponsored the team!`, "success");
  };

  const logAuditorAction = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditorLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: currentUser.userId,
      adminName: currentUser.gameName,
      action,
      details,
      timestamp: Date.now()
    };
    setAuditorLogs(prev => [newLog, ...prev]);
    // In a real app, sync this to server
  };

  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register Service Worker
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    try {
      const storedUsers = localStorage.getItem('ff_users');
      const storedMatches = localStorage.getItem('ff_matches');
      const storedPayments = localStorage.getItem('ff_payments');
      const storedWithdraws = localStorage.getItem('ff_withdraws');
      const storedResults = localStorage.getItem('ff_results');
      const storedNotifications = localStorage.getItem('ff_notifications');
      const storedSession = localStorage.getItem('ff_session');
      const storedAdminSession = localStorage.getItem('ff_admin_session');
      const storedAppConfig = localStorage.getItem('ff_app_config') || localStorage.getItem('ff_wallet');
      const storedBanners = localStorage.getItem('ff_banners');
      const storedPromoCodes = localStorage.getItem('ff_promo_codes');
      const storedComments = localStorage.getItem('ff_comments');
      const storedMessages = localStorage.getItem('ff_messages');
      const storedReports = localStorage.getItem('ff_reports');
      const storedTemplates = localStorage.getItem('ff_templates');
      const storedLogs = localStorage.getItem('ff_logs');
      const storedShopItems = localStorage.getItem('ff_shop_items');
      const storedTopupPackages = localStorage.getItem('ff_topup_packages');
      const storedTopupRequests = localStorage.getItem('ff_topup_requests');
      const storedPredictions = localStorage.getItem('ff_predictions');

      let migratedUsers: UserData[] = [];
      if (storedUsers) {
        const parsedUsers = safeJSONParse(storedUsers, []);
        if (Array.isArray(parsedUsers)) {
          migratedUsers = parsedUsers.map((u: any) => ({
            ...u,
            xp: u.xp || 0,
            level: u.level || 1,
            totalMatches: u.totalMatches || 0,
            totalWins: u.totalWins || 0,
            totalKills: u.totalKills || 0,
            referralCount: u.referralCount || 0
          }));
          setUsers(migratedUsers);
        }
      }

      if (storedAppConfig) {
        const parsed = safeJSONParse(storedAppConfig, {});
        setAppConfig(prev => ({
          ...DEFAULT_APP_CONFIG,
          ...parsed,
          featureMaintenance: {
            ...DEFAULT_APP_CONFIG.featureMaintenance,
            ...(parsed.featureMaintenance || {})
          },
          featureToggles: {
            ...DEFAULT_APP_CONFIG.featureToggles,
            ...(parsed.featureToggles || {})
          }
        }));
      }
      if (storedWithdraws) setWithdrawRequests(safeJSONParse(storedWithdraws, []));
      if (storedResults) setMatchResults(safeJSONParse(storedResults, []));
      if (storedNotifications) setNotifications(safeJSONParse(storedNotifications, []));
      if (storedPromoCodes) setPromoCodes(safeJSONParse(storedPromoCodes, []));
      if (storedComments) setMatchComments(safeJSONParse(storedComments, []));
      if (storedMessages) setMessages(safeJSONParse(storedMessages, []));
      if (storedReports) setUserReports(safeJSONParse(storedReports, []));
      if (storedTemplates) setMatchTemplates(safeJSONParse(storedTemplates, []));
      if (storedLogs) setTransactionLogs(safeJSONParse(storedLogs, []));
      if (storedShopItems) setShopItems(safeJSONParse(storedShopItems, []));
      if (storedTopupPackages) setTopupPackages(safeJSONParse(storedTopupPackages, []));
      if (storedTopupRequests) setTopupRequests(safeJSONParse(storedTopupRequests, []));
      if (storedPredictions) setPredictions(safeJSONParse(storedPredictions, []));
      
      const storedAuditorLogs = localStorage.getItem('ff_auditor_logs');
      if (storedAuditorLogs) setAuditorLogs(safeJSONParse(storedAuditorLogs, []));

      const storedMysteryBoxes = localStorage.getItem('ff_mystery_boxes');
      if (storedMysteryBoxes) setMysteryBoxes(safeJSONParse(storedMysteryBoxes, []));

      const storedSponsorships = localStorage.getItem('ff_sponsorships');
      if (storedSponsorships) setSponsorships(safeJSONParse(storedSponsorships, []));
      
      const storedTeamFinder = localStorage.getItem('ff_team_finder');
      if (storedTeamFinder) {
        setTeamFinderPosts(safeJSONParse(storedTeamFinder, []));
      } else {
        const defaultPosts: TeamFinderPost[] = [
          {
            id: '1',
            userId: 'admin',
            gameName: 'RK_Admin',
            game: 'Free Fire',
            role: 'Sniper',
            description: 'Looking for a competitive squad for the upcoming Grand Tournament.',
            contactInfo: 'RK_Official',
            timestamp: Date.now() - 3600000,
            slotsNeeded: 2
          },
          {
            id: '2',
            userId: 'user1',
            gameName: 'ProPlayer_07',
            game: 'PUBG',
            role: 'Rusher',
            description: 'Need a team for daily scrims. Must have 3+ K/D.',
            contactInfo: 't.me/proplayer07',
            timestamp: Date.now() - 7200000,
            slotsNeeded: 1
          }
        ];
        setTeamFinderPosts(defaultPosts);
        localStorage.setItem('ff_team_finder', JSON.stringify(defaultPosts));
      }
      
      const storedMissions = localStorage.getItem('ff_missions');
      if (storedMissions) setMissions(safeJSONParse(storedMissions, []));

      if (storedBanners) {
        setBanners(safeJSONParse(storedBanners, []));
      } else {
        const defaultBanners: Banner[] = [
          { id: '1', imageUrl: 'https://picsum.photos/seed/tournament1/1200/400', title: 'Big Tournament Coming Soon!' },
          { id: '2', imageUrl: 'https://picsum.photos/seed/winner1/1200/400', title: 'Congrats to Last Week\'s Winners!' },
          { id: '3', imageUrl: 'https://picsum.photos/seed/offer1/1200/400', title: 'Get 10% Extra on Your First Deposit' }
        ];
        setBanners(defaultBanners);
        localStorage.setItem('ff_banners', JSON.stringify(defaultBanners));
      }

      if (storedMatches) {
        const parsedMatches = safeJSONParse(storedMatches, []);
        if (Array.isArray(parsedMatches)) {
          const migratedMatches = parsedMatches.map((m: any) => ({
            ...m,
            startTime: m.startTime || (Date.now() + 3600000),
            joinedPlayers: (m.joinedPlayers || []).map((p: any) => 
              typeof p === 'string' ? { userId: p, joinedAt: Date.now() } : p
            )
          }));
          setMatches(migratedMatches);
        }
      } else {
        const initialMatches: Match[] = [
          { id: '1', name: 'Elite Clash Squad', map: 'Bermuda', time: '20:00 PM', startTime: Date.now() + 3600000, entryFee: 50, totalPrize: 500, perKill: 10, totalSlots: 48, joinedPlayers: [], imageUrl: 'https://picsum.photos/seed/elite/800/400', game: 'Free Fire', category: 'Squad' },
          { id: '2', name: 'Sunday Battle Royal', map: 'Purgatory', time: '21:30 PM', startTime: Date.now() + 7200000, entryFee: 100, totalPrize: 1000, perKill: 20, totalSlots: 48, joinedPlayers: [], imageUrl: 'https://picsum.photos/seed/battle/800/400', game: 'Free Fire', category: 'Classic' }
        ];
        setMatches(initialMatches);
        localStorage.setItem('ff_matches', JSON.stringify(initialMatches));
      }
      if (storedPayments) setPayments(safeJSONParse(storedPayments, []));
      if (storedSession) {
        const user = safeJSONParse(storedSession, null);
        if (user && user.userId) {
          const latestUser = migratedUsers.find((u: any) => u.userId === user.userId);
          if (latestUser) {
            setCurrentUser(latestUser);
          } else {
            setCurrentUser({
              ...user,
              xp: user.xp || 0,
              level: user.level || 1,
              totalMatches: user.totalMatches || 0,
              totalWins: user.totalWins || 0,
              totalKills: user.totalKills || 0,
              referralCount: user.referralCount || 0
            });
          }
        }
      }
      if (storedAdminSession) {
        setAdminSession(safeJSONParse(storedAdminSession, null));
      }
    } catch (error) {
      console.error("Critical error loading localStorage:", error);
    }
  }, [socket]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server via socket.io');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket.io reconnection attempt #${attempt}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`Socket.io reconnected after ${attempt} attempts`);
    });

    // Socket.io listeners
    socket.on('init_data', (data) => {
      isRemoteUpdate.current = true;
      if (data.squads) setSquads(data.squads);
      if (data.availableMaps) setAvailableMaps(data.availableMaps);
      if (data.users) setUsers(data.users);
      if (data.matches) setMatches(data.matches);
      if (data.appConfig) {
        const updatedConfig = {
          ...DEFAULT_APP_CONFIG,
          ...data.appConfig,
          featureMaintenance: {
            ...DEFAULT_APP_CONFIG.featureMaintenance,
            ...(data.appConfig.featureMaintenance || {})
          },
          featureToggles: {
            ...DEFAULT_APP_CONFIG.featureToggles,
            ...(data.appConfig.featureToggles || {})
          }
        };
        setAppConfig(updatedConfig);
        localStorage.setItem('ff_app_config', JSON.stringify(updatedConfig));
      }
      if (data.missions) setMissions(data.missions);
      if (data.topupPackages) setTopupPackages(data.topupPackages);
      if (data.topupCategories) setTopupCategories(data.topupCategories);
      if (data.topupRequests) setTopupRequests(data.topupRequests);
      if (data.withdrawRequests) setWithdrawRequests(data.withdrawRequests);
      if (data.notifications) setNotifications(data.notifications);
      if (data.messages) setMessages(data.messages);
      if (data.banners) setBanners(data.banners);
      if (data.matchResults) setMatchResults(data.matchResults);
      if (data.userReports) setUserReports(data.userReports);
      if (data.predictions) setPredictions(data.predictions);
      if (data.auditorLogs) setAuditorLogs(data.auditorLogs);
      if (data.mysteryBoxes) setMysteryBoxes(data.mysteryBoxes);
      if (data.sponsorships) setSponsorships(data.sponsorships);
      if (data.mapVotes) setMapVotes(data.mapVotes);
      setIsLoading(false);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    });

    // Fallback to stop loading if socket takes too long
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    socket.on('data_updated', (data) => {
      isRemoteUpdate.current = true;
      if (data.squads) setSquads(data.squads);
      if (data.availableMaps) setAvailableMaps(data.availableMaps);
      if (data.users) setUsers(data.users);
      if (data.matches) setMatches(data.matches);
      if (data.appConfig) {
        const updatedConfig = {
          ...DEFAULT_APP_CONFIG,
          ...data.appConfig,
          featureMaintenance: {
            ...DEFAULT_APP_CONFIG.featureMaintenance,
            ...(data.appConfig.featureMaintenance || {})
          },
          featureToggles: {
            ...DEFAULT_APP_CONFIG.featureToggles,
            ...(data.appConfig.featureToggles || {})
          }
        };
        setAppConfig(updatedConfig);
        localStorage.setItem('ff_app_config', JSON.stringify(updatedConfig));
      }
      if (data.missions) setMissions(data.missions);
      if (data.topupPackages) setTopupPackages(data.topupPackages);
      if (data.topupCategories) setTopupCategories(data.topupCategories);
      if (data.topupRequests) setTopupRequests(data.topupRequests);
      if (data.withdrawRequests) setWithdrawRequests(data.withdrawRequests);
      if (data.notifications) setNotifications(data.notifications);
      if (data.messages) setMessages(data.messages);
      if (data.banners) setBanners(data.banners);
      if (data.matchResults) setMatchResults(data.matchResults);
      if (data.userReports) setUserReports(data.userReports);
      if (data.predictions) setPredictions(data.predictions);
      if (data.auditorLogs) setAuditorLogs(data.auditorLogs);
      if (data.mysteryBoxes) setMysteryBoxes(data.mysteryBoxes);
      if (data.sponsorships) setSponsorships(data.sponsorships);
      if (data.mapVotes) setMapVotes(data.mapVotes);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    });

    return () => {
      clearTimeout(loadingTimeout);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('init_data');
      socket.off('data_updated');
    };
  }, [socket]);

  useEffect(() => {
    if (isLoading) return;

    // Batch localStorage updates
    localStorage.setItem('ff_squads', JSON.stringify(squads));
    localStorage.setItem('ff_available_maps', JSON.stringify(availableMaps));
    localStorage.setItem('ff_map_votes', JSON.stringify(mapVotes));
    localStorage.setItem('ff_promo_codes', JSON.stringify(promoCodes));
    localStorage.setItem('ff_comments', JSON.stringify(matchComments));
    localStorage.setItem('ff_banners', JSON.stringify(banners));
    localStorage.setItem('ff_nft_badges', JSON.stringify(nftBadges));
    localStorage.setItem('ff_predictions', JSON.stringify(predictions));
    localStorage.setItem('ff_auditor_logs', JSON.stringify(auditorLogs));
    localStorage.setItem('ff_mystery_boxes', JSON.stringify(mysteryBoxes));
    localStorage.setItem('ff_sponsorships', JSON.stringify(sponsorships));
    localStorage.setItem('ff_messages', JSON.stringify(messages));
    localStorage.setItem('ff_users', JSON.stringify(users));
    localStorage.setItem('ff_matches', JSON.stringify(matches));
    localStorage.setItem('ff_payments', JSON.stringify(payments));
    localStorage.setItem('ff_withdraws', JSON.stringify(withdrawRequests));
    localStorage.setItem('ff_team_finder', JSON.stringify(teamFinderPosts));
    localStorage.setItem('ff_results', JSON.stringify(matchResults));
    localStorage.setItem('ff_notifications', JSON.stringify(notifications));
    localStorage.setItem('ff_app_config', JSON.stringify(appConfig));
    localStorage.setItem('ff_shop_items', JSON.stringify(shopItems));
    localStorage.setItem('ff_topup_packages', JSON.stringify(topupPackages));
    localStorage.setItem('ff_topup_requests', JSON.stringify(topupRequests));
    localStorage.setItem('ff_reports', JSON.stringify(userReports));
    localStorage.setItem('ff_templates', JSON.stringify(matchTemplates));
    localStorage.setItem('ff_logs', JSON.stringify(transactionLogs));
    localStorage.setItem('ff_missions', JSON.stringify(missions));

    syncData({
      squads, availableMaps, mapVotes, promoCodes, matchComments, banners,
      nftBadges, predictions, auditorLogs, mysteryBoxes, sponsorships,
      messages, users, matches, payments, withdrawRequests, teamFinderPosts,
      matchResults, notifications, appConfig, shopItems, topupPackages,
      topupRequests, userReports, matchTemplates, transactionLogs, missions
    });

  }, [
    isLoading, squads, availableMaps, mapVotes, promoCodes, matchComments,
    banners, nftBadges, predictions, auditorLogs, mysteryBoxes, sponsorships,
    messages, users, matches, payments, withdrawRequests, teamFinderPosts,
    matchResults, notifications, appConfig, shopItems, topupPackages,
    topupRequests, userReports, matchTemplates, transactionLogs, missions,
    syncData
  ]);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  useEffect(() => {
    if (currentUser) {
      const user = users.find(u => u.userId === currentUser.userId);
      if (user?.isBanned) {
        setCurrentUser(user);
        localStorage.setItem('ff_session', JSON.stringify(user));
      }
    }
  }, [users]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const unlocked = currentUser.achievements || [];
      const newUnlocked = [...unlocked];

      // First Blood
      const matchesJoined = matches.filter(m => m.joinedPlayers.some(p => p.userId === currentUser.userId)).length;
      if (matchesJoined >= 1 && !newUnlocked.includes('first_match')) {
        newUnlocked.push('first_match');
      }

      // High Roller
      if (currentUser.balance >= 1000 && !newUnlocked.includes('high_roller')) {
        newUnlocked.push('high_roller');
      }

      // Veteran
      if (matchesJoined >= 10 && !newUnlocked.includes('veteran')) {
        newUnlocked.push('veteran');
      }

      // Richie Rich
      const totalAdded = payments.filter(p => p.userId === currentUser.userId && p.status === 'approved').reduce((acc, p) => acc + p.amount, 0);
      if (totalAdded >= 5000 && !newUnlocked.includes('rich')) {
        newUnlocked.push('rich');
      }

      if (newUnlocked.length > unlocked.length) {
        const updatedUser = { ...currentUser, achievements: newUnlocked };
        setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
        setCurrentUser(updatedUser);
        showToast('🏆 New Achievement Unlocked!', 'success');
      }
    }
  }, [matches, payments, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('ff_session', JSON.stringify(currentUser));
    else localStorage.removeItem('ff_session');
  }, [currentUser]);

  useEffect(() => {
    if (window.location.pathname === '/adminriad') {
      const localAdminSessionId = localStorage.getItem('ff_admin_session_id');
      const isMultiSession = localAdminSessionId?.startsWith('multi_');
      
      if (appConfig.isAdminActive && !isMultiSession && localAdminSessionId !== appConfig.activeAdminSessionId) {
        showToast('Admin is already logged in from another device.', 'error');
        setView('home');
        window.history.replaceState({}, '', '/');
        return;
      }

      if (!adminSession) {
        setView('adminLogin');
      } else {
        setView('admin');
      }
      window.history.replaceState({}, '', '/');
    }
  }, [adminSession, appConfig.isAdminActive, appConfig.activeAdminSessionId]);

  useEffect(() => {
    if (!currentUser) return;
    
    const now = new Date();
    const today = now.toDateString();
    const lastReset = localStorage.getItem(`ff_mission_reset_${currentUser.userId}`);
    
    if (lastReset !== today) {
      const updatedUser = {
        ...currentUser,
        missionProgress: {},
        claimedMissions: []
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.userId === updatedUser.userId ? updatedUser : u));
      localStorage.setItem('ff_session', JSON.stringify(updatedUser));
      localStorage.setItem(`ff_mission_reset_${currentUser.userId}`, today);
    }
  }, [currentUser?.userId]);

  // --- Auth Handlers ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rk Tournament',
          text: 'Join the ultimate Free Fire tournament platform!',
          url: window.location.origin,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const checkLevelUp = (oldLevel: number, newLevel: number, userId: string) => {
    if (newLevel > oldLevel) {
      const reward = (newLevel - oldLevel) * 10; // ৳10 per level
      
      const updatedUsers = users.map(u => {
        if (u.userId === userId) {
          return { ...u, balance: u.balance + reward };
        }
        return u;
      });
      setUsers(updatedUsers);
      
      if (currentUser?.userId === userId) {
        const updatedUser = { ...currentUser, balance: currentUser.balance + reward };
        setCurrentUser(updatedUser);
        localStorage.setItem('ff_session', JSON.stringify(updatedUser));
      }
      
      const newNotif: Notification = {
        id: Date.now().toString() + Math.random(),
        userId: userId,
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel} and earned ৳${reward} bonus!`,
        type: 'success',
        timestamp: Date.now(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleSpin = (prize: { type: 'balance' | 'xp', amount: number }) => {
    if (!currentUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastSpinDate === today) return;

    const oldLevel = currentUser.level;
    const newXp = prize.type === 'xp' ? currentUser.xp + prize.amount : currentUser.xp;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedUser = {
      ...currentUser,
      balance: prize.type === 'balance' ? currentUser.balance + prize.amount : currentUser.balance,
      xp: newXp,
      level: newLevel,
      lastSpinDate: today
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.userId === updatedUser.userId ? updatedUser : u));
    updateUser(updatedUser);
    updateMissionProgress('spin', 1);
    
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      title: 'Daily Spin Reward!',
      message: `You won ${prize.amount} ${prize.type === 'balance' ? '৳' : 'XP'}!`,
      type: 'success',
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (newLevel > oldLevel) {
      checkLevelUp(oldLevel, newLevel, currentUser.userId);
    }
  };

  const [moderatorActivities, setModeratorActivities] = useState<AuditorLog[]>([]);

  const logModeratorActivity = (action: string, details: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const newLog: AuditorLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: currentUser.userId,
      adminName: currentUser.gameName,
      action,
      details,
      timestamp: Date.now()
    };
    setModeratorActivities(prev => [newLog, ...prev]);
    const storedLogs = localStorage.getItem('ff_auditor_logs');
    const logs = safeJSONParse(storedLogs, []);
    localStorage.setItem('ff_auditor_logs', JSON.stringify([newLog, ...logs]));
  };

  const handleUploadSquadLogo = (logoUrl: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, squadLogo: logoUrl };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    showToast('Squad logo updated successfully!', 'success');
  };

  const [squadJoinCode, setSquadJoinCode] = useState('');
  const [showSquadCreate, setShowSquadCreate] = useState(false);
  const [newSquadData, setNewSquadData] = useState({ name: '', logo: '', description: '' });

  const createSquad = (name: string, logo: string, description: string) => {
    if (!currentUser) return;
    if (currentUser.squadId) {
      showToast('You are already in a squad!', 'error');
      return;
    }
    const newSquad: Squad = {
      id: 'squad_' + Math.random().toString(36).substr(2, 9),
      name,
      logo: logo || 'https://picsum.photos/seed/squad/200/200',
      leaderId: currentUser.userId,
      members: [currentUser.userId],
      description,
      createdAt: Date.now(),
      joinCode: Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    
    setSquads([...squads, newSquad]);
    const updatedUser = { ...currentUser, squadId: newSquad.id, squadName: name, squadLogo: newSquad.logo };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    showToast(`Squad "${name}" created!`, 'success');
    setShowSquadCreate(false);
  };

  const joinSquad = (joinCode: string) => {
    if (!currentUser) return;
    if (currentUser.squadId) {
      showToast('You are already in a squad!', 'error');
      return;
    }
    const squad = squads.find(s => s.joinCode === joinCode.toUpperCase());
    if (!squad) {
      showToast('Invalid join code!', 'error');
      return;
    }
    
    if (squad.members.length >= 4) {
      showToast('Squad is full!', 'error');
      return;
    }

    const updatedSquad = { ...squad, members: [...squad.members, currentUser.userId] };
    setSquads(squads.map(s => s.id === squad.id ? updatedSquad : s));
    
    const updatedUser = { ...currentUser, squadId: squad.id, squadName: squad.name, squadLogo: squad.logo };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    showToast(`Joined squad "${squad.name}"!`, 'success');
  };

  const leaveSquad = () => {
    if (!currentUser || !currentUser.squadId) return;
    const squad = squads.find(s => s.id === currentUser.squadId);
    if (!squad) return;
    
    if (squad.leaderId === currentUser.userId) {
      showToast('Leaders cannot leave. Disband the squad instead.', 'info');
      return;
    }
    
    const updatedSquad = { ...squad, members: squad.members.filter(m => m !== currentUser.userId) };
    setSquads(squads.map(s => s.id === squad.id ? updatedSquad : s));
    
    const updatedUser = { ...currentUser, squadId: undefined, squadName: undefined, squadLogo: undefined };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    showToast('Left the squad.', 'info');
  };

  const disbandSquad = () => {
    if (!currentUser || !currentUser.squadId) return;
    const squad = squads.find(s => s.id === currentUser.squadId);
    if (!squad || squad.leaderId !== currentUser.userId) return;
    
    setSquads(squads.filter(s => s.id !== squad.id));
    
    const updatedUsers = users.map(u => {
      if (u.squadId === squad.id) {
        return { ...u, squadId: undefined, squadName: undefined, squadLogo: undefined };
      }
      return u;
    });
    setUsers(updatedUsers);
    
    if (currentUser.squadId === squad.id) {
      setCurrentUser({ ...currentUser, squadId: undefined, squadName: undefined, squadLogo: undefined });
    }
    showToast('Squad disbanded.', 'info');
  };

  const handleUpdateSquadName = (name: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, squadName: name };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    showToast('Squad name updated successfully!', 'success');
  };

  const handleUploadStory = (contentUrl: string, type: 'image' | 'video') => {
    if (!currentUser) return;
    const newStory: UserStory = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      userName: currentUser.gameName,
      contentUrl,
      type,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    
    const updatedUsers = users.map(u => {
      if (u.userId === currentUser.userId) {
        return { ...u, stories: [...(u.stories || []), newStory] };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    setCurrentUser(updatedUsers.find(u => u.userId === currentUser.userId) || null);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    showToast('Story uploaded! It will be visible for 24 hours.', 'success');
  };

  const handleVoteMap = (matchId: string, mapName: string) => {
    if (!currentUser) return;
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    if (match.votedUserIds?.includes(currentUser.userId)) {
      showToast('You have already voted for this match.', 'info');
      return;
    }
    
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        const votes = m.mapVotes || { Bermuda: 0, Purgatory: 0 };
        return {
          ...m,
          mapVotes: { ...votes, [mapName]: (votes[mapName] || 0) + 1 },
          votedUserIds: [...(m.votedUserIds || []), currentUser.userId]
        };
      }
      return m;
    });
    
    setMatches(updatedMatches);
    localStorage.setItem('ff_matches', JSON.stringify(updatedMatches));
    showToast(`Voted for ${mapName}!`, 'success');
  };

  const handleMassRefund = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    confirmAction('Mass Refund', `Are you sure you want to refund all ${match.joinedPlayers.length} players for match "${match.name}"?`, () => {
      const updatedUsers = users.map(u => {
        const joined = match.joinedPlayers.find(p => p.userId === u.userId);
        if (joined) {
          return { ...u, balance: u.balance + match.entryFee };
        }
        return u;
      });
      
      const updatedMatches = matches.map(m => m.id === matchId ? { ...m, isCompleted: true, joinedPlayers: [] } : m);
      
      setUsers(updatedUsers);
      setMatches(updatedMatches);
      localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
      localStorage.setItem('ff_matches', JSON.stringify(updatedMatches));
      
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'all',
        title: 'Match Cancelled & Refunded',
        message: `Match "${match.name}" has been cancelled. Entry fees have been refunded to all participants.`,
        type: 'info',
        timestamp: Date.now(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      showToast(`Successfully refunded ${match.joinedPlayers.length} players!`, 'success');
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUser) return;
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.userId,
      senderName: currentUser.gameName,
      receiverId: 'admin',
      text,
      timestamp: Date.now(),
      isRead: false
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    syncData({ messages: updatedMessages });

    // AI Support Logic
    if (view === 'support') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({ 
          model: "gemini-3-flash-preview",
          contents: text,
          config: {
            systemInstruction: `You are the AI Support Assistant for RK Tournament, an e-sports platform. 
            Respond in the user's language: ${currentUser.language || 'English'}.
            Help users with payment issues, technical problems, or general questions. 
            Keep responses professional, helpful, and concise. 
            User Info: Name: ${currentUser.gameName}, Balance: ${currentUser.balance}, Level: ${currentUser.level}.`
          }
        });
        
        const aiText = response.text;

        const aiMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: 'ai_support',
          senderName: 'AI Support',
          receiverId: currentUser.userId,
          text: aiText || "I'm sorry, I'm having trouble processing your request. Please try again later.",
          timestamp: Date.now(),
          isRead: false
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        syncData({ messages: finalMessages });
      } catch (error) {
        console.error("AI Support Error:", error);
      }
    }
  };

  const updateMissionProgress = (type: Mission['type'], amount: number = 1, userId?: string) => {
    const targetUserId = userId || currentUser?.userId;
    if (!targetUserId) return;
    
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => {
        if (u.userId === targetUserId) {
          const relevantMissions = missions.filter(m => m.type === type);
          if (relevantMissions.length === 0) return u;
          
          const updatedProgress = { ...(u.missionProgress || {}) };
          relevantMissions.forEach(m => {
            updatedProgress[m.id] = (updatedProgress[m.id] || 0) + amount;
          });
          
          const updatedUser = { ...u, missionProgress: updatedProgress };
          if (u.userId === currentUser?.userId) {
            setCurrentUser(updatedUser);
            localStorage.setItem('ff_session', JSON.stringify(updatedUser));
          }
          updateUser(updatedUser);
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const claimMissionReward = (missionId: string) => {
    if (!currentUser) return;
    
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    
    const progress = (currentUser.missionProgress || {})[missionId] || 0;
    if (progress < mission.requirement) return;
    
    if (currentUser.claimedMissions?.includes(missionId)) return;
    
    const oldLevel = currentUser.level;
    const newXp = currentUser.xp + mission.xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + mission.reward,
      xp: newXp,
      level: newLevel,
      claimedMissions: [...(currentUser.claimedMissions || []), missionId]
    };
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.userId === updatedUser.userId ? updatedUser : u));
    updateUser(updatedUser);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    
    const newNotif: Notification = {
      id: Date.now().toString() + Math.random(),
      userId: currentUser.userId,
      title: 'Mission Reward!',
      message: `You claimed ৳${mission.reward} and ${mission.xpReward} XP for completing "${mission.title}"!`,
      type: 'success',
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    if (newLevel > oldLevel) {
      checkLevelUp(oldLevel, newLevel, currentUser.userId);
    }
    
    showToast(`Reward claimed: ৳${mission.reward} and ${mission.xpReward} XP!`, 'success');
  };

  const equipItem = (itemId: string) => {
    if (!currentUser) return;
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    const updatedUser = { ...currentUser };
    if (item.type === 'frame') {
      updatedUser.equippedFrame = item.id;
    } else if (item.type === 'name_color') {
      updatedUser.equippedNameColor = item.color;
    } else if (item.type === 'badge') {
      // For badges, we'll just show all owned badges on the profile
      // but maybe the user wants to "equip" a primary one?
      // For now, let's just show all owned badges.
    }

    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    showToast(`${item.name} equipped!`, 'success');
  };

  const buyItem = (itemId: string) => {
    if (!currentUser) {
      setView('login');
      return;
    }
    
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (currentUser.inventory?.includes(item.id)) {
      showToast('You already own this item!', 'info');
      return;
    }

    if (currentUser.balance < item.price) {
      showToast('Insufficient balance! Please deposit funds.', 'error');
      setView('wallet');
      return;
    }

    const updatedUser: UserData = {
      ...currentUser,
      balance: currentUser.balance - item.price,
      inventory: [...(currentUser.inventory || []), item.id],
      isVip: (item.type === 'badge' && item.id === 'badge_vip') ? true : currentUser.isVip,
      entryCards: item.type === 'entry_card' ? (currentUser.entryCards || 0) + 1 : currentUser.entryCards,
      equippedNameColor: item.type === 'name_color' ? item.color : currentUser.equippedNameColor,
    };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    
    const newLog: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      amount: item.price,
      type: 'purchase',
      method: 'Shop',
      status: 'approved',
      details: `Purchased ${item.name}`,
      timestamp: Date.now()
    };
    setTransactionLogs([newLog, ...transactionLogs]);
    localStorage.setItem('ff_logs', JSON.stringify([newLog, ...transactionLogs]));

    showToast(`Successfully purchased ${item.name}!`, 'success');
  };

  const equipFrame = (frameId: string | undefined) => {
    if (!currentUser) return;
    const updatedUser: UserData = {
      ...currentUser,
      equippedFrame: frameId
    };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
  };

  const equipNameColor = (color: string | undefined) => {
    if (!currentUser) return;
    const updatedUser: UserData = {
      ...currentUser,
      equippedNameColor: color
    };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
  };

  const handleAdminReply = (userId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'admin',
      senderName: 'Admin',
      receiverId: userId,
      text,
      timestamp: Date.now(),
      isRead: false
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    
    // Notify user
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title: 'Support Reply',
      message: 'Admin has replied to your support message.',
      type: 'info',
      timestamp: Date.now(),
      isRead: false
    };
    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const handleAIChat = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user' as const, text };
    setAIChatMessages(prev => [...prev, userMessage]);
    setIsAITyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: `You are the official AI Support Assistant for "RK Tournament" (formerly Winner 75). 
          Your goal is to help users with:
          1. Deposit: Users can deposit via bKash (${appConfig.bkash}) or Nagad (${appConfig.nagad}). They need to send money first and then submit the TrxID in the Wallet section.
          2. Withdrawal: Minimum withdrawal is ৳100 from Winnings balance.
          3. Game Rules: ${appConfig.matchRules}
          4. General: Be polite, professional, and concise. Use emojis. If you don't know something, ask them to contact human support.
          Respond in a friendly tone. Use Bengali if the user speaks Bengali.`
        }
      });

      const aiText = response.text || "Sorry, I'm having trouble understanding. Please try again. 🙏";
      setAIChatMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setAIChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later or contact human support. 🙏" }]);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const checkDailyQuests = useCallback((user: UserData) => {
    if (!appConfig.featureToggles?.dailyQuests) return;
    const today = new Date().toISOString().split('T')[0];
    if (user.lastQuestCheck === today) return;

    // Logic for daily quests
    const newMissions = [...missions];
    // Randomly update missions or progress
    const updatedUser = { ...user, lastQuestCheck: today };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.userId === user.userId ? updatedUser : u));
  }, [appConfig.featureToggles?.dailyQuests, missions]);

  const handleBirthdaySurprise = useCallback((user: UserData) => {
    if (!appConfig.featureToggles?.birthdaySurprise || !user.birthday) return;
    const today = new Date();
    const bday = new Date(user.birthday);
    if (today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate()) {
      const lastSurprise = user.lastBirthdaySurprise || 0;
      if (new Date(lastSurprise).getFullYear() < today.getFullYear()) {
        const bonus = 50; // ৳50 birthday bonus
        const updatedUser = { 
          ...user, 
          balance: user.balance + bonus, 
          lastBirthdaySurprise: Date.now() 
        };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.userId === user.userId ? updatedUser : u));
        setNotifications(prev => [{
          id: Date.now().toString(),
          userId: user.userId,
          title: '🎂 Happy Birthday!',
          message: `Happy Birthday, ${user.gameName}! We've added ৳${bonus} to your balance as a gift. Enjoy!`,
          timestamp: Date.now(),
          isRead: false
        }, ...prev]);
      }
    }
  }, [appConfig.featureToggles?.birthdaySurprise]);

  useEffect(() => {
    if (currentUser) {
      checkDailyQuests(currentUser);
      handleBirthdaySurprise(currentUser);
    }
  }, [currentUser, checkDailyQuests, handleBirthdaySurprise]);

  const handleLogin = async (userId: string, pass: string) => {
    const user = users.find(u => u.userId === userId && u.password === pass);
    if (user) {
      if (user.isBanned || user.isPermanentlyBanned) {
        showToast('Your account has been banned. Please contact support.', 'error');
        return;
      }

      // Capture IP and Device
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        const device = navigator.userAgent;

        const blacklist = JSON.parse(localStorage.getItem('rk_blacklist') || '[]');
        if (blacklist.some((b: any) => b.ip === ip || b.deviceId === 'mock-device-id')) {
          showToast('Your IP or Device has been permanently banned. Access denied.', 'error');
          return;
        }

        if (appConfig.ipBanList?.includes(ip)) {
          showToast('Your IP has been banned. Access denied.', 'error');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        let newStreak = user.loginStreak || 0;
        let balanceBonus = 0;
        
        if (user.lastLoginDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (user.lastLoginDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          balanceBonus = 1; // 1 coin reward
          
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.userId,
            title: 'Daily Login Reward',
            message: `You earned ৳1 for logging in today! Current streak: ${newStreak} days.`,
            type: 'success',
            timestamp: Date.now(),
            isRead: false
          };
          setNotifications(prev => [newNotif, ...prev]);
        }

        const updatedUser = {
          ...user,
          lastLoginIp: ip,
          lastLoginDevice: device,
          loginStreak: newStreak,
          lastLoginDate: today,
          balance: user.balance + balanceBonus
        };
        setUsers(users.map(u => u.userId === userId ? updatedUser : u));
        setCurrentUser(updatedUser);
        setView('home');
      } catch (e) {
        console.error('IP fetch error:', e);
        setCurrentUser(user);
        setView('home');
      }
    } else {
      showToast('Invalid credentials', 'error');
    }
  };

  const handleInvest = (playerId: string, amount: number) => {
    if (!currentUser) return;
    if (currentUser.balance < amount) {
      showToast('Insufficient balance!', 'error');
      return;
    }

    const updatedUser = { 
      ...currentUser, 
      balance: currentUser.balance - amount,
      investments: [
        ...(currentUser.investments || []),
        { playerId, amount, timestamp: Date.now() }
      ]
    };
    
    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    socket.emit('update_data', { users: updatedUsers });
    showToast('Investment successful!', 'success');
  };

  const handleWithdrawRequest = async (amount: number, number: string, method: 'bKash' | 'Nagad', trxId?: string) => {
    if (!currentUser) return;
    
    if (amount >= 5000 && !currentUser.isFaceVerified) {
      confirmAction(
        'Face Verification Required',
        'Face Verification is required for large withdrawals. Start verification?',
        () => {
          showToast('Face verification successful!', 'success');
          const updatedUser = { ...currentUser, isFaceVerified: true };
          setCurrentUser(updatedUser);
          setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
          // Proceed with withdrawal after verification
          processWithdrawal(amount, number, method, trxId);
        }
      );
      return;
    }
    
    processWithdrawal(amount, number, method, trxId);
  };

  const processWithdrawal = (amount: number, number: string, method: 'bKash' | 'Nagad', trxId?: string) => {
    if (!currentUser) return;
    if (amount < 100) {
      showToast('Minimum withdraw amount is ৳100', 'error');
      return;
    }
    if (currentUser.winnings < amount) {
      showToast('Insufficient winnings balance!', 'error');
      return;
    }

    const newRequest: WithdrawRequest = {
      id: Date.now().toString(),
      userId: currentUser.userId,
      amount,
      number,
      method,
      status: 'pending',
      timestamp: Date.now(),
      trxId
    };

    setWithdrawRequests([...withdrawRequests, newRequest]);
    
    const updatedUser = { ...currentUser, winnings: currentUser.winnings - amount };
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    setCurrentUser(updatedUser);
    showToast('Withdraw request submitted successfully!', 'success');
  };

  const updateProfile = (updates: Partial<UserData>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    syncData({ users: updatedUsers });
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
  };

  const handleAvatarSelect = (url: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatarUrl: url };
    setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
    setCurrentUser(updatedUser);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
  };

  const handleSignup = async (userId: string, gameName: string, pass: string, avatarUrl?: string, refCode?: string, district?: string) => {
    if (users.some(u => u.userId === userId)) {
      showToast('User ID already exists', 'error');
      return;
    }

    // Capture IP and Device
    let ip = 'Unknown';
    const device = navigator.userAgent;
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      ip = ipData.ip;

      if (appConfig.ipBanList?.includes(ip)) {
        showToast('Your IP has been banned. Registration denied.', 'error');
        return;
      }
    } catch (e) {
      console.error('IP fetch error:', e);
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newUser: UserData = { 
      userId, 
      gameName, 
      password: pass, 
      avatarUrl: avatarUrl || '',
      balance: 0, 
      winnings: 0, 
      role: 'user',
      referralCode,
      referredBy: refCode,
      xp: 0,
      level: 1,
      totalMatches: 0,
      totalWins: 0,
      totalKills: 0,
      referralCount: 0,
      creditScore: 100,
      loanAmount: 0,
      registrationIp: ip,
      registrationDevice: device,
      lastLoginIp: ip,
      lastLoginDevice: device,
      loginStreak: 0,
      lastLoginDate: '',
      district: district || 'Dhaka',
      trophies: [],
      bio: '',
      socialLinks: { facebook: '', youtube: '', instagram: '' }
    };

    let updatedUsers = [...users, newUser];
    if (refCode) {
      const referrer = users.find(u => u.referralCode === refCode);
      if (referrer) {
        updatedUsers = updatedUsers.map(u => 
          u.userId === referrer.userId ? { ...u, balance: u.balance + appConfig.referralBonus, referralCount: (u.referralCount || 0) + 1 } : u
        );
        // Add notification for referrer
        const newNotif: Notification = {
          id: Date.now().toString(),
          userId: referrer.userId,
          title: 'Referral Bonus!',
          message: `You earned ৳${appConfig.referralBonus} for referring ${gameName}!`,
          type: 'success',
          timestamp: Date.now(),
          isRead: false
        };
        setNotifications(prev => [...prev, newNotif]);
        updateMissionProgress('refer', 1, referrer.userId);
      }
    }

    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setView('home');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ff_session');
    localStorage.removeItem('ff_user_voted_map');
    setView('home');
  };

  // --- User Actions ---
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const handleSlotClick = (slotNumber: number) => {
    if (!currentUser || !selectedMatch) return;

    // Check if user is on cooldown
    if (currentUser.cooldownUntil && currentUser.cooldownUntil > Date.now()) {
      const minutesLeft = Math.ceil((currentUser.cooldownUntil - Date.now()) / 60000);
      showToast(`You are on cooldown! Try again in ${minutesLeft} minutes.`, 'error');
      return;
    }

    // Check if slot is already joined
    if (selectedMatch.joinedPlayers.some(p => p.slotNumber === slotNumber)) {
      showToast('Slot already occupied!', 'error');
      return;
    }

    // Check if slot is reserved by someone else
    const reservation = (selectedMatch.reservedSlots || []).find(r => r.slotNumber === slotNumber);
    if (reservation && reservation.userId !== currentUser.userId && reservation.expiresAt > Date.now()) {
      showToast('Slot is currently reserved!', 'error');
      return;
    }

    // Reserve the slot
    const updatedMatches = matches.map(m => {
      if (m.id === selectedMatch.id) {
        const otherReservations = (m.reservedSlots || []).filter(r => r.userId !== currentUser.userId && r.expiresAt > Date.now());
        return {
          ...m,
          reservedSlots: [...otherReservations, { slotNumber, userId: currentUser.userId, expiresAt: Date.now() + 120000 }] // 2 mins
        };
      }
      return m;
    });
    setMatches(updatedMatches);
    socket.emit('update_data', { matches: updatedMatches });
    setSelectedSlot(slotNumber);
    showToast('Slot reserved for 2 minutes!', 'info');
  };

  const handleCloseMatchModal = () => {
    if (currentUser && selectedMatch && selectedSlot) {
      // User selected a slot but is now closing the modal without joining
      const cooldownTime = Date.now() + 3600000; // 1 hour
      const updatedUsers = users.map(u => u.userId === currentUser.userId ? { ...u, cooldownUntil: cooldownTime } : u);
      setUsers(updatedUsers);
      socket.emit('update_data', { users: updatedUsers });
      
      // Remove reservation
      const updatedMatches = matches.map(m => {
        if (m.id === selectedMatch.id) {
          return {
            ...m,
            reservedSlots: (m.reservedSlots || []).filter(r => r.userId !== currentUser.userId)
          };
        }
        return m;
      });
      setMatches(updatedMatches);
      socket.emit('update_data', { matches: updatedMatches });
      
      showToast('Anti-Spam: 1 hour cooldown applied for leaving reserved slot.', 'error');
    }
    setSelectedMatch(null);
    setSelectedSlot(null);
  };
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
    // Auto-Dark Mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', listener);

    // Suspicious Activity Check
    const checkSuspicious = () => {
      const suspicious = users.find(u => {
        const winRate = u.totalMatches > 5 ? (u.totalWins / u.totalMatches) : 0;
        return winRate > 0.85; // Over 85% win rate is suspicious
      });
      if (suspicious) {
        setIsSuspiciousActivity(true);
        setSuspiciousUser(suspicious);
      }
    };
    checkSuspicious();

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const handleGoogleLogin = () => {
    // Simulate Google Login
    const mockGoogleUser: UserData = {
      userId: 'google_' + Math.random().toString(36).substr(2, 9),
      gameName: 'Google Player',
      balance: 0,
      winnings: 0,
      role: 'user',
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      xp: 0,
      level: 1,
      totalMatches: 0,
      totalWins: 0,
      totalKills: 0,
      referralCount: 0,
      creditScore: 100,
      loanAmount: 0,
      loginStreak: 0,
      lastLoginDate: ''
    };
    setCurrentUser(mockGoogleUser);
    setView('home');
    
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: mockGoogleUser.userId,
      title: 'Welcome!',
      message: 'Successfully logged in with Google.',
      type: 'success',
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleJoinClick = (match: Match) => {
    if (!currentUser) {
      setView('login');
      return;
    }
    setSelectedMatch(match);
  };

  const handlePrediction = (matchId: string, predictedWinner: string) => {
    if (!currentUser) return;
    
    const newPrediction: Prediction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      matchId,
      predictedWinner,
      points: 10,
      status: 'pending',
      timestamp: Date.now()
    };
    
    const updatedPredictions = [newPrediction, ...predictions];
    setPredictions(updatedPredictions);
    syncData({ predictions: updatedPredictions });
    
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      title: 'Prediction Placed!',
      message: `You predicted ${predictedWinner} will win. Good luck!`,
      type: 'success',
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const confirmJoin = () => {
    if (!currentUser || !selectedMatch || !selectedSlot) return;
    
    if (selectedMatch.joinedPlayers.some(p => p.userId === currentUser.userId)) {
      showToast('Already joined this match', 'info');
      setSelectedMatch(null);
      setSelectedSlot(null);
      return;
    }

    if (selectedMatch.joinedPlayers.some(p => p.slotNumber === selectedSlot)) {
      showToast('Slot already occupied!', 'error');
      return;
    }

    if (currentUser.balance < selectedMatch.entryFee) {
      if (currentUser.creditScore >= 500 && currentUser.loanAmount === 0) {
        confirmAction(
          'Use Gamer Loan?',
          `You have insufficient balance. Would you like to use your Gamer Loyalty Loan to join this match? ৳${selectedMatch.entryFee} will be deducted from your next winnings.`,
          () => {
            // Proceed with loan
            processJoinMatch(true);
          }
        );
        return;
      } else {
        showToast('Insufficient balance. Please add money to your wallet.', 'error');
        setView('wallet');
        setSelectedMatch(null);
        setSelectedSlot(null);
        return;
      }
    }

    processJoinMatch(false);
  };

  const processJoinMatch = (isLoan: boolean) => {
    if (!currentUser || !selectedMatch || !selectedSlot) return;

    // Update match
    if (!currentUser.isShadowBanned) {
      const updatedMatches = matches.map(m => {
        if (m.id === selectedMatch.id) {
          const newJoinedPlayers = [...m.joinedPlayers, { 
            userId: currentUser.userId, 
            joinedAt: Date.now(), 
            slotNumber: selectedSlot,
            squadName: currentUser.squadName,
            squadLogo: currentUser.squadLogo
          }];
          
          // Remove reservation
          const updatedReservedSlots = (m.reservedSlots || []).filter(r => r.userId !== currentUser.userId);

          // Smart Prize Pool Logic
          let updatedPrize = m.totalPrize;
          if (m.prizePoolType === 'dynamic' && m.minPlayersForFullPrize) {
            const currentPlayers = newJoinedPlayers.length;
            const ratio = Math.min(currentPlayers / m.minPlayersForFullPrize, 1);
            updatedPrize = Math.floor(m.totalPrize * ratio);
          }

          return { 
            ...m, 
            joinedPlayers: newJoinedPlayers,
            reservedSlots: updatedReservedSlots,
            currentPrize: updatedPrize
          };
        }
        return m;
      });
      setMatches(updatedMatches);
      socket.emit('update_data', { matches: updatedMatches });
    }

    // Update user balance and XP and stats
    const xpGain = 50;
    const oldLevel = currentUser.level;
    const newXp = (currentUser.xp || 0) + xpGain;
    const newLevel = Math.floor(newXp / 100) + 1;
    const isLegendary = newLevel >= 100;

    const updatedUsers = users.map(u => {
      if (u.userId === currentUser.userId) {
        return { 
          ...u, 
          balance: isLoan ? u.balance : u.balance - selectedMatch.entryFee,
          loanAmount: isLoan ? (u.loanAmount || 0) + selectedMatch.entryFee : u.loanAmount,
          xp: newXp, 
          level: newLevel,
          isLegendary: isLegendary || u.isLegendary,
          totalMatches: (u.totalMatches || 0) + 1,
          monthlyMatchesPlayed: u.isProContracted ? (u.monthlyMatchesPlayed || 0) + 1 : u.monthlyMatchesPlayed
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
    
    // Update current session user
    const updatedSessionUser = { 
      ...currentUser, 
      balance: isLoan ? currentUser.balance : currentUser.balance - selectedMatch.entryFee,
      loanAmount: isLoan ? (currentUser.loanAmount || 0) + selectedMatch.entryFee : currentUser.loanAmount,
      xp: newXp,
      level: newLevel,
      isLegendary: isLegendary || currentUser.isLegendary,
      totalMatches: (currentUser.totalMatches || 0) + 1
    };
    setCurrentUser(updatedSessionUser);
    localStorage.setItem('ff_session', JSON.stringify(updatedSessionUser));

    showToast(isLoan ? `Joined using Gamer Loan at slot ${selectedSlot}!` : `Successfully joined the match at slot ${selectedSlot}!`, 'success');
    setSelectedMatch(null);
    setSelectedSlot(null);

    if (newLevel > oldLevel) {
      checkLevelUp(oldLevel, newLevel, currentUser.userId);
    }

    updateMissionProgress('matches', 1);
  };

  const [isCaptchaActive, setIsCaptchaActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(Date.now());

  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;
      
      if (timeDiff < 100) { // Clicks faster than 100ms
        setClickCount(prev => prev + 1);
      } else {
        setClickCount(0);
      }
      
      setLastClickTime(now);

      if (clickCount > 10) { // More than 10 fast clicks
        setIsCaptchaActive(true);
        setClickCount(0);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [clickCount, lastClickTime]);

  const [nftToSell, setNftToSell] = useState<NFTBadge | null>(null);
  const [salePrice, setSalePrice] = useState('');

  const SellNftModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
      >
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
          <Award size={40} className="text-orange-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic text-white">Sell NFT</h2>
          <p className="text-gray-400 text-sm font-medium">List "{nftToSell?.name}" on the marketplace.</p>
        </div>
        
        <div className="space-y-2 text-left">
          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Sale Price (৳)</label>
          <input 
            type="number" 
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Enter Price"
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-xl font-black focus:border-orange-500 outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={() => setNftToSell(null)}
            className="flex-1 py-4 bg-white/5 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (salePrice && !isNaN(Number(salePrice))) {
                listNftForSale(nftToSell!.id, Number(salePrice));
                setNftToSell(null);
                setSalePrice('');
              }
            }}
            className="flex-1 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
          >
            List Now
          </button>
        </div>
      </motion.div>
    </div>
  );
  const CaptchaChallenge = () => {
    const [answer, setAnswer] = useState('');
    const [num1] = useState(Math.floor(Math.random() * 10) + 1);
    const [num2] = useState(Math.floor(Math.random() * 10) + 1);
    const [op] = useState(['+', '-', '*'][Math.floor(Math.random() * 3)]);
    
    const correctAnswer = op === '+' ? num1 + num2 : op === '-' ? num1 - num2 : num1 * num2;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl shadow-red-500/20"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={40} className="text-red-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic text-white">Bot Detection</h2>
            <p className="text-gray-400 text-sm">Unusual activity detected. Please solve this challenge to continue.</p>
          </div>
          
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <p className="text-3xl font-black text-white tracking-widest">{num1} {op} {num2} = ?</p>
          </div>

          <input 
            type="number" 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your Answer"
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-center text-xl font-black focus:border-red-500 outline-none"
          />

          <button 
            onClick={() => {
              if (parseInt(answer) === correctAnswer) {
                setIsCaptchaActive(false);
                showToast('Verification successful!', 'success');
              } else {
                showToast('Incorrect answer. Try again.', 'error');
              }
            }}
            className="w-full py-4 bg-red-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
          >
            Verify Me
          </button>
        </motion.div>
      </div>
    );
  };

  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [walletTab, setWalletTab] = useState<'add' | 'withdraw'>('add');

  const submitPayment = (amount: number, sender: string, trxId: string, method: 'bKash' | 'Nagad') => {
    if (!currentUser) return;
    
    // Fake Payment Detection
    const isDuplicate = payments.some(p => p.trxId === trxId);
    const isValidFormat = /^[A-Z0-9]{8,12}$/.test(trxId);
    
    if (isDuplicate || !isValidFormat) {
      const reason = isDuplicate ? 'Duplicate Transaction ID' : 'Invalid TrxID Format';
      const newRequest: PaymentRequest = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.userId,
        amount,
        senderNumber: sender,
        trxId,
        method,
        status: 'rejected',
        timestamp: Date.now(),
        isFlagged: true,
        flagReason: reason
      };
      setPayments([newRequest, ...payments]);
      
      // Mark user as suspicious
      const updatedUsers = users.map(u => u.userId === currentUser.userId ? { ...u, isSuspicious: true } : u);
      setUsers(updatedUsers);
      setCurrentUser({ ...currentUser, isSuspicious: true });
      
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.userId,
        title: 'Payment Rejected',
        message: `Your payment request was automatically rejected: ${reason}. Your account has been marked as suspicious.`,
        type: 'warning',
        timestamp: Date.now(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      syncData({ payments: [newRequest, ...payments], users: updatedUsers });
      
      // Automated Refund
      setTimeout(() => {
        showToast('Automated Refund: Your payment failed and has been automatically processed for refund.', 'info');
      }, 5000);
      return;
    }

    const newRequest: PaymentRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      amount,
      senderNumber: sender,
      trxId: trxId,
      method,
      status: 'pending',
      timestamp: Date.now()
    };
    setPayments([newRequest, ...payments]);
    syncData({ payments: [newRequest, ...payments] });
    showToast('Payment request submitted. Waiting for admin approval.', 'success');
    setView('profile');
  };

  const handleTopupRequest = (pkg: TopupPackage, gameId: string, saveId: boolean, promoCode?: string) => {
    if (!currentUser) return;
    
    let finalPrice = pkg.price;
    let bonusDiamonds = 0;

    if (promoCode) {
      const promo = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
      if (promo && !promo.usedBy?.includes(currentUser.userId)) {
        if (promo.discount) {
          finalPrice = Math.floor(pkg.price * (1 - promo.discount / 100));
        }
        if (promo.bonusDiamonds) {
          bonusDiamonds += promo.bonusDiamonds;
        }
        // Mark promo as used
        const updatedPromoCodes = promoCodes.map(p => 
          p.id === promo.id ? { ...p, usedBy: [...p.usedBy, currentUser.userId] } : p
        );
        setPromoCodes(updatedPromoCodes);
        syncData({ promoCodes: updatedPromoCodes });
      }
    }

    // First topup bonus (10%)
    if (!currentUser.hasToppedUp) {
      bonusDiamonds += Math.floor(pkg.diamonds * 0.1);
    }

    if (currentUser.balance < finalPrice) {
      showToast('Insufficient balance. Please add money to your wallet.', 'error');
      return;
    }

    const newRequest: TopupRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      gameId,
      packageId: pkg.id,
      diamonds: pkg.diamonds + bonusDiamonds,
      price: finalPrice,
      status: 'pending',
      timestamp: Date.now()
    };

    // Deduct balance immediately and update user stats
    const updatedUser: UserData = {
      ...currentUser,
      balance: currentUser.balance - finalPrice,
      lastGameId: saveId ? gameId : currentUser.lastGameId,
      hasToppedUp: true
    };

    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));

    setTopupRequests([newRequest, ...topupRequests]);
    localStorage.setItem('ff_topup_requests', JSON.stringify([newRequest, ...topupRequests]));

    // Log transaction
    const newLog: TransactionLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.userId,
      amount: finalPrice,
      type: 'topup',
      method: 'Wallet',
      status: 'approved',
      details: `Topup: ${pkg.diamonds + bonusDiamonds} Diamonds for ID: ${gameId}${promoCode ? ` (Promo: ${promoCode})` : ''}`,
      timestamp: Date.now()
    };
    setTransactionLogs([newLog, ...transactionLogs]);
    localStorage.setItem('ff_logs', JSON.stringify([newLog, ...transactionLogs]));

    showToast('Topup request submitted! Diamonds will be added to your account shortly.', 'success');
    setView('profile');
  };

  const handleDailyCheckIn = () => {
    if (!currentUser) return;
    
    const now = Date.now();
    const lastCheckIn = currentUser.lastCheckIn || 0;
    
    const lastDate = new Date(lastCheckIn).toDateString();
    const currentDate = new Date(now).toDateString();
    
    if (lastDate === currentDate) {
      showToast('You have already checked in today!', 'info');
      return;
    }
    
    const oldLevel = currentUser.level;
    const newXp = currentUser.xp + appConfig.dailyRewardXP;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + appConfig.dailyRewardAmount,
      xp: newXp,
      level: newLevel,
      lastCheckIn: now
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.userId === updatedUser.userId ? updatedUser : u));
    localStorage.setItem('ff_session', JSON.stringify(updatedUser));
    updateMissionProgress('checkin', 1);
    
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId: currentUser.userId,
      title: 'Daily Reward!',
      message: `You earned ৳${appConfig.dailyRewardAmount} and ${appConfig.dailyRewardXP} XP!`,
      type: 'success',
      timestamp: now,
      isRead: false
    };
    setNotifications(prev => [...prev, newNotif]);
    showToast(`Daily check-in successful! You got ৳${appConfig.dailyRewardAmount} and ${appConfig.dailyRewardXP} XP.`, 'success');

    if (newLevel > oldLevel) {
      checkLevelUp(oldLevel, newLevel, currentUser.userId);
    }
  };

  const redeemPromoCode = (code: string) => {
    if (!currentUser) return;
    
    const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (!promo) {
      showToast('Invalid promo code!', 'error');
      return;
    }
    
    if (promo.usedBy?.includes(currentUser.userId)) {
      showToast('You have already used this promo code!', 'info');
      return;
    }
    
    const updatedPromo = {
      ...promo,
      usedBy: [...promo.usedBy, currentUser.userId]
    };
    
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + promo.reward
    };
    
    const updatedPromoCodes = promoCodes.map(p => p.id === promo.id ? updatedPromo : p);
    setPromoCodes(updatedPromoCodes);
    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.userId === updatedUser.userId ? updatedUser : u);
    setUsers(updatedUsers);
    
    syncData({ 
      promoCodes: updatedPromoCodes, 
      users: updatedUsers 
    });
    
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId: currentUser.userId,
      title: 'Promo Code Redeemed!',
      message: `You earned ৳${promo.reward} from promo code ${promo.code}!`,
      type: 'success',
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [...prev, newNotif]);
    showToast(`Promo code redeemed! You got ৳${promo.reward}.`, 'success');
  };

  const postComment = (matchId: string, text: string) => {
    if (!currentUser) return;
    if (!appConfig.isDiscussionEnabled) {
      showToast('Discussions are currently disabled by admin.', 'info');
      return;
    }

    if (currentUser.banUntil && currentUser.banUntil > Date.now()) {
      const remaining = Math.ceil((currentUser.banUntil - Date.now()) / (1000 * 60));
      showToast(`You are banned from chat for ${remaining} more minutes due to bad behavior.`, 'error');
      return;
    }
    
    const { censoredText, hasViolation } = checkChatModeration(text);
    
    if (hasViolation) {
      const newViolationCount = (currentUser.violationCount || 0) + 1;
      const updatedUser = { ...currentUser, violationCount: newViolationCount };
      
      if (newViolationCount >= 3) {
        updatedUser.banUntil = Date.now() + (1000 * 60 * 60); // 1 hour ban
        updatedUser.violationCount = 0; // Reset after ban
        showToast('You have been banned for 1 hour for repeated use of bad words.', 'error');
      } else {
        showToast(`Warning: Bad words are not allowed. Violation ${newViolationCount}/3.`, 'info');
      }
      
      setCurrentUser(updatedUser);
      const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
      setUsers(updatedUsers);
      syncData({ users: updatedUsers });
    }

    const newComment: MatchComment = {
      id: Date.now().toString(),
      matchId,
      userId: currentUser.userId,
      gameName: currentUser.gameName,
      text: censoredText,
      timestamp: Date.now()
    };
    
    setMatchComments(prev => [...prev, newComment]);
  };

  const deleteComment = (commentId: string) => {
    if (currentUser?.role !== 'admin') return;
    confirmAction(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      () => setMatchComments(prev => prev.filter(c => c.id !== commentId))
    );
  };

  const addPromoCode = (code: string, reward: number) => {
    if (currentUser?.role !== 'admin') return;
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      reward,
      usedBy: []
    };
    const updated = [...promoCodes, newPromo];
    setPromoCodes(updated);
    syncData({ promoCodes: updated });
  };

  const deletePromoCode = (id: string) => {
    if (currentUser?.role !== 'admin') return;
    confirmAction(
      'Delete Promo Code',
      'Are you sure you want to delete this promo code?',
      () => {
        const updated = promoCodes.filter(p => p.id !== id);
        setPromoCodes(updated);
        syncData({ promoCodes: updated });
        showToast('Promo code deleted!', 'success');
      }
    );
  };

  // --- Admin Actions ---
  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    // Update payment status
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'approved' } : p));

    // Update user balance
    setUsers(users.map(u => u.userId === payment.userId ? { ...u, balance: u.balance + payment.amount } : u));
    
    // If current user is the one being approved (unlikely in admin view but for consistency)
    if (currentUser?.userId === payment.userId) {
      setCurrentUser({ ...currentUser, balance: currentUser.balance + payment.amount });
    }
  };

  const rejectPayment = (paymentId: string, isFake: boolean = false) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = payments.map(p => p.id === paymentId ? { ...p, status: 'rejected' as const } : p);
    setPayments(updatedPayments);
    socket.emit('update_data', { payments: updatedPayments });

    if (isFake) {
      const updatedUsers = users.map(u => {
        if (u.userId === payment.userId) {
          const newCount = (u.fakeTrxCount || 0) + 1;
          return { ...u, fakeTrxCount: newCount, isSuspicious: newCount >= 3 };
        }
        return u;
      });
      setUsers(updatedUsers);
      socket.emit('update_data', { users: updatedUsers });
      showToast(`User flagged for fake transaction. Total: ${(users.find(u => u.userId === payment.userId)?.fakeTrxCount || 0) + 1}`, 'warning');
      logAuditorAction('FLAG_USER_FRAUD', `User ${payment.userId} flagged for fake transaction ID: ${payment.trxId}`);
    }
  };

  const addMatch = (newMatch: Omit<Match, 'id' | 'joinedPlayers'>) => {
    const match: Match = {
      ...newMatch,
      id: Math.random().toString(36).substr(2, 9),
      joinedPlayers: []
    };
    setMatches([...matches, match]);
  };

  const updateMatchRoomInfo = (matchId: string, roomId: string, roomPassword: string, isRoomPublished: boolean) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setMatches(matches.map(m => 
      m.id === matchId ? { ...m, roomId, roomPassword, isRoomPublished } : m
    ));

    if (isRoomPublished) {
      const newNotifs = match.joinedPlayers.map(p => ({
        id: Date.now().toString() + Math.random(),
        userId: p.userId,
        title: 'Room Details Published!',
        message: `Room ID/Password for match "${match.name}" is now available. Go to the match details to see it!`,
        type: 'info' as const,
        timestamp: Date.now(),
        isRead: false
      }));
      setNotifications(prev => [...prev, ...newNotifs]);
      showToast('Room info published and notifications sent to players!', 'success');
    } else {
      showToast('Room info saved but hidden from players.', 'info');
    }
  };

  const broadcastNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotifs = users.filter(u => u.role !== 'admin').map(u => ({
      id: Date.now().toString() + Math.random(),
      userId: u.userId,
      title,
      message,
      type,
      timestamp: Date.now(),
      isRead: false
    }));
    setNotifications(prev => [...prev, ...newNotifs]);
    showToast(`Notification broadcasted to ${newNotifs.length} users.`, 'success');
  };

  const deleteMatch = (id: string) => {
    confirmAction(
      'Delete Match',
      'Are you sure you want to delete this match?',
      () => setMatches(matches.filter(m => m.id !== id))
    );
  };

  const removePlayerFromMatch = (matchId: string, userId: string) => {
    confirmAction(
      'Remove Player',
      `Are you sure you want to remove player ${userId} from this match?`,
      () => {
        setMatches(matches.map(m => 
          m.id === matchId ? { ...m, joinedPlayers: m.joinedPlayers.filter(p => p.userId !== userId) } : m
        ));
        showToast(`Player ${userId} removed from match.`, 'success');
      }
    );
  };

  const addBalanceToUser = (userId: string, amount: number) => {
    setUsers(users.map(u => u.userId === userId ? { ...u, balance: u.balance + amount } : u));
    if (currentUser?.userId === userId) {
      setCurrentUser({ ...currentUser, balance: currentUser.balance + amount });
    }
    showToast(`Added ৳${amount} to user ${userId}`, 'success');
  };

  const updateUser = (updatedUser: UserData) => {
    setUsers(users.map(u => u.userId === updatedUser.userId ? updatedUser : u));
    if (currentUser?.userId === updatedUser.userId) {
      setCurrentUser(updatedUser);
    }
    setEditingUser(null);
    showToast('User profile updated!', 'success');
  };

  const resetAllData = () => {
    confirmAction(
      'Reset All Data',
      'Are you sure you want to reset all data? This will clear all users, matches, and payments. This action cannot be undone.',
      () => {
        setUsers([]);
        setMatches([]);
        setPayments([]);
        setWithdrawRequests([]);
        setMatchResults([]);
        setNotifications([]);
        setMatchComments([]);
        setTeamFinderPosts([]);
        setTransactionLogs([]);
        localStorage.clear();
        window.location.reload();
      }
    );
  };

  const clearOldData = (type: 'matches' | 'payments' | 'notifications') => {
    confirmAction(
      `Clear ${type}`,
      `Are you sure you want to clear all ${type}?`,
      () => {
        if (type === 'matches') setMatches([]);
        if (type === 'payments') setPayments([]);
        if (type === 'notifications') setNotifications([]);
        showToast(`${type} cleared successfully.`, 'success');
      }
    );
  };

  const scheduleAnnouncement = (text: string, time: string) => {
    const newAnnouncement: ScheduledAnnouncement = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      scheduledTime: new Date(time).getTime(),
      isSent: false
    };
    setAppConfig({
      ...appConfig,
      scheduledAnnouncements: [...(appConfig.scheduledAnnouncements || []), newAnnouncement]
    });
  };

  // Announcement & Room ID Scheduler Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Handle Announcements
      const pendingAnnouncements = (appConfig.scheduledAnnouncements || []).filter(a => !a.isSent && a.scheduledTime <= now);
      if (pendingAnnouncements.length > 0) {
        const newNotifs: Notification[] = pendingAnnouncements.map(a => ({
          id: Math.random().toString(36).substr(2, 9),
          userId: 'all',
          title: 'Announcement',
          message: a.text,
          type: 'info',
          timestamp: now,
          isRead: false
        }));
        setNotifications(prev => [...prev, ...newNotifs]);
        const updatedAnnouncements = appConfig.scheduledAnnouncements.map(a => 
          pendingAnnouncements.some(p => p.id === a.id) ? { ...a, isSent: true } : a
        );
        setAppConfig({ ...appConfig, scheduledAnnouncements: updatedAnnouncements });
      }

      // Handle Room ID Publishing
      const matchesToPublish = matches.filter(m => !m.isRoomPublished && m.publishTime && m.publishTime <= now);
      if (matchesToPublish.length > 0) {
        const updatedMatches = matches.map(m => 
          matchesToPublish.some(p => p.id === m.id) ? { ...m, isRoomPublished: true } : m
        );
        setMatches(updatedMatches);
        
        // Notify joined players
        matchesToPublish.forEach(match => {
          const newNotifs: Notification[] = match.joinedPlayers.map(p => ({
            id: Math.random().toString(36).substr(2, 9),
            userId: p.userId,
            title: 'Room ID Published!',
            message: `Room ID for ${match.name} is now available. Check match details.`,
            type: 'info',
            timestamp: now,
            isRead: false
          }));
          setNotifications(prev => [...prev, ...newNotifs]);
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [appConfig.scheduledAnnouncements, matches]);

  // Real-time Payment Alert for Admin
  useEffect(() => {
    if (adminSession) {
      const pendingCount = payments.filter(p => p.status === 'pending').length;
      const prevPendingCount = parseInt(localStorage.getItem('prev_pending_count') || '0');
      
      if (pendingCount > prevPendingCount) {
        // New payment request!
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        setAdminAlert({
          show: true,
          message: `New Payment Request Received!`
        });
        
        setTimeout(() => setAdminAlert({ show: false, message: '' }), 5000);
      }
      localStorage.setItem('prev_pending_count', pendingCount.toString());
    }
  }, [payments, currentUser]);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      matches.forEach(match => {
        // If match starts in 10 minutes and room info is available but not yet published to specific users
        const timeToStart = match.startTime - now;
        if (timeToStart > 0 && timeToStart <= 600000 && match.roomId && match.roomPassword) {
          // Find users who joined this match
          match.joinedPlayers.forEach(player => {
            // Check if user already got a notification for this match's room info
            const hasNotif = notifications.some(n => n.userId === player.userId && n.title === 'Room ID Ready' && n.message?.includes(match.name));
            
            if (!hasNotif) {
              const newNotif: Notification = {
                id: Math.random().toString(36).substr(2, 9),
                userId: player.userId,
                title: 'Room ID Ready',
                message: `Match: ${match.name}\nRoom ID: ${match.roomId}\nPassword: ${match.roomPassword}\n\nGood luck!`,
                type: 'success',
                timestamp: Date.now(),
                isRead: false
              };
              setNotifications(prev => [newNotif, ...prev]);
              
              // Simulate WhatsApp/SMS send
              console.log(`[SIMULATED SMS/WhatsApp to ${player.userId}] Room ID for ${match.name}: ${match.roomId}`);
            }
          });
        }
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [matches, notifications]);
  const Navbar = () => (
    <nav className="fixed bottom-0 left-0 right-0 glass backdrop-blur-2xl border-t border-red-600/20 px-4 py-3 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-red-600/10 border border-red-600/30 flex items-center justify-center glow-red/20">
            <img 
              src="https://i.ibb.co/v4m0YvL/RK-ESPORTS.png" 
              alt="RK Logo" 
              className="w-7 h-7 object-contain brightness-125"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.freepik.com/free-vector/esports-logo-design-template_23-2148604514.jpg';
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tighter hidden sm:inline italic text-red-600 text-glow-red uppercase">Venomous Arena</span>
            {!isOnline && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-none">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Offline</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 md:gap-8 shrink-0 pb-1 overflow-x-auto no-scrollbar max-w-full px-4">
          {[
            { id: 'home', icon: <LayoutDashboard size={20} />, label: 'Arena' },
            { id: 'teamfinder', icon: <Users size={20} />, label: 'Squads' },
            { id: 'leaderboard', icon: <Trophy size={20} />, label: 'Hall' },
            { id: 'fan_economy', icon: <TrendingUp size={20} />, label: 'Invest' },
            { id: 'calendar', icon: <Calendar size={20} />, label: 'Plan' },
            { id: 'wallet', icon: <Wallet size={20} />, label: 'Vault' },
            { id: 'marketplace', icon: <Award size={20} />, label: 'NFT' },
            { id: 'support', icon: <MessageSquare size={20} />, label: 'Help' },
            { id: 'notifications', icon: <Bell size={20} />, label: 'Alerts', badge: true },
            { id: 'shop', icon: <ShoppingBag size={20} />, label: 'Store' },
            { id: 'mysterybox', icon: <Gift size={20} />, label: 'Boxes' },
            { id: 'topup', icon: <Smartphone size={20} />, label: 'Topup' },
            { id: 'profile', icon: <User size={20} />, label: 'Profile' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)} 
              className={`relative flex flex-col items-center gap-1 shrink-0 transition-all duration-300 ${view === item.id || (item.id === 'support' && view === 'report') ? 'text-red-600 scale-110' : 'text-gray-500 hover:text-white'}`}
            >
              <div className={`p-1.5 transition-all ${view === item.id ? 'bg-red-600/10 glow-red/20' : ''}`}>
                {item.icon}
              </div>
              {item.badge && (notifications || []).filter(n => !n.isRead && (n.userId === 'all' || n.userId === currentUser?.userId)).length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 border border-black"></span>
              )}
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button onClick={handleShare} className="flex flex-col items-center gap-1 shrink-0 text-gray-400 hover:text-red-600 transition-colors">
            <Share2 size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Share</span>
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white font-sans selection:bg-primary selection:text-black transition-colors duration-300">
        <AnimatePresence>
          {isLoading && (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-none animate-pulse" />
              <div className="relative flex flex-col items-center space-y-6">
                <div className="w-32 h-32 bg-red-600 rounded-none rotate-45 flex items-center justify-center shadow-2xl shadow-red-600/50">
                  <Trophy size={64} className="text-white -rotate-45" />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">VENOMOUS STRIKE</h1>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-1 w-12 bg-red-600 rounded-none" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">The Ultimate Battleground</p>
                    <div className="h-1 w-12 bg-red-600 rounded-none" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-none animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-red-600 rounded-none animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-red-600 rounded-none animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <AnimatePresence>
        {adminAlert.show && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-teal-500 text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center">
              <Bell className="animate-bounce" size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter leading-none">Admin Alert</p>
              <p className="text-sm font-bold">{adminAlert.message}</p>
            </div>
            <button onClick={() => setAdminAlert({ show: false, message: '' })} className="p-2 hover:bg-black/10 rounded-lg">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInstallable && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-[110] bg-orange-500 text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tighter leading-none">Install RK App</p>
                <p className="text-[10px] font-medium opacity-80">Get the best experience on mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black/80 transition-all"
              >
                Install
              </button>
              <button 
                onClick={() => setIsInstallable(false)}
                className="p-2 hover:bg-black/10 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Mode Overlay */}
      {appConfig.isMaintenanceMode && currentUser?.role !== 'admin' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-24 h-24 bg-red-600/10 rounded-none flex items-center justify-center mb-6 border border-red-600/20">
            <Settings size={48} className="text-red-600 animate-spin-slow" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-white">Under Maintenance</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-md leading-relaxed">
            {appConfig.maintenanceMessage}
          </p>
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-none animate-bounce" />
              <div className="w-2 h-2 bg-red-600 rounded-none animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-red-600 rounded-none animate-bounce [animation-delay:0.4s]" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-red-600/60">Venomous Strike Arena</p>
          </div>
        </motion.div>
      )}

      {/* Banned User Overlay */}
      {(currentUser?.isBanned || currentUser?.isPermanentlyBanned) && <BannedOverlay reason={currentUser.banReason || 'Permanent Ban (IP/Device Blocked)'} />}

      {isCaptchaActive && <CaptchaChallenge />}
      {nftToSell && <SellNftModal />}

      <main className="relative z-10 pt-8 pb-24 px-4 max-w-2xl mx-auto md:pt-24">
        {/* Pull to Refresh Indicator */}
        <div className="absolute top-0 left-0 right-0 flex justify-center py-4 opacity-20 pointer-events-none">
          <RefreshCw size={24} className="animate-spin text-red-600" />
        </div>
        
        <AnimatePresence mode="wait">
          {view === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <header className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">Tournament Roadmap</h1>
                <p className="text-gray-400 text-sm font-medium">Plan your month and pre-book slots.</p>
              </header>

              <div className="bg-black/40 border border-red-600/20 rounded-none p-6 space-y-6">
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={`${day}-${idx}`} className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const date = new Date();
                    date.setDate(day);
                    const dayMatches = matches.filter(m => {
                      const mDate = new Date(m.startTime);
                      return mDate.getDate() === day && mDate.getMonth() === new Date().getMonth();
                    });

                    return (
                      <div 
                        key={day} 
                        className={`aspect-square rounded-none border flex flex-col items-center justify-center gap-1 transition-all ${
                          dayMatches.length > 0 
                            ? 'bg-red-600/10 border-red-600/30 text-red-600' 
                            : 'bg-white/5 border-white/5 text-gray-500'
                        }`}
                      >
                        <span className="text-xs font-black">{day}</span>
                        {dayMatches.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-none animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Upcoming Schedule</h3>
                  <div className="space-y-3">
                    {matches
                      .filter(m => m.startTime > Date.now())
                      .sort((a, b) => a.startTime - b.startTime)
                      .slice(0, 5)
                      .map(match => (
                        <div 
                          key={match.id}
                          onClick={() => {
                            setSelectedMatch(match);
                            setMatchModalTab('details');
                          }}
                          className="bg-black/40 border border-red-600/10 rounded-none p-4 flex items-center justify-between group hover:bg-red-600/5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-600/10 rounded-none flex items-center justify-center text-red-600 border border-red-600/20">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{match.name}</p>
                              <p className="text-[10px] text-gray-500 font-medium">
                                {new Date(match.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {match.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Pre-Book</p>
                              <p className="text-xs font-bold">৳{match.entryFee}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-red-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <MatchTicker matches={matches || []} />

              {/* User Stories */}
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
                {/* Add Story Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const url = prompt('Enter content URL (image/video):');
                    if (url) handleUploadStory(url, url.includes('mp4') ? 'video' : 'image');
                  }}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className="w-16 h-16 rounded-none bg-red-500/10 border-2 border-dashed border-red-500 flex items-center justify-center text-red-500">
                    <Plus size={24} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Add Story</span>
                </motion.button>

                {/* Other Stories */}
                {(users || []).flatMap(u => u.stories || []).sort((a, b) => b.timestamp - a.timestamp).map(story => (
                  <motion.button
                    key={story.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      showToast(`Viewing story from ${story.userName}`, 'info');
                    }}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <div className="w-16 h-16 rounded-none p-0.5 border-2 border-red-500">
                      <img 
                        src={story.type === 'image' ? story.contentUrl : 'https://picsum.photos/seed/video/100/100'} 
                        className="w-full h-full rounded-none object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white truncate w-16 text-center">{story.userName}</span>
                  </motion.button>
                ))}
              </div>

              {/* Cinematic Hero Section */}
              <div className="relative h-[450px] rounded-none overflow-hidden border border-red-500/20 shadow-2xl group glow-red/10">
                <div className="absolute inset-0 bg-black">
                  <img 
                    src="https://picsum.photos/seed/venom-strike/1920/1080" 
                    alt="Hero"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-[5000ms]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-transparent" />
                </div>
                
                {/* HUD Elements - Floating */}
                <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-12 right-12 w-32 h-32 border border-red-500/20 rounded-none flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="absolute inset-0 border-r-2 border-b-2 border-red-500/40 w-4 h-4 right-0 bottom-0" />
                  <div className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500/60 text-center">
                    VENOMOUS <br /> STRIKE
                  </div>
                </motion.div>

                <div className="absolute top-8 left-8 border-l-2 border-t-2 border-red-500 w-12 h-12 opacity-50" />
                <div className="absolute top-8 right-8 border-r-2 border-t-2 border-red-500 w-12 h-12 opacity-50" />
                <div className="absolute bottom-8 left-8 border-l-2 border-b-2 border-red-500 w-12 h-12 opacity-50" />
                <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-red-500 w-12 h-12 opacity-50" />

                <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 space-y-6">
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-px w-12 bg-red-600" />
                      <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.5em] text-red-600 text-glow-red">Tournament Live</span>
                    </div>
                    <h1 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
                      VENOMOUS <br />
                      <span className="text-red-600 text-glow-red">STRIKE</span>
                    </h1>
                  </motion.div>
                  
                  <motion.p
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-300 text-sm font-bold uppercase tracking-widest max-w-md leading-relaxed"
                  >
                    Enter the arena of legends. Compete in the most brutal 
                    tournaments and claim your throne.
                  </motion.p>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                  >
                    <CreepyButton 
                      onClick={() => setView('signup')}
                      className="w-full sm:w-auto"
                    >
                      Register Now
                    </CreepyButton>
                    <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] skew-x-[-15deg] hover:bg-white/10 transition-all">
                      <span className="skew-x-[15deg] block">Live Stream</span>
                    </button>
                  </motion.div>
                </div>

                {/* Scanning Line Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-[2px] bg-red-600/30 blur-sm animate-[scan_3s_linear_infinite]" />
                </div>
              </div>

              {/* Banner Slider */}
              {(banners || []).length > 0 && (
                <div className="relative w-full h-48 rounded-none overflow-hidden border border-white/10 shadow-2xl group glow-violet/5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBannerIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={banners[currentBannerIndex].imageUrl} 
                        alt={banners[currentBannerIndex].title}
                        className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-[2000ms]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                        <div className="space-y-2">
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-3 py-1 bg-primary text-black text-[8px] font-black uppercase tracking-[0.3em] mb-2"
                          >
                            Featured Event
                          </motion.div>
                          {banners[currentBannerIndex].title && (
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white text-glow-violet leading-none">
                              {banners[currentBannerIndex].title}
                            </h2>
                          )}
                          <p className="text-gray-400 text-xs font-medium max-w-sm">Experience the next level of competitive gaming in the Cyber Arena.</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* HUD Elements */}
                  <div className="absolute top-4 left-4 z-20 flex gap-1">
                    <div className="w-1 h-4 bg-primary animate-pulse" />
                    <div className="w-1 h-4 bg-primary/40" />
                    <div className="w-1 h-4 bg-primary/20" />
                  </div>
                  
                  {/* Dots */}
                  <div className="absolute bottom-8 right-8 flex gap-3 z-20">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBannerIndex(idx)}
                        className={`w-1.5 h-1.5 transition-all duration-500 ${idx === currentBannerIndex ? 'bg-primary w-8 glow-violet' : 'bg-white/20 hover:bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Spin Card */}
              {currentUser && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-red-600 to-red-800 rounded-none p-6 relative overflow-hidden shadow-2xl shadow-red-600/20 group cursor-pointer"
                  onClick={() => setView('spin')}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase italic text-white leading-none">Daily Spin</h3>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Win Balance & XP Every Day!</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <RefreshCw size={28} className="text-white" />
                    </div>
                  </div>
                  {currentUser.lastSpinDate === new Date().toISOString().split('T')[0] && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Come back tomorrow!</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <header className="space-y-6">
                <div className="bg-primary/10 border-y border-primary/20 py-2 overflow-hidden whitespace-nowrap relative">
                  <div className="animate-marquee inline-block text-[10px] font-black uppercase tracking-widest text-primary">
                    {appConfig.scrollingNotice} &nbsp;&nbsp;&nbsp;&nbsp; {appConfig.scrollingNotice} &nbsp;&nbsp;&nbsp;&nbsp; {appConfig.scrollingNotice}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">Tournaments</h2>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest ml-1">Join & Win Big Rewards</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-orange-500 hover:bg-white/10 transition-all">
                      <Search size={20} />
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-orange-500 hover:bg-white/10 transition-all">
                      <Filter size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['All', 'Free Fire', 'PUBG', 'COD', 'Ludo'].map((game) => (
                    <button
                      key={game}
                      onClick={() => setSelectedGame(game as any)}
                      className={`px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        selectedGame === game
                          ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['All', 'Solo', 'Duo', 'Squad', 'Classic', 'Rush'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                        selectedCategory === cat
                          ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {currentUser && currentUser.role !== 'admin' && (
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setView('leaderboard')}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                        title="Leaderboard"
                      >
                        <Trophy size={18} />
                      </button>
                      <button 
                        onClick={() => setView('profile')}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-teal-500"
                        title="Daily Check-in"
                      >
                        <Calendar size={18} />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                        title="Share App"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <Star className="text-orange-500 w-4 h-4 fill-orange-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Level {currentUser.level}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500" 
                          style={{ width: `${(currentUser.xp % 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </header>

              <div className="grid gap-4">
                {appConfig.featureMaintenance.matches ? (
                  <MaintenanceOverlay />
                ) : (
                  matches
                    .filter(m => (selectedGame === 'All' || m.game === selectedGame) && (selectedCategory === 'All' || m.category === selectedCategory))
                    .map(match => (
                    <div 
                      key={match.id}
                      className="group glass border border-red-600/10 rounded-none hover:border-red-600/50 transition-all duration-300 relative overflow-hidden glow-red/5"
                    >
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-none uppercase tracking-widest border border-red-600/30">
                        {match.game}
                      </div>
                      {match.isScrim && (
                        <div className="bg-purple-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg animate-pulse">
                          Scrim Match
                        </div>
                      )}
                      {match.isPPV && (
                        <div className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg animate-pulse flex items-center gap-1">
                          <Eye size={8} /> PPV Match
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      {match.joinedPlayers.length >= match.totalSlots ? (
                        <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-none uppercase tracking-widest shadow-lg">
                          Registration Closed
                        </div>
                      ) : (
                        <div className="bg-white text-black text-[10px] font-black px-2 py-1 rounded-none uppercase tracking-widest shadow-lg">
                          {match.totalSlots - match.joinedPlayers.length} Slots Left
                        </div>
                      )}
                    </div>

                    {match.imageUrl && (
                      <div className="h-44 w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10 opacity-60" />
                        <img 
                          src={match.imageUrl} 
                          alt={match.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <div className="p-5 space-y-5">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">{match.name}</h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                              <MapPin size={12} className="text-teal-500" />
                              {match.map}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                              <Clock size={12} className="text-teal-500" />
                              {match.time}
                            </div>
                          </div>
                        </div>
                        <Countdown targetTime={match.startTime} />
                      </div>

                      {match.isPPV && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye size={16} className="text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Watch Live (PPV)</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePPVJoin(match.id);
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all"
                          >
                            ৳{match.viewerFee} to Watch
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-xl p-3 border border-white/5">
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Entry</div>
                          <div className="text-orange-500 font-bold">৳{match.entryFee}</div>
                        </div>
                        <div className="text-center border-x border-white/10">
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Prize</div>
                          <div className="text-teal-500 font-bold">৳{match.totalPrize}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Per Kill</div>
                          <div className="text-white font-bold">৳{match.perKill}</div>
                        </div>
                      </div>

                      {/* Room Info for Joined Players */}
                      {match.joinedPlayers.some(p => p.userId === (currentUser?.userId || '')) && (
                        (() => {
                          const now = Date.now();
                          const timeDiff = match.startTime - now;
                          const isTimeToShow = timeDiff <= 20 * 60 * 1000; // 20 minutes

                          if (isTimeToShow && match.isRoomPublished) {
                            return (
                              <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 space-y-2">
                                <div className="text-[10px] text-teal-500 font-black uppercase tracking-widest text-center">Room Information (Live)</div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-400 font-bold uppercase">Room ID:</span>
                                  <span className="text-sm font-mono font-black text-white">{match.roomId || 'TBA'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-400 font-bold uppercase">Password:</span>
                                  <span className="text-sm font-mono font-black text-white">{match.roomPassword || 'TBA'}</span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Room Info Coming Soon</div>
                                <p className="text-[9px] text-gray-400 mt-1 italic">
                                  {isTimeToShow ? 'Admin is publishing room info...' : 'Check back 15-20 minutes before match time.'}
                                </p>
                              </div>
                            );
                          }
                        })()
                      )}

                      <div className="flex gap-2">
                        <NeonButton 
                          onClick={() => handleJoinClick(match)}
                          disabled={match.joinedPlayers.some(p => p.userId === (currentUser?.userId || '')) || match.joinedPlayers.length >= match.totalSlots}
                          color="#f97316"
                          className="flex-1"
                        >
                          {match.joinedPlayers.some(p => p.userId === (currentUser?.userId || '')) 
                            ? 'Already Joined' 
                            : match.joinedPlayers.length >= match.totalSlots 
                              ? 'Registration Closed' 
                              : 'Join Match'}
                        </NeonButton>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare();
                          }}
                          className="px-4 py-3 bg-white/5 border border-white/10 text-orange-500 rounded-xl hover:bg-white/10 transition-all"
                          title="Share Match"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

              {/* Map Voting Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <Globe className="text-teal-500" />
                    Map Voting
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Season Choice</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {availableMaps.map(map => {
                    const totalVotes = Object.values(mapVotes).reduce((a: number, b: number) => a + b, 0) || 1;
                    const percentage = Math.round(((mapVotes[map.name] as number || 0) / (totalVotes as number)) * 100);
                    const isVoted = userVotedMap === map.name;

                    return (
                      <motion.div 
                        key={map.name}
                        whileHover={{ y: -5 }}
                        className={`relative bg-white/5 border rounded-3xl p-4 overflow-hidden group transition-all ${isVoted ? 'border-teal-500' : 'border-white/10'}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${map.color} to-transparent opacity-50`} />
                        <div className="relative space-y-4">
                          <div className="h-24 rounded-2xl overflow-hidden border border-white/10">
                            <img src={map.image} alt={map.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <h4 className="text-lg font-black uppercase italic tracking-tighter">{map.name}</h4>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{mapVotes[map.name]} Votes</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black italic text-red-600">{percentage}%</div>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="h-full bg-red-600"
                            />
                          </div>
                          <button 
                            onClick={() => handleMapVote(map.name)}
                            disabled={!!userVotedMap}
                            className={`w-full py-3 rounded-none font-black uppercase tracking-widest text-[10px] transition-all ${
                              isVoted 
                              ? 'bg-red-600 text-white' 
                              : userVotedMap 
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-white/10 text-white hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {isVoted ? 'Voted' : 'Vote Map'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Daily Missions */}
              {currentUser && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                      <Zap size={16} /> Daily Missions
                    </h3>
                    {missions.some(m => {
                      const progress = (currentUser.missionProgress || {})[m.id] || 0;
                      return progress >= m.requirement && !currentUser.claimedMissions?.includes(m.id);
                    }) && (
                      <CreepyButton 
                        onClick={() => {
                          missions.forEach(m => {
                            const progress = (currentUser.missionProgress || {})[m.id] || 0;
                            if (progress >= m.requirement && !currentUser.claimedMissions?.includes(m.id)) {
                              claimMissionReward(m.id);
                            }
                          });
                        }}
                        className="scale-75 origin-right"
                      >
                        Claim All
                      </CreepyButton>
                    )}
                  </div>
                  <div className="space-y-3">
                    {missions.map(mission => {
                      const progress = (currentUser.missionProgress || {})[mission.id] || 0;
                      const isCompleted = progress >= mission.requirement;
                      const isClaimed = currentUser.claimedMissions?.includes(mission.id);
                      
                      return (
                        <div key={mission.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-black uppercase tracking-tight">{mission.title}</h4>
                              <span className="text-[9px] font-black text-gray-500 uppercase">{progress}/{mission.requirement}</span>
                            </div>
                            <p className="text-[10px] text-gray-400">{mission.description}</p>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                              <div 
                                className="h-full bg-red-600 transition-all duration-500" 
                                style={{ width: `${Math.min(100, (progress / mission.requirement) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <button 
                            disabled={!isCompleted || isClaimed}
                            onClick={() => claimMissionReward(mission.id)}
                            className={`px-4 py-2 rounded-none text-[9px] font-black uppercase tracking-widest transition-all ${
                              isClaimed 
                              ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                              : isCompleted 
                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20' 
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isClaimed ? 'Claimed' : isCompleted ? 'Claim' : 'In Progress'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Join Confirmation Modal */}
              <AnimatePresence>
                {selectedMatch && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl"
                    >
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-red-600/20 rounded-none flex items-center justify-center mx-auto mb-4">
                          <Trophy className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">{selectedMatch.name}</h3>
                        <p className="text-gray-400 text-sm">Are you sure you want to join this match?</p>
                      </div>

                      <div className="flex bg-white/5 p-1 rounded-none border border-white/10">
                        <button 
                          onClick={() => setMatchModalTab('details')}
                          className={`flex-1 py-2 rounded-none text-[8px] font-black uppercase tracking-widest transition-all ${matchModalTab === 'details' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => setMatchModalTab('players')}
                          className={`flex-1 py-2 rounded-none text-[8px] font-black uppercase tracking-widest transition-all ${matchModalTab === 'players' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                        >
                          Players
                        </button>
                        <button 
                          onClick={() => setMatchModalTab('discussion')}
                          className={`flex-1 py-2 rounded-none text-[8px] font-black uppercase tracking-widest transition-all ${matchModalTab === 'discussion' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                        >
                          Chat
                        </button>
                        <button 
                          onClick={() => setMatchModalTab('predictions')}
                          className={`flex-1 py-2 rounded-none text-[8px] font-black uppercase tracking-widest transition-all ${matchModalTab === 'predictions' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
                        >
                          Predict
                        </button>
                      </div>

                      {matchModalTab === 'details' && (
                        <>
                          <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5">
                            <div className="space-y-2">
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Select Slot (1-48)</div>
                              <div className="grid grid-cols-6 gap-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                                {Array.from({ length: selectedMatch.totalSlots }, (_, i) => i + 1).map(slotNum => {
                                  const occupant = selectedMatch.joinedPlayers.find(p => p.slotNumber === slotNum);
                                  const isSelected = selectedSlot === slotNum;
                                  const isOccupied = !!occupant;

                                  return (
                                    <button
                                      key={slotNum}
                                      disabled={isOccupied}
                                      onClick={() => handleSlotClick(slotNum)}
                                      className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border ${
                                        isOccupied 
                                          ? 'bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed' 
                                          : isSelected
                                            ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                      }`}
                                    >
                                      {slotNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Match Rules</div>
                              <div className="text-[10px] text-gray-400 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                                {appConfig.matchRules}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Entry Fee</span>
                              <span className="font-bold text-orange-500">৳{selectedMatch.entryFee}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Your Balance</span>
                              <span className={`font-bold ${currentUser && currentUser.balance >= selectedMatch.entryFee ? 'text-teal-500' : 'text-red-500'}`}>
                                ৳{currentUser?.balance || 0}
                              </span>
                            </div>

                            {/* Map Voting */}
                            <div className="space-y-2">
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex justify-between">
                                <span>Vote for Map</span>
                                <span className="text-red-600">{selectedMatch.votedUserIds?.length || 0} Votes</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {['Bermuda', 'Purgatory'].map(mapName => {
                                  const votes = selectedMatch.mapVotes?.[mapName] || 0;
                                  const totalVotes = (Object.values(selectedMatch.mapVotes || {}) as number[]).reduce((a, b) => a + b, 0) || 1;
                                  const percentage = Math.round((votes / totalVotes) * 100);
                                  const hasVoted = selectedMatch.votedUserIds?.includes(currentUser?.userId || '');

                                  return (
                                    <button
                                      key={mapName}
                                      disabled={hasVoted}
                                      onClick={() => handleVoteMap(selectedMatch.id, mapName)}
                                      className={`relative overflow-hidden p-3 rounded-none border transition-all ${hasVoted ? 'bg-white/5 border-white/10 opacity-50' : 'bg-white/5 border-white/10 hover:border-red-600/50'}`}
                                    >
                                      <div className="absolute inset-0 bg-red-600/10 transition-all" style={{ width: `${percentage}%` }} />
                                      <div className="relative flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{mapName}</span>
                                        <span className="text-[10px] font-bold text-red-600">{percentage}%</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Voice Room */}
                            <button
                              onClick={() => showToast('Joining Voice Room... (WebRTC implementation pending)', 'info')}
                              className="w-full py-3 bg-red-600/20 border border-red-600/40 text-red-600 rounded-none flex items-center justify-center gap-2 hover:bg-red-600/30 transition-all"
                            >
                              <Mic size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Join Team Voice Room</span>
                            </button>

                            {/* Room ID/Password in Modal for joined players */}
                            {selectedMatch.joinedPlayers.some(p => p.userId === (currentUser?.userId || '')) && selectedMatch.isRoomPublished && (
                              <div className="mt-4 p-4 bg-red-600/10 border border-red-600/20 rounded-none space-y-3">
                                <div className="text-[10px] text-red-600 font-black uppercase tracking-widest text-center">Room Details Published</div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[8px] text-gray-500 uppercase font-black">Room ID</p>
                                    <p className="text-sm font-mono font-black text-white">{selectedMatch.roomId || 'TBA'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[8px] text-gray-500 uppercase font-black">Password</p>
                                    <p className="text-sm font-mono font-black text-white">{selectedMatch.roomPassword || 'TBA'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3">
                            {currentUser && currentUser.balance >= selectedMatch.entryFee ? (
                              <button 
                                onClick={confirmJoin}
                                disabled={!selectedSlot}
                                className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-none hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {selectedSlot ? `Confirm & Join (Slot ${selectedSlot})` : 'Select a Slot to Join'}
                              </button>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">Insufficient Balance</p>
                                <button 
                                  onClick={() => {
                                    setView('wallet');
                                    handleCloseMatchModal();
                                  }}
                                  className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 active:scale-95 transition-all"
                                >
                                  Add Money to Join
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button 
                                onClick={handleCloseMatchModal}
                                className="flex-1 py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleShare}
                                className="px-6 py-4 bg-white/5 border border-white/10 text-orange-500 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                              >
                                <Share2 size={20} /> Share
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {matchModalTab === 'players' && (
                        <div className="space-y-4">
                          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {selectedMatch.joinedPlayers.length === 0 ? (
                              <p className="text-center py-8 text-gray-500 text-[10px] uppercase font-black tracking-widest italic">No players joined yet.</p>
                            ) : (
                              selectedMatch.joinedPlayers.map(player => {
                                const playerUser = users.find(u => u.userId === player.userId);
                                return (
                                  <div key={player.userId} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-black/20 rounded-lg flex items-center justify-center text-xs font-black">
                                        {player.slotNumber}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold">{playerUser?.gameName || 'Unknown'}</span>
                                        {player.squadName && (
                                          <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                            {player.squadLogo && <img src={player.squadLogo} className="w-2 h-2 rounded-full" referrerPolicy="no-referrer" />}
                                            {player.squadName}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-mono">
                                      {new Date(player.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <button 
                            onClick={handleCloseMatchModal}
                            className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                          >
                            Close
                          </button>
                        </div>
                      )}

                      {matchModalTab === 'discussion' && (
                        <div className="space-y-4">
                          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {matchComments.filter(c => c.matchId === selectedMatch.id).length === 0 ? (
                              <p className="text-center py-8 text-gray-500 text-[10px] uppercase font-black tracking-widest italic">No comments yet.</p>
                            ) : (
                              matchComments.filter(c => c.matchId === selectedMatch.id).map(comment => (
                                <div key={comment.id} className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-orange-500 uppercase italic">{comment.gameName}</span>
                                    <span className="text-[8px] text-gray-500">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-xs text-gray-300">{comment.text}</p>
                                  {(currentUser?.role === 'admin' || adminSession) && (
                                    <button onClick={() => deleteComment(comment.id)} className="text-[8px] text-red-500 uppercase font-black hover:underline">Delete</button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                          
                          {appConfig.isDiscussionEnabled ? (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              postComment(selectedMatch.id, formData.get('comment') as string);
                              e.currentTarget.reset();
                            }} className="flex gap-2">
                              <input 
                                name="comment" 
                                placeholder="Type a message..." 
                                required
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none"
                              />
                              <button type="submit" className="p-3 bg-teal-500 text-black rounded-xl hover:bg-teal-400">
                                <Send size={18} />
                              </button>
                            </form>
                          ) : (
                            <p className="text-center text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Discussion is disabled.</p>
                          )}
                          
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setSelectedMatch(null)}
                              className="flex-1 py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                            >
                              Close
                            </button>
                            <button 
                              onClick={handleShare}
                              className="px-6 py-4 bg-teal-500/10 border border-teal-500/20 text-teal-500 rounded-xl hover:bg-teal-500/20 transition-all"
                            >
                              <Share2 size={20} />
                            </button>
                          </div>
                        </div>
                      )}

                      {matchModalTab === 'predictions' && (
                        <div className="space-y-4">
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center space-y-2">
                            <Bot className="text-purple-500 mx-auto" size={32} />
                            <h4 className="text-sm font-black uppercase italic tracking-tight">AI Winner Prediction</h4>
                            <p className="text-[10px] text-gray-400">Predict the winner and earn 10 RK Points!</p>
                          </div>

                          <div className="space-y-3">
                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Who will win?</div>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                              {(selectedMatch.joinedPlayers || []).length === 0 ? (
                                <p className="text-center py-4 text-gray-500 text-[10px] uppercase font-black tracking-widest italic">No players joined yet.</p>
                              ) : (
                                (selectedMatch.joinedPlayers || []).map(player => {
                                  const playerUser = users.find(u => u.userId === player.userId);
                                  const hasPredicted = (predictions || []).some(p => p.userId === currentUser?.userId && p.matchId === selectedMatch.id);
                                  const isSelected = (predictions || []).find(p => p.userId === currentUser?.userId && p.matchId === selectedMatch.id)?.predictedWinner === playerUser?.gameName;

                                  return (
                                    <button
                                      key={player.userId}
                                      disabled={hasPredicted}
                                      onClick={() => handlePrediction(selectedMatch.id, playerUser?.gameName || 'Unknown')}
                                      className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${
                                        isSelected
                                          ? 'bg-purple-500 border-purple-500 text-black'
                                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                      } ${hasPredicted && !isSelected ? 'opacity-50 grayscale' : ''}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center text-[10px] font-black">
                                          {player.slotNumber}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold">{playerUser?.gameName || 'Unknown'}</span>
                                          {player.squadName && (
                                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
                                              {player.squadLogo && <img src={player.squadLogo} className="w-2 h-2 rounded-full" referrerPolicy="no-referrer" />}
                                              {player.squadName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {isSelected && <Check size={16} />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={() => setSelectedMatch(null)}
                            className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header className="flex justify-between items-end">
                <div className="flex items-end gap-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Achievements</h1>
                    <p className="text-gray-400 text-sm font-medium">Your tournament milestones.</p>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                    title="Share Achievements"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Unlocked</div>
                    <div className="text-3xl font-black text-orange-500 tracking-tighter italic">{currentUser?.achievements?.length || 0} / {ACHIEVEMENTS.length}</div>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                    title="Share Achievements"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {ACHIEVEMENTS.map(achievement => {
                  const isUnlocked = currentUser?.achievements?.includes(achievement.id);
                  const Icon = achievement.icon === 'Zap' ? Zap : 
                               achievement.icon === 'Trophy' ? Trophy : 
                               achievement.icon === 'Medal' ? Medal : 
                               achievement.icon === 'Wallet' ? Wallet : Award;

                  return (
                    <div 
                      key={achievement.id}
                      className={`relative overflow-hidden bg-white/5 border rounded-3xl p-6 transition-all duration-500 ${isUnlocked ? 'border-orange-500/50' : 'border-white/10 opacity-50 grayscale'}`}
                    >
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="bg-orange-500 text-black text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Unlocked</div>
                        </div>
                      )}
                      
                      <div className="flex gap-5 items-center">
                        <div className={`p-4 rounded-2xl ${isUnlocked ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-gray-600'}`}>
                          <Icon size={32} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase italic tracking-tight">{achievement.title}</h3>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">{achievement.description}</p>
                          <div className="pt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                              Requirement: {achievement.requirement}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {view === 'wallet' && (
            <motion.div 
              key="wallet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {appConfig.featureMaintenance.wallet ? (
                <MaintenanceOverlay />
              ) : (
                <>
                  <header className="flex justify-between items-end">
                <div className="flex items-end gap-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">My Wallet</h1>
                    <p className="text-gray-400 text-sm font-medium">Manage your funds.</p>
                  </div>
                </div>
                  <div className="text-right flex items-end gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Balance</div>
                    <div className="text-2xl font-black text-red-600 tracking-tighter italic">৳{currentUser?.balance || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Winnings</div>
                    <div className="text-2xl font-black text-white tracking-tighter italic">৳{currentUser?.winnings || 0}</div>
                  </div>
                </div>
              </header>

              {/* Wallet Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                <button 
                  onClick={() => setWalletTab('add')}
                  className={`flex-1 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    walletTab === 'add' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Plus size={16} /> Add Money
                </button>
                <button 
                  onClick={() => setWalletTab('withdraw')}
                  className={`flex-1 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    walletTab === 'withdraw' ? 'bg-white text-black shadow-lg shadow-white/20' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight size={16} /> Withdraw
                </button>
              </div>

              <div className="space-y-6">
                {walletTab === 'add' ? 
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                      <CreditCard className="text-red-600" />
                      Add Money
                    </h3>
                    
                    <div className="bg-red-600/10 border border-red-600/20 rounded-none p-4 mb-4">
                      <div className="flex gap-3">
                        <Info size={18} className="text-red-600 shrink-0" />
                        <p className="text-[10px] text-red-600/80 font-bold uppercase tracking-widest leading-relaxed">
                          To add money, send the amount to our number below and submit the transaction details. Your request will be processed within 5-30 minutes.
                        </p>
                      </div>
                    </div>
                    
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">bKash Personal</div>
                            <div className="text-lg font-mono font-bold text-red-600">{appConfig.bkash}</div>
                          </div>
                          <button onClick={() => {
                            navigator.clipboard.writeText(appConfig.bkash);
                            showToast('Number copied!', 'success');
                          }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <Smartphone size={18} />
                          </button>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Nagad Personal</div>
                            <div className="text-lg font-mono font-bold text-red-600">{appConfig.nagad}</div>
                          </div>
                          <button onClick={() => {
                            navigator.clipboard.writeText(appConfig.nagad);
                            showToast('Number copied!', 'success');
                          }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <Smartphone size={18} />
                          </button>
                        </div>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as any;
                          submitPayment(
                            Number(form.amount.value),
                            form.sender.value,
                            form.trxId.value,
                            form.method.value
                          );
                          form.reset();
                        }}
                        className="space-y-4 pt-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Payment Method</label>
                            <select 
                              name="method" 
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as 'bKash' | 'Nagad')}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none appearance-none"
                            >
                              <option value="bKash">bKash</option>
                              <option value="Nagad">Nagad</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Amount (৳)</label>
                            <input 
                              name="amount" 
                              type="number" 
                              required 
                              placeholder="Min ৳10" 
                              onChange={(e) => setTopupAmount(Number(e.target.value))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Sender Number</label>
                            <input name="sender" type="text" required placeholder="01XXX-XXXXXX" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Transaction ID (TrxID)</label>
                            <input name="trxId" type="text" required placeholder="8X7Y6Z..." className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                          </div>
                        </div>
                        <div className="pt-4">
                          <CreepyButton type="submit" className="w-full">
                            Submit Request
                          </CreepyButton>
                        </div>
                      </form>

                      <div className="pt-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <History size={14} /> Add Money History
                        </h4>
                        <div className="space-y-2">
                          {payments.filter(p => p.userId === currentUser?.userId).length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-[10px] uppercase font-bold italic">No payment history.</p>
                          ) : (
                            payments.filter(p => p.userId === currentUser?.userId).map(p => (
                              <div key={p.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                  <div className="text-xs font-bold uppercase italic">৳{p.amount} via {p.method}</div>
                                  <div className="text-[9px] text-gray-500 font-mono">{p.trxId}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                                    p.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                    p.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                    'bg-orange-500/10 text-orange-500'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                 : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  {appConfig.featureMaintenance.withdraw ? 
                    <MaintenanceOverlay />
                   : 
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <ArrowUpRight className="text-orange-500" />
                        Withdraw Winnings
                      </h3>
                      
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-4">
                        <div className="flex gap-3">
                          <Info size={18} className="text-orange-500 shrink-0" />
                          <p className="text-[10px] text-orange-500/80 font-bold uppercase tracking-widest leading-relaxed">
                            Withdrawal requests are processed within 24 hours. Minimum withdrawal is ৳100.
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Withdraw your earned prize money to your personal wallet.</p>
                      
                      {/* Pro Contract Card */}
                      {currentUser?.isProContracted && (
                        <div className="bg-gradient-to-br from-orange-500/20 via-black to-yellow-500/10 border border-orange-500/30 rounded-3xl p-6 relative overflow-hidden group mb-6">
                          <div className="absolute top-0 right-0 p-4">
                            <Star className="text-orange-500 animate-pulse" size={24} />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Active Contract</div>
                              <h3 className="text-2xl font-black uppercase italic tracking-tight">Contracted Pro</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Monthly Salary</div>
                                <div className="text-lg font-black text-teal-500 italic">৳{currentUser.salaryAmount}</div>
                              </div>
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Matches Played</div>
                                <div className="text-lg font-black text-orange-500 italic">{currentUser.monthlyMatchesPlayed || 0} / 10</div>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 transition-all duration-1000" 
                                style={{ width: `${Math.min(100, ((currentUser.monthlyMatchesPlayed || 0) / 10) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 italic">Play 10 matches this month to receive your full salary!</p>
                          </div>
                        </div>
                      )}

                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as any;
                            handleWithdrawRequest(
                              Number(form.amount.value),
                              form.number.value,
                              form.method.value,
                              form.trxId.value
                            );
                            form.reset();
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Withdraw Method</label>
                              <select name="method" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none appearance-none">
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Amount (৳)</label>
                              <input name="amount" type="number" required placeholder="Min ৳100" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Your Number</label>
                              <input name="number" type="text" required placeholder="01XXX-XXXXXX" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Transaction ID (Optional)</label>
                              <input name="trxId" type="text" placeholder="Reference TrxID" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                            </div>
                          </div>
                          <div className="pt-4">
                            <CreepyButton type="submit" className="w-full">
                              Request Withdraw
                            </CreepyButton>
                          </div>
                        </form>

                      <div className="pt-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <History size={14} /> Withdraw History
                        </h4>
                        <div className="space-y-2">
                          {withdrawRequests.filter(w => w.userId === currentUser?.userId).length === 0 ? (
                            <p className="text-center py-4 text-gray-600 text-[10px] uppercase font-bold italic">No withdraw history.</p>
                          ) : (
                            withdrawRequests.filter(w => w.userId === currentUser?.userId).map(w => (
                              <div key={w.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                  <div className="text-xs font-bold uppercase italic">৳{w.amount} via {w.method}</div>
                                  <div className="text-[9px] text-gray-500 font-mono">{w.number}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => generateWithdrawalReceipt(w, currentUser!)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-orange-500"
                                    title="Download Receipt"
                                  >
                                    <Download size={14} />
                                  </button>
                                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                    w.status === 'approved' ? 'bg-teal-500/20 text-teal-500' :
                                    w.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                    'bg-orange-500/20 text-orange-500'
                                  }`}>
                                    {w.status}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    )}

          {view === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Shop 
                items={shopItems} 
                onBuy={buyItem} 
                userBalance={currentUser?.balance || 0} 
                userInventory={currentUser?.inventory || []} 
                isMaintenance={appConfig.featureMaintenance.shop}
              />
            </motion.div>
          )}

          {view === 'marketplace' && (
            <motion.div 
              key="marketplace"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Marketplace />
            </motion.div>
          )}

          {view === 'mysterybox' && (
            <motion.div 
              key="mysterybox"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Mystery Box Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <Gift className="text-pink-500" />
                    Mystery Boxes
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Luck of the Draw</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mysteryBoxes.map(box => (
                    <motion.div 
                      key={box.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-pink-500/10 via-black to-purple-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                      onClick={() => {
                        if (!currentUser) return;
                        if (currentUser.balance < box.price) {
                          showToast('Insufficient balance!', 'error');
                          return;
                        }
                        
                        // Open Box Logic
                        const rand = Math.random();
                        let cumulativeChance = 0;
                        let prize = box.prizes[box.prizes.length - 1];
                        
                        for (const p of box.prizes) {
                          cumulativeChance += p.chance;
                          if (rand < cumulativeChance) {
                            prize = p;
                            break;
                          }
                        }

                        const updatedUser = { ...currentUser };
                        updatedUser.balance -= box.price;
                        
                        if (prize.type === 'balance') updatedUser.balance += prize.amount;
                        if (prize.type === 'diamonds') updatedUser.diamonds = (updatedUser.diamonds || 0) + prize.amount;
                        if (prize.type === 'xp') updatedUser.xp = (updatedUser.xp || 0) + prize.amount;
                        
                        setCurrentUser(updatedUser);
                        setUsers(users.map(u => u.userId === currentUser.userId ? updatedUser : u));
                        setWonPrize({ boxName: box.name, prize });
                        showToast(`You opened ${box.name} and won: ${prize.amount} ${prize.type.toUpperCase()}!`, 'success');
                        logAuditorAction('OPEN_MYSTERY_BOX', `User ${currentUser.userId} opened ${box.name} and won ${prize.amount} ${prize.type}`);
                      }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-pink-500/20 transition-all" />
                      <div className="relative flex items-center gap-4">
                        <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 border border-pink-500/30 group-hover:scale-110 transition-transform overflow-hidden">
                          {box.image ? (
                            <img src={box.image} alt={box.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={32} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-black uppercase italic tracking-tighter">{box.name}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Price: ৳{box.price}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black italic text-pink-500">OPEN</div>
                          <ChevronRight size={16} className="text-gray-500 ml-auto" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Premium Rewards Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Trophy className="text-yellow-500" />
                      Premium Rewards
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Exclusive Items</span>
                  </div>

                  <div className="electric-card-container overflow-x-auto no-scrollbar py-10">
                    <div className="flex gap-10 min-w-max px-4">
                      <ElectricCard 
                        badge="Legendary"
                        title="Cyber Katana"
                        description="A high-frequency blade forged in the neon depths of the city."
                      />
                      <ElectricCard1 
                        badge="Mythic"
                        title="Golden Dragon"
                        description="The ultimate symbol of power and prestige in the arena."
                      />
                      <ElectricCard 
                        badge="Epic"
                        title="Neon Glider"
                        description="Soar through the skies with unmatched style and speed."
                      />
                    </div>
                  </div>
                </section>

                {/* Won Prize Modal */}
                <AnimatePresence>
                  {wonPrize && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setWonPrize(null)}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                      />
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                        className="relative w-full max-sm bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-[3rem] p-8 text-center shadow-2xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 blur-[100px] rounded-full" />

                        <div className="relative z-10 space-y-6">
                          <div className="space-y-2">
                            <h2 className="text-sm font-black text-purple-500 uppercase tracking-[0.3em]">Mystery Unlocked</h2>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{wonPrize.boxName}</h3>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
                            <div className="relative w-48 h-48 mx-auto bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                              {wonPrize.prize.image ? (
                                <img src={wonPrize.prize.image} alt="Prize" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center space-y-2">
                                  {wonPrize.prize.type === 'balance' && <Coins size={64} className="text-yellow-500 mx-auto" />}
                                  {wonPrize.prize.type === 'diamonds' && <Zap size={64} className="text-blue-400 mx-auto" />}
                                  {wonPrize.prize.type === 'xp' && <Target size={64} className="text-teal-500 mx-auto" />}
                                  {['nft', 'badge', 'frame', 'skin', 'custom'].includes(wonPrize.prize.type) && <Award size={64} className="text-purple-500 mx-auto" />}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">You Received</p>
                            <h4 className="text-4xl font-black text-white italic tracking-tighter leading-none">
                              {wonPrize.prize.amount > 0 ? `${wonPrize.prize.amount} ` : ''}
                              <span className="text-purple-500">{wonPrize.prize.name || wonPrize.prize.type.toUpperCase()}</span>
                            </h4>
                          </div>

                          <button 
                            onClick={() => setWonPrize(null)}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all shadow-xl"
                          >
                            Claim Reward
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          )}

          {view === 'topup' && (
            <motion.div 
              key="topup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Topup 
                packages={topupPackages} 
                categories={topupCategories}
                onTopup={handleTopupRequest} 
                userBalance={currentUser?.balance || 0} 
                history={topupRequests.filter(r => r.userId === currentUser?.userId)}
                currentUser={currentUser}
                promoCodes={promoCodes}
                isMaintenance={appConfig.featureMaintenance.topup}
                showToast={showToast}
              />
            </motion.div>
          )}

          {view === 'fan_economy' && (
            <motion.div 
              key="fan_economy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FanEconomy 
                users={users} 
                currentUser={currentUser!} 
                onInvest={handleInvest} 
              />
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {!currentUser ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                    <User size={40} className="text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase italic">Join the Arena</h2>
                    <p className="text-gray-400 text-sm">Login to track your progress and join matches.</p>
                  </div>
                  {isInstallable && (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                    >
                      <Smartphone size={20} /> Install App
                    </button>
                  )}
                  <div className="flex flex-col gap-3">
                    <NeonButton onClick={() => setView('login')} color="#f97316" className="w-full">Login</NeonButton>
                    <NeonButton onClick={() => setView('signup')} color="#8b5cf6" className="w-full">Sign Up</NeonButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <header className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="relative group">
                      <div className="w-20 h-20 bg-teal-500/20 rounded-2xl flex items-center justify-center overflow-hidden border-2" style={{ borderColor: shopItems.find(i => i.id === currentUser.equippedFrame)?.color || 'rgba(20, 184, 166, 0.3)' }}>
                        {appConfig.featureToggles?.metaverse ? (
                          <MetaverseAvatar parts={currentUser.avatarParts} />
                        ) : currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={40} className="text-teal-500" />
                        )}
                      </div>
                      <label 
                        className="absolute -bottom-2 -right-2 p-2 bg-orange-500 text-black rounded-lg shadow-xl transition-opacity cursor-pointer z-20"
                        title="Change Avatar"
                      >
                        <Edit size={14} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleAvatarSelect(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black uppercase italic tracking-tight leading-none" style={{ color: currentUser.equippedNameColor || 'inherit' }}>{currentUser.gameName}</h2>
                          <div className="flex items-center gap-1">
                            {shopItems.filter(i => i.type === 'badge' && currentUser.inventory?.includes(i.id)).map(badge => (
                              <div key={badge.id} title={badge.name} className="p-1 bg-white/5 rounded-md border border-white/10" style={{ color: badge.color }}>
                                <Award size={12} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {currentUser.isPro && <ShieldCheck size={18} className="text-teal-500" />}
                      </div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Player ID: {currentUser.userId}</p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => generateGamingCV(currentUser!)}
                          className="px-3 py-1 bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1"
                        >
                          <FileText size={10} /> Gaming CV
                        </button>
                          <button 
                            onClick={() => {
                              const skin = ((currentUser.avatarParts?.skin || 0) + 1) % 5;
                              const hair = ((currentUser.avatarParts?.hair || 0) + 1) % 10;
                              const shirt = ((currentUser.avatarParts?.shirt || 0) + 1) % 8;
                              const updatedUser = { ...currentUser, avatarParts: { skin, hair, shirt } };
                              const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
                              setUsers(updatedUsers);
                              setCurrentUser(updatedUser);
                              localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
                            }}
                            className="px-3 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-full"
                          >
                            Customize Avatar
                          </button>
                      </div>
                    </div>
                    <LogoutButton onLogout={logout} />
                  </header>

                  {/* Achievements & NFTs */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Award className="text-yellow-500" />
                        Achievements & NFTs
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Digital Collectibles</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {currentUser.achievementNFTs?.length === 0 ? (
                        <div className="col-span-full py-10 text-center bg-black/40 rounded-2xl border border-white/5 opacity-50">
                          <p className="text-[10px] font-black uppercase tracking-widest">No NFTs earned yet.</p>
                        </div>
                      ) : (
                        currentUser.achievementNFTs?.map(nft => (
                          <div key={nft.id} className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-3 group relative overflow-hidden">
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                              <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase italic truncate">{nft.name}</p>
                              <p className={`text-[8px] font-black uppercase tracking-widest ${
                                nft.rarity === 'Legendary' ? 'text-yellow-500' :
                                nft.rarity === 'Epic' ? 'text-purple-500' :
                                nft.rarity === 'Rare' ? 'text-blue-500' :
                                'text-gray-500'
                              }`}>{nft.rarity}</p>
                            </div>
                            <button 
                              onClick={() => setNftToSell(nft)}
                              className="w-full py-2 bg-white/5 hover:bg-orange-500 hover:text-black text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                            >
                              Sell NFT
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-teal-500 flex items-center gap-2">
                        <Award size={16} /> Achievement NFTs
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {currentUser.achievementNFTs && currentUser.achievementNFTs.length > 0 ? (
                          currentUser.achievementNFTs.map(nft => (
                            <div key={nft.id} className="flex flex-col items-center gap-2 shrink-0">
                              <div className="w-16 h-16 bg-white/5 rounded-2xl border border-teal-500/30 flex items-center justify-center p-2 group relative">
                                <img src={nft.imageUrl} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-white text-center w-16 truncate">{nft.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="w-full py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">No NFTs earned yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Squad Management Section */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                          <Users size={16} /> Advanced Team Management
                        </h3>
                        {currentUser.squadId && (
                          <div className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30">
                            Squad Member
                          </div>
                        )}
                      </div>

                      {!currentUser.squadId ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 text-center">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                              <Plus size={24} className="text-orange-500" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black uppercase tracking-tight">Create New Squad</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Start your own permanent team</p>
                            </div>
                            <button 
                              onClick={() => setShowSquadCreate(true)}
                              className="w-full py-3 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-orange-400 transition-all"
                            >
                              Create Squad
                            </button>
                          </div>

                          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 text-center">
                            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
                              <UserPlus size={24} className="text-teal-500" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black uppercase tracking-tight">Join Existing Squad</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Enter code to join your friends</p>
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="ENTER CODE"
                                value={squadJoinCode}
                                onChange={(e) => setSquadJoinCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-teal-500 transition-all uppercase font-black tracking-widest"
                              />
                              <button 
                                onClick={() => joinSquad(squadJoinCode)}
                                className="px-4 py-2 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-teal-400 transition-all"
                              >
                                Join
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {squads.find(s => s.id === currentUser.squadId) ? (
                            (() => {
                              const squad = squads.find(s => s.id === currentUser.squadId)!;
                              const isLeader = squad.leaderId === currentUser.userId;
                              return (
                                <div className="space-y-6">
                                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                    <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                                      <img src={squad.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      {isLeader && (
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                          <Camera size={24} />
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  const updatedSquad = { ...squad, logo: reader.result as string };
                                                  setSquads(squads.map(s => s.id === squad.id ? updatedSquad : s));
                                                  showToast('Squad logo updated!', 'success');
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-2">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">{squad.name}</h4>
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-black uppercase tracking-widest text-gray-500">
                                            Code: {squad.joinCode}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-400 italic max-w-md">{squad.description || 'No description set.'}</p>
                                      <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                        {isLeader ? (
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => {
                                                confirmAction('Disband Squad', 'Are you sure you want to permanently disband this squad?', disbandSquad);
                                              }}
                                              className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                                            >
                                              Disband Squad
                                            </button>
                                            <button 
                                              onClick={async () => {
                                                const jerseyDataUrl = await generateTeamJersey(squad.name, squad.logo);
                                                const link = document.createElement('a');
                                                link.href = jerseyDataUrl;
                                                link.download = `${squad.name}_Jersey.png`;
                                                link.click();
                                                showToast('Team Jersey Generated!', 'success');
                                              }}
                                              className="px-4 py-2 bg-teal-500/20 text-teal-500 border border-teal-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all flex items-center gap-2"
                                            >
                                              <Shirt size={14} /> Generate Jersey
                                            </button>
                                          </div>
                                        ) : (
                                          <button 
                                            onClick={() => {
                                              confirmAction('Leave Squad', 'Are you sure you want to leave this squad?', leaveSquad);
                                            }}
                                            className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                                          >
                                            Leave Squad
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                      <Users size={12} /> Squad Members ({squad.members.length}/4)
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {squad.members.map(memberId => {
                                        const member = users.find(u => u.userId === memberId);
                                        return (
                                          <div key={memberId} className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                              {member?.avatarUrl ? (
                                                <img src={member.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                              ) : (
                                                <User size={16} className="text-gray-600" />
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-[10px] font-black uppercase tracking-tight truncate">{member?.gameName || memberId}</p>
                                              <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">
                                                {squad.leaderId === memberId ? 'Leader' : 'Member'}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-sm text-red-500 font-black uppercase">Squad data missing. Please contact support.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Squad Create Modal */}
                    {showSquadCreate && (
                      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowSquadCreate(false)}
                          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Create Your Squad</h3>
                            <button onClick={() => setShowSquadCreate(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                              <X size={20} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Squad Name</label>
                              <input 
                                type="text" 
                                placeholder="ENTER SQUAD NAME"
                                value={newSquadData.name}
                                onChange={(e) => setNewSquadData({ ...newSquadData, name: e.target.value.toUpperCase() })}
                                className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-sm outline-none focus:border-red-600 transition-all font-black tracking-widest"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Description (Optional)</label>
                              <textarea 
                                placeholder="ENTER SQUAD DESCRIPTION"
                                value={newSquadData.description}
                                onChange={(e) => setNewSquadData({ ...newSquadData, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-sm outline-none focus:border-red-600 transition-all min-h-[100px] resize-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Squad Logo</label>
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                  {newSquadData.logo ? (
                                    <img src={newSquadData.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Users size={24} className="text-gray-600" />
                                  )}
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setNewSquadData({ ...newSquadData, logo: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] outline-none file:bg-orange-500 file:border-none file:rounded file:px-2 file:py-1 file:text-[8px] file:font-black file:uppercase file:mr-2"
                                />
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              if (!newSquadData.name) {
                                showToast('Please enter a squad name!', 'error');
                                return;
                              }
                              createSquad(newSquadData.name, newSquadData.logo, newSquadData.description);
                            }}
                            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-none shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Create Permanent Squad
                          </button>
                        </motion.div>
                      </div>
                    )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Balance</div>
                      <div className="text-xl font-black text-orange-500 italic">৳{currentUser.balance}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Winnings</div>
                      <div className="text-xl font-black text-teal-500 italic">৳{currentUser.winnings}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Matches</div>
                      <div className="text-xl font-black text-white italic">
                        {currentUser.totalMatches || 0}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Wins / Kills</div>
                      <div className="text-xl font-black text-white italic">
                        {currentUser.totalWins || 0} / {currentUser.totalKills || 0}
                      </div>
                    </div>
                  </div>

                  {/* Daily Check-in */}
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-3xl p-6 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-widest text-teal-500 flex items-center gap-2">
                        <Calendar size={16} /> Daily Check-in
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Claim ৳{appConfig.dailyRewardAmount} & {appConfig.dailyRewardXP} XP every day!</p>
                    </div>
                    <CreepyButton 
                      onClick={handleDailyCheckIn}
                      className="min-w-[8em]"
                    >
                      Claim
                    </CreepyButton>
                  </div>

                  {/* Inventory & Customization */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                      <Package size={16} /> My Inventory
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {shopItems.filter(item => currentUser.inventory?.includes(item.id)).length === 0 ? (
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center py-4 italic">Your inventory is empty. Visit the store!</p>
                      ) : (
                        shopItems.filter(item => currentUser.inventory?.includes(item.id)).map(item => {
                          const isEquipped = item.type === 'frame' ? currentUser.equippedFrame === item.id :
                                           item.type === 'name_color' ? currentUser.equippedNameColor === item.color :
                                           false;
                          
                          return (
                            <div key={item.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center" style={{ color: item.color }}>
                                  {item.type === 'frame' && <div className="w-8 h-8 rounded-full border-2" style={{ borderColor: item.color }} />}
                                  {item.type === 'badge' && <Award size={24} />}
                                  {item.type === 'name_color' && <Edit2 size={24} />}
                                  {item.type === 'entry_card' && <Ticket size={24} />}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase italic">{item.name}</h4>
                                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{item.type.replace('_', ' ')}</p>
                                </div>
                              </div>
                              
                              {['frame', 'name_color'].includes(item.type) && (
                                <button 
                                  onClick={() => equipItem(item.id)}
                                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    isEquipped 
                                    ? 'bg-teal-500 text-black' 
                                    : 'bg-white/5 text-white hover:bg-white/10'
                                  }`}
                                >
                                  {isEquipped ? 'Equipped' : 'Equip'}
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                      <Zap size={16} /> Redeem Promo Code
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      redeemPromoCode(formData.get('promo') as string);
                      e.currentTarget.reset();
                    }} className="flex gap-2">
                      <input 
                        name="promo" 
                        placeholder="ENTER CODE" 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none uppercase font-black tracking-widest"
                      />
                      <button type="submit" className="px-6 py-3 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 active:scale-95 transition-all">
                        Apply
                      </button>
                    </form>
                  </div>

                  {/* Gamer Credit Score */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                        <Target size={16} /> Gamer Credit Score
                      </h3>
                      <div className="px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                        <span className="text-xs font-black text-orange-500">{currentUser.creditScore} pts</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Credit Limit</span>
                        <span className="text-white">৳{currentUser.creditScore >= 500 ? '500' : '0'}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentUser.creditScore / 1000) * 100}%` }}
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                        Maintain a score above 500 to unlock instant loans for tournament entries. Your score increases with every match played and fair play behavior.
                      </p>
                      
                      {currentUser.creditScore >= 500 && currentUser.loanAmount === 0 && (
                        <button 
                          onClick={() => {
                            confirmAction(
                              'Borrow Coins',
                              'Borrow ৳100 for your next match? This will be deducted from your next winning.',
                              () => handleLoan(100)
                            );
                          }}
                          className="w-full py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                        >
                          Get Instant ৳100 Loan
                        </button>
                      )}
                      
                      {currentUser.loanAmount > 0 && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Active Loan</p>
                            <p className="text-sm font-black text-white">৳{currentUser.loanAmount}</p>
                          </div>
                          <button 
                            onClick={() => {
                              if (currentUser.balance < currentUser.loanAmount) {
                                showToast("Insufficient balance to repay loan.", "error");
                                return;
                              }
                              const updatedUser = {
                                ...currentUser,
                                balance: currentUser.balance - currentUser.loanAmount,
                                loanAmount: 0,
                                creditScore: currentUser.creditScore + 20 // Repaying increases score
                              };
                              const updatedUsers = users.map(u => u.userId === currentUser.userId ? updatedUser : u);
                              setUsers(updatedUsers);
                              setCurrentUser(updatedUser);
                              localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
                              showToast("Loan repaid successfully! Your credit score increased.", "success");
                            }}
                            className="px-4 py-2 bg-red-500 text-black font-black uppercase tracking-widest text-[10px] rounded-lg"
                          >
                            Repay Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Referral System */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                          <Share2 size={16} /> Referral Program
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Invite friends & earn ৳50 bonus!</p>
                      </div>
                      <div className="bg-orange-500 text-black px-3 py-1 rounded-lg font-black text-xs italic">
                        {currentUser.referralCode}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(currentUser.referralCode);
                          showToast('Referral code copied!', 'success');
                        }}
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        Copy Code
                      </button>
                      <button 
                        onClick={() => setView('affiliate')}
                        className="flex-1 py-3 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                      >
                        <Zap size={14} /> Affiliate
                      </button>
                    </div>
                    <button 
                      onClick={() => setView('sponsorship')}
                      className="w-full py-3 bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Shield size={14} /> Sponsorship Marketplace
                    </button>
                  </div>
                  {/* NFT Badges */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                        <Trophy size={16} /> NFT Trophy Badges
                      </h3>
                      <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Marketplace</button>
                    </div>
                    <NFTBadges badges={nftBadges.filter(b => b.ownerId === currentUser.userId)} />
                    {nftBadges.filter(b => b.ownerId === currentUser.userId).length === 0 && (
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center py-4">Win tournaments to earn NFT trophies</p>
                    )}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-orange-500/20 rotate-3">
                          <Star size={28} className="fill-black" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Current Level</div>
                          <div className="text-2xl font-black text-white italic tracking-tighter uppercase">Level {currentUser.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Total XP</div>
                        <div className="text-xl font-black text-orange-500 italic tracking-tighter">{currentUser.xp} XP</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Progress to Level {currentUser.level + 1}</span>
                        <span>{currentUser.xp % 100}%</span>
                      </div>
                      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${currentUser.xp % 100}%` }}
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-center italic">Play more matches to level up and unlock rewards!</p>
                    </div>
                  </div>

                  {/* Bio & Social Links */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-teal-500 flex items-center gap-2">
                      <Edit2 size={16} /> Gamer Bio & Socials
                    </h3>
                    <div className="space-y-3">
                      <textarea 
                        value={currentUser.bio || ''}
                        onChange={(e) => updateProfile({ bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none h-20 resize-none text-white"
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                          <Facebook size={16} className="text-blue-500" />
                          <input 
                            value={currentUser.socialLinks?.facebook || ''}
                            onChange={(e) => updateProfile({ socialLinks: { ...currentUser.socialLinks, facebook: e.target.value } })}
                            placeholder="Facebook URL"
                            className="bg-transparent border-none outline-none text-xs flex-1 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                          <Youtube size={16} className="text-red-500" />
                          <input 
                            value={currentUser.socialLinks?.youtube || ''}
                            onChange={(e) => updateProfile({ socialLinks: { ...currentUser.socialLinks, youtube: e.target.value } })}
                            placeholder="YouTube URL"
                            className="bg-transparent border-none outline-none text-xs flex-1 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                          <Instagram size={16} className="text-pink-500" />
                          <input 
                            value={currentUser.socialLinks?.instagram || ''}
                            onChange={(e) => updateProfile({ socialLinks: { ...currentUser.socialLinks, instagram: e.target.value } })}
                            placeholder="Instagram URL"
                            className="bg-transparent border-none outline-none text-xs flex-1 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trophy Cabinet */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                      <Trophy className="text-orange-500" />
                      Achievement Hall (Trophy Cabinet)
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(!currentUser.trophies || currentUser.trophies.length === 0) ? (
                        <p className="col-span-3 text-center py-8 text-gray-500 text-[10px] uppercase font-black tracking-widest italic border border-white/5 rounded-2xl">No trophies earned yet. Win matches to fill your cabinet!</p>
                      ) : (
                        currentUser.trophies.map((trophy, idx) => (
                          <motion.div 
                            key={trophy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-2xl p-3 text-center space-y-2 group relative"
                          >
                            <div className="absolute inset-0 bg-orange-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img 
                              src={trophy.imageUrl} 
                              alt={trophy.name} 
                              className="w-12 h-12 mx-auto drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black uppercase tracking-tighter text-orange-500 truncate">{trophy.name}</p>
                              <p className="text-[7px] text-gray-500 uppercase font-bold truncate">{trophy.matchName}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Inventory Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                      <ShoppingBag className="text-orange-500" />
                      My Inventory
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {!currentUser.inventory || currentUser.inventory.length === 0 ? (
                        <p className="col-span-2 text-center py-8 text-gray-500 text-sm italic border border-white/5 rounded-2xl">Your inventory is empty. Visit the Store!</p>
                      ) : (
                        currentUser.inventory.map((itemId, idx) => {
                          const item = shopItems.find(i => i.id === itemId);
                          if (!item) return null;
                          return (
                            <div key={`${itemId}-${idx}`} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.type.replace('_', ' ')}</div>
                                {item.type === 'frame' && (
                                  <button 
                                    onClick={() => equipFrame(currentUser.equippedFrame === item.id ? undefined : item.id)}
                                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${
                                      currentUser.equippedFrame === item.id ? 'bg-orange-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                  >
                                    {currentUser.equippedFrame === item.id ? 'Equipped' : 'Equip'}
                                  </button>
                                )}
                                {item.type === 'name_color' && (
                                  <button 
                                    onClick={() => equipNameColor(currentUser.equippedNameColor === item.color ? undefined : item.color)}
                                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${
                                      currentUser.equippedNameColor === item.color ? 'bg-orange-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                  >
                                    {currentUser.equippedNameColor === item.color ? 'Equipped' : 'Equip'}
                                  </button>
                                )}
                              </div>
                              <div className="text-xs font-black uppercase italic tracking-tight truncate">{item.name}</div>
                              <div className="h-16 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                                {item.type === 'frame' && (
                                  <div className="w-10 h-10 rounded-full border-2" style={{ borderColor: item.color }} />
                                )}
                                {item.type === 'badge' && (
                                  <Award size={24} style={{ color: item.color }} />
                                )}
                                {item.type === 'entry_card' && (
                                  <Ticket size={24} className="text-teal-500" />
                                )}
                                {item.type === 'name_color' && (
                                  <div className="text-sm font-black uppercase italic" style={{ color: item.color }}>
                                    Name
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="https://wa.me/yournumber" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-[#25D366]/20 transition-all"
                    >
                      <MessageSquare className="text-[#25D366]" size={20} />
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">WhatsApp</div>
                        <div className="text-[9px] text-gray-400 font-bold">Direct Support</div>
                      </div>
                    </a>
                    <a 
                      href="https://t.me/yourusername" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#0088cc]/10 border border-[#0088cc]/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-[#0088cc]/20 transition-all"
                    >
                      <ExternalLink className="text-[#0088cc]" size={20} />
                      <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#0088cc]">Telegram</div>
                        <div className="text-[9px] text-gray-400 font-bold">Join Channel</div>
                      </div>
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <Trophy className="text-orange-500" />
                        Joined Matches
                      </h3>
                      <button onClick={() => setView('results')} className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:underline">View Results</button>
                    </div>
                    <div className="space-y-2">
                      {matches.filter(m => m.joinedPlayers.some(p => p.userId === currentUser.userId)).length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm italic border border-white/5 rounded-2xl">No matches joined yet.</p>
                      ) : (
                        matches.filter(m => m.joinedPlayers.some(p => p.userId === currentUser.userId)).map(m => (
                          <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                            <div>
                              <div className="text-sm font-bold uppercase italic flex items-center gap-2">
                                {m.name}
                                {m.isScrim && <span className="text-[8px] px-1 bg-purple-500/20 text-purple-500 rounded font-black">Scrim</span>}
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-widest">{m.map} • {m.time}</div>
                              {m.isRoomPublished && (
                                <div className="mt-2 flex gap-3">
                                  <div className="bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded">
                                    <span className="text-[8px] text-gray-500 uppercase font-black block">ID</span>
                                    <span className="text-[10px] font-mono font-black text-white">{m.roomId || 'TBA'}</span>
                                  </div>
                                  <div className="bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded">
                                    <span className="text-[8px] text-gray-500 uppercase font-black block">Pass</span>
                                    <span className="text-[10px] font-mono font-black text-white">{m.roomPassword || 'TBA'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-teal-500/20 text-teal-500">
                              Joined
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                      <History className="text-orange-500" />
                      Payment History
                    </h3>
                    <div className="space-y-2">
                      {payments.filter(p => p.userId === currentUser.userId).length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm italic">No payment history found.</p>
                      ) : (
                        payments.filter(p => p.userId === currentUser.userId).map(p => (
                          <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                            <div>
                              <div className="text-sm font-bold uppercase italic">৳{p.amount} via {p.method}</div>
                              <div className="text-[10px] text-gray-500 font-mono">{p.trxId}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.status === 'approved' && (
                                <button 
                                  onClick={() => generateInvoice(p, currentUser!)}
                                  className="p-2 bg-white/5 rounded-lg text-teal-500 hover:bg-white/10 transition-all"
                                  title="Download Receipt"
                                >
                                  <FileText size={16} />
                                </button>
                              )}
                              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                p.status === 'approved' ? 'bg-teal-500/20 text-teal-500' :
                                p.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                'bg-orange-500/20 text-orange-500'
                              }`}>
                                {p.status}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                      <Smartphone className="text-orange-500" />
                      Mobile App
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-500 shrink-0">
                          <Download size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">How to install on Android</p>
                          <p className="text-[10px] text-gray-400 mt-1">Click the "Install Android App" button below or look for "Add to Home Screen" in your Chrome menu.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">How to install on iOS (iPhone)</p>
                          <p className="text-[10px] text-gray-400 mt-1">Tap the <span className="text-orange-500 font-black">Share</span> button in Safari and select <span className="text-orange-500 font-black">"Add to Home Screen"</span>.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isInstallable && (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full py-4 bg-teal-500/10 border border-teal-500/20 text-teal-500 font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-2 hover:bg-teal-500/20 transition-all mt-6"
                    >
                      <Smartphone size={20} /> Install Android App
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {view === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {appConfig.featureMaintenance.leaderboard ? (
                <MaintenanceOverlay />
              ) : (
                <>
                  <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-end gap-3">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Warriors Hall</h1>
                    <p className="text-gray-400 text-sm font-medium">The best of the best in the arena.</p>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                    title="Share Leaderboard"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setLeaderboardTab('winnings')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${leaderboardTab === 'winnings' ? 'bg-orange-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    Winnings
                  </button>
                  <button 
                    onClick={() => setLeaderboardTab('kills')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${leaderboardTab === 'kills' ? 'bg-red-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    Kills
                  </button>
                  <button 
                    onClick={() => setLeaderboardTab('referrals')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${leaderboardTab === 'referrals' ? 'bg-teal-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    Referrals
                  </button>
                  <button 
                    onClick={handleShare}
                    className="px-4 py-2 text-gray-400 hover:text-orange-500 transition-all"
                    title="Share Leaderboard"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </header>

              <div className="glass border border-white/10 rounded-none overflow-hidden glow-violet/5 relative">
                {/* HUD Decorative Lines */}
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <div className="absolute top-0 right-0 w-1 h-full bg-primary/20" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-transparent to-primary/50" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-transparent to-primary/50" />
                
                <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 grid grid-cols-12 text-[10px] font-black uppercase tracking-[0.2em] text-primary text-glow-violet relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary" />
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-6">Warrior</div>
                  <div className="col-span-4 text-right">
                    {leaderboardTab === 'winnings' ? 'Winnings' : leaderboardTab === 'kills' ? 'Kills' : 'Referrals'}
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {[...users]
                    .sort((a, b) => {
                      if (leaderboardTab === 'winnings') return (b.winnings || 0) - (a.winnings || 0);
                      if (leaderboardTab === 'kills') return (b.totalKills || 0) - (a.totalKills || 0);
                      return (b.referralCount || 0) - (a.referralCount || 0);
                    })
                    .slice(0, 20)
                    .map((user, index) => (
                    <div key={user.userId} className={`px-6 py-5 grid grid-cols-12 items-center transition-all hover:bg-primary/5 group ${user.userId === currentUser?.userId ? 'bg-primary/10 border-l-2 border-primary' : ''}`}>
                      <div className="col-span-2">
                        <div className={`w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-black border skew-x-[-12deg] transition-all group-hover:scale-110 ${
                          index === 0 ? 'bg-primary border-primary text-black glow-violet' :
                          index === 1 ? 'bg-secondary border-secondary text-black glow-cyan' :
                          index === 2 ? 'bg-accent border-accent text-black' :
                          'border-white/10 text-gray-500 bg-white/5'
                        }`}>
                          <span className="skew-x-[12deg]">{index + 1}</span>
                        </div>
                      </div>
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/40 border border-white/10 rounded-none flex items-center justify-center overflow-hidden relative group-hover:border-primary/50 transition-colors">
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User size={20} className="text-gray-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{user.gameName}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (user.level || 1) * 10)}%` }} />
                            </div>
                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">LVL {user.level || 1}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`col-span-4 text-right font-black italic tracking-tight text-lg ${
                        leaderboardTab === 'winnings' ? 'text-primary text-glow-violet' : 
                        leaderboardTab === 'kills' ? 'text-red-500' : 
                        'text-secondary text-glow-cyan'
                      }`}>
                        {leaderboardTab === 'winnings' ? `৳${user.winnings || 0}` : 
                         leaderboardTab === 'kills' ? `${user.totalKills || 0}` : 
                         `${user.referralCount || 0}`}
                        <span className="text-[8px] ml-1 uppercase not-italic opacity-50">
                          {leaderboardTab === 'winnings' ? 'BDT' : leaderboardTab === 'kills' ? 'KILLS' : 'REFS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

          {view === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {appConfig.featureMaintenance.notifications ? (
                <MaintenanceOverlay />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <header className="space-y-1">
                      <h1 className="text-4xl font-black tracking-tighter uppercase italic">Alerts</h1>
                      <p className="text-gray-400 text-sm font-medium">Stay updated with the latest news.</p>
                    </header>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const updated = notifications.map(n => 
                            (n.userId === 'all' || n.userId === currentUser?.userId) ? { ...n, isRead: true } : n
                          );
                          setNotifications(updated);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:underline"
                      >
                        Mark all as read
                      </button>
                      <button 
                        onClick={handleShare}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-orange-500"
                        title="Share App"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notifications.filter(n => n.userId === 'all' || n.userId === currentUser?.userId).length === 0 ? (
                      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <Bell className="mx-auto text-gray-700 mb-4" size={48} />
                        <p className="text-gray-500 text-sm font-bold uppercase italic">No notifications yet.</p>
                      </div>
                    ) : (
                      [...notifications]
                        .filter(n => n.userId === 'all' || n.userId === currentUser?.userId)
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map(n => (
                          <div 
                            key={n.id} 
                            className={`p-5 rounded-2xl border transition-all ${
                              n.isRead ? 'bg-white/5 border-white/10 opacity-60' : 'bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-black uppercase italic tracking-tight">{n.title}</h4>
                              <span className="text-[9px] font-mono text-gray-500">{new Date(n.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed mb-3">{n.message}</p>
                            {!n.isRead && (
                              <button 
                                onClick={() => {
                                  const updated = notifications.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif);
                                  setNotifications(updated);
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-orange-500"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'spin' && (
            <motion.div 
              key="spin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-black uppercase italic">Daily Spin</h2>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4">
                <SpinWheel 
                  onSpin={handleSpin} 
                  lastSpinDate={currentUser?.lastSpinDate} 
                  prizes={appConfig.spinPrizes} 
                  isMaintenance={appConfig.featureMaintenance.spin}
                />
              </div>
            </motion.div>
          )}

          {view === 'support' && (
            <motion.div 
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-[calc(100vh-12rem)]"
            >
              {appConfig.featureMaintenance.support ? (
                <MaintenanceOverlay />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setView('home')} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <ChevronLeft size={24} />
                      </button>
                      <h2 className="text-2xl font-black uppercase italic">Live Support</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full hover:bg-orange-500/20 transition-all duration-200"
                      >
                        <Share2 size={12} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Share</span>
                      </button>
                      <button 
                        onClick={() => setView('report')}
                        className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all duration-200"
                      >
                        <Flag size={12} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Report</span>
                      </button>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Status Card */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black">
                        <ExternalLink size={24} />
                      </div>
                      <div>
                        <h3 className="font-black uppercase tracking-widest italic">App is Live!</h3>
                        <p className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest">Version 1.0.0 Stable</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Welcome to RK Tournament! Our platform is now fully operational. Share the app with your friends and start earning rewards today.
                    </p>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Status</p>
                        <div className="text-xs text-teal-500 font-bold flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                          Operational
                        </div>
                      </div>
                      <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Server</p>
                        <p className="text-xs text-white font-bold">Asia-East1</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                    {messages.filter(m => m.senderId === currentUser?.userId || m.receiverId === currentUser?.userId).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                          <MessageSquare size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black uppercase italic">No messages yet</p>
                          <p className="text-xs font-medium">Send a message to start a conversation with admin.</p>
                        </div>
                      </div>
                    ) : (
                      messages
                        .filter(m => m.senderId === currentUser?.userId || m.receiverId === currentUser?.userId)
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === currentUser?.userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.senderId === currentUser?.userId ? 'bg-orange-500 text-black rounded-tr-none' : 'bg-white/5 border border-white/10 text-white rounded-tl-none'}`}>
                              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                              <p className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-50 ${msg.senderId === currentUser?.userId ? 'text-black' : 'text-white'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="mt-6 relative">
                    <input 
                      type="text"
                      placeholder="Type your message..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-orange-500 transition-all font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleSendMessage(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          handleSendMessage(input.value);
                          input.value = '';
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'report' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('support')} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-black uppercase italic text-red-500">Submit Report</h2>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Report Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['bug', 'player', 'other'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const form = document.getElementById('report-form') as HTMLFormElement;
                          const input = form.querySelector('input[name="type"]') as HTMLInputElement;
                          input.value = type;
                          // Force re-render for active state
                          const buttons = form.querySelectorAll('.type-btn');
                          buttons.forEach(b => b.classList.remove('bg-red-500', 'text-black'));
                          buttons.forEach(b => b.classList.add('bg-white/5', 'text-white'));
                          const btn = document.getElementById(`type-${type}`);
                          btn?.classList.remove('bg-white/5', 'text-white');
                          btn?.classList.add('bg-red-500', 'text-black');
                        }}
                        id={`type-${type}`}
                        className={`type-btn py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${type === 'bug' ? 'bg-red-500 text-black' : 'bg-white/5 text-white'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <form id="report-form" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const type = formData.get('type') as 'bug' | 'player' | 'other';
                  const title = formData.get('title') as string;
                  const description = formData.get('description') as string;

                  if (!title || !description) {
                    showToast('Please fill all fields', 'error');
                    return;
                  }

                  const newReport: UserReport = {
                    id: Math.random().toString(36).substr(2, 9),
                    userId: currentUser?.userId || '',
                    gameName: currentUser?.gameName || '',
                    userName: currentUser?.gameName || '',
                    type: type as string,
                    title,
                    description,
                    status: 'pending',
                    timestamp: Date.now()
                  };

                  setUserReports([newReport, ...userReports]);
                  showToast('Report submitted successfully!', 'success');
                  setView('support');
                }} className="space-y-4">
                  <input type="hidden" name="type" defaultValue="bug" />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Title</label>
                    <input 
                      name="title"
                      type="text" 
                      placeholder="Brief summary of the issue"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Description</label>
                    <textarea 
                      name="description"
                      placeholder="Provide more details..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-red-500 text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Submit Report
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase italic ml-4">Your Recent Reports</h3>
                {userReports.filter(r => r.userId === currentUser?.userId).length === 0 ? (
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center opacity-50">
                    <p className="text-xs font-bold uppercase tracking-widest">No reports yet</p>
                  </div>
                ) : (
                  userReports
                    .filter(r => r.userId === currentUser?.userId)
                    .map(report => (
                      <div key={report.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            report.type === 'bug' ? 'bg-blue-500/20 text-blue-500' :
                            report.type === 'player' ? 'bg-red-500/20 text-red-500' :
                            'bg-orange-500/20 text-orange-500'
                          }`}>
                            {report.type}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            report.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="font-black uppercase italic text-sm">{report.title}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-2">{report.description}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'affiliate' && (
            <motion.div 
              key="affiliate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header className="flex items-center gap-4">
                <button onClick={() => setView('profile')} className="p-2 bg-white/5 rounded-xl">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Affiliate Dashboard</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Partner Program</p>
                </div>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Referrals</p>
                  <p className="text-2xl font-black text-orange-500 italic">{currentUser?.affiliateStats?.totalReferrals || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Earnings</p>
                  <p className="text-2xl font-black text-teal-500 italic">৳{currentUser?.affiliateStats?.totalEarnings || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-black border border-orange-500/20 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Your Referral Link</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Share this to earn ৳10 per user</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-gray-400 overflow-hidden whitespace-nowrap">
                    {window.location.origin}/signup?ref={currentUser?.userId}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${currentUser?.userId}`);
                      showToast("Referral link copied!", "success");
                    }}
                    className="p-3 bg-orange-500 text-black rounded-xl"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                  <History size={16} /> Recent Referrals
                </h3>
                <div className="space-y-4">
                  {users.filter(u => u.refBy === currentUser?.userId).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs font-bold uppercase tracking-widest">No referrals yet</div>
                  ) : (
                    users.filter(u => u.refBy === currentUser?.userId).map(u => (
                      <div key={u.userId} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-white">{u.gameName}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Joined {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-xs font-black text-teal-500">+৳10</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'sponsorship' && (
            <motion.div 
              key="sponsorship"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header className="flex items-center gap-4">
                <button onClick={() => setView('profile')} className="p-2 bg-white/5 rounded-xl">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Sponsorship Marketplace</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Connect with top teams</p>
                </div>
              </header>

              <div className="space-y-4">
                {sponsorships.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-gray-700">
                      <Shield size={40} />
                    </div>
                    <p className="text-sm text-gray-500 font-black uppercase tracking-widest italic">No teams looking for sponsors right now</p>
                  </div>
                ) : (
                  sponsorships.map(s => (
                    <div key={s.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-all" />
                      <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase italic tracking-tight text-white">{s.teamName}</h3>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Team ID: {s.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                          s.status === 'open' ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
                        }`}>
                          {s.status}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 font-medium leading-relaxed relative z-10">{s.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Sponsorship Goal</p>
                          <p className="text-lg font-black text-teal-500 italic">৳{s.amount}</p>
                        </div>
                        {s.status === 'open' ? (
                          <button 
                            onClick={() => {
                              const name = window.prompt("Enter your company/brand name:");
                              if (name) handleSponsorship(s.id, name, s.amount);
                            }}
                            className="px-6 py-3 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
                          >
                            Sponsor Team
                          </button>
                        ) : (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Sponsored By</p>
                            <p className="text-sm font-black text-white italic">{s.sponsorName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'teamfinder' && currentUser && (
          <TeamFinderView 
            posts={teamFinderPosts}
            currentUser={currentUser}
            onBack={() => setView('home')}
            onAddPost={(post) => {
              const newPost: TeamFinderPost = {
                ...post,
                id: Math.random().toString(36).substr(2, 9),
                userId: currentUser.userId,
                gameName: currentUser.gameName,
                timestamp: Date.now(),
                squadName: currentUser.squadName,
                squadLogo: currentUser.squadLogo
              };
              setTeamFinderPosts([newPost, ...teamFinderPosts]);
              syncData({ teamFinderPosts: [newPost, ...teamFinderPosts] });
            }}
          />
        )}
        {view === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {appConfig.featureMaintenance.results ? (
                <MaintenanceOverlay />
              ) : (
                <>
                  <header className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Battle Reports</h1>
                    <p className="text-gray-400 text-sm font-medium">Check the results of past matches.</p>
                  </header>

                  <div className="space-y-4">
                    {matchResults.length === 0 ? (
                      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                        <Trophy className="mx-auto text-gray-700 mb-4" size={48} />
                        <p className="text-gray-500 text-sm font-bold uppercase italic">No results published yet.</p>
                      </div>
                    ) : (
                      [...matchResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(result => (
                        <div key={result.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                          <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-black uppercase italic tracking-tight">{result.matchName}</h3>
                              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{result.date}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Total Prize</div>
                              <div className="text-xl font-black italic">৳{result.totalPrize}</div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Top Performers</h4>
                              {result.winners.map((winner, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                                      idx === 0 ? 'bg-yellow-500 text-black' :
                                      idx === 1 ? 'bg-gray-300 text-black' :
                                      idx === 2 ? 'bg-orange-400 text-black' :
                                      'bg-white/10 text-white'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <span className="text-sm font-bold uppercase italic">{winner.playerName}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-teal-500 font-black uppercase tracking-widest">{winner.kills} Kills</div>
                                    <div className="text-xs font-black italic text-orange-500">৳{winner.prize}</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {result.aiCommentary && (
                              <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bot size={16} className="text-orange-500" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">AI Match Commentary</span>
                                </div>
                                <p className="text-xs text-gray-400 italic leading-relaxed">"{result.aiCommentary}"</p>
                              </div>
                            )}

                            {currentUser && result.winners.some(w => w.gameName === currentUser.gameName) && (
                              <div className="mt-8 flex flex-col items-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-4 flex items-center gap-2">
                                  <Medal size={14} /> You were a winner! Here's your performance card:
                                </div>
                                <ESportsCard user={currentUser} matchResult={result} />
                                <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                  <Download size={14} /> Download Card
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <header className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Achievements</h1>
                <p className="text-gray-400 text-sm font-medium">Your milestones and rewards in the arena.</p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'First Blood', desc: 'Join your first match', icon: <Trophy size={24} />, unlocked: matches.some(m => m.joinedPlayers.some(p => p.userId === currentUser?.userId)) },
                  { title: 'Big Spender', desc: 'Add ৳500+ to wallet', icon: <Wallet size={24} />, unlocked: payments.filter(p => p.userId === currentUser?.userId && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0) >= 500 },
                  { title: 'Winner Circle', desc: 'Win your first prize', icon: <Award size={24} />, unlocked: (currentUser?.winnings || 0) > 0 },
                  { title: 'Recruiter', desc: 'Refer a friend', icon: <Share2 size={24} />, unlocked: users.some(u => u.referredBy === currentUser?.referralCode) },
                ].map((ach, idx) => (
                  <div key={idx} className={`p-6 rounded-3xl border transition-all ${ach.unlocked ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${ach.unlocked ? 'bg-orange-500 text-black' : 'bg-white/10 text-gray-500'}`}>
                      {ach.icon}
                    </div>
                    <h3 className="font-black uppercase italic tracking-tight mb-1">{ach.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">{ach.desc}</p>
                    {ach.unlocked && (
                      <div className="mt-4 text-[8px] font-black uppercase tracking-widest text-teal-500 flex items-center gap-1">
                        <ShieldCheck size={10} /> Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'admin' && !adminSession && (
            <motion.div 
              key="access-denied"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                <ShieldAlert size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-red-500">Access Denied</h2>
                <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">You do not have the necessary permissions to access the command center.</p>
              </div>
              <button 
                onClick={() => setView('home')}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Return to Base
              </button>
            </motion.div>
          )}

          {view === 'admin' && adminSession && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {adminSubView !== 'dashboard' && (
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                      {adminSubView === 'dashboard' ? 'Admin Command' : adminSubView.charAt(0).toUpperCase() + adminSubView.slice(1)}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                      {adminSubView === 'dashboard' ? 'Manage the arena and its warriors.' : `Control ${adminSubView} settings and data.`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-orange-500">
                    <Share2 size={20} />
                  </button>
                  <button onClick={() => setView('profile')} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                    <User size={20} />
                  </button>
                  <LogoutButton onLogout={handleAdminLogout} />
                </div>
              </header>

              {adminSubView === 'dashboard' && (
                <div className="space-y-8">
                  {isSuspiciousActivity && suspiciousUser && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 animate-pulse" />
                      <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-black animate-bounce relative z-10">
                        <ShieldAlert size={32} />
                      </div>
                      <div className="flex-1 relative z-10">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-red-500">Suspicious Activity Detected!</h3>
                        <p className="text-sm text-gray-300 font-bold uppercase tracking-wide">
                          User <span className="text-white">@{suspiciousUser.userId}</span> has an unusually high win rate ({((suspiciousUser.totalWins / suspiciousUser.totalMatches) * 100).toFixed(1)}%).
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingUser(suspiciousUser);
                          setIsSuspiciousActivity(false);
                        }}
                        className="px-6 py-3 bg-red-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all relative z-10"
                      >
                        Investigate
                      </button>
                    </motion.div>
                  )}

                  {users.some(u => (u.fakeTrxCount || 0) >= 3) && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 animate-pulse" />
                      <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-black animate-bounce relative z-10">
                        <ShieldAlert size={32} />
                      </div>
                      <div className="flex-1 relative z-10">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-red-500">Fraud Alert!</h3>
                        <p className="text-sm text-gray-300 font-bold uppercase tracking-wide">
                          Multiple users have been flagged for fake transactions.
                        </p>
                      </div>
                      <button 
                        onClick={() => setAdminSubView('reports')}
                        className="px-6 py-3 bg-red-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all relative z-10"
                      >
                        View Fraudsters
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Users</div>
                      <div className="text-2xl font-black text-red-600 italic">{users.length}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Matches</div>
                      <div className="text-2xl font-black text-red-600 italic">{matches.length}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Pending Pay</div>
                      <div className="text-2xl font-black text-red-600 italic">{payments.filter(p => p.status === 'pending').length}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Pending With</div>
                      <div className="text-2xl font-black text-red-600 italic">{withdrawRequests.filter(w => w.status === 'pending').length}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LiveUserHeatmap users={users} />
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                        <BarChart3 size={16} /> Real-time Profit Meter
                      </h3>
                      <ProfitGraph payments={payments} withdraws={withdrawRequests} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                        <Activity size={16} /> Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {notifications.slice(0, 5).map(notif => (
                          <div key={notif.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center text-red-600">
                              <Bell size={14} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] text-white font-bold uppercase tracking-tight">{notif.text}</p>
                              <p className="text-[8px] text-gray-500 uppercase font-black">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Driven Features (Conceptual) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-teal-500/10 to-black border border-teal-500/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-teal-500/10 transition-all" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-500 border border-teal-500/30">
                          <Cpu size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase italic tracking-widest">Self-Healing Server</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                          <span>System Health</span>
                          <span className="text-teal-500">99.9% Optimal</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '99.9%' }}
                            className="h-full bg-teal-500"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">AI is monitoring logs and auto-patching minor bugs in real-time.</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-black border border-orange-500/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-all" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/30">
                          <ShieldAlert size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase italic tracking-widest">Bot-Killer Firewall</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                          <span>Threat Level</span>
                          <span className="text-orange-500">Low (AI Protected)</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '15%' }}
                            className="h-full bg-orange-500"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">Neural network identifying and blocking suspicious traffic patterns.</p>
                    </div>

                    <div 
                      onClick={() => setAdminSubView('ip_bans')}
                      className="bg-gradient-to-br from-red-500/10 to-black border border-red-500/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group cursor-pointer hover:border-red-500/40 transition-all"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-red-500/10 transition-all" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 border border-red-500/30">
                          <ShieldAlert size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase italic tracking-widest">IP Ban Control</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                          <span>Banned IPs</span>
                          <span className="text-red-500">{appConfig.ipBanList?.length || 0} Blocked</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">Manually block malicious IP addresses from accessing the platform.</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500/10 to-black border border-pink-500/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-pink-500/10 transition-all" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 border border-pink-500/30">
                          <Mic size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase italic tracking-widest">AI Support Voice-bot</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [4, 12, 4] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                              className="w-1 bg-pink-500 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-pink-500">Listening...</span>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">Multilingual AI handling user queries via voice and text 24/7.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'matches', label: 'Matches', icon: <Trophy size={20} />, color: 'text-orange-500' },
                      { id: 'users', label: 'Users', icon: <Users size={20} />, color: 'text-teal-500' },
                      { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, color: 'text-yellow-500' },
                      { id: 'withdraws', label: 'Withdraws', icon: <Wallet size={20} />, color: 'text-red-500' },
                      { id: 'support', label: 'Support', icon: <MessageSquare size={20} />, color: 'text-blue-500' },
                      { id: 'notifications', label: 'Alerts', icon: <Bell size={20} />, color: 'text-purple-500' },
                      { id: 'banners', label: 'Banners', icon: <ImageIcon size={20} />, color: 'text-pink-500' },
                      { id: 'spin', label: 'Spin Wheel', icon: <RefreshCw size={20} />, color: 'text-green-500' },
                      { id: 'promo', label: 'Promo Codes', icon: <Zap size={20} />, color: 'text-yellow-400' },
                      { id: 'settings', label: 'Settings', icon: <Settings size={20} />, color: 'text-gray-400' },
                      { id: 'balance', label: 'Balance', icon: <Plus size={20} />, color: 'text-emerald-500' },
                      { id: 'wallets', label: 'Wallets', icon: <Smartphone size={20} />, color: 'text-indigo-500' },
                      { id: 'reports', label: 'Reports', icon: <AlertCircle size={20} />, color: 'text-red-400' },
                      { id: 'templates', label: 'Templates', icon: <Copy size={20} />, color: 'text-orange-300' },
                      { id: 'logs', label: 'Logs', icon: <History size={20} />, color: 'text-gray-300' },
                      { id: 'auditor', label: 'Auditor', icon: <ShieldCheck size={20} />, color: 'text-teal-500' },
                      { id: 'squads', label: 'Squads', icon: <Users size={20} />, color: 'text-orange-500' },
                      { id: 'advanced', label: 'Advanced', icon: <Cpu size={20} />, color: 'text-red-500' },
                      { id: 'shop', label: 'Shop', icon: <ShoppingBag size={20} />, color: 'text-pink-500' },
                      { id: 'topup', label: 'Topup Req', icon: <Smartphone size={20} />, color: 'text-teal-500' },
                      { id: 'topup_packages', label: 'Topup Pkg', icon: <Smartphone size={20} />, color: 'text-pink-500' },
                      { id: 'maintenance', label: 'Maintenance', icon: <ShieldAlert size={20} />, color: 'text-red-500' },
                      { id: 'analytics', label: 'Analytics', icon: <ArrowUpRight size={20} />, color: 'text-teal-400' },
                      { id: 'announcements', label: 'Broadcasts', icon: <Megaphone size={20} />, color: 'text-orange-500' },
                      { id: 'leaderboard', label: 'Leaderboard', icon: <BarChart size={20} />, color: 'text-yellow-500' },
                      { id: 'activity', label: 'Activity', icon: <Activity size={20} />, color: 'text-pink-400' },
                      { id: 'missions', label: 'Missions', icon: <Target size={20} />, color: 'text-orange-500' },
                      { id: 'roadmap', label: 'Roadmap', icon: <Calendar size={20} />, color: 'text-teal-500' },
                      { id: 'moderator_activity', label: 'Mod Activity', icon: <Activity size={20} />, color: 'text-blue-400' },
                      { id: 'nfts', label: 'NFTs', icon: <Award size={20} />, color: 'text-yellow-500' },
                      { id: 'mystery_boxes', label: 'Mystery Boxes', icon: <Package size={20} />, color: 'text-purple-500' },
                      { id: 'sponsorships', label: 'Sponsorships', icon: <Handshake size={20} />, color: 'text-emerald-500' },
                      { id: 'voting', label: 'Map Voting', icon: <Globe size={20} />, color: 'text-blue-400' },
                      { id: 'theme', label: 'Theme Settings', icon: <Palette size={20} />, color: 'text-pink-400' },
                      { id: 'staff', label: 'Staff Control', icon: <ShieldCheck size={20} />, color: 'text-teal-500' },
                      { id: 'fraud_reports', label: 'Fraud Reports', icon: <ShieldAlert size={20} />, color: 'text-red-500' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setAdminSubView(item.id as any)}
                        className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all group"
                      >
                        <div className={`p-3 rounded-2xl bg-white/5 mb-3 group-hover:scale-110 transition-transform ${item.color}`}>
                          {item.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-red-500 uppercase tracking-tight">System Reset</div>
                      <div className="text-[10px] text-gray-500 uppercase">Clear all local storage data</div>
                    </div>
                    <button 
                      onClick={resetAllData}
                      className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Reset Data
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Sub-Views */}
              <div className="space-y-6">
                {adminSubView === 'activity' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Activity className="text-pink-400" />
                      Recent Activity Timeline
                    </h3>
                    <div className="space-y-4">
                      {transactionLogs.slice(0, 20).map((log, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <div className="w-px h-full bg-white/10" />
                          </div>
                          <div className="pb-6">
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                            <div className="text-sm font-black uppercase italic tracking-tight">{log.type} - {log.status}</div>
                            <div className="text-[10px] text-gray-400 italic">{log.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubView === 'leaderboard' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <BarChart className="text-yellow-500" />
                      Leaderboard Management
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-orange-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg">Top Earners</button>
                      <button className="flex-1 py-2 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-lg">Top Killers</button>
                    </div>
                    <div className="space-y-3">
                      {users.sort((a, b) => (b.totalWinnings || 0) - (a.totalWinnings || 0)).slice(0, 10).map((user, index) => (
                        <div key={user.userId} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-black text-orange-500 italic">#{index + 1}</div>
                            <div>
                              <div className="text-sm font-black uppercase italic tracking-tight">{user.gameName}</div>
                              <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">ID: {user.userId}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-teal-500 italic">৳{user.totalWinnings || 0}</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total Winnings</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubView === 'notifications' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <Bell className="text-orange-500" />
                    Send Notification
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newNotif: Notification = {
                      id: Math.random().toString(36).substr(2, 9),
                      userId: formData.get('target') as string,
                      title: formData.get('title') as string,
                      message: formData.get('message') as string,
                      type: 'info',
                      timestamp: Date.now(),
                      isRead: false
                    };
                    setNotifications([...notifications, newNotif]);
                    e.currentTarget.reset();
                    showToast('Notification sent!', 'success');
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target User ID (or 'all')</label>
                        <input name="target" defaultValue="all" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Title</label>
                        <input name="title" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Message</label>
                      <textarea name="message" required rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all resize-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                      Broadcast Message
                    </button>
                  </form>
                </div>
                )}

                {adminSubView === 'banners' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <ImageIcon className="text-orange-500" />
                    Banner Manager
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                    const file = fileInput.files?.[0];

                    const handleAddBanner = (imgUrl: string) => {
                      const newBanner: Banner = {
                        id: Date.now().toString(),
                        imageUrl: imgUrl,
                        title: formData.get('title') as string,
                        link: formData.get('link') as string,
                      };
                      setBanners([...banners, newBanner]);
                      e.currentTarget.reset();
                      showToast('Banner added!', 'success');
                    };

                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleAddBanner(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else if (formData.get('imageUrl')) {
                      handleAddBanner(formData.get('imageUrl') as string);
                    } else {
                      showToast('Please provide an image URL or upload a photo.', 'error');
                    }
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Banner Photo</label>
                        <div className="flex gap-2">
                          <input type="file" accept="image/*" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none file:bg-orange-500 file:border-none file:rounded file:px-2 file:py-1 file:text-[10px] file:font-black file:uppercase file:mr-4" />
                          <span className="text-gray-500 text-[10px] flex items-center">OR</span>
                          <input name="imageUrl" placeholder="Image URL" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Title (Optional)</label>
                        <input name="title" placeholder="Banner Title" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 text-black font-black uppercase italic tracking-tighter py-4 rounded-2xl hover:bg-orange-400 transition-all flex items-center justify-center gap-2">
                      <Plus size={20} /> Add Banner
                    </button>
                  </form>

                  <div className="grid gap-4 mt-6">
                    {banners.map(banner => (
                      <div key={banner.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <img src={banner.imageUrl} alt="" className="w-16 h-10 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                          <div>
                            <div className="text-sm font-black uppercase italic tracking-tight">{banner.title || 'No Title'}</div>
                            <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{banner.imageUrl}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setBanners(banners.filter(b => b.id !== banner.id))}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {adminSubView === 'support' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    <MessageSquare className="text-orange-500" />
                    Support Chat Manager
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {(Array.from(new Set((messages || []).map(m => m.senderId === 'admin' ? m.receiverId : m.senderId))) as string[]).map(userId => {
                      const userMessages = (messages || []).filter(m => m.senderId === userId || m.receiverId === userId);
                      const lastMessage = userMessages[userMessages.length - 1];
                      const user = users.find(u => u.userId === userId);
                      
                      return (
                        <div key={userId} className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-black uppercase italic">
                                {user?.gameName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-black uppercase italic tracking-tight">{user?.gameName || 'Unknown'}</div>
                                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">ID: {userId}</div>
                              </div>
                            </div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">
                              {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString() : ''}
                            </div>
                          </div>
                          
                          <div className="bg-white/5 rounded-xl p-3 space-y-2">
                            <p className="text-xs text-gray-400 italic">Last: {lastMessage?.text || 'No messages'}</p>
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                            if (input.value.trim()) {
                              handleAdminReply(userId, input.value);
                              input.value = '';
                            }
                          }} className="flex gap-2">
                            <input placeholder="Reply..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-orange-500 outline-none" />
                            <button type="submit" className="p-2 bg-orange-500 text-black rounded-xl hover:scale-105 transition-all">
                              <Send size={16} />
                            </button>
                          </form>
                        </div>
                      );
                    })}
                    {(messages || []).length === 0 && (
                      <p className="text-center py-8 text-gray-500 text-sm italic">No support messages yet.</p>
                    )}
                  </div>
                </div>
                )}

                {adminSubView === 'reports' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Flag className="text-red-500" />
                        User Reports
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setUserSearchTerm(userSearchTerm === 'is:pending' ? '' : 'is:pending')}
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                            userSearchTerm === 'is:pending' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-500 border border-white/10'
                          }`}
                        >
                          Pending
                        </button>
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500">
                          {userReports.filter(r => r.status === 'pending').length} Total Pending
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(userReports || []).filter(r => userSearchTerm === 'is:pending' ? r.status === 'pending' : true).length === 0 ? (
                        <div className="p-12 bg-white/5 border border-white/10 rounded-[2.5rem] text-center opacity-50">
                          <p className="text-xs font-bold uppercase tracking-widest">No reports matching filter</p>
                        </div>
                      ) : (
                        (userReports || []).filter(r => userSearchTerm === 'is:pending' ? r.status === 'pending' : true).map(report => (
                          <div key={report.id} className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    report.type === 'bug' ? 'bg-blue-500/20 text-blue-500' :
                                    report.type === 'player' ? 'bg-red-500/20 text-red-500' :
                                    'bg-orange-500/20 text-orange-500'
                                  }`}>
                                    {report.type}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                    report.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                                    'bg-gray-500/20 text-gray-500'
                                  }`}>
                                    {report.status}
                                  </span>
                                </div>
                                <h4 className="text-lg font-black uppercase italic tracking-tight">{report.title}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                  From: {report.userName} (ID: {report.userId})
                                </p>
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                {new Date(report.timestamp).toLocaleString()}
                              </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                              <p className="text-sm text-gray-300 leading-relaxed">{report.description}</p>
                            </div>

                            <div className="flex gap-2">
                              {report.status === 'pending' && (
                                <button 
                                  onClick={() => {
                                    const updated = userReports.map(r => r.id === report.id ? { ...r, status: 'resolved' as const } : r);
                                    setUserReports(updated);
                                    showToast('Report marked as resolved!', 'success');
                                  }}
                                  className="flex-1 py-3 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-400 transition-all"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  confirmAction(
                                    'Delete Report',
                                    'Are you sure you want to delete this report?',
                                    () => {
                                      setUserReports(userReports.filter(r => r.id !== report.id));
                                    }
                                  );
                                }}
                                className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'results' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        Match Results
                      </h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-[10px] font-black uppercase tracking-widest text-yellow-400">
                          {matchResults.length} Total
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(matchResults || []).length === 0 ? (
                        <div className="p-12 bg-white/5 border border-white/10 rounded-[2.5rem] text-center opacity-50">
                          <p className="text-xs font-bold uppercase tracking-widest">No results published yet</p>
                        </div>
                      ) : (
                        (matchResults || []).sort((a, b) => b.timestamp - a.timestamp).map(result => (
                          <div key={result.id} className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="text-lg font-black uppercase italic tracking-tight">{result.matchName}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                  Match ID: {result.matchId} • {new Date(result.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <button 
                                onClick={() => {
                                  confirmAction(
                                    'Delete Result',
                                    'Are you sure you want to delete this result?',
                                    () => {
                                      setMatchResults(matchResults.filter(r => r.id !== result.id));
                                    }
                                  );
                                }}
                                className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.winners.map((winner, idx) => (
                                <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                      winner.rank === 1 ? 'bg-yellow-500 text-black' :
                                      winner.rank === 2 ? 'bg-gray-300 text-black' :
                                      winner.rank === 3 ? 'bg-orange-600 text-white' :
                                      'bg-white/10 text-white'
                                    }`}>
                                      #{winner.rank}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold uppercase italic">{winner.gameName}</div>
                                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{winner.kills} Kills</div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-black text-green-500 italic">৳{winner.prize}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'templates' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Copy className="text-orange-300" />
                      Match Templates
                    </h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const newTemplate: MatchTemplate = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: formData.get('name') as string,
                        entryFee: Number(formData.get('entryFee')),
                        perKill: Number(formData.get('perKill')),
                        totalPrize: Number(formData.get('totalPrize')),
                        map: formData.get('map') as string,
                        totalSlots: Number(formData.get('totalSlots')),
                        imageUrl: formData.get('imageUrl') as string,
                        isScrim: formData.get('isScrim') === 'true',
                        publishTime: formData.get('publishTime') ? new Date(formData.get('publishTime') as string).getTime() : undefined,
                        game: formData.get('game') as any,
                        category: formData.get('category') as any
                      };
                      setMatchTemplates([...matchTemplates, newTemplate]);
                      e.currentTarget.reset();
                      showToast('Template saved!', 'success');
                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-6 rounded-3xl border border-white/10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Template Name</label>
                        <input name="name" required placeholder="e.g. Daily Solo Erangel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image URL</label>
                        <input name="imageUrl" placeholder="Banner URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Entry Fee (৳)</label>
                        <input name="entryFee" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Per Kill (৳)</label>
                        <input name="perKill" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Prize (৳)</label>
                        <input name="totalPrize" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Map</label>
                        <input name="map" required placeholder="Erangel / Miramar" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Game</label>
                        <select name="game" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none">
                          <option value="Free Fire">Free Fire</option>
                          <option value="PUBG">PUBG</option>
                          <option value="COD">COD</option>
                          <option value="Ludo">Ludo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                        <select name="category" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none">
                          <option value="Solo">Solo</option>
                          <option value="Duo">Duo</option>
                          <option value="Squad">Squad</option>
                          <option value="Classic">Classic</option>
                          <option value="Rush">Rush</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Slots</label>
                        <input name="totalSlots" type="number" defaultValue={100} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match Type</label>
                        <select name="isScrim" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none">
                          <option value="false">Tournament (Paid)</option>
                          <option value="true">Scrim (Free Practice)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Room ID Publish Time</label>
                        <input name="publishTime" type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      </div>
                      <button type="submit" className="md:col-span-2 py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                        Save Template
                      </button>
                    </form>

                    <div className="grid gap-4">
                      {(matchTemplates || []).map(template => (
                        <div key={template.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                              <Trophy size={24} />
                            </div>
                            <div>
                              <div className="text-sm font-black uppercase italic tracking-tight">{template.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                {template.map} • {template.type} • ৳{template.entryFee} Entry
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const newMatch: Match = {
                                  ...template,
                                  id: Math.random().toString(36).substr(2, 9),
                                  startTime: Date.now() + 3600000, // 1 hour from now
                                  time: new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  joinedPlayers: [],
                                  isRoomPublished: false,
                                  game: template.game,
                                  category: template.category
                                };
                                setMatches([...matches, newMatch]);
                                setAdminSubView('matches');
                                showToast('Match created from template!', 'success');
                              }}
                              className="px-4 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-teal-400 transition-all"
                            >
                              Use
                            </button>
                            <button 
                              onClick={() => setMatchTemplates(matchTemplates.filter(t => t.id !== template.id))}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubView === 'results' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const winners = [
                      { rank: 1, gameName: formData.get('p1') as string, kills: Number(formData.get('k1')), prize: Number(formData.get('pr1')) },
                      { rank: 2, gameName: formData.get('p2') as string, kills: Number(formData.get('k2')), prize: Number(formData.get('pr2')) },
                      { rank: 3, gameName: formData.get('p3') as string, kills: Number(formData.get('k3')), prize: Number(formData.get('pr3')) },
                    ].filter(w => w.gameName);

                    const newResult: MatchResult = {
                      id: Math.random().toString(36).substr(2, 9),
                      matchId: formData.get('matchId') as string,
                      matchName: formData.get('matchName') as string,
                      timestamp: Date.now(),
                      winners
                    };

                    // Update user balances and stats
                    const updatedUsers = users.map(u => {
                      const winner = winners.find(w => w.gameName === u.gameName);
                      if (winner) {
                        const loanToDeduct = Math.min(u.loanAmount || 0, winner.prize);
                        const actualPrize = winner.prize - loanToDeduct;
                        const remainingLoan = (u.loanAmount || 0) - loanToDeduct;

                        // Award NFT for Rank 1 in Tournaments
                        const newNft: NFTBadge | undefined = winner.rank === 1 ? {
                          id: Math.random().toString(36).substr(2, 9),
                          name: `${newResult.matchName} Champion`,
                          image: `https://picsum.photos/seed/${newResult.matchId}/400/400`,
                          rarity: 'Legendary',
                          ownerId: u.userId,
                          mintDate: new Date().toLocaleDateString()
                        } : undefined;

                        return {
                          ...u,
                          winnings: (u.winnings || 0) + actualPrize,
                          loanAmount: remainingLoan,
                          achievementNFTs: newNft ? [...(u.achievementNFTs || []), newNft] : u.achievementNFTs,
                          totalWins: winner.rank === 1 ? (u.totalWins || 0) + 1 : (u.totalWins || 0),
                          totalKills: (u.totalKills || 0) + winner.kills
                        };
                      }
                      return u;
                    });
                    setUsers(updatedUsers);
                    socket.emit('update_data', { users: updatedUsers });

                    // Update current user if they won
                    const currentWinner = winners.find(w => w.gameName === currentUser?.gameName);
                    if (currentWinner && currentUser) {
                      const loanToDeduct = Math.min(currentUser.loanAmount || 0, currentWinner.prize);
                      const actualPrize = currentWinner.prize - loanToDeduct;
                      const remainingLoan = (currentUser.loanAmount || 0) - loanToDeduct;

                      const newNft: NFTBadge | undefined = currentWinner.rank === 1 ? {
                        id: Math.random().toString(36).substr(2, 9),
                        name: `${newResult.matchName} Champion`,
                        image: `https://picsum.photos/seed/${newResult.matchId}/400/400`,
                        rarity: 'Legendary',
                        ownerId: currentUser.userId,
                        mintDate: new Date().toLocaleDateString()
                      } : undefined;

                      const updatedSessionUser = {
                        ...currentUser,
                        winnings: (currentUser.winnings || 0) + actualPrize,
                        loanAmount: remainingLoan,
                        achievementNFTs: newNft ? [...(currentUser.achievementNFTs || []), newNft] : currentUser.achievementNFTs,
                        totalWins: currentWinner.rank === 1 ? (currentUser.totalWins || 0) + 1 : (currentUser.totalWins || 0),
                        totalKills: (currentUser.totalKills || 0) + currentWinner.kills
                      };
                      setCurrentUser(updatedSessionUser);
                      localStorage.setItem('ff_session', JSON.stringify(updatedSessionUser));

                      if (currentWinner.rank === 1) {
                        updateMissionProgress('wins', 1);
                      }
                      if (currentWinner.kills > 0) {
                        updateMissionProgress('kills', currentWinner.kills);
                      }
                    }

                    const blockchainHash = btoa(JSON.stringify(newResult) + Date.now()).substring(0, 32);
                    const resultWithHash = { ...newResult, blockchainHash };
                    const updatedMatchResults = [...matchResults, resultWithHash];
                    setMatchResults(updatedMatchResults);
                    socket.emit('update_data', { matchResults: updatedMatchResults });
                    e.currentTarget.reset();
                    showToast('Result published!', 'success');
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input name="matchId" placeholder="Match ID" required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                      <input name="matchName" placeholder="Match Name" required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                    </div>
                    <input name="totalPrize" type="number" placeholder="Total Prize Pool" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input name="p1" placeholder="Winner 1 Name" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                        <input name="k1" type="number" placeholder="Kills" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                        <input name="pr1" type="number" placeholder="Prize" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input name="p2" placeholder="Winner 2 Name" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                        <input name="k2" type="number" placeholder="Kills" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                        <input name="pr2" type="number" placeholder="Prize" className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all">
                      Publish Results
                    </button>
                  </form>
                </div>
                )}

                {adminSubView === 'withdraws' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <CreditCard className="text-orange-500" />
                      Withdraw Requests
                    </h3>
                <div className="space-y-3">
                  {withdrawRequests.filter(w => w.status === 'pending').length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm italic border border-white/5 rounded-2xl">No pending withdraw requests.</p>
                  ) : (
                    withdrawRequests.filter(w => w.status === 'pending').map(w => (
                      <div key={w.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black italic">৳{w.amount}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-orange-500 text-black rounded">{w.method}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">{w.number}</p>
                          {w.trxId && <p className="text-[10px] text-teal-500 font-mono">TrxID: {w.trxId}</p>}
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">User: {w.userId}</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => {
                              const updated = withdrawRequests.map(req => req.id === w.id ? { ...req, status: 'approved' } : req);
                              setWithdrawRequests(updated);
                              
                              // Send notification
                              const newNotif: Notification = {
                                id: Math.random().toString(36).substr(2, 9),
                                userId: w.userId,
                                title: 'Withdraw Approved',
                                message: `Your withdrawal of ৳${w.amount} via ${w.method} has been approved and sent.`,
                                type: 'success',
                                timestamp: Date.now(),
                                isRead: false
                              };
                              setNotifications([...notifications, newNotif]);
                            }}
                            className="flex-1 md:flex-none px-6 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-teal-400"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              const updated = withdrawRequests.map(req => req.id === w.id ? { ...req, status: 'rejected' } : req);
                              setWithdrawRequests(updated);
                              
                              // Refund winnings
                              const updatedUsers = users.map(u => {
                                if (u.userId === w.userId) {
                                  return { ...u, winnings: (u.winnings || 0) + w.amount };
                                }
                                return u;
                              });
                              setUsers(updatedUsers);
                              if (currentUser?.userId === w.userId) {
                                setCurrentUser({ ...currentUser, winnings: (currentUser.winnings || 0) + w.amount });
                              }

                              // Send notification
                              const newNotif: Notification = {
                                id: Math.random().toString(36).substr(2, 9),
                                userId: w.userId,
                                title: 'Withdraw Rejected',
                                message: `Your withdrawal of ৳${w.amount} has been rejected. The amount has been refunded to your winnings balance.`,
                                type: 'warning',
                                timestamp: Date.now(),
                                isRead: false
                              };
                              setNotifications([...notifications, newNotif]);
                            }}
                            className="flex-1 md:flex-none px-6 py-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500/20 border border-red-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}

                {adminSubView === 'spin' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                  <RefreshCw className="text-orange-500" />
                  Spin Prize Manager
                </h3>
                <p className="text-xs text-gray-500 font-medium italic">Note: The wheel always has 8 slots. Update the prizes below.</p>
                
                <div className="space-y-4">
                  {appConfig.spinPrizes.map((prize, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Slot {idx + 1} Type</label>
                        <select 
                          value={prize.type}
                          onChange={(e) => {
                            const newPrizes = [...appConfig.spinPrizes];
                            newPrizes[idx] = { ...newPrizes[idx], type: e.target.value as 'balance' | 'xp' };
                            setAppConfig({ ...appConfig, spinPrizes: newPrizes });
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all appearance-none"
                        >
                          <option value="balance">Balance (৳)</option>
                          <option value="xp">XP</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</label>
                        <input 
                          type="number" 
                          value={prize.amount}
                          onChange={(e) => {
                            const newPrizes = [...appConfig.spinPrizes];
                            newPrizes[idx] = { ...newPrizes[idx], amount: Number(e.target.value) };
                            setAppConfig({ ...appConfig, spinPrizes: newPrizes });
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Color (Hex)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={prize.color}
                            onChange={(e) => {
                              const newPrizes = [...appConfig.spinPrizes];
                              newPrizes[idx] = { ...newPrizes[idx], color: e.target.value };
                              setAppConfig({ ...appConfig, spinPrizes: newPrizes });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all"
                          />
                          <div className="w-12 h-12 rounded-xl border border-white/10 shrink-0" style={{ backgroundColor: prize.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

                {adminSubView === 'settings' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                  <Settings className="text-orange-500" />
                  Global App Settings
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  setAppConfig({
                    ...appConfig,
                    referralBonus: Number(formData.get('referralBonus')),
                    matchRules: formData.get('matchRules') as string,
                    dailyRewardAmount: Number(formData.get('dailyRewardAmount')),
                    dailyRewardXP: Number(formData.get('dailyRewardXP')),
                    isDiscussionEnabled: formData.get('isDiscussionEnabled') === 'true',
                    isMaintenanceMode: formData.get('isMaintenanceMode') === 'true',
                    maintenanceMessage: formData.get('maintenanceMessage') as string,
                    scrollingNotice: formData.get('scrollingNotice') as string,
                    isLiveCommentaryActive: formData.get('isLiveCommentaryActive') === 'true',
                    liveCommentaryUrl: formData.get('liveCommentaryUrl') as string
                  });
                  showToast('Settings updated!', 'success');
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Maintenance Mode</label>
                      <select name="isMaintenanceMode" defaultValue={appConfig.isMaintenanceMode ? 'true' : 'false'} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all appearance-none">
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Maintenance Message</label>
                      <input name="maintenanceMessage" defaultValue={appConfig.maintenanceMessage} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scrolling Notice</label>
                    <input name="scrollingNotice" defaultValue={appConfig.scrollingNotice} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Commentary Status</label>
                      <select name="isLiveCommentaryActive" defaultValue={appConfig.isLiveCommentaryActive ? 'true' : 'false'} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all appearance-none">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Commentary URL (Audio Stream)</label>
                      <input name="liveCommentaryUrl" defaultValue={appConfig.liveCommentaryUrl} placeholder="https://stream.url/audio" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Referral Bonus (৳)</label>
                      <input name="referralBonus" type="number" defaultValue={appConfig.referralBonus} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discussion System</label>
                      <select name="isDiscussionEnabled" defaultValue={appConfig.isDiscussionEnabled ? 'true' : 'false'} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all appearance-none">
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Daily Reward (৳)</label>
                      <input name="dailyRewardAmount" type="number" defaultValue={appConfig.dailyRewardAmount} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Daily Reward (XP)</label>
                      <input name="dailyRewardXP" type="number" defaultValue={appConfig.dailyRewardXP} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Match Rules</label>
                    <textarea name="matchRules" defaultValue={appConfig.matchRules} required rows={5} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                    Update Global Settings
                  </button>
                </form>
              </div>
              )}

                {adminSubView === 'maintenance' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <ShieldAlert className="text-red-500" />
                      System Maintenance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3 text-orange-500">
                          <Trash2 size={24} />
                          <h4 className="font-black uppercase italic">Database Cleaner</h4>
                        </div>
                        <p className="text-xs text-gray-400">Remove old data to keep the system fast and clean.</p>
                        <div className="space-y-2">
                          <button 
                            onClick={() => clearOldData('matches')}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            Clear All Matches
                          </button>
                          <button 
                            onClick={() => clearOldData('payments')}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            Clear All Payments
                          </button>
                          <button 
                            onClick={() => clearOldData('notifications')}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            Clear All Notifications
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                          <ShieldAlert size={24} />
                          <h4 className="font-black uppercase italic">Danger Zone</h4>
                        </div>
                        <p className="text-xs text-gray-400">Irreversible actions. Use with extreme caution.</p>
                        <button 
                          onClick={resetAllData}
                          className="w-full py-4 bg-red-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all"
                        >
                          Full System Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'analytics' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <ArrowUpRight className="text-teal-400" />
                      Payment Analytics (Last 7 Days)
                    </h3>
                    
                    <div className="h-[300px] w-full bg-black/40 border border-white/5 rounded-2xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={(() => {
                          const last7Days = [...Array(7)].map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - i);
                            return d.toISOString().split('T')[0];
                          }).reverse();

                          return last7Days.map(date => {
                            const dayPayments = payments.filter(p => p.status === 'approved' && new Date(p.timestamp).toISOString().split('T')[0] === date);
                            return {
                              date: date.split('-').slice(1).join('/'),
                              bKash: dayPayments.filter(p => p.method === 'bKash').reduce((acc, curr) => acc + curr.amount, 0),
                              Nagad: dayPayments.filter(p => p.method === 'Nagad').reduce((acc, curr) => acc + curr.amount, 0)
                            };
                          });
                        })()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="date" stroke="#666" fontSize={10} fontWeight="bold" />
                          <YAxis stroke="#666" fontSize={10} fontWeight="bold" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                          />
                          <Bar dataKey="bKash" fill="#d1126d" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Nagad" fill="#f7941d" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total bKash</div>
                        <div className="text-xl font-black text-[#d1126d] italic">৳{payments.filter(p => p.status === 'approved' && p.method === 'bKash').reduce((acc, curr) => acc + curr.amount, 0)}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Nagad</div>
                        <div className="text-xl font-black text-[#f7941d] italic">৳{payments.filter(p => p.status === 'approved' && p.method === 'Nagad').reduce((acc, curr) => acc + curr.amount, 0)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'announcements' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Megaphone className="text-orange-500" />
                      Broadcast Scheduler
                    </h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      scheduleAnnouncement(formData.get('text') as string, formData.get('time') as string);
                      e.currentTarget.reset();
                      showToast('Announcement scheduled!', 'success');
                    }} className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Announcement Message</label>
                        <textarea name="text" required rows={3} placeholder="Type your announcement here..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Schedule Time</label>
                        <input name="time" type="datetime-local" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                      </div>
                      <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                        Schedule Announcement
                      </button>
                    </form>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scheduled Broadcasts</h4>
                      {(appConfig.scheduledAnnouncements || []).length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-xs italic border border-white/5 rounded-2xl">No scheduled announcements.</p>
                      ) : (
                        [...(appConfig.scheduledAnnouncements || [])].sort((a, b) => a.scheduledTime - b.scheduledTime).map(a => (
                          <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="text-sm font-bold">{a.text}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{new Date(a.scheduledTime).toLocaleString()}</span>
                                {a.isSent ? (
                                  <span className="text-[8px] px-2 py-0.5 bg-teal-500/20 text-teal-500 rounded-full font-black uppercase tracking-widest">Sent</span>
                                ) : (
                                  <span className="text-[8px] px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full font-black uppercase tracking-widest">Pending</span>
                                )}
                              </div>
                            </div>
                            {!a.isSent && (
                              <button 
                                onClick={() => {
                                  const updated = appConfig.scheduledAnnouncements.filter(item => item.id !== a.id);
                                  setAppConfig({ ...appConfig, scheduledAnnouncements: updated });
                                }}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'live_tracking' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Globe className="text-orange-500" />
                      Live Session Monitor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Users</div>
                        <div className="text-2xl font-black text-orange-500 italic">{users.filter(u => u.location?.page).length}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">In Wallet</div>
                        <div className="text-2xl font-black text-teal-500 italic">{users.filter(u => u.location?.page === 'wallet').length}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">In Matches</div>
                        <div className="text-2xl font-black text-purple-500 italic">{users.filter(u => u.location?.page === 'home').length}</div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Current Page</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.filter(u => u.location?.page).map(u => (
                            <tr key={u.userId} className="hover:bg-white/5 transition-all">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={u.photoURL} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                                  <div>
                                    <div className="text-sm font-bold">{u.displayName}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">{u.userId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                  {u.location?.page}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                  {u.location?.city}, {u.location?.country}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={() => {
                                    const msg = prompt('Enter message for ' + u.displayName);
                                    if (msg) {
                                      socket.emit('send_notification', { userId: u.userId, message: msg, type: 'info' });
                                      showToast('Notification sent!', 'success');
                                    }
                                  }}
                                  className="p-2 bg-teal-500/10 text-teal-500 rounded-lg hover:bg-teal-500/20 transition-all"
                                >
                                  <Zap size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminSubView === 'pro_contracts' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <Star className="text-orange-500" />
                      Pro Player Contracts
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Contract Management</h4>
                      <div className="space-y-3">
                        {users.filter(u => u.isProContracted).map(u => (
                          <div key={u.userId} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <img src={u.photoURL} className="w-12 h-12 rounded-xl border border-white/10" referrerPolicy="no-referrer" />
                              <div>
                                <div className="text-sm font-black uppercase italic">{u.displayName}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Salary: ৳{u.salaryAmount || 0} / Month</div>
                                <div className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">Matches Played: {u.monthlyMatchesPlayed || 0} / 10</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const updated = users.map(user => user.userId === u.userId ? { ...user, isProContracted: false } : user);
                                  setUsers(updated);
                                  socket.emit('update_data', { users: updated });
                                  showToast('Contract terminated.', 'info');
                                }}
                                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                              >
                                Terminate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Potential Pro Players (Top 10)</h4>
                      <div className="space-y-3">
                        {users.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10).filter(u => !u.isProContracted).map(u => (
                          <div key={u.userId} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <img src={u.photoURL} className="w-10 h-10 rounded-xl border border-white/10" referrerPolicy="no-referrer" />
                              <div>
                                <div className="text-sm font-bold">{u.displayName}</div>
                                <div className="text-[10px] text-gray-500 font-mono">XP: {u.xp}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const salary = prompt('Enter monthly salary for ' + u.displayName, '500');
                                if (salary) {
                                  const updated = users.map(user => user.userId === u.userId ? { ...user, isProContracted: true, salaryAmount: Number(salary), monthlyMatchesPlayed: 0 } : user);
                                  setUsers(updated);
                                  socket.emit('update_data', { users: updated });
                                  showToast('Contract signed!', 'success');
                                }
                              }}
                              className="px-4 py-2 bg-orange-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Sign Contract
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'promo' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                  <Zap className="text-orange-500" />
                  Promo Code Manager
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPromoCode(formData.get('code') as string, Number(formData.get('reward')));
                  e.currentTarget.reset();
                  showToast('Promo code added!', 'success');
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Code</label>
                      <input name="code" placeholder="WELCOME50" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all uppercase" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reward (৳)</label>
                      <input name="reward" type="number" placeholder="50" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                    Create Promo Code
                  </button>
                </form>

                <div className="grid gap-4 mt-6">
                  {promoCodes.length === 0 ? (
                    <p className="text-center py-4 text-gray-500 text-xs italic">No promo codes created.</p>
                  ) : (
                    promoCodes.map(promo => (
                      <div key={promo.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-2xl">
                        <div>
                          <div className="text-sm font-black uppercase italic tracking-tight text-orange-500">{promo.code}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Reward: ৳{promo.reward} • Used by: {promo.usedBy.length} users</div>
                        </div>
                        <button 
                          onClick={() => deletePromoCode(promo.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}

              {/* Broadcast Notification */}

                {adminSubView === 'balance' && (
                  <section className="space-y-4">
                <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                  <User className="text-orange-500" />
                  Manage User Balance
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      addBalanceToUser(form.userId.value, Number(form.amount.value));
                      form.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input name="userId" required placeholder="User ID" className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="amount" type="number" required placeholder="Amount" className="w-24 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <button type="submit" className="p-3 bg-orange-500 text-black rounded-xl">
                      <Plus size={20} />
                    </button>
                  </form>
                </div>
              </section>
              )}

                {adminSubView === 'wallets' && (
                  <section className="space-y-4">
                <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                  <Wallet className="text-orange-500" />
                  Wallet Numbers
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      setAppConfig({
                        ...appConfig,
                        bkash: form.bkash.value,
                        nagad: form.nagad.value,
                        whatsapp: form.whatsapp.value,
                        telegram: form.telegram.value
                      });
                      showToast('Settings updated successfully!', 'success');
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">bKash Number</label>
                      <input name="bkash" defaultValue={appConfig.bkash} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Nagad Number</label>
                      <input name="nagad" defaultValue={appConfig.nagad} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">WhatsApp Link</label>
                      <input name="whatsapp" defaultValue={appConfig.whatsapp} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Telegram Link</label>
                      <input name="telegram" defaultValue={appConfig.telegram} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <button type="submit" className="sm:col-span-2 py-3 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all">
                      Update Settings
                    </button>
                  </form>
                </div>
              </section>
              )}

                {adminSubView === 'payments' && (
                  <section className="space-y-4">
                <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                  <CreditCard className="text-orange-500" />
                  Payment Requests ({payments.filter(p => p.status === 'pending').length})
                </h3>
                <div className="space-y-3">
                  {payments.filter(p => p.status === 'pending').length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm italic border border-white/5 rounded-2xl">No pending requests.</p>
                  ) : (
                    payments.filter(p => p.status === 'pending').map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-lg font-black text-teal-500 italic">৳{p.amount}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">User: {p.userId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-orange-500 uppercase tracking-widest">{p.method}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{p.trxId}</div>
                            {p.isFlagged && (
                              <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">SUSPICIOUS</div>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500">Sender: {p.senderNumber}</div>
                        <div className="flex gap-2">
                          <button onClick={() => verifyPaymentWithAI(p.id)} className="flex-1 py-2 bg-purple-500/20 text-purple-500 font-black uppercase text-[10px] tracking-widest rounded-lg border border-purple-500/20 flex items-center justify-center gap-1">
                            <Zap size={14} /> AI Verify
                          </button>
                          <button onClick={() => approvePayment(p.id)} className="flex-1 py-2 bg-teal-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg flex items-center justify-center gap-1">
                            <Check size={14} /> Approve
                          </button>
                          <button onClick={() => rejectPayment(p.id)} className="flex-1 py-2 bg-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-lg border border-red-500/20 flex items-center justify-center gap-1">
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              )}

                {adminSubView === 'matches' && (
                  <section className="space-y-4">
                <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                  <Trophy className="text-orange-500" />
                  Match Manager
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Add New Match</h4>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const fileInput = form.photo as HTMLInputElement;
                      const file = fileInput.files?.[0];

                      const handleCreation = (imgUrl: string) => {
                        const startTime = new Date(form.startTime.value).getTime();
                        addMatch({
                          name: form.name.value,
                          map: form.map.value,
                          time: form.time.value,
                          startTime: startTime,
                          entryFee: Number(form.entry.value),
                          totalPrize: Number(form.prize.value),
                          perKill: Number(form.perKill.value),
                          totalSlots: Number(form.totalSlots.value),
                          imageUrl: imgUrl,
                          roomId: form.roomId.value,
                          roomPassword: form.roomPassword.value,
                          game: form.game.value,
                          category: form.category.value
                        });
                        form.reset();
                      };

                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleCreation(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        handleCreation(form.imageUrl.value);
                      }
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <input name="name" required placeholder="Match Name" className="col-span-2 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Match Photo</label>
                      <div className="flex gap-2">
                        <input name="photo" type="file" accept="image/*" className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none file:bg-orange-500 file:border-none file:rounded file:px-2 file:py-1 file:text-[10px] file:font-black file:uppercase file:mr-4" />
                        <span className="text-gray-500 text-[10px] flex items-center">OR</span>
                        <input name="imageUrl" placeholder="Image URL" className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Select Game</label>
                      <select name="game" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                        <option value="Free Fire">Free Fire</option>
                        <option value="PUBG">PUBG</option>
                        <option value="COD">COD</option>
                        <option value="Ludo">Ludo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Match Category</label>
                      <select name="category" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                        <option value="Solo">Solo</option>
                        <option value="Duo">Duo</option>
                        <option value="Squad">Squad</option>
                        <option value="Classic">Classic</option>
                        <option value="Rush">Rush</option>
                      </select>
                    </div>
                    <input name="map" required placeholder="Map" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="time" required placeholder="Display Time (e.g. 8:00 PM)" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Countdown Start Time</label>
                      <input name="startTime" type="datetime-local" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <input name="entry" type="number" required placeholder="Entry Fee" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="prize" type="number" required placeholder="Total Prize" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="perKill" type="number" required placeholder="Per Kill" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="totalSlots" type="number" required placeholder="Total Slots" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="roomId" placeholder="Room ID (Optional)" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input name="roomPassword" placeholder="Room Password (Optional)" className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                    <button type="submit" className="col-span-2 py-3 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2">
                      <Plus size={18} /> Create Match
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  {matches.map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold uppercase italic">{m.name}</div>
                          <span className="text-[8px] px-1.5 py-0.5 bg-teal-500/20 text-teal-500 border border-teal-500/30 rounded font-black uppercase tracking-widest">{m.game}</span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded font-black uppercase tracking-widest">{m.category}</span>
                          {m.isScrim && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded font-black uppercase tracking-widest">Scrim</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={10} /> {m.joinedPlayers.length} / {m.totalSlots} Slots
                          </div>
                          <Countdown targetTime={m.startTime} showLabel={false} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const newSlots = window.prompt('Enter new total slots', m.totalSlots.toString());
                            const newFee = window.prompt('Enter new entry fee', m.entryFee.toString());
                            if (newSlots !== null || newFee !== null) {
                              const updated = matches.map(match => match.id === m.id ? { 
                                ...match, 
                                totalSlots: newSlots !== null ? Number(newSlots) : match.totalSlots,
                                entryFee: newFee !== null ? Number(newFee) : match.entryFee
                              } : match);
                              setMatches(updated);
                              socket.emit('update_data', { matches: updated });
                              showToast('Match updated!', 'success');
                            }
                          }}
                          className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"
                          title="Edit Match"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleMassRefund(m.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg"
                          title="Mass Refund"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={() => setAdminViewingMatchId(m.id)}
                          className="p-2 bg-teal-500/10 text-teal-500 rounded-lg"
                        >
                          <Users size={18} />
                        </button>
                        <button 
                          onClick={async () => {
                            const winnersCount = prompt('How many winners to add? (e.g. 3)', '3');
                            if (!winnersCount) return;
                            
                            const winners = [];
                            for (let i = 1; i <= Number(winnersCount); i++) {
                              const gameName = prompt(`Rank #${i} Game Name:`);
                              const kills = prompt(`Rank #${i} Kills:`, '0');
                              const prize = prompt(`Rank #${i} Prize (৳):`, '0');
                              
                              if (gameName) {
                                winners.push({
                                  rank: i,
                                  gameName,
                                  kills: Number(kills),
                                  prize: Number(prize)
                                });
                              }
                            }
                            
                            if (winners.length > 0) {
                              const winnerName = winners.find(w => w.rank === 1)?.gameName || '';
                              
                              // Generate AI Commentary
                              const aiCommentary = await generateAICommentary(m.name, winners);

                              const newResult: MatchResult = {
                                id: Math.random().toString(36).substr(2, 9),
                                matchId: m.id,
                                matchName: m.name,
                                winnerName,
                                aiCommentary,
                                winners,
                                timestamp: Date.now(),
                                date: new Date().toLocaleDateString(),
                                totalPrize: m.totalPrize
                              };
                              
                              // Mark match as completed
                              const updatedMatches = matches.map(match => 
                                match.id === m.id ? { ...match, isCompleted: true, winnerName } : match
                              );
                              setMatches(updatedMatches);

                              // Award trophies to winners
                              const updatedUsers = users.map(user => {
                                const winner = winners.find(w => w.gameName === user.gameName);
                                if (winner) {
                                  const trophy: Trophy = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: winner.rank === 1 ? 'Champion Trophy' : winner.rank === 2 ? 'Runner Up Medal' : 'Third Place Medal',
                                    imageUrl: winner.rank === 1 ? 'https://cdn-icons-png.flaticon.com/512/2618/2618245.png' : 'https://cdn-icons-png.flaticon.com/512/2618/2618254.png',
                                    matchName: m.name,
                                    date: new Date().toLocaleDateString(),
                                    rank: winner.rank
                                  };
                                  return {
                                    ...user,
                                    trophies: [...(user.trophies || []), trophy],
                                    totalWins: winner.rank === 1 ? (user.totalWins || 0) + 1 : (user.totalWins || 0),
                                    winnings: (user.winnings || 0) + winner.prize,
                                    balance: user.balance + winner.prize
                                  };
                                }
                                return user;
                              });
                              
                              // Resolve predictions
                              const updatedPredictions = predictions.map(p => {
                                if (p.matchId === m.id) {
                                  const isCorrect = p.predictedWinner === winnerName;
                                  return { ...p, status: isCorrect ? 'won' as const : 'lost' as const };
                                }
                                return p;
                              });
                              setPredictions(updatedPredictions);
                              
                              // Reward users who predicted correctly
                              const correctPredictions = updatedPredictions.filter(p => p.matchId === m.id && p.status === 'won');
                              const finalUpdatedUsers = updatedUsers.map(user => {
                                const userCorrectPredictions = correctPredictions.filter(p => p.userId === user.userId);
                                if (userCorrectPredictions.length > 0) {
                                  const reward = userCorrectPredictions.reduce((acc, p) => acc + p.points, 0);
                                  
                                  // Add notification for reward
                                  const newNotif: Notification = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    userId: user.userId,
                                    title: 'Prediction Reward!',
                                    message: `You earned ${reward} RK Points for correctly predicting the winner of ${m.name}!`,
                                    type: 'success',
                                    timestamp: Date.now(),
                                    isRead: false
                                  };
                                  setNotifications(prev => [newNotif, ...prev]);
                                  
                                  return { ...user, xp: user.xp + reward }; // Reward with XP/Points
                                }
                                return user;
                              });
                              setUsers(finalUpdatedUsers);
                              
                              const blockchainHash = btoa(JSON.stringify(newResult) + Date.now()).substring(0, 32);
                              const resultWithHash = { ...newResult, blockchainHash };
                              setMatchResults([...matchResults, resultWithHash]);
                              syncData({ 
                                matches: updatedMatches, 
                                predictions: updatedPredictions, 
                                users: finalUpdatedUsers,
                                matchResults: [...matchResults, newResult]
                              });
                              showToast('Results published and predictions resolved!', 'success');
                            }
                          }}
                          className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"
                          title="Publish Results"
                        >
                          <Trophy size={18} />
                        </button>
                        <button onClick={() => deleteMatch(m.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              )}

                {adminSubView === 'voting' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <Globe className="text-blue-400" />
                        Map Voting Management
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const mapName = prompt('Enter new map name:');
                            if (mapName && !availableMaps.find(m => m.name === mapName)) {
                              const imageUrl = prompt('Enter map image URL:', `https://picsum.photos/seed/${mapName.toLowerCase()}/400/200`);
                              const color = prompt('Enter Tailwind gradient color (e.g., from-blue-500/20):', 'from-teal-500/20');
                              
                              const newMap = { name: mapName, image: imageUrl || '', color: color || 'from-teal-500/20' };
                              const updatedMaps = [...availableMaps, newMap];
                              const updatedVotes = { ...mapVotes, [mapName]: 0 };
                              
                              setAvailableMaps(updatedMaps);
                              setMapVotes(updatedVotes);
                              socket.emit('update_data', { availableMaps: updatedMaps, mapVotes: updatedVotes });
                              showToast(`Map ${mapName} added!`, 'success');
                            }
                          }}
                          className="px-4 py-2 bg-teal-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all"
                        >
                          Add Map
                        </button>
                        <button 
                          onClick={() => {
                            confirmAction(
                              'Reset Votes',
                              'Are you sure you want to reset all map votes to zero?',
                              () => {
                                const resetVotes = Object.keys(mapVotes).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
                                setMapVotes(resetVotes);
                                socket.emit('update_data', { mapVotes: resetVotes });
                                showToast('Votes reset successfully!', 'success');
                              }
                            );
                          }}
                          className="px-4 py-2 bg-red-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(Object.entries(mapVotes) as [string, number][]).map(([mapName, count]) => (
                        <div key={mapName} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              confirmAction(
                                'Delete Map',
                                `Are you sure you want to delete ${mapName}?`,
                                () => {
                                  const updatedMaps = availableMaps.filter(m => m.name !== mapName);
                                  const updatedVotes = { ...mapVotes };
                                  delete updatedVotes[mapName];
                                  
                                  setAvailableMaps(updatedMaps);
                                  setMapVotes(updatedVotes);
                                  socket.emit('update_data', { availableMaps: updatedMaps, mapVotes: updatedVotes });
                                  showToast(`Map ${mapName} deleted!`, 'success');
                                }
                              );
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="flex justify-between items-center">
                            <h4 className="text-xl font-black uppercase italic tracking-tight">{mapName}</h4>
                            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                              {count} Votes
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Manual Edit</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" 
                                value={count}
                                onChange={(e) => {
                                  const newVal = parseInt(e.target.value) || 0;
                                  const updatedVotes = { ...mapVotes, [mapName]: newVal };
                                  setMapVotes(updatedVotes);
                                  socket.emit('update_data', { mapVotes: updatedVotes });
                                }}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const updatedVotes = { ...mapVotes, [mapName]: Math.max(0, count - 10) };
                                setMapVotes(updatedVotes);
                                socket.emit('update_data', { mapVotes: updatedVotes });
                              }}
                              className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                              -10
                            </button>
                            <button 
                              onClick={() => {
                                const updatedVotes = { ...mapVotes, [mapName]: count + 10 };
                                setMapVotes(updatedVotes);
                                socket.emit('update_data', { mapVotes: updatedVotes });
                              }}
                              className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {adminSubView === 'theme' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Palette className="text-pink-500" />
                        Theme & Visual Settings
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'light', label: 'Light Mode', icon: <Sun size={24} />, desc: 'Standard bright UI' },
                        { id: 'dark', label: 'Dark Mode', icon: <Moon size={24} />, desc: 'Classic dark interface' },
                        { id: 'event', label: 'Event Theme', icon: <Zap size={24} />, desc: 'Custom event colors' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            const updatedConfig = { ...appConfig, theme: t.id as any };
                            setAppConfig(updatedConfig);
                            localStorage.setItem('ff_app_config', JSON.stringify(updatedConfig));
                            socket.emit('update_data', { appConfig: updatedConfig });
                            showToast(`${t.label} activated!`, 'success');
                          }}
                          className={`p-6 rounded-2xl border transition-all text-left space-y-3 ${
                            appConfig.theme === t.id 
                              ? 'bg-pink-500/20 border-pink-500' 
                              : 'bg-black/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`${appConfig.theme === t.id ? 'text-pink-500' : 'text-gray-500'}`}>
                            {t.icon}
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight">{t.label}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {appConfig.theme === 'event' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-6"
                      >
                        <h4 className="text-xs font-black uppercase tracking-widest text-pink-500">Event Configuration</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const updatedConfig = {
                            ...appConfig,
                            eventThemeConfig: {
                              name: formData.get('eventName') as string,
                              primaryColor: formData.get('primaryColor') as string,
                              secondaryColor: formData.get('secondaryColor') as string
                            }
                          };
                          setAppConfig(updatedConfig);
                          localStorage.setItem('ff_app_config', JSON.stringify(updatedConfig));
                          socket.emit('update_data', { appConfig: updatedConfig });
                          showToast('Event theme updated!', 'success');
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Event Name</label>
                            <input 
                              name="eventName" 
                              defaultValue={appConfig.eventThemeConfig?.name} 
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Color (Hex)</label>
                            <div className="flex gap-2">
                              <input 
                                name="primaryColor" 
                                type="color"
                                defaultValue={appConfig.eventThemeConfig?.primaryColor} 
                                className="w-12 h-12 bg-transparent border-none cursor-pointer" 
                              />
                              <input 
                                name="primaryColorText" 
                                value={appConfig.eventThemeConfig?.primaryColor}
                                readOnly
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secondary Color (Hex)</label>
                            <div className="flex gap-2">
                              <input 
                                name="secondaryColor" 
                                type="color"
                                defaultValue={appConfig.eventThemeConfig?.secondaryColor} 
                                className="w-12 h-12 bg-transparent border-none cursor-pointer" 
                              />
                              <input 
                                name="secondaryColorText" 
                                value={appConfig.eventThemeConfig?.secondaryColor}
                                readOnly
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none" 
                              />
                            </div>
                          </div>
                          <button type="submit" className="md:col-span-2 py-4 bg-pink-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-pink-400 transition-all">
                            Save Event Theme
                          </button>
                        </form>
                      </motion.div>
                    )}

                    <div className="bg-pink-500/5 border border-pink-500/10 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-pink-500/20 rounded-xl text-pink-500">
                          <Info size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight text-pink-500">Theme Preview</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed mt-1">
                            Theme changes are applied globally in real-time. Event themes allow you to customize the primary and secondary colors for special occasions like tournaments or holidays.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'staff' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <ShieldCheck className="text-teal-500" />
                        Staff Control & Permissions
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      {users.filter(u => u.role === 'moderator' || u.role === 'admin').map(staff => (
                        <div key={staff.userId} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-500 border border-teal-500/30">
                                <User size={24} />
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase italic tracking-tight">{staff.gameName}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Role: {staff.role}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const newRole = staff.role === 'admin' ? 'moderator' : 'admin';
                                  const updatedUsers = users.map(u => u.userId === staff.userId ? { ...u, role: newRole } : u);
                                  setUsers(updatedUsers);
                                  localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
                                  showToast(`Role updated to ${newRole}`, 'success');
                                }}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                              >
                                Change Role
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Permissions</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { id: 'verify_payments', label: 'Verify Payments' },
                                { id: 'manage_matches', label: 'Manage Matches' },
                                { id: 'manage_users', label: 'Manage Users' },
                                { id: 'send_notifs', label: 'Send Notifications' },
                                { id: 'view_reports', label: 'View Reports' },
                                { id: 'delete_data', label: 'Delete Data' },
                              ].map(perm => (
                                <label key={perm.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={(staff.moderatorPermissions || []).includes(perm.id)}
                                    onChange={(e) => {
                                      const currentPerms = staff.moderatorPermissions || [];
                                      const newPerms = e.target.checked 
                                        ? [...currentPerms, perm.id]
                                        : currentPerms.filter(p => p !== perm.id);
                                      updateModeratorPermissions(staff.userId, newPerms);
                                    }}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500"
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{perm.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {adminSubView === 'fraud_reports' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <ShieldAlert className="text-red-500" />
                        Fraud Reports & Blacklist
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      {users.filter(u => (u.fakeTrxCount || 0) > 0).sort((a, b) => (b.fakeTrxCount || 0) - (a.fakeTrxCount || 0)).map(fraudster => (
                        <div key={fraudster.userId} className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 border border-red-500/30">
                                <User size={24} />
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase italic tracking-tight">{fraudster.gameName}</h4>
                                <p className="text-[10px] text-red-500 uppercase font-black tracking-widest">Fake Trx Count: {fraudster.fakeTrxCount}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!fraudster.isPermanentlyBanned ? (
                                <button 
                                  onClick={() => banUser(fraudster.userId)}
                                  className="px-6 py-3 bg-red-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all"
                                >
                                  Ban Hammer
                                </button>
                              ) : (
                                <div className="px-6 py-3 bg-black/40 border border-red-500/30 text-red-500 font-black uppercase tracking-widest rounded-xl">
                                  Banned
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                              <span>IP Address</span>
                              <span className="text-white">192.168.1.1 (Mocked)</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                              <span>Device ID</span>
                              <span className="text-white">RK-DEV-{fraudster.userId.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {adminSubView === 'squads' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <Users className="text-orange-500" />
                        Squad Management
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from(new Set(users.filter(u => u.squadName).map(u => u.squadName))).map(squadName => {
                        const members = users.filter(u => u.squadName === squadName);
                        const squadLogo = members.find(m => m.squadLogo)?.squadLogo;
                        
                        return (
                          <div key={squadName} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                {squadLogo ? (
                                  <img src={squadLogo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Users size={24} className="text-gray-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase italic tracking-tight">{squadName}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{members.length} Members</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Members</label>
                              <div className="flex flex-wrap gap-2">
                                {members.map(member => (
                                  <div key={member.userId} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-gray-400 uppercase">
                                    @{member.userId}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {adminSubView === 'ip_bans' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <ShieldAlert className="text-red-500" />
                        IP Ban Management
                      </h3>
                      <button 
                        onClick={() => {
                          const ip = prompt('Enter IP address to ban:');
                          if (ip && ip.trim()) {
                            if (appConfig.ipBanList.includes(ip.trim())) {
                              showToast('IP already banned!', 'info');
                            } else {
                              setAppConfig({ ...appConfig, ipBanList: [...appConfig.ipBanList, ip.trim()] });
                              showToast('IP added to ban list!', 'success');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Add New IP
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">
                        <Globe size={12} className="text-teal-500" />
                        Currently Banned IP Addresses ({appConfig.ipBanList?.length || 0})
                      </div>
                      
                      {(!appConfig.ipBanList || appConfig.ipBanList.length === 0) ? (
                        <div className="text-center py-12 space-y-4">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                            <ShieldAlert size={32} />
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No IP addresses are currently banned.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {appConfig.ipBanList.map(ip => (
                            <div key={ip} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-red-500/20 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                                  <Globe size={16} />
                                </div>
                                <div>
                                  <div className="text-sm font-mono font-bold text-white">{ip}</div>
                                  <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Status: Permanently Blocked</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  confirmAction(
                                    'Unban IP',
                                    `Are you sure you want to remove ${ip} from the ban list?`,
                                    () => {
                                      setAppConfig({ ...appConfig, ipBanList: appConfig.ipBanList.filter(i => i !== ip) });
                                      showToast('IP Unbanned!', 'success');
                                    }
                                  );
                                }}
                                className="p-2 bg-white/5 text-gray-500 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-4 items-start">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-500">Security Note</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                          Banning an IP will immediately block all requests from that address. This is a powerful tool to stop DDoS attacks, bot spam, or persistent rule breakers. Use with caution as some users might share public IPs.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {adminSubView === 'users' && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
                        <Users className="text-orange-500" />
                        User Management
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => exportToExcel(users, 'RK_Users_List')}
                          className="px-3 py-1 bg-teal-500 text-black rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-1"
                        >
                          <Download size={10} /> Export Excel
                        </button>
                        <button 
                          onClick={() => setUserSearchTerm(userSearchTerm === 'is:banned' ? '' : 'is:banned')}
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                            userSearchTerm === 'is:banned' ? 'bg-red-500 text-black' : 'bg-white/5 text-gray-500 border border-white/10'
                          }`}
                        >
                          Banned
                        </button>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                          <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={userSearchTerm === 'is:banned' ? '' : userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-[10px] outline-none focus:border-orange-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {users.filter(u => {
                        if (userSearchTerm === 'is:banned') return u.isBanned;
                        return u.gameName?.toLowerCase()?.includes(userSearchTerm.toLowerCase()) || 
                               u.userId?.toLowerCase()?.includes(userSearchTerm.toLowerCase());
                      }).map(u => (
                        <div key={u.userId} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold uppercase italic">{u.gameName}</div>
                              {u.isBanned && (
                                <span className="px-2 py-0.5 bg-red-500 text-black text-[8px] font-black uppercase rounded-full">Banned</span>
                              )}
                              {u.isSuspicious && (
                                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black uppercase rounded-full">Suspicious</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ID: {u.userId}</div>
                            <div className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mt-1">
                              Balance: ৳{u.balance} | Winnings: ৳{u.winnings}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                              <MapPin size={10} className="text-orange-500" />
                              District: <span className="text-white">{u.district || 'N/A'}</span>
                            </div>
                            {(u.registrationIp || u.lastLoginIp) && (
                              <div className="mt-2 p-2 bg-black/40 rounded-xl border border-white/5 space-y-1">
                                <div className="flex items-center gap-2 text-[8px] text-gray-500 uppercase font-black tracking-widest">
                                  <Globe size={10} className="text-teal-500" />
                                  Reg IP: <span className="text-gray-300">{u.registrationIp || 'N/A'}</span>
                                  {u.registrationIp && !appConfig.ipBanList?.includes(u.registrationIp) && (
                                    <button 
                                      onClick={() => {
                                        confirmAction(
                                          'Ban IP',
                                          `Are you sure you want to ban IP ${u.registrationIp}?`,
                                          () => {
                                            setAppConfig({ ...appConfig, ipBanList: [...appConfig.ipBanList, u.registrationIp!] });
                                            showToast('IP Banned!', 'success');
                                          }
                                        );
                                      }}
                                      className="ml-2 text-red-500 hover:underline"
                                    >
                                      Ban IP
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[8px] text-gray-500 uppercase font-black tracking-widest">
                                  <Smartphone size={10} className="text-orange-500" />
                                  Device: <span className="text-gray-300 truncate max-w-[150px]">{u.registrationDevice || 'N/A'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                confirmAction(
                                  u.role === 'admin' ? 'Remove Admin' : 'Make Admin',
                                  `Are you sure you want to ${u.role === 'admin' ? 'remove' : 'make'} ${u.gameName} as admin?`,
                                  () => {
                                    const updatedUser = { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
                                    const updatedUsers = users.map(user => user.userId === u.userId ? updatedUser : user);
                                    setUsers(updatedUsers);
                                    localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
                                    showToast(`User ${u.gameName} is now ${updatedUser.role}!`, 'success');
                                  }
                                );
                              }}
                              className={`p-2 rounded-lg ${u.role === 'admin' ? 'bg-teal-500 text-black' : 'bg-teal-500/10 text-teal-500'}`}
                              title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            >
                              <ShieldCheck size={18} />
                            </button>
                            <button 
                              onClick={() => setEditingUser(u)}
                              className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"
                            >
                              <User size={18} />
                            </button>
                            <button 
                              onClick={() => setEditingUser(u)}
                              className={`p-2 rounded-lg ${u.isBanned ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                            >
                              <ShieldAlert size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {adminSubView === 'auditor' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <ShieldCheck className="text-teal-500" />
                        Auditor History (Super Admin)
                      </h3>
                      <button 
                        onClick={() => exportToExcel(auditorLogs, 'RK_Auditor_History')}
                        className="px-4 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all flex items-center gap-2"
                      >
                        <Download size={14} /> Export History
                      </button>
                    </div>
                    <div className="space-y-4">
                      {auditorLogs.length === 0 ? (
                        <div className="text-center py-20 bg-black/40 border border-white/5 rounded-2xl opacity-50">
                          <p className="text-xs font-bold uppercase tracking-widest">No auditor logs found.</p>
                        </div>
                      ) : (
                        auditorLogs.map(log => (
                          <div key={log.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-2 group hover:border-teal-500/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500">
                                  <User size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase italic tracking-tight">{log.adminName}</p>
                                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Admin ID: {log.adminId}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-teal-500/20 text-teal-500 rounded-full">{log.action}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[10px] text-gray-300 italic leading-relaxed">"{log.details}"</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'nfts' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black uppercase italic flex items-center gap-2">
                          <Award className="text-yellow-500" /> NFT Management
                        </h3>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Total NFTs: {nftBadges.length}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Give NFT Form */}
                        <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black uppercase tracking-widest text-orange-500">Give New NFT</h4>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedNFTTemplate(null)}
                                className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${!selectedNFTTemplate ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 text-gray-400 border-white/10'}`}
                              >
                                Custom
                              </button>
                              <button 
                                onClick={() => setSelectedNFTTemplate(NFT_TEMPLATES[0])}
                                className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${selectedNFTTemplate ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 text-gray-400 border-white/10'}`}
                              >
                                Templates
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Select User</label>
                              <select 
                                value={selectedUserForNFT}
                                onChange={(e) => setSelectedUserForNFT(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                              >
                                <option value="">Choose a warrior...</option>
                                {users.map(u => (
                                  <option key={u.userId} value={u.userId}>@{u.userId} ({u.gameName})</option>
                                ))}
                              </select>
                            </div>

                            {selectedNFTTemplate ? (
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Select NFT Template</label>
                                <div className="grid grid-cols-2 gap-3">
                                  {NFT_TEMPLATES.map((template, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedNFTTemplate(template)}
                                      className={`p-3 rounded-2xl border transition-all text-left space-y-2 ${
                                        selectedNFTTemplate?.name === template.name 
                                          ? 'bg-orange-500/20 border-orange-500' 
                                          : 'bg-white/5 border-white/10 hover:border-white/20'
                                      }`}
                                    >
                                      <img src={template.image} alt={template.name} className="w-full h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
                                      <div>
                                        <p className="text-[10px] font-black uppercase text-white leading-tight">{template.name}</p>
                                        <p className={`text-[8px] font-bold uppercase ${
                                          template.rarity === 'Legendary' ? 'text-yellow-500' :
                                          template.rarity === 'Epic' ? 'text-purple-500' :
                                          template.rarity === 'Rare' ? 'text-blue-500' : 'text-gray-500'
                                        }`}>{template.rarity}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">NFT Name</label>
                                  <input 
                                    type="text"
                                    value={customNFT.name}
                                    onChange={(e) => setCustomNFT(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Master of Arena"
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Image URL or Upload</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={customNFT.image}
                                      onChange={(e) => setCustomNFT(prev => ({ ...prev, image: e.target.value }))}
                                      placeholder="https://..."
                                      className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                                    />
                                    <label className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                                      <Camera size={20} />
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleImageUpload(file, (url) => setCustomNFT(prev => ({ ...prev, image: url })));
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Rarity</label>
                                  <select 
                                    value={customNFT.rarity}
                                    onChange={(e) => setCustomNFT(prev => ({ ...prev, rarity: e.target.value as any }))}
                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-orange-500 outline-none transition-all"
                                  >
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Legendary">Legendary</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => handleGiveNFT(!selectedNFTTemplate)}
                              disabled={!selectedUserForNFT || (!selectedNFTTemplate && (!customNFT.name || !customNFT.image))}
                              className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
                            >
                              Mint & Give NFT
                            </button>
                          </div>
                        </div>

                        {/* NFT Stats/Info */}
                        <div className="space-y-6">
                          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-teal-500 mb-4">NFT Distribution</h4>
                            <div className="space-y-4">
                              {['Legendary', 'Epic', 'Rare', 'Common'].map(rarity => {
                                const count = nftBadges.filter(b => b.rarity === rarity).length;
                                const percentage = nftBadges.length > 0 ? (count / nftBadges.length) * 100 : 0;
                                return (
                                  <div key={rarity} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                      <span className="text-gray-400">{rarity}</span>
                                      <span className="text-white">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className={`h-full rounded-full ${
                                          rarity === 'Legendary' ? 'bg-yellow-500' :
                                          rarity === 'Epic' ? 'bg-purple-500' :
                                          rarity === 'Rare' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                            <p className="text-[10px] font-bold text-orange-500 uppercase leading-relaxed">
                              Admin NFT Control allows you to reward top performers, loyal users, or winners of special events with unique digital collectibles. These badges are visible on their profiles.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All NFTs List */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white ml-2">All Minted NFTs</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {nftBadges.map(nft => (
                            <div key={nft.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3 group hover:border-white/20 transition-all">
                              <div className="relative aspect-square rounded-xl overflow-hidden">
                                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                                  {nft.rarity}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-white truncate">{nft.name}</p>
                                <p className="text-[8px] font-bold text-orange-500 uppercase">@{nft.ownerId}</p>
                                <p className="text-[8px] text-gray-500 font-medium">{nft.mintDate}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  confirmAction(
                                    'Burn NFT',
                                    'Are you sure you want to burn this NFT?',
                                    () => {
                                      setNftBadges(prev => prev.filter(b => b.id !== nft.id));
                                      showToast('NFT burned successfully', 'info');
                                    }
                                  );
                                }}
                                className="w-full py-2 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              >
                                Burn NFT
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'mystery_boxes' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black uppercase italic flex items-center gap-2">
                          <Package className="text-purple-500" /> Mystery Box Management
                        </h3>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Total Boxes: {mysteryBoxes.length}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Create Mystery Box Form */}
                        <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5">
                          <h4 className="text-sm font-black uppercase tracking-widest text-purple-500">Create New Box</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Box Name</label>
                              <input 
                                type="text"
                                value={newMysteryBox.name}
                                onChange={(e) => setNewMysteryBox(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Legendary Crate"
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-purple-500 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Image URL or Upload</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={newMysteryBox.image}
                                  onChange={(e) => setNewMysteryBox(prev => ({ ...prev, image: e.target.value }))}
                                  placeholder="https://..."
                                  className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-purple-500 outline-none transition-all"
                                />
                                <label className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                                  <Camera size={20} />
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(file, (url) => setNewMysteryBox(prev => ({ ...prev, image: url })));
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Price (৳)</label>
                              <input 
                                type="number"
                                value={newMysteryBox.price}
                                onChange={(e) => setNewMysteryBox(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-purple-500 outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 block">Prizes & Chances</label>
                                <button 
                                  onClick={() => {
                                    setNewMysteryBox(prev => ({
                                      ...prev,
                                      prizes: [...(prev.prizes || []), { type: 'balance', amount: 0, chance: 0.1, image: '', name: '' }]
                                    }));
                                  }}
                                  className="text-[8px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-400"
                                >
                                  + Add Prize
                                </button>
                              </div>
                              {newMysteryBox.prizes?.map((prize, idx) => (
                                <div key={idx} className="space-y-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                                  <div className="grid grid-cols-3 gap-2">
                                    <select 
                                      value={prize.type}
                                      onChange={(e) => {
                                        const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                        updatedPrizes[idx] = { ...prize, type: e.target.value as any };
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                                    >
                                      <option value="balance">Balance</option>
                                      <option value="diamonds">Diamonds</option>
                                      <option value="xp">XP</option>
                                      <option value="coupon">Coupon</option>
                                      <option value="nft">NFT</option>
                                      <option value="badge">Badge</option>
                                      <option value="frame">Frame</option>
                                      <option value="skin">Skin</option>
                                      <option value="custom">Custom</option>
                                    </select>
                                    <input 
                                      type="text"
                                      value={prize.name}
                                      onChange={(e) => {
                                        const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                        updatedPrizes[idx] = { ...prize, name: e.target.value };
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      placeholder="Prize Name"
                                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                                    />
                                    <input 
                                      type="number"
                                      value={prize.amount}
                                      onChange={(e) => {
                                        const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                        updatedPrizes[idx] = { ...prize, amount: Number(e.target.value) };
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      placeholder="Amount"
                                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="number"
                                      step="0.01"
                                      value={prize.chance}
                                      onChange={(e) => {
                                        const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                        updatedPrizes[idx] = { ...prize, chance: Number(e.target.value) };
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      placeholder="Chance (0-1)"
                                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={prize.image}
                                      onChange={(e) => {
                                        const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                        updatedPrizes[idx] = { ...prize, image: e.target.value };
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      placeholder="Prize Image URL"
                                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
                                    />
                                    <label className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                                      <Camera size={14} />
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleImageUpload(file, (url) => {
                                            const updatedPrizes = [...(newMysteryBox.prizes || [])];
                                            updatedPrizes[idx] = { ...prize, image: url };
                                            setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                          });
                                        }}
                                      />
                                    </label>
                                    <button 
                                      onClick={() => {
                                        const updatedPrizes = (newMysteryBox.prizes || []).filter((_, i) => i !== idx);
                                        setNewMysteryBox(prev => ({ ...prev, prizes: updatedPrizes }));
                                      }}
                                      className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={handleCreateMysteryBox}
                              className="w-full py-4 bg-purple-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20"
                            >
                              Create Mystery Box
                            </button>
                          </div>
                        </div>

                        {/* Existing Boxes List */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white ml-2">Active Mystery Boxes</h4>
                          <div className="space-y-3">
                            {mysteryBoxes.map(box => (
                              <div key={box.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
                                    <Package size={20} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase text-white">{box.name}</p>
                                    <p className="text-[10px] font-bold text-orange-500 uppercase">৳{box.price}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setBoxToDelete(box.id)}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                      {boxToDelete && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setBoxToDelete(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                          />
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-6 text-center space-y-6 shadow-2xl"
                          >
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto">
                              <AlertCircle size={32} />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-xl font-black uppercase italic">Delete Box?</h3>
                              <p className="text-xs text-gray-400 font-medium">This action cannot be undone. Are you sure you want to remove this mystery box?</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setBoxToDelete(null)}
                                className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  setMysteryBoxes(prev => prev.filter(b => b.id !== boxToDelete));
                                  showToast('Mystery box deleted', 'info');
                                  setBoxToDelete(null);
                                }}
                                className="py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {adminSubView === 'sponsorships' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black uppercase italic flex items-center gap-2">
                          <Handshake className="text-emerald-500" /> Sponsorship Management
                        </h3>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Total Active: {sponsorships.length}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Create Sponsorship Form */}
                        <div className="space-y-6 bg-black/40 p-6 rounded-3xl border border-white/5">
                          <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Add New Sponsorship</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Team Name</label>
                              <input 
                                type="text"
                                value={newSponsorship.teamName}
                                onChange={(e) => setNewSponsorship(prev => ({ ...prev, teamName: e.target.value }))}
                                placeholder="e.g. Team Bangladesh"
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Amount (৳)</label>
                              <input 
                                type="number"
                                value={newSponsorship.amount}
                                onChange={(e) => setNewSponsorship(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Description</label>
                              <textarea 
                                value={newSponsorship.description}
                                onChange={(e) => setNewSponsorship(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Details about this sponsorship..."
                                className="w-full h-24 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                              />
                            </div>

                            <button
                              onClick={handleCreateSponsorship}
                              className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              Add Sponsorship
                            </button>
                          </div>
                        </div>

                        {/* Existing Sponsorships List */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white ml-2">Current Sponsorships</h4>
                          <div className="space-y-3">
                            {sponsorships.map(sponsor => (
                              <div key={sponsor.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                                    <Handshake size={20} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black uppercase text-white">{sponsor.teamName}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase">৳{sponsor.amount} • {sponsor.status}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    confirmAction(
                                      'Delete Sponsorship',
                                      'Are you sure you want to delete this sponsorship?',
                                      () => {
                                        setSponsorships(prev => prev.filter(s => s.id !== sponsor.id));
                                        showToast('Sponsorship deleted', 'info');
                                      }
                                    );
                                  }}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'moderator_activity' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Activity className="text-blue-500" />
                        Moderator Activity (Live)
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Live Updates</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {moderatorActivities.length === 0 ? (
                        <div className="text-center py-20 bg-black/40 border border-white/5 rounded-2xl opacity-50">
                          <p className="text-xs font-bold uppercase tracking-widest">No moderator activities found.</p>
                        </div>
                      ) : (
                        moderatorActivities.map(log => (
                          <div key={log.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-2 group hover:border-blue-500/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                  <User size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase italic tracking-tight">{log.adminName}</p>
                                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Moderator ID: {log.adminId}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded-full">{log.action}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[10px] text-gray-300 italic leading-relaxed">"{log.details}"</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'logs' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <History className="text-gray-300" />
                        Transaction Logs
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => exportToExcel(transactionLogs, 'RK_Transaction_Logs')}
                          className="px-3 py-1 bg-teal-500 text-black rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-1"
                        >
                          <Download size={10} /> Export Excel
                        </button>
                        <button 
                          onClick={() => {
                            confirmAction(
                              'Clear Logs',
                              'Are you sure you want to clear all logs?',
                              () => {
                                setTransactionLogs([]);
                              }
                            );
                          }}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-red-500"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                      {transactionLogs.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm italic">No transaction logs yet.</p>
                      ) : (
                        transactionLogs.sort((a, b) => b.timestamp - a.timestamp).map(log => (
                          <div key={log.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  log.type === 'payment' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                  {log.type}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  log.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              <div className="text-sm font-black uppercase italic tracking-tight">৳{log.amount} via {log.method}</div>
                              <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">
                                User ID: {log.userId} • {new Date(log.timestamp).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-gray-400 italic">{log.details}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {adminSubView === 'comparison' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Users className="text-orange-500" />
                        Player Comparison Card
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player 1 (User ID)</label>
                        <select 
                          value={playerComparison.player1?.userId || ''}
                          onChange={(e) => {
                            const user = users.find(u => u.userId === e.target.value);
                            setPlayerComparison(prev => ({ ...prev, player1: user || null }));
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none appearance-none"
                        >
                          <option value="">Select Player 1</option>
                          {users.map(u => <option key={u.userId} value={u.userId}>{u.gameName} ({u.userId})</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player 2 (User ID)</label>
                        <select 
                          value={playerComparison.player2?.userId || ''}
                          onChange={(e) => {
                            const user = users.find(u => u.userId === e.target.value);
                            setPlayerComparison(prev => ({ ...prev, player2: user || null }));
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none appearance-none"
                        >
                          <option value="">Select Player 2</option>
                          {users.map(u => <option key={u.userId} value={u.userId}>{u.gameName} ({u.userId})</option>)}
                        </select>
                      </div>
                    </div>

                    {playerComparison.player1 && playerComparison.player2 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-orange-500 text-black rounded-full flex items-center justify-center font-black italic text-xl border-4 border-black shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                          VS
                        </div>
                        
                        {[playerComparison.player1, playerComparison.player2].map((p, idx) => (
                          <div key={p.userId} className={`bg-black/40 border border-white/10 rounded-3xl p-6 space-y-6 ${idx === 0 ? 'text-right' : 'text-left'}`}>
                            <div className={`flex items-center gap-4 ${idx === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                                  <User size={32} className="text-white" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase italic tracking-tighter">{p.gameName}</h4>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ID: {p.userId}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Win Rate</p>
                                <p className="text-2xl font-black italic text-orange-500">{((p.wins || 0) / (p.matchesPlayed || 1) * 100).toFixed(1)}%</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">K/D Ratio</p>
                                <p className="text-2xl font-black italic text-teal-500">{((p.totalKills || 0) / (p.matchesPlayed || 1)).toFixed(2)}</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Wins</p>
                                <p className="text-2xl font-black italic">{p.wins || 0}</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">XP Level</p>
                                <p className="text-2xl font-black italic">{Math.floor((p.xp || 0) / 1000)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-black/40 border border-white/5 rounded-3xl opacity-50">
                        <p className="text-sm font-black uppercase tracking-widest">Select two players to compare their battle stats.</p>
                      </div>
                    )}
                  </div>
                )}

                {adminSubView === 'advanced' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Advanced System Controls</h2>
                    <button 
                      onClick={() => {
                        confirmAction(
                          'Emergency Shutdown',
                          'CRITICAL: This will immediately shutdown all user access. Proceed?',
                          () => {
                            setAppConfig({ ...appConfig, isKillSwitchActive: !appConfig.isKillSwitchActive });
                            logAuditorAction('KILL_SWITCH', `Kill switch ${!appConfig.isKillSwitchActive ? 'ACTIVATED' : 'DEACTIVATED'}`);
                          }
                        );
                      }}
                      className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
                        appConfig.isKillSwitchActive 
                          ? 'bg-green-500 text-black hover:bg-green-400' 
                          : 'bg-red-500 text-black hover:bg-red-400 animate-pulse'
                      }`}
                    >
                      <Zap size={20} />
                      {appConfig.isKillSwitchActive ? 'Deactivate Kill Switch' : 'Activate Kill Switch'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                        <Settings size={16} /> One-Click Feature Toggles
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(appConfig.featureToggles || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-white">{key.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Toggle this feature for all users</p>
                            </div>
                            <button 
                              onClick={() => {
                                const newToggles = { ...(appConfig.featureToggles || {}), [key]: !value };
                                setAppConfig({ ...appConfig, featureToggles: newToggles });
                                logAuditorAction('FEATURE_TOGGLE', `${key} set to ${!value}`);
                              }}
                              className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-orange-500' : 'bg-gray-800'}`}
                            >
                              <motion.div 
                                animate={{ x: value ? 24 : 4 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-teal-500 flex items-center gap-2">
                        <Shield size={16} /> Security & Performance
                      </h3>
                      <div className="space-y-4">
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                              <Globe size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest">CDN Integration</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Global content delivery active</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              animate={{ width: ['0%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="h-full bg-teal-500"
                            />
                          </div>
                        </div>

                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                              <Zap size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest">Zero-Latency Database</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Optimistic UI & Prefetching active</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                              <motion.div 
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                className="h-4 w-1 bg-purple-500 rounded-full"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                {adminSubView === 'shop' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <ShoppingBag className="text-pink-500" />
                        Store Management
                      </h3>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-teal-500">Mystery Box Manager</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const newBox: MysteryBox = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: form.boxName.value,
                          price: Number(form.boxPrice.value),
                          prizes: [
                            { type: 'balance', amount: 10, chance: 50 },
                            { type: 'balance', amount: 50, chance: 30 },
                            { type: 'balance', amount: 100, chance: 15 },
                            { type: 'balance', amount: 500, chance: 5 }
                          ]
                        };
                        setMysteryBoxes([...mysteryBoxes, newBox]);
                        form.reset();
                        showToast('Mystery Box added!', 'success');
                      }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="boxName" required placeholder="Box Name" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                        <input name="boxPrice" type="number" required placeholder="Price" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                        <button type="submit" className="md:col-span-2 py-3 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all">
                          Create Mystery Box
                        </button>
                      </form>
                      
                      <div className="space-y-2">
                        {mysteryBoxes.map(box => (
                          <div key={box.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold uppercase italic">{box.name} (৳{box.price})</span>
                            <button onClick={() => setMysteryBoxes(mysteryBoxes.filter(b => b.id !== box.id))} className="text-red-500 p-1 hover:bg-red-500/10 rounded">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Add New Product</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const newItem: ShopItem = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: form.productName.value,
                          description: form.description.value,
                          price: Number(form.price.value),
                          type: form.type.value as any,
                          color: form.color.value || undefined
                        };
                        setShopItems([...shopItems, newItem]);
                        form.reset();
                        showToast('Product added successfully!', 'success');
                      }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Name</label>
                          <input name="productName" required placeholder="e.g. Neon Frame" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Price (৳)</label>
                          <input name="price" type="number" required placeholder="500" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                          <textarea name="description" required placeholder="Describe the item..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none h-20 resize-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
                          <select name="type" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none appearance-none">
                            <option value="frame">Profile Frame</option>
                            <option value="badge">Badge</option>
                            <option value="entry_card">Entry Card</option>
                            <option value="name_color">Name Color</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Color (Hex Code, optional)</label>
                          <input name="color" placeholder="#FF0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                        </div>
                        <button type="submit" className="md:col-span-2 py-4 bg-pink-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-pink-400 transition-all flex items-center justify-center gap-2">
                          <Plus size={18} /> Add to Store
                        </button>
                      </form>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Current Inventory</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {shopItems.map(item => (
                          <div key={item.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                {item.type === 'frame' && <div className="w-8 h-8 rounded border-2" style={{ borderColor: item.color || '#fff' }} />}
                                {item.type === 'badge' && <Trophy className="text-yellow-500" size={24} />}
                                {item.type === 'entry_card' && <CreditCard className="text-teal-500" size={24} />}
                                {item.type === 'name_color' && <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.color || '#fff' }} />}
                              </div>
                              <div>
                                <div className="font-bold uppercase italic text-sm">{item.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">৳{item.price} • {item.type}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                confirmAction(
                                  'Delete Item',
                                  `Are you sure you want to delete ${item.name} from store?`,
                                  () => {
                                    setShopItems(shopItems.filter(i => i.id !== item.id));
                                  }
                                );
                              }}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'topup' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Smartphone className="text-teal-500" />
                        Topup Requests ({topupRequests.filter(r => r.status === 'pending').length})
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {topupRequests.filter(r => r.status === 'pending').length === 0 ? (
                        <p className="text-center py-12 text-gray-500 text-sm italic border border-white/5 rounded-3xl bg-black/20">No pending topup requests.</p>
                      ) : (
                        topupRequests.filter(r => r.status === 'pending').map(request => (
                          <div key={request.id} className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4 group hover:border-teal-500/30 transition-all">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="text-2xl font-black text-teal-500 italic leading-none">{request.diamonds} Diamonds</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player ID: <span className="text-white font-mono">{request.gameId}</span></div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">User ID: <span className="text-white">{request.userId}</span></div>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="text-lg font-black text-white italic leading-none">৳{request.price}</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-gray-500">{new Date(request.timestamp).toLocaleString()}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                  const updated = topupRequests.map(r => r.id === request.id ? { ...r, status: 'approved' as const } : r);
                                  setTopupRequests(updated);
                                  
                                  // Send notification
                                  const newNotif: Notification = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    userId: request.userId,
                                    title: 'Topup Approved!',
                                    message: `Your topup request for ${request.diamonds} Diamonds has been approved.`,
                                    timestamp: Date.now(),
                                    isRead: false,
                                    type: 'success'
                                  };
                                  setNotifications([newNotif, ...notifications]);
                                  localStorage.setItem('ff_notifications', JSON.stringify([newNotif, ...notifications]));
                                  updateMissionProgress('topup', 1, request.userId);

                                  showToast('Topup request approved!', 'success');
                                }}
                                className="flex-1 py-3 bg-teal-500 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
                              >
                                <Check size={16} /> Mark as Done
                              </button>
                              <button 
                                onClick={() => {
                                  confirmAction(
                                    'Reject Topup',
                                    'Are you sure you want to reject this topup request and refund the user?',
                                    () => {
                                      const updated = topupRequests.map(r => r.id === request.id ? { ...r, status: 'rejected' as const } : r);
                                      setTopupRequests(updated);
                                      
                                      // Send notification
                                      const newNotif: Notification = {
                                      id: Math.random().toString(36).substr(2, 9),
                                      userId: request.userId,
                                      title: 'Topup Rejected',
                                      message: `Your topup request for ${request.diamonds} Diamonds was rejected. Balance refunded.`,
                                      timestamp: Date.now(),
                                      isRead: false,
                                      type: 'warning'
                                    };
                                    setNotifications([newNotif, ...notifications]);
                                    localStorage.setItem('ff_notifications', JSON.stringify([newNotif, ...notifications]));

                                    // Refund user
                                    const user = users.find(u => u.userId === request.userId);
                                    if (user) {
                                      const updatedUser = { ...user, balance: user.balance + request.price };
                                      const updatedUsers = users.map(u => u.userId === user.userId ? updatedUser : u);
                                      setUsers(updatedUsers);
                                      if (currentUser?.userId === user.userId) {
                                        setCurrentUser(updatedUser);
                                        localStorage.setItem('ff_session', JSON.stringify(updatedUser));
                                      }
                                      localStorage.setItem('ff_users', JSON.stringify(updatedUsers));
                                    }
                                    showToast('Topup request rejected and refunded.', 'info');
                                  }
                                );
                              }}
                                className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                <X size={16} /> Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Recent History</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                        {topupRequests.filter(r => r.status !== 'pending').sort((a, b) => b.timestamp - a.timestamp).map(request => (
                          <div key={request.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center opacity-60">
                            <div>
                              <div className="text-sm font-black italic">{request.diamonds} Diamonds</div>
                              <div className="text-[8px] font-black uppercase tracking-widest text-gray-500">ID: {request.gameId} • {request.status}</div>
                            </div>
                            <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                              request.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {request.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'topup_packages' && (
                  <div className="space-y-8">
                    {/* Topup Categories Section */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                          <LayoutGrid className="text-pink-500" />
                          Manage Topup Categories
                        </h3>
                        <button 
                          onClick={() => setShowAddCategoryModal(true)}
                          className="px-4 py-2 bg-pink-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-pink-400 transition-all flex items-center gap-2"
                        >
                          <Plus size={14} /> Add Category
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topupCategories.map(cat => (
                          <div key={cat.id} className="bg-black/40 border border-white/10 p-4 rounded-3xl flex justify-between items-center group hover:border-pink-500/30 transition-all">
                            <div className="flex items-center gap-4">
                              {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.label} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-white/10">
                                  <Smartphone size={20} className="text-pink-500" />
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="text-sm font-black text-pink-500 italic leading-none">{cat.label}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                  {topupPackages.filter(p => p.category === cat.id).length} Packages
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                confirmAction(
                                  'Delete Category',
                                  `Are you sure you want to delete "${cat.label}"? This will NOT delete the packages in this category, but they will become uncategorized.`,
                                  async () => {
                                    if (cat.imageUrl) {
                                      try {
                                        await fetch('/api/delete/image', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ imageUrl: cat.imageUrl })
                                        });
                                      } catch (e) {
                                        console.error("Error deleting image:", e);
                                      }
                                    }
                                    const updated = topupCategories.filter(c => c.id !== cat.id);
                                    setTopupCategories(updated);
                                    syncData({ topupCategories: updated });
                                    showToast('Category deleted successfully.', 'success');
                                  }
                                );
                              }}
                              className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                          <Smartphone className="text-teal-500" />
                          Manage Topup Packages
                        </h3>
                        <button 
                          onClick={() => setShowAddTopupModal(true)}
                          className="px-4 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-400 transition-all flex items-center gap-2"
                        >
                          <Plus size={14} /> Add Package
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {topupPackages.map(pkg => (
                          <div key={pkg.id} className="bg-black/40 border border-white/10 p-4 rounded-3xl flex justify-between items-center group hover:border-teal-500/30 transition-all">
                            <div className="flex items-center gap-4">
                              {pkg.imageUrl ? (
                                <img src={pkg.imageUrl} alt={pkg.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/10">
                                  <Smartphone size={20} className="text-teal-500" />
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="text-sm font-black text-teal-500 italic leading-none">{pkg.name}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{pkg.diamonds} Diamonds • <span className="text-white">৳{pkg.price}</span> • <span className="text-teal-500/50">{pkg.category}</span></div>
                                <div className="flex gap-2">
                                  {pkg.tag && <div className="text-[8px] font-black uppercase tracking-widest text-pink-500">{pkg.tag}</div>}
                                  <div className={`text-[8px] font-black uppercase tracking-widest ${pkg.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{pkg.status}</div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                confirmAction(
                                  'Delete Package',
                                  `Are you sure you want to delete "${pkg.name}"?`,
                                  async () => {
                                    if (pkg.imageUrl) {
                                      try {
                                        await fetch('/api/delete/image', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ imageUrl: pkg.imageUrl })
                                        });
                                      } catch (e) {
                                        console.error("Error deleting image:", e);
                                      }
                                    }
                                    const updated = topupPackages.filter(p => p.id !== pkg.id);
                                    setTopupPackages(updated);
                                    localStorage.setItem('ff_topup_packages', JSON.stringify(updated));
                                    syncData({ topupPackages: updated });
                                  }
                                );
                              }}
                              className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'maintenance' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <ShieldAlert className="text-red-500" />
                        Maintenance Settings
                      </h3>
                    </div>

                    {/* Global Site Maintenance */}
                    <div className={`p-6 rounded-3xl border transition-all ${appConfig.isMaintenanceMode ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="text-xl font-black uppercase italic">Global Site Maintenance</div>
                          <p className="text-xs text-gray-500 font-medium">When enabled, the entire site will be inaccessible to regular users.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const updatedConfig = { ...appConfig, isMaintenanceMode: !appConfig.isMaintenanceMode };
                            setAppConfig(updatedConfig);
                            localStorage.setItem('ff_config', JSON.stringify(updatedConfig));
                          }}
                          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            appConfig.isMaintenanceMode 
                            ? 'bg-green-500 text-black hover:bg-green-400' 
                            : 'bg-red-500 text-white hover:bg-red-400'
                          }`}
                        >
                          {appConfig.isMaintenanceMode ? 'Turn Site ON' : 'Turn Site OFF'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Individual Feature Maintenance</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(appConfig.featureMaintenance || {}).map(([feature, isUnderMaintenance]) => (
                          <div key={feature} className={`bg-black/40 border p-5 rounded-3xl flex justify-between items-center group transition-all ${isUnderMaintenance ? 'border-red-500/30' : 'border-white/10 hover:border-white/20'}`}>
                            <div className="space-y-1">
                              <div className="text-sm font-black text-white uppercase italic leading-none">{feature}</div>
                              <div className={`text-[9px] font-black uppercase tracking-widest ${isUnderMaintenance ? 'text-red-500' : 'text-green-500'}`}>
                                {isUnderMaintenance ? 'Maintenance' : 'Active'}
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const updatedConfig = {
                                  ...appConfig,
                                  featureMaintenance: {
                                    ...(appConfig.featureMaintenance || {}),
                                    [feature as keyof typeof appConfig.featureMaintenance]: !isUnderMaintenance
                                  }
                                };
                                setAppConfig(updatedConfig);
                                localStorage.setItem('ff_config', JSON.stringify(updatedConfig));
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                isUnderMaintenance 
                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                              }`}
                            >
                              {isUnderMaintenance ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Maintenance Message</h4>
                      <p className="text-[10px] text-gray-600 uppercase font-bold">This message will be shown when the site or a feature is under maintenance.</p>
                      <textarea 
                        value={appConfig.maintenanceMessage}
                        onChange={(e) => {
                          const updatedConfig = { ...appConfig, maintenanceMessage: e.target.value };
                          setAppConfig(updatedConfig);
                          localStorage.setItem('ff_config', JSON.stringify(updatedConfig));
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-500 outline-none transition-all min-h-[100px]"
                        placeholder="Enter maintenance message..."
                      />
                    </div>
                  </div>
                )}

                {adminSubView === 'analytics' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                      <BarChart3 className="text-teal-400" />
                      Financial Analytics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Revenue Overview</div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400">Total Deposits</div>
                            <div className="text-2xl font-black text-green-500 italic">৳{payments.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.amount, 0)}</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400">Total Payouts</div>
                            <div className="text-2xl font-black text-red-500 italic">৳{withdrawRequests.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0)}</div>
                          </div>
                          <div className="h-px bg-white/10" />
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-white">Net Profit</div>
                            <div className="text-3xl font-black text-orange-500 italic">
                              ৳{payments.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.amount, 0) - 
                                withdrawRequests.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">User Engagement</div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400">Total Registered Users</div>
                            <div className="text-2xl font-black text-teal-500 italic">{users.length}</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400">Total Matches Played</div>
                            <div className="text-2xl font-black text-orange-500 italic">{matches.reduce((acc, m) => acc + m.joinedPlayers.length, 0)}</div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-gray-400">Average XP</div>
                            <div className="text-2xl font-black text-purple-500 italic">
                              {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.xp || 0), 0) / users.length) : 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-4">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Recent Activity (Last 24h)</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">New Users</div>
                          <div className="text-xl font-black text-white italic">
                            {users.filter(u => u.createdAt && (Date.now() - new Date(u.createdAt).getTime()) < 86400000).length}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Deposits</div>
                          <div className="text-xl font-black text-green-500 italic">
                            ৳{payments.filter(p => p.status === 'approved' && (Date.now() - p.timestamp) < 86400000).reduce((acc, p) => acc + p.amount, 0)}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Withdraws</div>
                          <div className="text-xl font-black text-red-500 italic">
                            ৳{withdrawRequests.filter(w => w.status === 'approved' && (Date.now() - w.timestamp) < 86400000).reduce((acc, w) => acc + w.amount, 0)}
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Match Joins</div>
                          <div className="text-xl font-black text-orange-500 italic">
                            {matches.reduce((acc, m) => acc + m.joinedPlayers.filter(p => (Date.now() - p.joinedAt) < 86400000).length, 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminSubView === 'missions' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Target className="text-orange-500" />
                        Manage Daily Missions
                      </h3>
                      <button 
                        onClick={() => setShowAddMissionModal(true)}
                        className="px-4 py-2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Mission
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {missions.map(mission => (
                        <div key={mission.id} className="bg-black/40 border border-white/10 p-6 rounded-3xl flex justify-between items-center group hover:border-orange-500/30 transition-all">
                          <div className="space-y-1">
                            <div className="text-lg font-black text-white uppercase italic leading-none">{mission.title}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              Reward: <span className="text-orange-500">৳{mission.reward}</span> • XP: <span className="text-teal-500">{mission.xpReward}</span> • Req: <span className="text-white">{mission.requirement}</span> • Type: <span className="text-pink-500">{mission.type}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              confirmAction(
                                'Delete Mission',
                                `Are you sure you want to delete "${mission.title}"?`,
                                () => {
                                  const updated = missions.filter(m => m.id !== mission.id);
                                  setMissions(updated);
                                  localStorage.setItem('ff_missions', JSON.stringify(updated));
                                  syncData({ missions: updated });
                                }
                              );
                            }}
                            className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubView === 'roadmap' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase italic">Tournament Roadmap</h2>
                    <button 
                      onClick={() => setAdminSubView('matches')}
                      className="px-4 py-2 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Add New Match
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {matches.map(match => (
                      <div key={match.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                            <Calendar size={24} />
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase italic">{match.name}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">{match.date} • {match.time}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            confirmAction(
                              'Delete Match',
                              'Are you sure you want to delete this match?',
                              () => {
                                const updatedMatches = matches.filter(m => m.id !== match.id);
                                setMatches(updatedMatches);
                                syncData({ matches: updatedMatches });
                              }
                            );
                          }}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminSubView === 'advanced' && (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                        <Shield className="text-red-500" />
                        Advanced Settings
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Add New Product</h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const newItem: ShopItem = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: form.productName.value,
                            description: form.description.value,
                            price: Number(form.price.value),
                            type: form.type.value as any,
                            color: form.color.value || undefined
                          };
                          setShopItems([...shopItems, newItem]);
                          form.reset();
                          showToast('Product added successfully!', 'success');
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Name</label>
                            <input name="productName" required placeholder="e.g. Neon Frame" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Price (৳)</label>
                            <input name="price" type="number" required placeholder="500" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                            <textarea name="description" required placeholder="Describe the item..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none h-20 resize-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
                            <select name="type" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none appearance-none">
                              <option value="frame">Profile Frame</option>
                              <option value="badge">Badge</option>
                              <option value="entry_card">Entry Card</option>
                              <option value="name_color">Name Color</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Color (Hex Code, optional)</label>
                            <input name="color" placeholder="#FF0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                          </div>
                          <button type="submit" className="md:col-span-2 py-4 bg-pink-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-pink-400 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} /> Add to Store
                          </button>
                        </form>
                      </div>

                      <div className="bg-black/40 border border-white/10 p-6 rounded-3xl space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Shop Management (Table View)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Product</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Price</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shopItems.map(item => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                                        {item.type === 'frame' && <div className="w-5 h-5 rounded border" style={{ borderColor: item.color || '#fff' }} />}
                                        {item.type === 'badge' && <Trophy className="text-yellow-500" size={16} />}
                                        {item.type === 'entry_card' && <CreditCard className="text-teal-500" size={16} />}
                                        {item.type === 'name_color' && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color || '#fff' }} />}
                                      </div>
                                      <span className="font-bold text-sm italic">{item.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-xs uppercase font-black tracking-widest text-gray-400">{item.type}</td>
                                  <td className="py-4 px-4 font-bold text-sm italic text-orange-500">৳{item.price}</td>
                                  <td className="py-4 px-4">
                                    <button 
                                      onClick={() => {
                                        confirmAction(
                                          'Delete Item',
                                          `Are you sure you want to delete ${item.name}?`,
                                          () => {
                                            const updated = shopItems.filter(i => i.id !== item.id);
                                            setShopItems(updated);
                                            localStorage.setItem('ff_shop_items', JSON.stringify(updated));
                                            syncData({ shopItems: updated });
                                          }
                                        );
                                      }}
                                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Management Modal */}
              <AnimatePresence>
                {adminViewingMatchId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">
                          {matches.find(m => m.id === adminViewingMatchId)?.name} Players
                        </h3>
                        <button onClick={() => setAdminViewingMatchId(null)} className="p-2 bg-white/5 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {/* Room Info Editor */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                          <h4 className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Update Room Info</h4>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target as any;
                              updateMatchRoomInfo(adminViewingMatchId, form.roomId.value, form.roomPassword.value, form.isPublished.checked);
                            }}
                            className="space-y-3"
                          >
                            <input name="roomId" defaultValue={matches.find(m => m.id === adminViewingMatchId)?.roomId} placeholder="Room ID" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none" />
                            <input name="roomPassword" defaultValue={matches.find(m => m.id === adminViewingMatchId)?.roomPassword} placeholder="Room Password" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none" />
                            
                            <div className="flex items-center gap-2 px-2">
                              <input 
                                type="checkbox" 
                                name="isPublished" 
                                id="isPublished"
                                defaultChecked={matches.find(m => m.id === adminViewingMatchId)?.isRoomPublished}
                                className="w-4 h-4 accent-orange-500"
                              />
                              <label htmlFor="isPublished" className="text-[10px] text-gray-400 font-black uppercase tracking-widest cursor-pointer">Publish to Players</label>
                            </div>

                            <button type="submit" className="w-full py-2 bg-teal-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg">Save & Update</button>
                          </form>
                        </div>

                        <div className="h-px bg-white/10 my-4" />

                        {matches.find(m => m.id === adminViewingMatchId)?.joinedPlayers.length === 0 ? (
                          <p className="text-center py-8 text-gray-500 text-sm italic">No players have joined yet.</p>
                        ) : (
                          matches.find(m => m.id === adminViewingMatchId)?.joinedPlayers.map(player => {
                            const user = users.find(u => u.userId === player.userId);
                            return (
                              <div key={player.userId} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                  <div className="text-sm font-bold text-white">{user?.gameName || 'Unknown'}</div>
                                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ID: {player.userId}</div>
                                  <div className="text-[9px] text-teal-500 font-bold uppercase tracking-tighter">
                                    Joined: {new Date(player.joinedAt).toLocaleTimeString()}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => removePlayerFromMatch(adminViewingMatchId, player.userId)}
                                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <button 
                        onClick={() => setAdminViewingMatchId(null)}
                        className="w-full py-4 bg-white/10 text-white font-black uppercase tracking-widest rounded-xl"
                      >
                        Close
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Topup Modal */}
              <AnimatePresence>
                {showAddCategoryModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Add Topup Category</h3>
                        <button onClick={() => { setShowAddCategoryModal(false); setFormImagePreview(null); setDroppedFile(null); }} className="p-2 bg-white/5 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.target as any;
                          const label = form.label.value;
                          const id = label.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
                          
                          let imageUrl = '';
                          if (droppedFile) {
                            const formData = new FormData();
                            formData.append('image', droppedFile);
                            try {
                              const res = await fetch('/api/upload/product', { // Reusing product upload endpoint
                                method: 'POST',
                                body: formData
                              });
                              const data = await res.json();
                              if (data.success) {
                                imageUrl = data.imageUrl;
                              }
                            } catch (err) {
                              console.error("Upload failed", err);
                            }
                          }

                          if (label) {
                            const newCat: TopupCategory = {
                              id,
                              label,
                              imageUrl: imageUrl || undefined,
                              icon: 'Smartphone'
                            };
                            const updated = [...topupCategories, newCat];
                            setTopupCategories(updated);
                            syncData({ topupCategories: updated });
                            setShowAddCategoryModal(false);
                            setFormImagePreview(null);
                            setDroppedFile(null);
                            showToast('Category added successfully!', 'success');
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Category Label</label>
                          <input name="label" required placeholder="e.g. In-Game Topup" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Category Photo</label>
                          <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files[0];
                              if (file && file.type.startsWith('image/')) {
                                setDroppedFile(file);
                                const reader = new FileReader();
                                reader.onload = (ev) => setFormImagePreview(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden group"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setDroppedFile(file);
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setFormImagePreview(ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            {formImagePreview ? (
                              <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <Upload size={24} className="text-gray-600 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Drop or Click to Upload</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/80 active:scale-95 transition-all shadow-lg shadow-primary/20">
                          Create Category
                        </button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
                {showAddTopupModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Add Topup Package</h3>
                        <button onClick={() => { setShowAddTopupModal(false); setFormImagePreview(null); setDroppedFile(null); }} className="p-2 bg-white/5 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.target as any;
                          const name = form.name.value;
                          const category = form.category.value;
                          const diamonds = parseInt(form.diamonds.value);
                          const price = parseInt(form.price.value);
                          const tag = form.tag.value;
                          const status = form.status.value;
                          
                          let imageUrl = '';
                          if (droppedFile) {
                            const formData = new FormData();
                            formData.append('image', droppedFile);
                            try {
                              const res = await fetch('/api/upload/product', {
                                method: 'POST',
                                body: formData
                              });
                              const data = await res.json();
                              if (data.success) {
                                imageUrl = data.imageUrl;
                              }
                            } catch (err) {
                              console.error("Upload failed", err);
                            }
                          }

                          if (diamonds && price) {
                            const newPkg: TopupPackage = {
                              id: 'tp_' + Date.now(),
                              name,
                              category,
                              diamonds,
                              price,
                              tag: tag || undefined,
                              status: status,
                              imageUrl: imageUrl || undefined
                            };
                            const updated = [...topupPackages, newPkg];
                            setTopupPackages(updated);
                            localStorage.setItem('ff_topup_packages', JSON.stringify(updated));
                            syncData({ topupPackages: updated });
                            setShowAddTopupModal(false);
                            setFormImagePreview(null);
                            setDroppedFile(null);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Product Name</label>
                            <input name="name" required placeholder="e.g. 115 Diamonds" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Category</label>
                            <select name="category" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none appearance-none">
                              {topupCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Diamonds</label>
                            <input name="diamonds" type="number" required placeholder="Count" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Price (৳)</label>
                            <input name="price" type="number" required placeholder="Price" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Tag (Optional)</label>
                            <input name="tag" type="text" placeholder="e.g. Popular" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Status</label>
                            <select name="status" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary outline-none">
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Product Image</label>
                          <div 
                            className="relative group cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('image/')) {
                                setDroppedFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          >
                            <div className={`w-full h-32 bg-black/60 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${formImagePreview ? 'border-secondary/50' : 'border-white/10 hover:border-white/20'}`}>
                              {formImagePreview ? (
                                <div className="relative w-full h-full p-2">
                                  <img src={formImagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFormImagePreview(null); setDroppedFile(null); }}
                                    className="absolute top-4 right-4 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="p-3 bg-white/5 rounded-full">
                                    <Camera size={24} className="text-gray-500" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Click or Drag Image</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                  </div>
                                </>
                              )}
                            </div>
                            <input 
                              name="image" 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setDroppedFile(file);
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setFormImagePreview(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-4 bg-secondary text-black font-black uppercase tracking-widest rounded-xl hover:bg-secondary/80 active:scale-95 transition-all shadow-lg shadow-secondary/20">Add Product</button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Mission Modal */}
              <AnimatePresence>
                {showAddMissionModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Add Daily Mission</h3>
                        <button onClick={() => setShowAddMissionModal(false)} className="p-2 bg-white/5 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as any;
                          const title = form.title.value;
                          const description = form.description.value;
                          const reward = parseInt(form.reward.value);
                          const xpReward = parseInt(form.xpReward.value);
                          const requirement = parseInt(form.requirement.value);
                          const type = form.type.value;
                          if (title && reward && xpReward && requirement && type) {
                            const newMission: Mission = {
                              id: 'm_' + Date.now(),
                              title,
                              description,
                              reward,
                              xpReward,
                              requirement,
                              type: type as any
                            };
                            const updated = [...missions, newMission];
                            setMissions(updated);
                            localStorage.setItem('ff_missions', JSON.stringify(updated));
                            syncData({ missions: updated });
                            setShowAddMissionModal(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Mission Title</label>
                          <input name="title" type="text" required placeholder="e.g. Play 5 Matches" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Mission Description</label>
                          <input name="description" type="text" required placeholder="e.g. Complete 5 matches in any mode" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Reward (৳)</label>
                            <input name="reward" type="number" required placeholder="Amount" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">XP Reward</label>
                            <input name="xpReward" type="number" required placeholder="XP" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Requirement</label>
                            <input name="requirement" type="number" required placeholder="Count" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Type</label>
                            <select name="type" required className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-500 outline-none text-xs">
                              <option value="matches">Matches</option>
                              <option value="wins">Wins</option>
                              <option value="kills">Kills</option>
                              <option value="spin">Spin</option>
                              <option value="checkin">Check-in</option>
                              <option value="refer">Refer</option>
                              <option value="topup">Topup</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 active:scale-95 transition-all">Add Mission</button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit User Modal */}
              <AnimatePresence>
                {editingUser && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Edit User Profile</h3>
                        <button onClick={() => setEditingUser(null)} className="p-2 bg-white/5 rounded-lg">
                          <X size={20} />
                        </button>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as any;
                          const updatedUser = {
                            ...editingUser,
                            gameName: form.gameName.value,
                            balance: Number(form.balance.value),
                            winnings: Number(form.winnings.value),
                            role: form.role.value,
                            isBanned: form.isBanned.value === 'true',
                            isVerifiedPro: form.isVerifiedPro.value === 'true',
                            banReason: form.banReason.value
                          };
                          updateUser(updatedUser);
                          logAuditorAction(
                            'UPDATE_USER',
                            `Updated user ${editingUser.userId}. Banned: ${updatedUser.isBanned}, Verified: ${updatedUser.isVerifiedPro}`
                          );
                          setEditingUser(null);
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Game Name</label>
                          <input name="gameName" defaultValue={editingUser.gameName} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Balance</label>
                            <input name="balance" type="number" defaultValue={editingUser.balance} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Winnings</label>
                            <input name="winnings" type="number" defaultValue={editingUser.winnings} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Role</label>
                          <select name="role" defaultValue={editingUser.role} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Status</label>
                            <select name="isBanned" defaultValue={editingUser.isBanned ? 'true' : 'false'} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500">
                              <option value="false">Active</option>
                              <option value="true">Banned</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Verified Pro</label>
                            <select name="isVerifiedPro" defaultValue={editingUser.isVerifiedPro ? 'true' : 'false'} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500">
                              <option value="false">No</option>
                              <option value="true">Yes (Badge)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Ban Reason (Optional)</label>
                          <input name="banReason" defaultValue={editingUser.banReason || ''} placeholder="e.g. Using hacks, abusive behavior" className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500" />
                        </div>
                        <button type="submit" className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all">
                          Update Profile
                        </button>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {(view === 'login' || view === 'signup' || view === 'adminLogin') && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="auth-v2-wrapper"
            >
              <div className={`auth-v2-container ${view === 'signup' ? 'active' : ''}`} id="container">
                {/* Sign Up Form */}
                <div className="auth-v2-sign-up">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!isCaptchaVerified) {
                      showToast('Please wait for security verification...', 'info');
                      return;
                    }
                    const form = e.target as any;
                    const file = form.avatar?.files?.[0];
                    const handleSignupWithAvatar = (avatarUrl?: string) => {
                      handleSignup(form.userId.value, form.gameName.value, form.password.value, avatarUrl, form.refCode?.value, form.district?.value);
                    };

                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleSignupWithAvatar(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      handleSignupWithAvatar();
                    }
                  }}>
                    <h1 className="text-2xl font-black uppercase italic mb-2">Create Account</h1>
                    <div className="auth-v2-icons">
                      <button type="button" onClick={handleGoogleLogin} className="auth-v2-icon border border-white/10 p-2 rounded-xl hover:bg-white/5 transition-all">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase font-black mb-4">or use your details for registration</span>
                    
                    <div className="w-full space-y-0 mb-4">
                      <div className="flex justify-center mb-2">
                         <div className="w-16 h-16 bg-secondary/10 rounded-xl border-2 border-dashed border-secondary/30 flex items-center justify-center overflow-hidden relative group">
                            <User size={24} className="text-secondary" />
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <ImageIcon size={16} className="text-white" />
                              <input 
                                type="file" 
                                name="avatar" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    const img = e.target.parentElement?.parentElement?.querySelector('img') || document.createElement('img');
                                    img.className = "w-full h-full object-cover absolute inset-0";
                                    reader.onloadend = () => {
                                      img.src = reader.result as string;
                                      if (!img.parentElement) {
                                        e.target.parentElement?.parentElement?.appendChild(img);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                      </div>
                      <input name="userId" type="text" placeholder="User ID" required />
                      <input name="gameName" type="text" placeholder="Game Name" required />
                      <input name="password" type="password" placeholder="Password" required />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <input name="refCode" type="text" placeholder="Ref Code" />
                        <select name="district" className="bg-[#222] border-none m-[8px_0] p-[10px_15px] text-[13px] rounded-[8px] w-full outline-none text-white">
                          {BANGLADESH_DISTRICTS.map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {!isCaptchaVerified && <InvisibleCaptcha onVerify={() => setIsCaptchaVerified(true)} />}
                    <button type="submit">Sign Up</button>
                    <button 
                      type="button" 
                      onClick={() => setView('login')} 
                      className="md:hidden mt-4 text-[10px] text-gray-500 hover:text-white uppercase font-black"
                    >
                      Already have an account? Sign In
                    </button>
                  </form>
                </div>

                {/* Sign In Form */}
                <div className="auth-v2-sign-in">
                  {view === 'adminLogin' ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      handleAdminLogin(form.username.value, form.password.value, form.pin?.value);
                    }}>
                      <h1 className="text-2xl font-black uppercase italic mb-2">Admin Access</h1>
                      <p className="text-xs text-gray-500 mb-4">Restricted Area</p>
                      <input name="username" type="text" placeholder="Admin Username" required />
                      <input name="password" type="password" placeholder="Admin Password" required />
                      <input name="pin" type="password" placeholder="Secret PIN (Optional)" />
                      <button type="submit">Authenticate</button>
                      <button type="button" onClick={() => setView('login')} className="mt-4 text-[10px] text-gray-500 hover:text-white uppercase font-black">Back to Login</button>
                    </form>
                  ) : (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!isCaptchaVerified) {
                        showToast('Please wait for security verification...', 'info');
                        return;
                      }
                      const form = e.target as any;
                      handleLogin(form.userId.value, form.password.value);
                    }}>
                      <h1 className="text-2xl font-black uppercase italic mb-2">Sign In</h1>
                      <div className="auth-v2-icons">
                        <button type="button" onClick={handleGoogleLogin} className="auth-v2-icon border border-white/10 p-2 rounded-xl hover:bg-white/5 transition-all">
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-black mb-4">or use your ID password</span>
                      <input name="userId" type="text" placeholder="User ID" required />
                      <input name="password" type="password" placeholder="Password" required />
                      <a href="#" onClick={(e) => { e.preventDefault(); showToast('Please contact support to reset password.', 'info'); }}>Forgot Your Password?</a>
                      {!isCaptchaVerified && <InvisibleCaptcha onVerify={() => setIsCaptchaVerified(true)} />}
                      <button type="submit">Sign In</button>
                      <button 
                        type="button" 
                        onClick={() => setView('signup')} 
                        className="md:hidden mt-4 text-[10px] text-gray-500 hover:text-white uppercase font-black"
                      >
                        Don't have an account? Sign Up
                      </button>
                    </form>
                  )}
                </div>

                {/* Toggle Container */}
                <div className="auth-v2-toggle-container">
                  <div className="auth-v2-toggle">
                    <div className="auth-v2-toggle-panel auth-v2-toggle-left">
                      <h1 className="text-2xl font-black uppercase italic">Welcome Back!</h1>
                      <p>Enter your personal details to use all of site features</p>
                      <button className="hidden" id="login" onClick={() => setView('login')}>Sign In</button>
                    </div>
                    <div className="auth-v2-toggle-panel auth-v2-toggle-right">
                      <h1 className="text-2xl font-black uppercase italic">Hello, Friend!</h1>
                      <p>Register with your personal details to use all of site features</p>
                      <button className="hidden" id="register" onClick={() => setView('signup')}>Sign Up</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-4 left-4 md:left-auto md:w-96 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col h-[500px]"
            >
              {/* Header */}
              <div className="p-4 bg-orange-500 flex items-center justify-between">
                <div className="flex items-center gap-3 text-black">
                  <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tighter text-sm">AI Support</h3>
                    <p className="text-[10px] font-bold opacity-70">Online & Ready to Help</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAIChatOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-black" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {aiChatMessages.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-orange-500">
                      <Bot size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black uppercase tracking-widest text-sm">Welcome to RK Support</h4>
                      <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Ask me anything about deposits, withdrawals, or game rules!</p>
                    </div>
                  </div>
                )}
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                      msg.role === 'user' 
                        ? 'bg-orange-500 text-black rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAITyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                  if (input.value.trim()) {
                    handleAIChat(input.value);
                    input.value = '';
                  }
                }}
                className="p-4 border-t border-white/10 bg-black/40"
              >
                <div className="relative">
                  <input 
                    name="message"
                    autoComplete="off"
                    placeholder="Type your question..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs focus:border-orange-500 outline-none transition-all duration-200"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:scale-110 transition-transform">
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating AI Chat Button */}
        <button 
          onClick={() => setIsAIChatOpen(true)}
          className={`fixed bottom-24 right-6 w-14 h-14 bg-orange-500 text-black rounded-2xl shadow-2xl shadow-orange-500/20 flex items-center justify-center z-[90] hover:scale-110 active:scale-95 transition-all duration-200 ${isAIChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <Bot size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-[#0a0a0a] rounded-full animate-pulse" />
        </button>

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                      {confirmModal.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                      {confirmModal.message}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                      className="py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmModal.onConfirm}
                      className="py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Filter for Electric Cards */}
        <svg className="hidden">
          <defs>
            <filter id="turbulent-displace">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* Toast System */}
        <div className="fixed top-4 right-4 z-[300] space-y-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[280px] ${
                  toast.type === 'success' ? 'bg-teal-500 border-teal-400 text-black' :
                  toast.type === 'error' ? 'bg-red-500 border-red-400 text-white' :
                  'bg-orange-500 border-orange-400 text-black'
                }`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={20} /> :
                 toast.type === 'error' ? <AlertCircle size={20} /> :
                 <Info size={20} />}
                <p className="text-sm font-bold">{toast.message}</p>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="ml-auto p-1 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
