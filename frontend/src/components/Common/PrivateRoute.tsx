import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// Kept for backward compat. App.tsx uses SignedIn/SignedOut at root,
// so this is mostly redundant but safe to use as extra guard.
const PrivateRoute: React.FC<{ component: React.ComponentType<any> }> = ({
  component: Component,
}) => {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <Component />;
};

export default PrivateRoute;
