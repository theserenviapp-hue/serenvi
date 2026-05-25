import React from 'react';
import { useAuth } from '@clerk/clerk-react';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  adminOnly = false,
}) => {
  const { isLoaded, isSignedIn } = useAuth();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return <Component />;
};

export default PrivateRoute;
