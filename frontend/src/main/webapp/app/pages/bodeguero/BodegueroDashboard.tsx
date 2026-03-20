import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Badge, Button, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxes,
  faFileInvoice,
  faExclamationTriangle,
  faTags,
  faPlus,
  faShoppingCart,
  faHistory,
  faEye,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import ArticuloService from 'app/services/articulo.service';
import IngresoService from 'app/services/ingreso.service';
import CategoriaService from 'app/services/categoria.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IIngreso } from 'app/shared/model/ingreso.model';
import dayjs from 'dayjs';

export const BodegueroDashboard = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = account?.authorities?.includes(AUTHORITIES.ADMIN);
  const [stats, setStats] = useState({
    totalProductos: 0,
    bajoStock: 0,
    comprasHoy: 0,
    totalCategorias: 0,
  });
  const [recientes, setRecientes] = useState<IIngreso[]>([]);
  const [articulosBajo, setArticulosBajo] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [resArt, resIng, resCat] = await Promise.all([
        ArticuloService.getAll(),
        IngresoService.getAll({ sort: 'id,desc', size: 100 }),
        CategoriaService.getAll(),
      ]);

      const articulos = resArt.data;
      const ingresos = resIng.data; // Ya vienen ordenados del servidor
      const categorias = resCat.data;

      const bajoStockList = articulos.filter(a => a.activo && (a.existencia || 0) <= (a.existenciaMinima || 0));
      const today = dayjs().startOf('day');
      const comprasHoy = ingresos.filter(i => {
        const fechaIngreso = dayjs(i.fecha).startOf('day');
        return fechaIngreso.isSame(today) && i.activo;
      }).length;

      const categoriasActivas = categorias.filter(c => c.activo !== false);
      const productosActivos = articulos.filter(a => a.activo !== false);

      setStats({
        totalProductos: productosActivos.length,
        bajoStock: bajoStockList.length,
        comprasHoy,
        totalCategorias: categoriasActivas.length,
      });

      setRecientes(ingresos.slice(0, 6)); // Últimos 6 ingresos
      setArticulosBajo(bajoStockList.slice(0, 6)); // Primeros 6 con bajo stock
    } catch (e) {
      console.error('Error cargando dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-2 px-md-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">👋 Bienvenido(a), {account?.firstName || account?.login}</h4>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {/* Total Productos */}
        <Col md="3">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a103d 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '2rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faBoxes} size="lg" className="text-white" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Total Productos
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.totalProductos}</h3>
            </CardBody>
          </Card>
        </Col>

        {/* Bajo Stock */}
        <Col md="3">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #536976 0%, #292e49 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '2rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="text-white" />
                </div>
                {stats.bajoStock > 0 && (
                  <Badge color="white" pill className="text-danger fw-bold shadow-sm">
                    Atención
                  </Badge>
                )}
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Bajo Stock
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.bajoStock} Artículos</h3>
            </CardBody>
          </Card>
        </Col>

        {/* Compras Hoy */}
        <Col md="3">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a103d 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '2rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faFileInvoice} size="lg" className="text-white" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Ingresos Hoy
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.comprasHoy}</h3>
            </CardBody>
          </Card>
        </Col>

        {/* Categorías */}
        <Col md="3">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #536976 0%, #292e49 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '2rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faTags} size="lg" className="text-white" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Categorías
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.totalCategorias}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Tabla de Ingresos Recientes */}
        <Col lg="7">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">
                  <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" /> Ingresos Recientes
                </h5>
                <Button color="link" tag={Link} to="/bodeguero/ingresos" className="text-decoration-none small text-primary fw-bold p-0">
                  Ver todos <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                </Button>
              </div>
              <div className="table-responsive">
                <Table borderless hover className="align-middle mb-0">
                  <thead className="text-muted small text-uppercase" style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Factura</th>
                      <th className="py-2">Proveedor</th>
                      {isAdmin && <th className="py-2 text-end">Total</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.length > 0 ? (
                      recientes.map(ing => (
                        <tr key={ing.id} className="border-bottom border-light">
                          <td className="small">{dayjs(ing.fecha).format('DD/MM/YY')}</td>
                          <td className="fw-bold">{ing.noDocumento}</td>
                          <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                            {ing.proveedor?.nombre}
                          </td>
                          {isAdmin && <td className="text-end fw-bold text-success">C$ {ing.total?.toLocaleString()}</td>}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No hay ingresos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Lista de Bajo Stock */}
        <Col lg="5">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0 text-danger">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Alertas de Reabastecimiento
                </h5>
                <Button color="link" tag={Link} to="/admin/articulos" className="text-decoration-none small text-danger fw-bold p-0">
                  Ir a inventario <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                </Button>
              </div>
              <div className="d-flex flex-column gap-2 mt-3">
                {articulosBajo.length > 0 ? (
                  articulosBajo.map(art => {
                    const existencia = art.existencia || 0;
                    const minima = art.existenciaMinima || 0;

                    // Determinar nivel de alerta
                    const nivel: 'critico' | 'bajo' = existencia === 0 ? 'critico' : 'bajo';

                    const estilos = {
                      critico: {
                        bg: '#fff0f0',
                        border: '#e53e3e',
                        badgeText: 'CRÍTICO',
                        dot: '#e53e3e',
                        countColor: '#e53e3e',
                        countBg: '#ffe5e5',
                      },
                      bajo: {
                        bg: '#fffbeb',
                        border: '#d97706',
                        badgeText: 'BAJO',
                        dot: '#d97706',
                        countColor: '#d97706',
                        countBg: '#fef3c7',
                      },
                    }[nivel];

                    return (
                      <div
                        key={art.id}
                        className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
                        style={{ backgroundColor: estilos.bg, borderLeft: `4px solid ${estilos.border}` }}
                      >
                        <div className="text-truncate me-2">
                          <div className="fw-bold text-dark small text-truncate">{art.nombre}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{art.codigo}</div>
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: '110px', justifyContent: 'flex-end' }}>
                          <span className="d-flex align-items-center gap-1 fw-semibold" style={{ fontSize: '0.72rem', color: estilos.dot }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: estilos.dot, display: 'inline-block' }} />
                            {estilos.badgeText}
                          </span>
                          <span
                            className="fw-bold rounded-2 px-2 py-1"
                            style={{ fontSize: '0.75rem', color: estilos.countColor, backgroundColor: estilos.countBg, whiteSpace: 'nowrap' }}
                          >
                            {existencia} / {minima}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5">
                    <FontAwesomeIcon icon={faBoxes} size="3x" className="text-light mb-2" />
                    <p className="text-muted small">El inventario está completo</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BodegueroDashboard;
