import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import UsuarioDashboard from './UsuarioDashboard';
import NuevaVenta from './NuevaVenta';
import ConsultaInventario from './ConsultaInventario';
import HistorialVentas from './HistorialVentas';
import GestionClientes from './GestionClientes';

const VentaRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<UsuarioDashboard />} />
    <Route path="nueva-venta" element={<NuevaVenta />} />
    {/* <Route path="consulta-inventario" element={<ConsultaInventario />} /> */}
    <Route path="historial-ventas" element={<HistorialVentas />} />
    <Route path="clientes" element={<GestionClientes />} />
  </ErrorBoundaryRoutes>
);

export default VentaRoutes;
