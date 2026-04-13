export type Rank = 'Influencer' | 'Master' | 'Legend' | 'Icon' | 'Titan' | 'Global Leader' | 'World Leader' | 'Empire Leader' | 'Global Icon';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Distributor {
  id: string;
  name: string;
  email: string;
  phone: string;
  rank: Rank;
  totalSales: number;
  carryForwardSales: number;
  walletBalance: number;
  sponsorId?: string;
  kycVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  type: 'PHYSICAL' | 'DIGITAL';
  stockQuantity?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Sale {
  id: string;
  sellerId: string;
  productId: string;
  quantity: number;
  saleAmount: number;
  paymentMethod: string;
  orderStatus: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  createdAt: Date;
}

export interface Commission {
  id: string;
  distributorId: string;
  saleId: string;
  level: number;
  commissionAmount: number;
  commissionRate: number;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  distributorId: string;
  rankName: Rank;
  salesTarget: number;
  rewardAmount: number;
  claimedAt: Date;
  createdAt: Date;
}

export interface LeadershipSalary {
  id: string;
  distributorId: string;
  rank: Rank;
  salaryAmount: number;
  poolPercentage: number;
  month: number;
  year: number;
  createdAt: Date;
}

export interface WalletTransaction {
  id: string;
  distributorId: string;
  type: 'MLM_COMMISSION' | 'ACHIEVEMENT_REWARD' | 'LEADERSHIP_SALARY' | 'PRODUCT_PURCHASE' | 'WITHDRAWAL' | 'REFUND';
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

export interface WithdrawalRequest {
  id: string;
  distributorId: string;
  amount: number;
  fee: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankAccount: string;
  bankIFSC: string;
  accountHolder: string;
  notes?: string;
  rejectionReason?: string;
  requestedAt: Date;
  processedAt?: Date;
}

export interface Dashboard {
  name: string;
  rank: Rank;
  totalSales: number;
  walletBalance: number;
  downlineCount: number;
  monthlyCommission: number;
  totalCommissionEarned: number;
  totalLeadershipSalary: number;
  multiLevelCommissionBreakdown: Array<{ level: string; amount: number }>;
  achievementsUnlocked: number;
  unlockedRanks: Array<{ rank: string; reward: number; unlockedAt: string }>;
  nextRank: { rank: string; target: number; reward: number; progress: number } | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
