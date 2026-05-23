// Type definitions for the MLM platform

export interface UserWithWallet {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  referredById?: string;
  rank: 'NOT_ACHIEVED' | 'PERFORMER' | 'CHAMPION' | 'INFLUENCER' | 'GAMER' | 'WORLD_SHAKER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  wallet?: {
    eWallet: number;
    topupWallet: number;
    shoppingFund: number;
    totalEarning: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BonusBreakdown {
  fastTrack: number;
  stepUp: number;
  talentDividend: number;
  leadership: number;
  rank: number;
  total: number;
}

export interface WithdrawalRequest {
  amount: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
}
