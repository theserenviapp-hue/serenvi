import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';

/**
 * TokenSync component injects the Clerk JWT token into axios request headers.
 * This runs once after sign-in and sets up the token getter for the API client.
 */
const TokenSync: React.FC = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const setupTokenGetter = async () => {
      // Set up a function that will be called by the API client to get fresh tokens
      if (typeof api.setTokenGetter === 'function') {
        api.setTokenGetter(getToken);
      }
    };

    setupTokenGetter();
  }, [getToken]);

  return null;
};

export default TokenSync;
