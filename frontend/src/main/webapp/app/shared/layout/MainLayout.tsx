import React from 'react';
import { useAppSelector } from 'app/config/store';

import ErrorBoundary from 'app/shared/error/error-boundary';
import { TopNavbar } from 'app/shared/layout/header/TopNavbar';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      {isAuthenticated && <TopNavbar />}
      <div className="flex-grow-1 p-0" style={{ backgroundColor: '#f8f9fa' }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
};

export default MainLayout;
