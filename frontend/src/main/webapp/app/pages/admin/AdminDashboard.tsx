import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Table, Badge, Progress, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faBoxes,
  faUsers,
  faExclamationTriangle,
  faMoneyBillWave,
  faCog,
  faTruck,
  faHistory,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IVenta } from 'app/shared/model/venta.model';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import dayjs from 'dayjs';

export const AdminDashboard = () => {
  const [bajoStock, setBajoStock] = useState<IArticulo[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<IVenta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ArticuloService.getAll(), VentaService.getAll()])
      .then(([artRes, venRes]) => {
        const low = artRes.data.filter(a => (a.existencia || 0) <= (a.existenciaMinima || 0));
        setBajoStock(low);
        setVentasRecientes(venRes.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Procesar datos para la gráfica (Ventas últimos 7 días)
  const chartData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
    const date = dayjs().subtract(daysAgo, 'day');
    const total = ventasRecientes.filter(v => dayjs(v.fecha).isSame(date, 'day')).reduce((acc, v) => acc + (v.total || 0), 0);
    return {
      name: date.format('ddd'),
      total,
    };
  });

  return (
    <div className="animate__animated animate__fadeIn p-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary fw-bold m-0">
          <FontAwesomeIcon icon={faChartLine} className="me-2" /> Panel de Control Gerencial
        </h4>
        <Button
          color="dark"
          outline
          size="sm"
          className="border-0 shadow-sm bg-white"
          onClick={() => alert('Configuración de Empresa próximamente')}
        >
          <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
          Configurar Empresa
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md="3">
          <Card className="shadow-sm border-start border-primary border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                    Ventas del Día
                  </div>
                  <h4 className="mb-0 text-primary fw-bold">
                    C${' '}
                    {ventasRecientes
                      .filter(v => dayjs(v.fecha).isSame(dayjs(), 'day'))
                      .reduce((acc, v) => acc + (v.total || 0), 0)
                      .toLocaleString()}
                  </h4>
                </div>
                <FontAwesomeIcon icon={faMoneyBillWave} size="lg" className="text-primary opacity-25" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-success border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                    Ventas del Mes
                  </div>
                  <h4 className="mb-0 text-success fw-bold">
                    C${' '}
                    {ventasRecientes
                      .filter(v => dayjs(v.fecha).isSame(dayjs(), 'month'))
                      .reduce((acc, v) => acc + (v.total || 0), 0)
                      .toLocaleString()}
                  </h4>
                </div>
                <FontAwesomeIcon icon={faChartLine} size="lg" className="text-success opacity-25" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-info border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                    Alertas de Stock
                  </div>
                  <h4 className="mb-0 text-info fw-bold">{bajoStock.length} Items</h4>
                </div>
                <FontAwesomeIcon icon={faBoxes} size="lg" className="text-info opacity-25" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-warning border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                    Vendedores
                  </div>
                  <h4 className="mb-0 text-warning fw-bold">Activos</h4>
                </div>
                <FontAwesomeIcon icon={faUsers} size="lg" className="text-warning opacity-25" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="8">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h6" className="text-secondary border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                <span>📊 Tendencia de Ventas (Últimos 7 días)</span>
                <Badge color="primary" pill style={{ fontSize: '0.7rem' }}>
                  C$ {ventasRecientes.reduce((acc, v) => acc + (v.total || 0), 0).toLocaleString()}
                </Badge>
              </CardTitle>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Alertas de Stock */}
        <Col md="4">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h6" className="text-danger border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                <span>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Alertas de Stock
                </span>
                <Badge color="danger" pill style={{ fontSize: '0.7rem' }}>
                  {bajoStock.length}
                </Badge>
              </CardTitle>

              {loading ? (
                <div className="text-center">checking stock...</div>
              ) : bajoStock.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table size="sm" borderless>
                    <tbody>
                      {bajoStock.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="fw-bold">{p.nombre}</div>
                            <small className="text-muted">{p.codigo}</small>
                          </td>
                          <td className="text-end text-danger fw-bold">
                            {p.existencia} / {p.existenciaMinima}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-success py-4">
                  <FontAwesomeIcon icon={faBoxes} size="2x" className="mb-2" />
                  <p>¡Todo en orden! No hay stock bajo.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
