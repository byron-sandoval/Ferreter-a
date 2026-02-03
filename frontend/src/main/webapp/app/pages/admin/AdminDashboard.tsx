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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import dayjs from 'dayjs';
import { IDetalleVenta } from 'app/shared/model/detalle-venta.model';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface ICategoryData {
  name: string;
  value: number;
}

export const AdminDashboard = () => {
  const [bajoStock, setBajoStock] = useState<IArticulo[]>([]);
  const [ventasRecientes, setVentasRecientes] = useState<IVenta[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ArticuloService.getAll(), VentaService.getAll(), VentaService.getAllDetalles()])
      .then(([artRes, venRes, detRes]) => {
        const low = artRes.data.filter(a => (a.existencia || 0) <= (a.existenciaMinima || 0));
        setBajoStock(low);
        setVentasRecientes(venRes.data);

        // Procesar datos para la gráfica de pastel (Ventas por Categoría)
        const details: IDetalleVenta[] = detRes.data;
        console.log('DEBUG - Detalles de Venta:', details);
        const groupByCategory = details.reduce((acc: Record<string, number>, det) => {
          const catName = det.articulo?.categoria?.nombre || 'Sin Categoría';
          const monto = det.monto || 0;
          acc[catName] = (acc[catName] || 0) + monto;
          return acc;
        }, {});

        const pieData: ICategoryData[] = Object.keys(groupByCategory).map(name => ({
          name,
          value: groupByCategory[name],
        }));

        setCategoryData(pieData.sort((a, b) => b.value - a.value));
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
        <Col md="4">
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
        <Col md="4">
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
        <Col md="4">
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
                <span> Tendencia de Ventas (Últimos 7 días)</span>
                <Badge color="primary" pill style={{ fontSize: '0.7rem' }}>
                  C$ {ventasRecientes.reduce((acc, v) => acc + (v.total || 0), 0).toLocaleString()}
                </Badge>
              </CardTitle>
              <div style={{ height: '300px', width: '100%' }}>
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
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
              <CardTitle tag="h6" className="text-secondary border-bottom pb-2 mb-3">
                Ventas por Categoría
              </CardTitle>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={130}
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
