import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Badge, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faShoppingBag, faUserFriends, faChartLine, faHistory, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import ArticuloService from 'app/services/articulo.service';
import { IVenta } from 'app/shared/model/venta.model';

export const VendedorDashboard = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    montoHoy: 0,
    clientesTotal: 0,
    productosBajoStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [resVentas, resClie, resArt] = await Promise.all([
        VentaService.getVentasHoy(),
        ClienteService.getAll(),
        ArticuloService.getAll(),
      ]);

      const ventas = resVentas.data.filter(v => !v.anulada);
      const monto = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
      const bajoStock = resArt.data.filter(a => (a.existencia || 0) <= (a.existenciaMinima || 0)).length;

      setStats({
        ventasHoy: ventas.length,
        montoHoy: monto,
        clientesTotal: resClie.data.length,
        productosBajoStock: bajoStock,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary mb-0">Bienvenido al Panel de Ventas</h2>
        <Button color="primary" tag={Link} to="/vendedor/nueva-venta" className="rounded-pill px-4 fw-bold shadow-sm">
          <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Nueva Factura
        </Button>
      </div>

      <Row className="g-4 mb-5">
        <Col md="3">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary">
                  <FontAwesomeIcon icon={faShoppingBag} size="lg" />
                </div>
                <Badge color="light" className="text-primary border">
                  +12% hoy
                </Badge>
              </div>
              <h6 className="text-muted small text-uppercase fw-bold mb-1">Ventas Realizadas</h6>
              <h3 className="fw-bold text-dark m-0">{stats.ventasHoy}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 text-success">
                  <FontAwesomeIcon icon={faChartLine} size="lg" />
                </div>
              </div>
              <h6 className="text-muted small text-uppercase fw-bold mb-1">Total del Día</h6>
              <h3 className="fw-bold text-dark m-0">C$ {stats.montoHoy.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 text-info">
                  <FontAwesomeIcon icon={faUserFriends} size="lg" />
                </div>
              </div>
              <h6 className="text-muted small text-uppercase fw-bold mb-1">Clientes Registrados</h6>
              <h3 className="fw-bold text-dark m-0">{stats.clientesTotal}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="3">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-danger bg-opacity-10 p-3 text-danger">
                  <FontAwesomeIcon icon={faBoxes} size="lg" />
                </div>
                {stats.productosBajoStock > 0 && (
                  <Badge color="danger" pill>
                    Alerta
                  </Badge>
                )}
              </div>
              <h6 className="text-muted small text-uppercase fw-bold mb-1">Productos Bajo Stock</h6>
              <h3 className="fw-bold text-dark m-0">{stats.productosBajoStock}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="8">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <CardBody className="p-4">
              <h5 className="fw-bold mb-4">Accesos Directos</h5>
              <Row className="g-3">
                <Col md="6">
                  <Button
                    color="light"
                    tag={Link}
                    to="/vendedor/historial-ventas"
                    className="w-100 py-4 border-0 shadow-none text-start d-flex align-items-center rounded-4 hover-primary-lite"
                  >
                    <div className="p-3 bg-white rounded-circle me-3 shadow-sm text-info">
                      <FontAwesomeIcon icon={faHistory} />
                    </div>
                    <div>
                      <div className="fw-bold d-block">Historial</div>
                      <small className="text-muted">Reversiones y ticket</small>
                    </div>
                  </Button>
                </Col>
                <Col md="6">
                  <Button
                    color="light"
                    tag={Link}
                    to="/vendedor/clientes"
                    className="w-100 py-4 border-0 shadow-none text-start d-flex align-items-center rounded-4 hover-primary-lite"
                  >
                    <div className="p-3 bg-white rounded-circle me-3 shadow-sm text-success">
                      <FontAwesomeIcon icon={faUserFriends} />
                    </div>
                    <div>
                      <div className="fw-bold d-block">Clientes</div>
                      <small className="text-muted">Crédito y deuda</small>
                    </div>
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100 overflow-hidden">
            <CardBody className="p-4 position-relative">
              <h4 className="fw-bold mb-3">Sugerencia del día</h4>
              <p className="opacity-75 small">
                Recuerda verificar el stock de &apos;Cemento Canal&apos; antes de facturar volumen mayor a 50 bolsas.
              </p>
              <FontAwesomeIcon icon={faCashRegister} size="6x" className="position-absolute bottom-0 end-0 m-n3 opacity-10" />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VendedorDashboard;
