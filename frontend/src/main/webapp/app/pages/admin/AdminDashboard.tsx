import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
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
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IVenta } from 'app/shared/model/venta.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import dayjs from 'dayjs';
import { IDetalleVenta } from 'app/shared/model/detalle-venta.model';
import DetalleDevolucionService from 'app/services/detalle-devolucion.service';
import { IDetalleDevolucion } from 'app/shared/model/detalle-devolucion.model';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface ICategoryData {
  name: string;
  value: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bajoStock, setBajoStock] = useState<IArticulo[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<IVenta[]>([]);
  const [devolucionesRecientes, setDevolucionesRecientes] = useState<IDevolucion[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ArticuloService.getAll(),
      VentaService.getAll({ size: 1000, sort: 'fecha,desc' }),
      VentaService.getAllDetalles({ size: 1000 }),
      DevolucionService.getAll(),
      DetalleDevolucionService.getAll({ size: 1000 }),
    ])
      .then(([artRes, venRes, detRes, devRes, detDevRes]) => {
        const allArticulos = artRes.data;
        const low = allArticulos.filter(a => a.activo && (a.existencia || 0) <= (a.existenciaMinima || 0));
        setBajoStock(low);
        setVentasRecientes(venRes.data);
        setDevolucionesRecientes(devRes.data);

        // Crear mapa de categorías por ID de artículo para máxima precisión
        const catMap: Record<number, string> = {};
        allArticulos.forEach(a => {
          if (a.id) catMap[a.id] = a.categoria?.nombre || 'Sin Categoría';
        });

        const groupByCategory: Record<string, number> = {};

        // 1. Sumar Ventas (solo las no anuladas)
        const details: IDetalleVenta[] = detRes.data;
        details.forEach(det => {
          if (det.venta?.anulada) return;
          const catName = (det.articulo?.id ? catMap[det.articulo.id] : det.articulo?.categoria?.nombre) || 'Sin Categoría';
          const monto = det.monto || 0;
          groupByCategory[catName] = (groupByCategory[catName] || 0) + monto;
        });

        // 2. Restar Devoluciones (Solo el monto NETO para que coincida con la suma de ventas)
        const detailsDev: IDetalleDevolucion[] = detDevRes.data;
        detailsDev.forEach(det => {
          const catName = (det.articulo?.id ? catMap[det.articulo.id] : det.articulo?.categoria?.nombre) || 'Sin Categoría';
          // Usamos cantidad * precioUnitario para tener el valor neto (sin IVA)
          const montoNeto = (det.cantidad || 0) * (det.precioUnitario || 0);

          if (groupByCategory[catName] !== undefined) {
            groupByCategory[catName] -= montoNeto;
            if (groupByCategory[catName] < 0) groupByCategory[catName] = 0;
          }
        });

        const pieData: ICategoryData[] = Object.keys(groupByCategory).map(name => ({
          name,
          value: groupByCategory[name],
        }));

        setCategoryData(pieData.sort((a, b) => b.value - a.value).filter(d => d.value > 0));
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Procesar datos para la gráfica (Ventas Netas últimos 7 días)
  const chartData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
    const date = dayjs().subtract(daysAgo, 'day');
    const totalVentas = ventasRecientes
      .filter(v => dayjs(v.fecha).isSame(date, 'day') && !v.anulada)
      .reduce((acc, v) => acc + (v.total || 0), 0);
    const totalDevoluciones = devolucionesRecientes
      .filter(d => dayjs(d.fecha).isSame(date, 'day'))
      .reduce((acc, d) => acc + (d.total || 0), 0);

    const balance = totalVentas - totalDevoluciones;
    return {
      name: date.format('ddd'),
      total: balance < 0 ? 0 : balance, // Evitar valores negativos en la gráfica
    };
  });

  return (
    <div className="dashboard-container animate__animated animate__fadeIn p-2 px-md-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary fw-bold m-0">
          <FontAwesomeIcon icon={faChartLine} className="me-2" /> Panel de Control
        </h4>
        <Button color="dark" outline size="sm" className="border-0 shadow-sm bg-white" onClick={() => navigate('/admin/configuracion')}>
          <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
          Configurar Empresa
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4 g-3">
        <Col md="3">
          <Card className="kpi-palette-cyan h-100">
            <CardBody className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="kpi-icon-palette">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="text-end">
                  <div className="stat-value-palette">
                    {(() => {
                      const vHoy = ventasRecientes
                        .filter(v => dayjs(v.fecha).isSame(dayjs(), 'day') && !v.anulada)
                        .reduce((acc, v) => acc + (v.total || 0), 0);
                      const dHoy = devolucionesRecientes
                        .filter(d => dayjs(d.fecha).isSame(dayjs(), 'day'))
                        .reduce((acc, d) => acc + (d.total || 0), 0);
                      return (vHoy - dHoy).toLocaleString('es-NI', { style: 'currency', currency: 'NIO', currencyDisplay: 'narrowSymbol' });
                    })()}
                  </div>
                  <div className="stat-label-palette">Ventas del Día</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="kpi-palette-grey h-100">
            <CardBody className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="kpi-icon-palette">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="text-end">
                  <div className="stat-value-palette">
                    {(() => {
                      const vMes = ventasRecientes
                        .filter(v => dayjs(v.fecha).isSame(dayjs(), 'month') && !v.anulada)
                        .reduce((acc, v) => acc + (v.total || 0), 0);
                      const dMes = devolucionesRecientes
                        .filter(d => dayjs(d.fecha).isSame(dayjs(), 'month'))
                        .reduce((acc, d) => acc + (d.total || 0), 0);
                      return (vMes - dMes).toLocaleString('es-NI', { style: 'currency', currency: 'NIO', currencyDisplay: 'narrowSymbol' });
                    })()}
                  </div>
                  <div className="stat-label-palette">Ventas del Mes</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="kpi-palette-cyan h-100">
            <CardBody className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="kpi-icon-palette">
                  <FontAwesomeIcon icon={faReceipt} />
                </div>
                <div className="text-end">
                  <div className="stat-value-palette">
                    {ventasRecientes.filter(v => dayjs(v.fecha).isSame(dayjs(), 'day') && !v.anulada).length}
                  </div>
                  <div className="stat-label-palette">Facturas del Día</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="kpi-palette-grey h-100">
            <CardBody className="py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="kpi-icon-palette">
                  <FontAwesomeIcon icon={faHistory} />
                </div>
                <div className="text-end">
                  <div className="stat-value-palette">
                    {devolucionesRecientes.filter(d => dayjs(d.fecha).isSame(dayjs(), 'day')).length}
                  </div>
                  <div className="stat-label-palette">Devoluciones Hoy</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="8">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h6" className="text-black border-bottom pb-2 mb-3">
                <span> Tendencia de Ventas (Últimos 7 días)</span>
              </CardTitle>
              <div style={{ height: '220px', width: '100%' }}>
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
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Alertas de Stock */}
        <Col md="4">
          <Card className="shadow mb-4 h-100">
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
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                </div>
              ) : bajoStock.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <Table size="sm" borderless hover className="align-middle">
                    <tbody>
                      {bajoStock.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="fw-bold small text-truncate" style={{ maxWidth: '150px' }}>
                              {p.nombre}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                              {p.codigo}
                            </div>
                          </td>
                          <td className="text-end">
                            <Badge color="soft-danger" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.7rem' }}>
                              {p.existencia} / {p.existenciaMinima}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-success py-5">
                  <FontAwesomeIcon icon={faBoxes} size="2x" className="mb-2 opacity-25" />
                  <p className="small mb-0">¡Todo en orden!</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="8">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h6" className="text-black border-bottom pb-2 mb-3">
                Ventas por Categoría
              </CardTitle>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [`C$ ${Number(value).toLocaleString()}`, 'Ventas']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
