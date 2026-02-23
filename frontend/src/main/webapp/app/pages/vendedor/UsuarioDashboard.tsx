import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Badge, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faShoppingBag, faUserFriends, faChartLine, faHistory, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import ArticuloService from 'app/services/articulo.service';
import { IVenta } from 'app/shared/model/venta.model';

export const UsuarioDashboard = () => {
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
      const bajoStock = resArt.data.filter(a => a.activo && (a.existencia || 0) <= (a.existenciaMinima || 0)).length;

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
        <h2 className="fw-bold text-black mb-0">Bienvenido al Panel de Ventas</h2>
        <Button color="primary" tag={Link} to="/vendedor/nueva-venta" className="rounded-pill px-4 fw-bold shadow-sm">
          <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Nueva Factura
        </Button>
      </div>

      <Row className="g-4 mb-5">
        <Col md="4">
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden h-100" style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)', color: 'white' }}>
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px' }}>
                  <FontAwesomeIcon icon={faShoppingBag} size="lg" className="text-primary" />
                </div>

              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>Ventas Realizadas</h6>
              <h3 className="fw-bold text-white m-0">{stats.ventasHoy}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden h-100" style={{ background: 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)', color: 'white' }}>
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px' }}>
                  <FontAwesomeIcon icon={faChartLine} size="lg" className="text-success" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>Total del Día</h6>
              <h3 className="fw-bold text-white m-0">C$ {stats.montoHoy.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden h-100" style={{ background: 'linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)', color: 'white' }}>
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px' }}>
                  <FontAwesomeIcon icon={faUserFriends} size="lg" style={{ color: '#8e44ad' }} />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>Clientes Registrados</h6>
              <h3 className="fw-bold text-white m-0">{stats.clientesTotal}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UsuarioDashboard;
