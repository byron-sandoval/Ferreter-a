import './home.scss';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faPlusCircle, faBoxes, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const loading = useAppSelector(state => state.authentication.loading);

  // Redirect automático a Keycloak solo si:
  // 1. No está autenticado
  // 2. No hay un proceso de autenticación en curso
  // 3. No hay información de cuenta cargándose
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && !loading && !account?.login) {
        window.location.href = '/oauth2/authorization/oidc';
      }
    }, 500); // Pequeño delay para permitir que se complete la carga del estado

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, account]);

  // Si está cargando o no autenticado, mostrar mensaje
  if (loading || !isAuthenticated) {
    return (
      <div className="home-dashboard d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">{loading ? 'Verificando sesión...' : 'Redirigiendo a inicio de sesión...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-dashboard">
      <Row className="mb-4">
        <Col md="12">
          <div className="hero-section p-4 bg-light rounded shadow-sm border-left-primary">
            <h1 className="display-5 text-primary">¡Bienvenido a FerroNica!</h1>
            <p className="lead text-muted">Sistema de Gestión de Inventario y Ventas</p>
            <Alert color="info" className="d-inline-block">
              Conectado como: <strong>{account.login}</strong>
            </Alert>
          </div>
        </Col>
      </Row>

      {account?.login && (
        <>
          <Row className="mb-4">
            <Col md="4">
              <Card className="text-white bg-success shadow h-100 py-2">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Ventas de Hoy</div>
                      <CardTitle tag="h3" className="mb-0">
                        C$ 0.00
                      </CardTitle>
                    </div>
                    <FontAwesomeIcon icon={faCashRegister} size="3x" className="text-white-50" />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="text-white bg-info shadow h-100 py-2">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Productos en Inventario</div>
                      <CardTitle tag="h3" className="mb-0">
                        0
                      </CardTitle>
                    </div>
                    <FontAwesomeIcon icon={faBoxes} size="3x" className="text-white-50" />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="text-white bg-warning shadow h-100 py-2">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-xs font-weight-bold text-uppercase mb-1">Clientes Registrados</div>
                      <CardTitle tag="h3" className="mb-0">
                        0
                      </CardTitle>
                    </div>
                    <FontAwesomeIcon icon={faUsers} size="3x" className="text-white-50" />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md="6" className="mb-4">
              <Card className="shadow h-100">
                <CardBody>
                  <CardTitle tag="h5" className="text-primary border-bottom pb-2">
                    <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> Accesos Rápidos
                  </CardTitle>
                  <div className="d-grid gap-2 mt-3">
                    <Button color="primary" block tag={Link} to="/venta/new">
                      <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> Nueva Venta
                    </Button>
                    <Button color="outline-primary" block tag={Link} to="/producto">
                      <FontAwesomeIcon icon={faBoxes} className="mr-2" /> Ver Inventario
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="6" className="mb-4">
              <Card className="shadow h-100">
                <CardBody>
                  <CardTitle tag="h5" className="text-primary border-bottom pb-2">
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" /> Resumen de Actividad
                  </CardTitle>
                  <CardText className="mt-3 text-muted">
                    Aquí aparecerán las últimas transacciones y movimientos de stock una vez que comiences a operar.
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Home;
