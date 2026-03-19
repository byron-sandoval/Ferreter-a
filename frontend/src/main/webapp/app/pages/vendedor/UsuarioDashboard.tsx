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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account && account.login) {
      loadStats();
    }
  }, [account]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Pedimos ventas de los últimos 7 días para la gráfica
      const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day');
      
      const [resVentasHoy, resVentasSemana, resClie, resArt] = await Promise.all([
        VentaService.getVentasHoy(),
        VentaService.getAll({ 
          'fecha.greaterThanOrEqual': sevenDaysAgo.toISOString(),
          size: 1000,
          sort: 'fecha,desc' 
        }),
        ClienteService.getAll(),
        ArticuloService.getAll(),
      ]);

      // Filtrar ventas para que solo aparezcan las del usuario logueado
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

      // Procesar datos para la gráfica de los últimos 7 días
      const misVentasSemana = resVentasSemana.data.filter(v => !v.anulada && v.usuario?.username === loginActual);
      
      const last7DaysData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
        const date = dayjs().subtract(daysAgo, 'day');
        const dailyTotal = misVentasSemana
          .filter(v => dayjs(v.fecha).isSame(date, 'day'))
          .reduce((acc, v) => acc + (v.total || 0), 0);
        
        return {
          name: date.format('ddd'),
          total: dailyTotal,
        };
      });

      setChartData(last7DaysData);
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
          <Card
            className="border-0 shadow-lg rounded-4 overflow-hidden h-100"
            style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)', color: 'white' }}
          >
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faShoppingBag} size="lg" className="text-primary" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Ventas Realizadas
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.ventasHoy}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card
            className="border-0 shadow-lg rounded-4 overflow-hidden h-100"
            style={{ background: 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)', color: 'white' }}
          >
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faChartLine} size="lg" className="text-success" />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Total del Día
              </h6>
              <h3 className="fw-bold text-white m-0">C$ {stats.montoHoy.toFixed(2)}</h3>
            </CardBody>
          </Card>
        </Col>

        <Col md="4">
          <Card
            className="border-0 shadow-lg rounded-4 overflow-hidden h-100"
            style={{ background: 'linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)', color: 'white' }}
          >
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div
                  className="rounded-circle bg-white p-3 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '54px', height: '54px' }}
                >
                  <FontAwesomeIcon icon={faUserFriends} size="lg" style={{ color: '#8e44ad' }} />
                </div>
              </div>
              <h6 className="text-white-50 small text-uppercase fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>
                Clientes Registrados
              </h6>
              <h3 className="fw-bold text-white m-0">{stats.clientesTotal}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md="6">
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-white">
            <CardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <CardTitle tag="h5" className="fw-bold text-dark m-0">
                  <FontAwesomeIcon icon={faChartLine} className="text-primary me-2" />
                  Mi Tendencia de Ventas
                </CardTitle>
                <Badge color="soft-primary" className="rounded-pill px-3 py-2 text-primary" style={{ backgroundColor: '#eef2ff' }}>
                  Personal
                </Badge>
              </div>
              
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
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
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
      </Row>
    </div>
  );
};

export default UsuarioDashboard;
