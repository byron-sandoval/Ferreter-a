import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from 'app/config/store';

export const Login = () => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const pageLocation = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const { from } = pageLocation.state || { from: { pathname: '/', search: pageLocation.search } };
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  return null;
};

export default Login;
