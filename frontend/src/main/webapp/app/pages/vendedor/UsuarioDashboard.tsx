import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Badge, Button, CardTitle } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faShoppingBag, faUserFriends, faChartLine, faHistory, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import ArticuloService from 'app/services/articulo.service';
import { IVenta } from 'app/shared/model/venta.model';
import { useAppSelector } from 'app/config/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export const UsuarioDashboard = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [stats, setStats] = useState({
    ventasHoy: 0,
    montoHoy: 0,
    clientesTotal: 0,
    productosBajoStock: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [allMisDetalles, setAllMisDetalles] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [topPeriod, setTopPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(true);

  // Recalcular Top 5 productos cada vez que cambie de período
  useEffect(() => {
    if (loading) return;
    const productSales: Record<string, number> = {};

    allMisDetalles.forEach(det => {
      const fechaDev = dayjs(det.fecha);
      let match = false;

      if (topPeriod === 'day') {
        match = fechaDev.isSame(dayjs(), 'day');
      } else if (topPeriod === 'week') {
        match = fechaDev.isAfter(dayjs().subtract(7, 'day'));
      } else {
        match = fechaDev.isSame(dayjs(), 'month');
      }

      if (match) {
        productSales[det.nombre] = (productSales[det.nombre] || 0) + det.cantidad;
      }
    });

    const top5 = Object.keys(productSales)
      .map(name => ({ name, total: productSales[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setTopProductsData(top5);
  }, [topPeriod, allMisDetalles, loading]);

  useEffect(() => {
    if (account && account.login) {
      loadStats();
    }
  }, [account]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Pedimos ventas de los últimos 30 días para asegurar que abarca semanas y mes
      const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month');

      const [resVentasHoy, resVentasRecientes, resClie, resArt, resDetalles] = await Promise.all([
        VentaService.getVentasHoy(),
        VentaService.getAll({
          'fecha.greaterThanOrEqual': startOfLastMonth.toISOString(),
          size: 2000,
          sort: 'fecha,desc'
        }),
        ClienteService.getAll(),
        ArticuloService.getAll(),
        VentaService.getAllDetalles({ size: 2000 })
      ]);

      // Filtrar ventas para calcular los totales de Hoy
      const loginActual = account.login;

      const misVentasHoy = resVentasHoy.data.filter(v => !v.anulada && v.usuario?.username === loginActual);
      const monto = misVentasHoy.reduce((acc, v) => acc + (v.total || 0), 0);

      const bajoStock = resArt.data.filter(a => a.activo && (a.existencia || 0) <= (a.existenciaMinima || 0)).length;

      setStats({
        ventasHoy: misVentasHoy.length,
        montoHoy: monto,
        clientesTotal: resClie.data.filter((c: any) => c.activo !== false).length,
        productosBajoStock: bajoStock,
      });

      // Mapear todas las ventas recientes validadas del usuario para cruzarlas con los detalles
      const misVentasMap = new Map();
      resVentasRecientes.data.forEach(v => {
        if (!v.anulada && v.usuario?.username === loginActual) {
          misVentasMap.set(v.id, v.fecha);
        }
      });

      // Procesar datos para la gráfica de tendencia de los últimos 7 días
      const last7DaysData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
        const date = dayjs().subtract(daysAgo, 'day');
        const dailyTotal = resVentasRecientes.data
          .filter(v => v.usuario?.username === loginActual && !v.anulada && dayjs(v.fecha).isSame(date, 'day'))
          .reduce((acc, v) => acc + (v.total || 0), 0);

        return {
          name: date.format('ddd'),
          total: dailyTotal,
        };
      });

      setChartData(last7DaysData);

      // Pre-filtrar todos los detalles que pertenecen al usuario para las gráficas dinámicas
      const validDetails: any[] = [];
      resDetalles.data.forEach(det => {
        if (det.venta && det.venta.id && misVentasMap.has(det.venta.id)) {
          validDetails.push({
            fecha: misVentasMap.get(det.venta.id),
            nombre: det.articulo?.nombre || 'Desconocido',
            cantidad: det.cantidad || 0
          });
        }
      });

      setAllMisDetalles(validDetails);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-black mb-0">👋 Bienvenido(a), {account?.firstName || account?.login}</h4>
        <Button color="primary" tag={Link} to="/vendedor/nueva-venta" className="rounded-pill px-4 fw-bold shadow-sm">
          <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Nueva Factura
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md="4">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a103d 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '4rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontSize: '1.8rem', color: 'rgba(255, 255, 255, 0.25)' }}>
                  <FontAwesomeIcon icon={faShoppingBag} />
                </div>
                <div className="text-end">
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'white' }}>{stats.ventasHoy}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ventas Realizadas
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #536976 0%, #292e49 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '4rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontSize: '1.8rem', color: 'rgba(255, 255, 255, 0.25)' }}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="text-end">
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'white' }}>C$ {stats.montoHoy.toFixed(2)}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total del Día
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card
            className="border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a103d 100%)', color: 'white', minHeight: '100px' }}
          >
            <CardBody style={{ padding: '4rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ fontSize: '1.8rem', color: 'rgba(255, 255, 255, 0.25)' }}>
                  <FontAwesomeIcon icon={faUserFriends} />
                </div>
                <div className="text-end">
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'white' }}>{stats.clientesTotal}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Clientes Registrados
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Gráfica de Tendencia (Ocupa la mitad) */}
        <Col md="6">
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white h-100">
            <div className="bg-white border-bottom" style={{ padding: '12px 15px' }}>
              <div className="d-flex justify-content-between align-items-center text-dark">
                <h6 className="m-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                  Mi Tendencia de Ventas
                </h6>
                <Badge color="primary" pill style={{ fontSize: '0.65rem' }}>
                  Personal
                </Badge>
              </div>
            </div>
            <CardBody className="p-3">
              <div style={{ height: '220px', width: '100%' }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4e73df" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4e73df" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(value) => `C$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          padding: '10px'
                        }}
                        formatter={(value: any) => [`C$ ${Number(value).toLocaleString()}`, 'Mis Ventas']}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#4e73df"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#4e73df' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4e73df' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Gráfica de Top Productos (Ocupa la otra mitad) */}
        <Col md="6">
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white h-100">
            <div className="bg-white border-bottom" style={{ padding: '8px 12px' }}>
              <div className="d-flex justify-content-between align-items-center text-dark">
                <h6 className="m-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                  <FontAwesomeIcon icon={faBoxes} className="me-2 text-primary" />
                  Mis 5 Artículos más Vendidos
                </h6>
                <div className="d-flex gap-1 bg-light rounded-pill p-1 border">
                  <Badge
                    pill
                    style={{ cursor: 'pointer', fontSize: '0.65rem', padding: '4px 8px' }}
                    color={topPeriod === 'day' ? 'success' : 'transparent'}
                    className={topPeriod === 'day' ? 'text-white fw-bold shadow-sm' : 'text-muted fw-semibold'}
                    onClick={() => setTopPeriod('day')}
                  >
                    HOY
                  </Badge>
                  <Badge
                    pill
                    style={{ cursor: 'pointer', fontSize: '0.65rem', padding: '4px 8px' }}
                    color={topPeriod === 'week' ? 'success' : 'transparent'}
                    className={topPeriod === 'week' ? 'text-white fw-bold shadow-sm' : 'text-muted fw-semibold'}
                    onClick={() => setTopPeriod('week')}
                  >
                    SEMANA
                  </Badge>
                  <Badge
                    pill
                    style={{ cursor: 'pointer', fontSize: '0.65rem', padding: '4px 8px' }}
                    color={topPeriod === 'month' ? 'success' : 'transparent'}
                    className={topPeriod === 'month' ? 'text-white fw-bold shadow-sm' : 'text-muted fw-semibold'}
                    onClick={() => setTopPeriod('month')}
                  >
                    MES
                  </Badge>
                </div>
              </div>
            </div>
            <CardBody className="p-3">
              <div style={{ height: '220px', width: '100%' }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-secondary" role="status"></div>
                  </div>
                ) : topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={topProductsData}
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={100}
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: any) => [`${value} unidades`, 'Cantidad']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#ff6c28ff"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">
                    <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-2" />
                    <p className="small">Sin datos de ventas</p>
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

export default UsuarioDashboard;
