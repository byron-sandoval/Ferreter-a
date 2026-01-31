import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import AdminDashboard from './AdminDashboard';
import ArticuloList from './ArticuloList';

const AdminRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<AdminDashboard />} />
    <Route path="articulos" element={<ArticuloList />} />
  </ErrorBoundaryRoutes>
);

export default AdminRoutes;
