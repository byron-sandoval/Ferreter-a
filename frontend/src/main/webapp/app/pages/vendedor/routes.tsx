import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import VendedorDashboard from './VendedorDashboard';
import NuevaVenta from './NuevaVenta';
import ConsultaInventario from './ConsultaInventario';
import HistorialVendedor from './HistorialVendedor';
import GestionClientes from './GestionClientes';

const VendedorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<VendedorDashboard />} />
    <Route path="nueva-venta" element={<NuevaVenta />} />
    <Route path="consulta-inventario" element={<ConsultaInventario />} />
    <Route path="historial-ventas" element={<HistorialVendedor />} />
    <Route path="clientes" element={<GestionClientes />} />
  </ErrorBoundaryRoutes>
);

export default VendedorRoutes;
