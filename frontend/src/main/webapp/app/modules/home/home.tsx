import './home.scss';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import { AdminDashboard } from 'app/pages/admin/AdminDashboard';

export const Home = () => {
  const { account, isAuthenticated, sessionHasBeenFetched } = useAppSelector(state => state.authentication);
  const isAdmin = account.authorities?.includes(AUTHORITIES.ADMIN);

  if (!sessionHasBeenFetched) {
    return null;
  }

  // Si no está autenticado, vamos al login directamente (igual que hacía tu botón)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si es ADMIN, mostrar Dashboard directamente
  if (isAdmin) {
    return (
      <div className="admin-home-wrapper" style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
        <AdminDashboard />
      </div>
    );
  }

  // 3. Redirección directa para Vendedores o Bodegueros
  if (account.authorities?.includes(AUTHORITIES.VENDEDOR)) {
    return <Navigate to="/vendedor" replace />;
  }

  if (account.authorities?.includes(AUTHORITIES.BODEGUERO)) {
    return <Navigate to="/bodeguero" replace />;
  }

  // Fallback si no tiene ninguno de los roles anteriores
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
      <div className="p-4 bg-white shadow-sm rounded-3">
        <h2 className="text-primary fw-bold mb-3">Bienvenido, {account.login}</h2>
        <p className="text-secondary lead">
          Panel de control disponible según tu rol. Por favor utiliza el menú de navegación para comenzar tus actividades.
        </p>
      </div>
    </div>
  );
};

export default Home;
