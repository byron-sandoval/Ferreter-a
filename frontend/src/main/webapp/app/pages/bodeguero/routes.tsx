import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import BodegueroDashboard from './BodegueroDashboard';

const BodegueroRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<BodegueroDashboard />} />
    {/* Aquí irán las rutas de Ingresos, Inventario, etc. */}
  </ErrorBoundaryRoutes>
);

export default BodegueroRoutes;
