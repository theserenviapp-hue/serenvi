import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../services/api';

export interface Me {
  userId: string;
  distributorId: string;
  name: string;
  email: string;
  phone: string;
  rank: string;
  referralCode: string;
  walletBalance: number;
  totalSales?: number;
  monthlySales?: number;
  sponsorId?: string | null;
  onboarded?: boolean;
  isAdmin: boolean;
}

/**
 * Fetches /me from backend after Clerk sign-in, caches distributorId in
 * localStorage so existing pages that read localStorage.getItem('distributorId')
 * keep working unchanged.
 */
export function useMe() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      localStorage.removeItem('distributorId');
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get('/me')
      .then(({ data }) => {
        if (cancelled) return;
        setMe(data);
        if (data?.distributorId) {
          localStorage.setItem('distributorId', data.distributorId);
        }
        setError(null);
      })
      .catch((e: any) => {
        if (cancelled) return;
        const msg = e?.response?.data?.message || e?.message || 'Failed to load profile';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  return { me, loading, error };
}
