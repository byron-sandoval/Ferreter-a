import './home.scss';
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import { AdminDashboard } from 'app/pages/admin/AdminDashboard';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = account.authorities?.includes(AUTHORITIES.ADMIN);

  // 1. Vista para usuarios NO autenticados
  if (!account?.login) {
    return (
      <div
        className="home-container d-flex align-items-center justify-content-center"
        style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}
      >
        <Container className="text-center">
          <div
            className="p-5 bg-white shadow-lg rounded-4 animate__animated animate__zoomIn"
            style={{ maxWidth: '600px', margin: '0 auto' }}
          >
            <div className="mb-4 text-primary">
              <FontAwesomeIcon icon={faWarehouse} size="5x" className="opacity-75" />
            </div>
            <h1 className="display-5 fw-bold text-dark mb-2">FerroNica</h1>
            <p className="text-muted mb-4 fw-medium">SISTEMA INTEGRAL DE GESTIÓN DE FERRETERÍA</p>
            <Button tag={Link} to="/login" color="primary" size="lg" className="rounded-pill px-5 fw-bold shadow-sm">
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Iniciar Sesión para Acceder
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // 2. Si es ADMIN, mostrar Dashboard directamente
  if (isAdmin) {
    return (
      <div className="admin-home-wrapper" style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
        <AdminDashboard />
      </div>
    );
  }

  // 3. Fallback para otros roles (Vendedores o Bodegueros)
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
      <div className="p-4 bg-white shadow-sm rounded-3">
        <h2 className="text-primary fw-bold mb-3">Bienvenido, {account.login}</h2>
        <p className="text-secondary lead">
          Panel de control disponible según tu rol. Por favor utiliza el menú de navegación para comenzar tus actividades.
        </p>
        <hr />
        <div className="d-flex gap-2">
          {account.authorities?.includes(AUTHORITIES.VENDEDOR) && (
            <Button tag={Link} to="/vendedor" color="info" className="text-white fw-bold">
              Ir a Panel de Ventas
            </Button>
          )}
          {account.authorities?.includes(AUTHORITIES.BODEGUERO) && (
            <Button tag={Link} to="/bodeguero" color="warning" className="text-white fw-bold">
              Ir a Panel de Bodega
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
