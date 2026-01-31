import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import Footer from 'app/shared/layout/footer/footer';
import ErrorBoundary from 'app/shared/error/error-boundary';
import { Sidebar } from 'app/shared/layout/sidebar/Sidebar';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [AUTHORITIES.ADMIN]));

  return (
    <div className="app-container">
      <div className="d-flex">
        {isAuthenticated && <Sidebar />}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <ErrorBoundary>{children}</ErrorBoundary>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
