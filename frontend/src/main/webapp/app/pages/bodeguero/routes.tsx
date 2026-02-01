import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

const BodegueroDashboard = React.lazy(() => import('./BodegueroDashboard'));
const IngresoList = React.lazy(() => import('./IngresoList'));

const Loadable = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    }
  >
    {children}
  </Suspense>
);

const BodegueroRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route
      index
      element={
        <Loadable>
          <BodegueroDashboard />
        </Loadable>
      }
    />
    <Route
      path="ingresos"
      element={
        <Loadable>
          <IngresoList />
        </Loadable>
      }
    />
  </ErrorBoundaryRoutes>
);

export default BodegueroRoutes;
