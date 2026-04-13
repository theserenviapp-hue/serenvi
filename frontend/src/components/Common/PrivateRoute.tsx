import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ component: React.ComponentType<any> }> = ({
  component: Component,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  if (!token) {
    navigate('/login');
    return null;
  }

  return <Component />;
};

export default PrivateRoute;
