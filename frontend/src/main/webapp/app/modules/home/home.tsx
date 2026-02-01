import './home.scss';
import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardBody, Button, Container } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faBoxes, faUsers, faWarehouse, faChartLine, faShoppingCart, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <div className="home-container" style={{ backgroundColor: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
      {/* 1. Header Premium Oscuro */}
      <div
        className="premium-header text-white py-5 px-4 mb-5 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', borderRadius: '0 0 20px 20px' }}
      >
        <Container fluid>
          <Row className="align-items-center">
            <Col md="8">
              <h1 className="display-4 fw-bold mb-2 animate__animated animate__fadeInLeft">Bienvenido a FerroNica</h1>
              <p className="lead opacity-75 animate__animated animate__fadeInLeft animate__delay-1s">
                Sistema Integral de Gestión de Ferretería
              </p>
              {account?.login ? (
                <div className="mt-3 badge bg-white text-primary px-3 py-2 fs-6 rounded-pill shadow-sm">
                  <span className="fw-normal text-muted me-1">Usuario:</span>
                  <strong>{account.login}</strong>
                </div>
              ) : (
                <div className="mt-3">
                  <Link to="/login" className="btn btn-light rounded-pill px-4 fw-bold text-primary">
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Iniciar Sesión Para Acceder
                  </Link>
                </div>
              )}
            </Col>
            <Col md="4" className="text-end d-none d-md-block">
              <FontAwesomeIcon icon={faWarehouse} size="8x" className="opacity-25" />
            </Col>
          </Row>
        </Container>
      </div>

      {/* 2. Grid de Accesos Rápidos (Visible solo si logueado) */}
      {account?.login && (
        <Container>
          <h3 className="text-secondary mb-4 border-bottom pb-2">Accesos Directos</h3>
          <Row className="g-4">
            {/* Venta Rápida */}
            <Col md="4" lg="3">
              <Link to="/vendedor/nueva-venta" className="text-decoration-none">
                <Card className="h-100 shadow-sm border-0 transform-hover" style={{ transition: '0.3s' }}>
                  <CardBody className="text-center py-5">
                    <div className="icon-circle bg-success bg-opacity-10 text-success p-4 rounded-circle mb-3 d-inline-block">
                      <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                    </div>
                    <h5 className="fw-bold text-dark">Nueva Venta</h5>
                    <p className="text-muted small">Punto de Venta Rápido (POS)</p>
                  </CardBody>
                </Card>
              </Link>
            </Col>

            {/* Inventario */}
            <Col md="4" lg="3">
              <Link to="/admin/articulos" className="text-decoration-none">
                <Card className="h-100 shadow-sm border-0 transform-hover" style={{ transition: '0.3s' }}>
                  <CardBody className="text-center py-5">
                    <div className="icon-circle bg-primary bg-opacity-10 text-primary p-4 rounded-circle mb-3 d-inline-block">
                      <FontAwesomeIcon icon={faBoxes} size="2x" />
                    </div>
                    <h5 className="fw-bold text-dark">Inventario</h5>
                    <p className="text-muted small">Productos y Stock</p>
                  </CardBody>
                </Card>
              </Link>
            </Col>

            {/* Reportes/Ventas */}
            <Col md="4" lg="3">
              <Link to="/vendedor" className="text-decoration-none">
                <Card className="h-100 shadow-sm border-0 transform-hover" style={{ transition: '0.3s' }}>
                  <CardBody className="text-center py-5">
                    <div className="icon-circle bg-warning bg-opacity-10 text-warning p-4 rounded-circle mb-3 d-inline-block">
                      <FontAwesomeIcon icon={faCashRegister} size="2x" />
                    </div>
                    <h5 className="fw-bold text-dark">Mis Ventas</h5>
                    <p className="text-muted small">Historial de Transacciones</p>
                  </CardBody>
                </Card>
              </Link>
            </Col>

            {/* Admin Panel (Solo si es Admin) */}
            <Col md="4" lg="3">
              <Link to="/admin" className="text-decoration-none">
                <Card className="h-100 shadow-sm border-0 transform-hover" style={{ transition: '0.3s', background: '#2c3e50' }}>
                  <CardBody className="text-center py-5">
                    <div className="icon-circle bg-white bg-opacity-10 text-white p-4 rounded-circle mb-3 d-inline-block">
                      <FontAwesomeIcon icon={faUsers} size="2x" />
                    </div>
                    <h5 className="fw-bold text-white">Administración</h5>
                    <p className="text-white-50 small">Gestión Global y Usuarios</p>
                  </CardBody>
                </Card>
              </Link>
            </Col>
          </Row>

          {/* 3. Indicadores Rápidos */}
          <Row className="mt-5">
            <Col md="6">
              <Card className="shadow-sm border-start border-success border-4">
                <CardBody className="d-flex align-items-center justify-content-between p-4">
                  <div>
                    <h6 className="text-uppercase text-muted fw-bold small">Estado del Sistema</h6>
                    <h4 className="text-success mb-0">
                      <FontAwesomeIcon icon={faChartLine} /> Operativo
                    </h4>
                  </div>
                  <Button color="success" outline size="sm">
                    Ver Detalles
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default Home;
