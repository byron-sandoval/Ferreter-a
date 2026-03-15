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
  faPencilAlt,
  faTruck,
  faHistory,
  faBuilding,
  faReceipt,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IVenta } from 'app/shared/model/venta.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { IDetalleVenta } from 'app/shared/model/detalle-venta.model';
import DetalleDevolucionService from 'app/services/detalle-devolucion.service';
import { IDetalleDevolucion } from 'app/shared/model/detalle-devolucion.model';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

dayjs.locale('es');

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
  const [revisionPrecios, setRevisionPrecios] = useState<IArticulo[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const [allArticulos, setAllArticulos] = useState<IArticulo[]>([]);
  const [allDetallesVenta, setAllDetallesVenta] = useState<IDetalleVenta[]>([]);
  const [allDetallesDevolucion, setAllDetallesDevolucion] = useState<IDetalleDevolucion[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ArticuloService.getAll(),
      VentaService.getAll({ size: 1000, sort: 'fecha,desc' }),
      VentaService.getAllDetalles({ size: 2000 }),
      DevolucionService.getAll(),
      DetalleDevolucionService.getAll({ size: 2000 }),
    ])
      .then(([artRes, venRes, detRes, devRes, detDevRes]) => {
        setAllArticulos(artRes.data);
        setVentasRecientes(venRes.data);
        setDevolucionesRecientes(devRes.data);
        setAllDetallesVenta(detRes.data);
        setAllDetallesDevolucion(detDevRes.data);

        const low = artRes.data.filter(a => a.activo && (a.existencia || 0) <= (a.existenciaMinima || 0));
        setBajoStock(low);
        const revision = artRes.data.filter(a => a.activo && a.ultimoCosto && (a.costo || 0) > (a.ultimoCosto || 0));
        setRevisionPrecios(revision);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (loading) return;

    // Crear mapa de categorías por ID de artículo para máxima precisión
    const catMap: Record<number, string> = {};
    allArticulos.forEach(a => {
      if (a.id) catMap[a.id] = a.categoria?.nombre || 'Sin Categoría';
    });

    const groupByCategory: Record<string, number> = {};

    // 1. Sumar Ventas del mes seleccionado (solo las no anuladas)
    allDetallesVenta.forEach(det => {
      if (det.venta?.anulada) return;
      if (!dayjs(det.venta?.fecha).isSame(selectedDate, 'month')) return;

      const catName = (det.articulo?.id ? catMap[det.articulo.id] : det.articulo?.categoria?.nombre) || 'Sin Categoría';
      const monto = det.monto || 0;
      groupByCategory[catName] = (groupByCategory[catName] || 0) + monto;
    });

    // 2. Restar Devoluciones del mes seleccionado
    allDetallesDevolucion.forEach(det => {
      if (!dayjs(det.devolucion?.fecha).isSame(selectedDate, 'month')) return;

      const catName = (det.articulo?.id ? catMap[det.articulo.id] : det.articulo?.categoria?.nombre) || 'Sin Categoría';
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
  }, [selectedDate, loading, allArticulos, allDetallesVenta, allDetallesDevolucion]);

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
        <div className="d-flex gap-2 align-items-center">
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} size="sm">
            <DropdownToggle caret color="white" className="border shadow-sm text-primary fw-bold px-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              {selectedDate.format('MMMM YYYY').charAt(0).toUpperCase() + selectedDate.format('MMMM YYYY').slice(1)}
            </DropdownToggle>
            <DropdownMenu end className="shadow border-0">
              <DropdownItem header>Seleccionar Mes</DropdownItem>
              {Array.from({ length: dayjs().month() + 1 })
                .map((_, m) => {
                  const d = dayjs().startOf('year').add(m, 'month');
                  const isSelected = selectedDate.isSame(d, 'month');
                  return (
                    <DropdownItem key={m} onClick={() => setSelectedDate(d)} active={isSelected}>
                      {d.format('MMMM YYYY').charAt(0).toUpperCase() + d.format('MMMM YYYY').slice(1)}
                    </DropdownItem>
                  );
                })
                .reverse()}
            </DropdownMenu>
          </Dropdown>
        </div>
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
                        .filter(v => dayjs(v.fecha).isSame(selectedDate, 'month') && !v.anulada)
                        .reduce((acc, v) => acc + (v.total || 0), 0);
                      const dMes = devolucionesRecientes
                        .filter(d => dayjs(d.fecha).isSame(selectedDate, 'month'))
                        .reduce((acc, d) => acc + (d.total || 0), 0);
                      return (vMes - dMes).toLocaleString('es-NI', { style: 'currency', currency: 'NIO', currencyDisplay: 'narrowSymbol' });
                    })()}
                  </div>
                  <div className="stat-label-palette">Ventas de {selectedDate.format('MMMM')}</div>
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
                        <stop offset="5%" stopColor="#1a0d65ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#05afd9ff" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        padding: '10px',
                      }}
                      formatter={(value: any) => [`C$ ${Number(value).toLocaleString()}`, 'Ventas']}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: '#4f46e5' }}
                      activeDot={{ r: 5, strokeWidth: 0, fill: '#4f46e5' }}
                    />
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
                <div className="d-flex flex-column gap-2 custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {bajoStock.map(p => {
                    const existencia = p.existencia || 0;
                    const minima = p.existenciaMinima || 0;

                    let nivel: 'critico' | 'bajo';
                    if (existencia === 0) {
                      nivel = 'critico';
                    } else {
                      nivel = 'bajo';
                    }

                    const estilos = {
                      critico: { bg: '#fff0f0', border: '#e53e3e', badgeText: 'CRÍTICO', dot: '#e53e3e', countColor: '#e53e3e', countBg: '#ffe5e5' },
                      bajo: { bg: '#fffbeb', border: '#d97706', badgeText: 'BAJO', dot: '#d97706', countColor: '#d97706', countBg: '#fef3c7' },
                    }[nivel];

                    return (
                      <div
                        key={p.id}
                        className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
                        style={{ backgroundColor: estilos.bg, borderLeft: `4px solid ${estilos.border}` }}
                      >
                        <div className="text-truncate me-2">
                          <div className="fw-bold small text-truncate" style={{ maxWidth: '150px' }}>{p.nombre}</div>
                          <div className="text-muted" style={{ fontSize: '0.65rem' }}>{p.codigo}</div>
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: '110px', justifyContent: 'flex-end' }}>
                          <span className="d-flex align-items-center gap-1 fw-semibold" style={{ fontSize: '0.72rem', color: estilos.dot }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: estilos.dot, display: 'inline-block' }} />
                            {estilos.badgeText}
                          </span>
                          <span className="fw-bold rounded-2 px-2 py-1" style={{ fontSize: '0.72rem', color: estilos.countColor, backgroundColor: estilos.countBg, whiteSpace: 'nowrap' }}>
                            {existencia} / {minima}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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
                Ventas por Categoría ({selectedDate.format('MMMM YYYY')})
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

      <Row className="mt-3">
        {/* Alertas de Margen: Ahora en una fila propia abajo */}
        <Col md="12">
          <Card className="shadow mb-4 border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
            <div style={{ background: 'linear-gradient(135deg, #29128cff 0%, #888f87ff 100%)', padding: '10px 15px' }}>
              <div className="d-flex justify-content-between align-items-center text-white">
                <h6 className="m-0 fw-bold">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> Alerta: Costo de Compra
                </h6>
                <Badge color="light" text="dark" pill>
                  {revisionPrecios.length}
                </Badge>
              </div>
            </div>
            <CardBody className="bg-light bg-opacity-10">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                </div>
              ) : revisionPrecios.length > 0 ? (
                <Row style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px' }}>
                  {revisionPrecios.map(p => (
                    <Col md="3" key={p.id} className="mb-4">
                      <div
                        className="bg-white p-3 shadow-sm border product-alert-card h-100"
                        style={{
                          borderRadius: '15px',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '1rem' }}>
                              {p.nombre}
                            </div>
                            <Badge color="warning" className="text-uppercase mt-1" style={{ fontSize: '0.6rem', padding: '3px 7px' }}>
                              Revisión Requerida
                            </Badge>
                          </div>
                          <div
                            className="btn-sm p-0 d-flex align-items-center justify-content-center bg-primary text-white shadow-sm"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/admin/articulos/${p.id}/edit`);
                            }}
                            style={{ width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer' }}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between gap-1 bg-light p-3 rounded-4 border-0">
                          <div className="text-center flex-fill">
                            <div className="text-muted mb-1" style={{ fontSize: '0.65rem' }}>
                              ANTERIOR
                            </div>
                            <div className="fw-bold small text-dark">C$ {p.ultimoCosto?.toLocaleString() || '---'}</div>
                          </div>
                          <div className="text-center flex-fill border-start border-end">
                            <div className="text-muted mb-1" style={{ fontSize: '0.65rem' }}>
                              NUEVO
                            </div>
                            <div className="text-danger fw-bold small">C$ {p.costo?.toLocaleString()}</div>
                          </div>
                          <div className="text-center flex-fill">
                            <div className="text-muted mb-1" style={{ fontSize: '0.65rem' }}>
                              VENTA
                            </div>
                            <div className="text-primary fw-bold small">C$ {p.precio?.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FontAwesomeIcon icon={faChartLine} size="2x" className="mb-2 opacity-10" />
                  <p className="small mb-0">Márgenes saludables</p>
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
