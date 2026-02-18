import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

const BodegueroDashboard = React.lazy(() => import('./BodegueroDashboard'));
const IngresoList = React.lazy(() => import('./IngresoList'));
const IngresoUpdate = React.lazy(() => import('./IngresoUpdate'));
const IngresoNuevaCompra = React.lazy(() => import('./IngresoNuevaCompra'));

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
    <Route
      path="ingresos/nuevo"
      element={
        <Loadable>
          <IngresoUpdate />
        </Loadable>
      }
    />
    <Route
      path="ingresos/nueva-compra"
      element={
        <Loadable>
          <IngresoNuevaCompra />
        </Loadable>
      }
    />
  </ErrorBoundaryRoutes>
);

export default BodegueroRoutes;
