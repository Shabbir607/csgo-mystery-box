export interface CSGOItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'knife';
  price: number;
  image: string;
  float?: number;
  probability?: number; // Probability percentage for admin panel
}

export interface CSGOCase {
  id: string;
  name: string;
  price: number;
  image: string;
  items: CSGOItem[];
  isActive?: boolean; 
}

export interface User {
  balance: number;
  inventory: CSGOItem[];
  username: string;
  level: number;
  totalOpened: number;
  joinDate: Date;
  isAdmin?: boolean;
  steamAccount?: SteamAccount; // New Steam integration
}

export interface SteamAccount {
  steamId: string;
  steamUsername: string;
  profileUrl: string;
  avatarUrl: string;
  isLinked: boolean;
  linkedDate: Date;
  tradeUrl?: string;
  isTradeUrlValid: boolean;
  lastSync: Date;
}

export interface SteamWithdrawal {
  id: string;
  userId: string;
  items: CSGOItem[];
  totalValue: number;
  status: 'pending' | 'processing' | 'sent' | 'completed' | 'failed' | 'cancelled';
  steamTradeOfferId?: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
  estimatedDelivery: Date;
}

export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network?: string;
  minDeposit: number;
  minWithdraw: number;
  withdrawFee: number;
  confirmations: number;
  rate: number; // USD rate
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  currency: string;
  amount: number;
  usdAmount: number;
  address: string;
  txHash?: string;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  confirmations: number;
  maxConfirmations: number;
  timestamp: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  joinDate: Date;
  lastLogin: Date;
}