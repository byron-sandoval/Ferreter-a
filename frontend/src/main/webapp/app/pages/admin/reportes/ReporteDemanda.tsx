import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Button, Table, Badge, Spinner, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faArrowLeft, faFileExcel, faCalendarDay, faFilter, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import ArticuloService from 'app/services/articulo.service';
import { IDetalleVenta } from 'app/shared/model/detalle-venta.model';
import { IArticulo } from 'app/shared/model/articulo.model';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx-js-style';

export const ReporteDemanda = () => {
  const navigate = useNavigate();
  const [detalles, setDetalles] = useState<IDetalleVenta[]>([]);
  const [detalleDevoluciones, setDetalleDevoluciones] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7_DAYS'); // 'TODAY', '7_DAYS', '15_DAYS', 'MONTH'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, detRes, devRes] = await Promise.all([
        ArticuloService.getAll(0, 5000),
        VentaService.getAllDetalles({ size: 10000, sort: 'id,desc' }),
        DevolucionService.getAllDetalles({ size: 10000, sort: 'id,desc' })
      ]);
      setArticulos(artRes.data);
      setDetalles(detRes.data);
      setDetalleDevoluciones(devRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDetalles = () => {
    let startDate = dayjs().startOf('day');
    const endDate = dayjs().endOf('day');

    if (range === '7_DAYS') startDate = dayjs().subtract(7, 'days').startOf('day');
    if (range === '15_DAYS') startDate = dayjs().subtract(15, 'days').startOf('day');
    if (range === 'MONTH') startDate = dayjs().startOf('month');
    if (range === 'TODAY') startDate = dayjs().startOf('day');

    return detalles.filter(det => {
      if (!det.venta || !det.venta.fecha || det.venta.anulada) return false;
      const fechaVenta = dayjs(det.venta.fecha);
      return fechaVenta.isAfter(startDate) && fechaVenta.isBefore(endDate);
    });
  };

  const getFilteredDevoluciones = () => {
    let startDate = dayjs().startOf('day');
    const endDate = dayjs().endOf('day');

    if (range === '7_DAYS') startDate = dayjs().subtract(7, 'days').startOf('day');
    if (range === '15_DAYS') startDate = dayjs().subtract(15, 'days').startOf('day');
    if (range === 'MONTH') startDate = dayjs().startOf('month');
    if (range === 'TODAY') startDate = dayjs().startOf('day');

    return detalleDevoluciones.filter(det => {
      if (!det.devolucion || !det.devolucion.fecha) return false;
      const fechaDev = dayjs(det.devolucion.fecha);
      return fechaDev.isAfter(startDate) && fechaDev.isBefore(endDate);
    });
  };

  const processedData = () => {
    const filteredDet = getFilteredDetalles();
    const filteredDev = getFilteredDevoluciones();
    const map = new Map<number, { nombre: string; cant: number; codigo: string }>();

    // Inicializar con 0 para todos los artículos que queremos monitorear
    articulos.forEach(art => {
      if (art.activo && art.id !== undefined) {
        map.set(art.id, { nombre: art.nombre || '', cant: 0, codigo: art.codigo || '' });
      }
    });

    // Sumar ventas
    filteredDet.forEach(det => {
      if (det.articulo && det.articulo.id !== undefined) {
        const current = map.get(det.articulo.id);
        if (current) {
          current.cant += (det.cantidad || 0);
        } else if (det.articulo.id) {
            map.set(det.articulo.id, { 
                nombre: det.articulo.nombre || 'Desconocido', 
                cant: det.cantidad || 0, 
                codigo: det.articulo.codigo || '-' 
            });
        }
      }
    });

    // Restar devoluciones
    filteredDev.forEach(det => {
      if (det.articulo && det.articulo.id !== undefined) {
        const current = map.get(det.articulo.id);
        if (current) {
          current.cant -= (det.cantidad || 0);
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.cant - a.cant);
  };

  const data = processedData();
  const topProducts = data.slice(0, 10);
  const bottomProducts = [...data].filter(p => p.cant >= 0).sort((a, b) => a.cant - b.cant).slice(0, 10);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['REPORTE DE DEMANDA DE PRODUCTOS'],
      ['Periodo:', range],
      ['Fecha Generación:', dayjs().format('DD/MM/YYYY')],
      [''],
      ['PRODUCTOS MÁS VENDIDOS'],
      ['Código', 'Producto', 'Cantidad Vendida']
    ];

    topProducts.forEach(p => wsData.push([p.codigo, p.nombre, p.cant.toString()]));
    
    wsData.push(['']);
    wsData.push(['PRODUCTOS MENOS VENDIDOS']);
    wsData.push(['Código', 'Producto', 'Cantidad Vendida']);
    bottomProducts.forEach(p => wsData.push([p.codigo, p.nombre, p.cant.toString()]));

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Anchos de columna
    ws['!cols'] = [{ wch: 15 }, { wch: 45 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Demanda');
    XLSX.writeFile(wb, `Reporte_Demanda_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded">
          <p className="small mb-0 fw-bold">{label}</p>
          <p className="small mb-0 text-primary">Vendidos: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (chartData: any[], title: string, color1: string, color2: string) => (
    <Card className="border-0 shadow-sm mb-4 h-100">
      <CardBody>
        <h6 className="fw-bold text-muted mb-4 uppercase small">{title}</h6>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id={`colorGrad-${title.replace(/ /g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color1} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color2} stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="nombre" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                fontSize={10} 
                stroke="#6c757d"
                height={60}
              />
              <YAxis fontSize={10} stroke="#6c757d" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cant" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#colorGrad-${title.replace(/ /g, '')})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="p-3 animate__animated animate__fadeIn" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button color="link" className="text-decoration-none p-0 text-muted mb-2 d-block" onClick={() => navigate('/admin/reportes')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver a Reportes
          </Button>
          <h4 className="fw-bold text-dark m-0">
            <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
            Reporte de productos con mayor y menor demanda
          </h4>
        </div>
        <div className="d-flex align-items-center gap-3">
            <ButtonGroup size="sm" className="shadow-sm">
                <Button color={range === 'TODAY' ? 'primary' : 'white'} onClick={() => setRange('TODAY')}>Hoy</Button>
                <Button color={range === '7_DAYS' ? 'primary' : 'white'} onClick={() => setRange('7_DAYS')}>Últimos 7 días</Button>
                <Button color={range === '15_DAYS' ? 'primary' : 'white'} onClick={() => setRange('15_DAYS')}>Últimos 15 días</Button>
                <Button color={range === 'MONTH' ? 'primary' : 'white'} onClick={() => setRange('MONTH')}>Este mes</Button>
            </ButtonGroup>
            <Button color="success" size="sm" className="shadow-sm border-0 px-3 fw-bold" onClick={exportToExcel}>
                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> EXPORTAR A EXCEL
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Procesando información de ventas...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md="6">
              {renderChart(topProducts, 'Gráfica de productos más demandados', '#6a11cb', '#2575fc')}
            </Col>
            <Col md="6">
              {renderChart(bottomProducts, 'Gráfica de productos menos demandados', '#ff9a9e', '#fecfef')}
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <Card className="border-0 shadow-sm mb-4">
                <CardBody className="p-0">
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                    <h6 className="fw-bold m-0 small text-uppercase"><FontAwesomeIcon icon={faArrowUp} className="text-success me-2"/>Recuento de productos más vendidos</h6>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                    <Table hover size="sm" className="mb-0 align-middle">
                      <thead className="bg-light sticky-top">
                        <tr className="small text-muted">
                          <th className="px-3 border-0 py-2">Nombre</th>
                          <th className="text-end px-3 border-0 py-2">Cantidad de productos vendidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, idx) => (
                          <tr key={idx} className={idx === 0 ? 'bg-primary bg-opacity-10' : ''}>
                            <td className="px-3 py-2 small fw-bold text-dark">{p.nombre}</td>
                            <td className="px-3 py-2 text-end">
                              <Badge color="soft-primary" className="fw-bold px-3" style={{ backgroundColor: 'rgba(37, 117, 252, 0.1)', color: '#2575fc' }}>
                                {p.cant}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col md="6">
              <Card className="border-0 shadow-sm mb-4">
                <CardBody className="p-0">
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                    <h6 className="fw-bold m-0 small text-uppercase"><FontAwesomeIcon icon={faArrowDown} className="text-danger me-2"/>Recuento de productos menos vendidos</h6>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '400px' }}>
                    <Table hover size="sm" className="mb-0 align-middle">
                      <thead className="bg-light sticky-top">
                        <tr className="small text-muted">
                          <th className="px-3 border-0 py-2">Nombre</th>
                          <th className="text-end px-3 border-0 py-2">Cantidad de productos vendidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bottomProducts.map((p, idx) => (
                          <tr key={idx} className={p.cant === 0 ? 'bg-danger bg-opacity-10' : ''}>
                            <td className="px-3 py-2 small fw-bold text-dark">{p.nombre}</td>
                            <td className="px-3 py-2 text-end">
                              <Badge color="soft-danger" className="fw-bold px-3" style={{ backgroundColor: 'rgba(255, 154, 158, 0.1)', color: '#dc3545' }}>
                                {p.cant}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <style>
        {`
          .card { transition: all 0.3s ease; }
          .card:hover { transform: translateY(-2px); }
          .btn-white { background: white; border: 1px solid #dee2e6; color: #6c757d; }
          .btn-white:hover { background: #f8f9fa; }
          .table-responsive::-webkit-scrollbar { width: 4px; }
          .table-responsive::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
        `}
      </style>
    </div>
  );
};

export default ReporteDemanda;
