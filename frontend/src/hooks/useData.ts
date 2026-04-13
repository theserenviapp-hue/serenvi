import { useState, useEffect } from 'react';
import api from '../services/api';

interface DashboardData {
  name: string;
  rank: string;
  personalSales: number;
  totalSales: number;
  walletBalance: number;
  monthlySales: number;
  totalCommissionEarned: number;
  currentLeadershipSalary: number;
  multiLevelCommissionBreakdown: Array<{ level: string; amount: number }>;
  achievementsUnlocked: number;
  unlockedRanks: Array<{ rank: string; reward: number; unlockedAt: string }>;
  nextRank: { rank: string; target: number; reward: number; progress: number } | null;
  downlineCount: number;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const distributorId = localStorage.getItem('distributorId') || '';
        console.log('Fetching dashboard for distributorId:', distributorId);
        
        if (!distributorId) {
          setError('Distributor ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await api.get(`/distributors/${distributorId}/dashboard`);
        console.log('Dashboard response:', response);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const response = await api.get('/wallet');
        setWallet(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return { wallet, loading, error, refetch: () => fetchWallet() };
};

const fetchWallet = async () => {
  return api.get('/wallet');
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const distributorId = localStorage.getItem('distributorId') || '';
        const response = await api.get(`/distributors/${distributorId}/achievements`);
        setAchievements(response.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return { achievements, loading, error };
};

export const useSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sales/history');
        setSales(response.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return { sales, loading, error };
};

export const useTeamSalesByLevel = () => {
  const [teamSales, setTeamSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamSales = async () => {
      try {
        setLoading(true);
        const distributorId = localStorage.getItem('distributorId') || '';
        const response = await api.get(`/distributors/${distributorId}/team-sales-by-level`);
        setTeamSales(response.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load team sales');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamSales();
  }, []);

  return { teamSales, loading, error };
};
