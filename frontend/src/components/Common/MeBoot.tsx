import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';

interface MeBootProps {
  children: ReactNode;
}

/**
 * MeBoot component calls the /me endpoint once after sign-in.
 * This provisions the distributor and caches essential data in localStorage.
 */
const MeBoot: React.FC<MeBootProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isMeReady, setIsMeReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const fetchMe = async () => {
      try {
        const response = await api.get('/me');
        const { distributorId, isAdmin } = response.data;

        // Cache essential data
        if (distributorId) {
          localStorage.setItem('distributorId', distributorId);
        }
        if (isAdmin !== undefined) {
          localStorage.setItem('isAdmin', String(isAdmin));
        }

        setIsMeReady(true);
      } catch (err: any) {
        console.error('Failed to fetch /me:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
        // Still mark as ready to avoid infinite loading
        setIsMeReady(true);
      }
    };

    fetchMe();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return <div>{children}</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error loading profile: {error}</p>
        <p>Please refresh the page or contact support.</p>
      </div>
    );
  }

  if (!isMeReady) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default MeBoot;
