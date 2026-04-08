import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, CardBody, Table, Badge, Button, Input, FormGroup, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faMoneyBillWave,
  faPrint,
  faCreditCard,
  faCashRegister,
  faCalendarDay,
  faHistory,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta } from 'app/shared/model/venta.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import dayjs from 'dayjs';

export const ResumenIngresos = () => {
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [ventas, setVentas] = useState<IVenta[]>([]);
  const [devoluciones, setDevoluciones] = useState<IDevolucion[]>([]);

  const [stats, setStats] = useState({
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    totalBruto: 0,
    totalDevoluciones: 0,
    totalNeto: 0,
  });

  useEffect(() => {
    fetchData();
  }, [fecha]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resVentas = await VentaService.getAll({ size: 1000, sort: 'fecha,desc' });
      const resDevoluciones = await DevolucionService.getAll();

      const selectedDate = dayjs(fecha).startOf('day');

      const daySales = resVentas.data.filter(v =>
        dayjs(v.fecha).isSame(selectedDate, 'day') && !v.anulada
      );

      const dayDevs = resDevoluciones.data.filter(d =>
        dayjs(d.fecha).isSame(selectedDate, 'day')
      );

      setVentas(daySales);
      setDevoluciones(dayDevs);

      const efectivo = daySales.filter(v => v.metodoPago === 'EFECTIVO').reduce((acc, v) => acc + (v.total || 0), 0);
      const tarjeta = daySales.filter(v => v.metodoPago === 'TARJETA_STRIPE').reduce((acc, v) => acc + (v.total || 0), 0);
      const transferencia = daySales.filter(v => v.metodoPago === 'TRANSFERENCIA').reduce((acc, v) => acc + (v.total || 0), 0);
      const totalDevs = dayDevs.reduce((acc, d) => acc + (d.total || 0), 0);

      const bruto = efectivo + tarjeta + transferencia;

      setStats({
        efectivo,
        tarjeta,
        transferencia,
        totalBruto: bruto,
        totalDevoluciones: totalDevs,
        totalNeto: bruto - totalDevs
      });

    } catch (error) {
      console.error('Error fetching incomes report:', error);
      toast.error('Error al cargar datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-vh-100 p-3 p-md-4">
      {/* VISTA INTERACTIVA */}
      <div className="d-print-none">
        {/* Header Compacto */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <Button color="link" className="text-decoration-none p-0 text-muted mb-2" onClick={() => navigate('/admin/reportes')}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Atrás
            </Button>
            <h2 className="fw-bold text-dark m-0 d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                <FontAwesomeIcon icon={faChartPie} className="text-info fs-4" />
              </div>
              Resumen de Ingresos
            </h2>
            <p className="text-muted small m-0 mt-1">Análisis detallado de ventas por medio de pago</p>
          </div>

          <div className="d-flex gap-2 align-items-center bg-light p-2 rounded-4 shadow-sm">
            <FontAwesomeIcon icon={faCalendarDay} className="text-muted ms-2" />
            <Input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="border-0 bg-transparent fw-bold text-primary shadow-none"
              style={{ width: '160px' }}
            />
            <Button color="primary" className="rounded-3 shadow-sm px-3 ms-2" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} className="me-2" /> Imprimir
            </Button>
          </div>
        </div>

        {/* KPIs Principales */}
        <Row className="g-4 mb-4">
          <Col md="3">
            <Card className="border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #6610f2 0%, #6f42c1 100%)', color: 'white' }}>
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="bg-white bg-opacity-25 p-2 rounded-3">
                    <FontAwesomeIcon icon={faHistory} className="text-white fs-6" />
                  </div>
                  <Badge color="light" pill className="px-2 text-primary" style={{ fontSize: '0.65rem' }}>BRUTO DEL DÍA</Badge>
                </div>
                <h4 className="fw-bold text-white mb-0">C$ {stats.totalBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</h4>
                <small className="text-white opacity-75 fw-semibold" style={{ fontSize: '0.75rem' }}>Ventas totales</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-success text-white">
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="bg-white bg-opacity-25 p-2 rounded-3">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-white fs-6" />
                  </div>
                  <Badge color="light" pill className="px-2 text-success" style={{ fontSize: '0.65rem' }}>EFECTIVO</Badge>
                </div>
                <h4 className="fw-bold text-white mb-0">
                  C$ {stats.efectivo.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </h4>
                <div className="mt-1 d-flex align-items-center">
                  <Badge color="white" className="bg-white text-success px-2 py-1 shadow-sm me-2" style={{fontSize: '0.7rem'}}>
                    {stats.totalBruto > 0 ? ((stats.efectivo / stats.totalBruto) * 100).toFixed(1) : 0}%
                  </Badge>
                  <small className="text-white opacity-75 fw-semibold" style={{ fontSize: '0.75rem' }}>Participación</small>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: '#2d3748', color: 'white' }}>
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="bg-white bg-opacity-25 p-2 rounded-3">
                    <FontAwesomeIcon icon={faCreditCard} className="text-white fs-6" />
                  </div>
                  <Badge color="light" pill className="px-2 text-dark" style={{ fontSize: '0.65rem' }}>TARJETA</Badge>
                </div>
                <h4 className="fw-bold text-white mb-0">
                  C$ {stats.tarjeta.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </h4>
                <div className="mt-1 d-flex align-items-center">
                  <Badge color="white" className="bg-white text-dark px-2 py-1 shadow-sm me-2" style={{fontSize: '0.7rem'}}>
                    {stats.totalBruto > 0 ? ((stats.tarjeta / stats.totalBruto) * 100).toFixed(1) : 0}%
                  </Badge>
                  <small className="text-white opacity-75 fw-semibold" style={{ fontSize: '0.75rem' }}>Participación</small>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-danger text-white">
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="bg-white bg-opacity-25 p-2 rounded-3">
                    <FontAwesomeIcon icon={faHistory} className="text-white fs-6" style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                  <Badge color="light" pill className="px-2 text-danger" style={{ fontSize: '0.65rem' }}>DEVOLUCIONES</Badge>
                </div>
                <h4 className="fw-bold text-white mb-0">
                  C$ {stats.totalDevoluciones.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </h4>
                <small className="text-white opacity-75 fw-semibold" style={{ fontSize: '0.75rem' }}>Salidas de hoy</small>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Tabla de Detalle Modernizada */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <CardBody className="p-0">
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0"><FontAwesomeIcon icon={faCashRegister} className="me-2 text-muted" /> Detalle de pagos</h5>
              <div className="small fw-bold text-muted text-uppercase letter-spacing-1">{ventas.length} Transacciones</div>
            </div>
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase fw-bold">
                  <tr>
                    <th className="py-3 px-4 border-0">Factura</th>
                    <th className="py-3 border-0 text-center">Hora</th>
                    <th className="py-3 border-0">Cliente</th>
                    <th className="py-3 border-0 text-center">Medio de Pago</th>
                    <th className="py-3 border-0 text-end px-4">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">No se registraron cobros en esta fecha.</td>
                    </tr>
                  ) : (
                    ventas.map(v => (
                      <tr key={v.id} className="border-bottom-light">
                        <td className="px-4 fw-bold text-dark">#{v.noFactura}</td>
                        <td className="text-center text-muted small">{dayjs(v.fecha).format('hh:mm A')}</td>
                        <td>{v.cliente?.nombre || 'Consumidor Final'}</td>
                        <td className="text-center">
                          {v.metodoPago === 'EFECTIVO' ? (
                            <Badge color="success" pill className="bg-opacity-10 text-success border border-success border-opacity-25 px-3">EFECTIVO</Badge>
                          ) : (
                            <Badge color="primary" pill className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3">TARJETA</Badge>
                          )}
                        </td>
                        <td className="text-end fw-bold px-4">C$ {v.total?.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {ventas.length > 0 && (
                  <tfoot className="bg-light fw-bold">
                    <tr>
                      <td colSpan={4} className="text-end py-3 px-4 h6 mb-0 text-muted">BALANCE FINAL (NETO):</td>
                      <td className="text-end py-3 px-4 h5 mb-0 text-primary">C$ {stats.totalNeto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* SECCIÓN PARA IMPRESIÓN (DISEÑO LIMPIO) */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} style={{ padding: '40px', color: '#000', backgroundColor: '#fff', width: '210mm' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontWeight: '900', color: '#1a1a1a', margin: '0 0 10px 0' }}>RESUMEN DE INGRESOS</h1>
            <div style={{ width: '100px', height: '4px', backgroundColor: '#333', margin: '0 auto 10px auto' }}></div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px' }}>Ferretería FERRONICA</p>
            <p style={{ margin: '5px 0', fontSize: '12px', fontWeight: 'bold' }}>FECHA DEL REPORTE: {dayjs(fecha).format('DD/MM/YYYY')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>VENTAS EFECTIVO</p>
              <h3 style={{ margin: 0, fontWeight: 'bold' }}>C$ {stats.efectivo.toLocaleString()}</h3>
            </div>
            <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>PAGOS CON TARJETA</p>
              <h3 style={{ margin: 0, fontWeight: 'bold' }}>C$ {stats.tarjeta.toLocaleString()}</h3>
            </div>
            <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Total del día</p>
              <h3 style={{ margin: 0, fontWeight: 'bold', color: '#2b35af' }}>C$ {stats.totalBruto.toLocaleString()}</h3>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', fontSize: '12px', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>FACTURA</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #333' }}>MEDIO DE PAGO</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>IMPORTE</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px' }}>
              {stats.efectivo > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>TOTAL ACUMULADO</td>
                  <td style={{ padding: '12px' }}>EFECTIVO</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>C$ {stats.efectivo.toLocaleString()}</td>
                </tr>
              )}
              {stats.tarjeta > 0 && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>TOTAL ACUMULADO</td>
                  <td style={{ padding: '12px' }}>TARJETA</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>C$ {stats.tarjeta.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <div style={{ minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px' }}>Total Bruto:</span>
                <span style={{ fontWeight: 'bold' }}>C$ {stats.totalBruto.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #333' }}>
                <span style={{ fontSize: '14px' }}>Devoluciones:</span>
                <span style={{ fontWeight: 'bold', color: '#dc3545' }}>- C$ {stats.totalDevoluciones.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Total del día:</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b35af' }}>C$ {stats.totalNeto.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>FIRMA RESPONSABLE</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Fecha Impresión: {dayjs().format('DD/MM/YYYY hh:mm A')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenIngresos;
