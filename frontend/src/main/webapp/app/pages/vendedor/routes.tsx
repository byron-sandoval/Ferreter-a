import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import VendedorDashboard from './VendedorDashboard';

const VendedorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<VendedorDashboard />} />
    {/* Aquí irán las rutas de Registrar Venta, Clientes, etc. */}
  </ErrorBoundaryRoutes>
);

export default VendedorRoutes;
