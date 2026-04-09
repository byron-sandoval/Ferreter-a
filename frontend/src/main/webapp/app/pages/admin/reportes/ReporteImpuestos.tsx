import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { Row, Col, Card, CardBody, Table, Badge, Button, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFileInvoice,
  faPrint,
  faLandmark,
  faCalendarAlt,
  faReceipt,
  faPercentage,
  faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import EmpresaService from 'app/services/empresa.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta } from 'app/shared/model/venta.model';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import * as XLSX from 'xlsx-js-style';

export const ReporteImpuestos = () => {
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [loading, setLoading] = useState(false);
  // Default to current month YYYY-MM
  const [mes, setMes] = useState(dayjs().format('YYYY-MM'));
  const [ventas, setVentas] = useState<IVenta[]>([]);
  const [porcentajeIva, setPorcentajeIva] = useState(15);

  const [stats, setStats] = useState({
    ventasTotales: 0,
    baseImponible: 0,
    ivaRetenido: 0,
    devolucionesIva: 0,
    ivaNeto: 0
  });

  useEffect(() => {
    fetchData();
  }, [mes]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener el IVA configurado en la empresa actual
      const resEmpresa = await EmpresaService.getAll();
      const iva = (resEmpresa.data && resEmpresa.data.length > 0) ? (resEmpresa.data[0].porcentajeIva ?? 15) : 15;
      setPorcentajeIva(iva);

      // Traer data
      const resVentas = await VentaService.getAll({ size: 2000, sort: 'fecha,desc' });
      const resDevoluciones = await DevolucionService.getAll();

      const selectedMonth = dayjs(mes).startOf('month');

      // Filtrar ventas del mes que NO estén anuladas
      const monthSales = resVentas.data.filter(v =>
        dayjs(v.fecha).isSame(selectedMonth, 'month') && !v.anulada
      );

      // Agrupar devoluciones del mes
      const monthDevs = resDevoluciones.data.filter(d =>
        dayjs(d.fecha).isSame(selectedMonth, 'month')
      );

      setVentas(monthSales);

      // Calcular montos
      const ventasBrutas = monthSales.reduce((acc, v) => acc + (v.total || 0), 0);
      const devolucionesTotales = monthDevs.reduce((acc, d) => acc + (d.total || 0), 0);
      
      const ventasNetas = ventasBrutas - devolucionesTotales;

      // Desglose de Base Imponible vs IVA ( VentaNeta = Base * (1 + iva/100) )
      // Base = VentaNeta / (1 + iva/100)
      const factor = 1 + (iva / 100);
      const baseImponible = ventasNetas / factor;
      const ivaRetenido = ventasNetas - baseImponible;

      setStats({
        ventasTotales: ventasNetas,
        baseImponible,
        ivaRetenido,
        devolucionesIva: devolucionesTotales - (devolucionesTotales / factor),
        ivaNeto: ivaRetenido
      });

    } catch (error) {
      console.error('Error fetching taxes report:', error);
      toast.error('Error al cargar datos de impuestos');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para la hoja
    const wsData = [
      ['DECLARACIÓN DE IMPUESTOS (IVA)'],
      ['Empresa:', 'Ferretería FERRONICA'],
      ['Fecha Generación:', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['RESUMEN FISCAL'],
      ['Indicador', 'Monto'],
      ['Ventas Totales (Bruto)', stats.ventasTotales.toFixed(2)],
      ['Base Imponible', stats.baseImponible.toFixed(2)],
      [`IVA (${porcentajeIva}%)`, stats.ivaRetenido.toFixed(2)],
      [''],
      ['DETALLE DE FACTURACIÓN'],
      ['No. Factura', 'Fecha', 'Base Imponible', 'IVA', 'Total']
    ];

    ventas.forEach(v => {
      const totalV = v.total || 0;
      const baseI = totalV / (1 + (porcentajeIva / 100));
      const ivaC = totalV - baseI;
      wsData.push([
        v.noFactura ? v.noFactura.toString() : '',
        v.fecha ? dayjs(v.fecha).format('DD/MM/YYYY') : '',
        baseI.toFixed(2),
        ivaC.toFixed(2),
        totalV.toFixed(2)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Estilos básicos
    ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Liquidación IVA');
    XLSX.writeFile(wb, `Reporte_IVA_${mes}.xlsx`);
  };

  return (
    <div className="bg-white min-vh-100 p-3 p-md-4">
      {/* VISTA INTERACTIVA */}
      <div className="d-print-none">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <Button color="link" className="text-decoration-none p-0 text-muted mb-2" onClick={() => navigate('/admin/reportes')}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Atrás
            </Button>
            <h3 className="fw-bold text-dark m-0 d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                <FontAwesomeIcon icon={faFileInvoice} className="text-danger fs-4" />
              </div>
              Declaración de Impuestos (IVA)
            </h3>
          </div>

          <div className="d-flex gap-2 align-items-center bg-light p-2 rounded-4 shadow-sm">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-muted ms-2" />
            <Input
              type="month"
              value={mes}
              onChange={e => setMes(e.target.value)}
              className="border-0 bg-transparent fw-bold text-primary shadow-none"
              style={{ width: '160px' }}
            />
            <Button color="success" className="rounded-3 shadow-sm px-3 ms-2 text-white border-0 fw-bold" onClick={exportToExcel}>
              <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Excel
            </Button>
            <Button color="primary" className="rounded-3 shadow-sm px-3 ms-2" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} className="me-2" /> Imprimir
            </Button>
          </div>
        </div>

        <Row className="g-4 mb-4">
          {/* Gráfico de Dona para Desglose Completo */}
          <Col md="12">
            <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
              <CardBody className="d-flex flex-column align-items-center justify-content-center w-100">
                <h4 className="fw-bold text-dark text-center mb-0 mt-2">
                  Proporción de Impuestos ({porcentajeIva}%)
                </h4>
                <p className="text-muted small text-center mb-4">Base imponible vs Retención fiscal. Al centro se lee el total bruto.</p>
                
                <div style={{ width: '100%', height: '280px' }} className="d-flex align-items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Base Imponible', value: stats.baseImponible },
                          { name: `IVA (${porcentajeIva}%)`, value: stats.ivaRetenido }
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        label={({ name, value }) => `${name} (C$ ${value.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                        labelLine={true}
                      >
                        <Label
                          value={`C$ ${stats.ventasTotales.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          position="center"
                          fill="#1e3c72"
                          style={{ fontSize: '20px', fontWeight: '900' }}
                        />
                        <Cell fill="#6c757d" /> {/* Base Imponible - Gris */}
                        <Cell fill="#dc3545" /> {/* IVA - Rojo */}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => `C$ ${value.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle" 
                        wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Tabla de comprobación */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <CardBody className="p-0">
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0 text-dark"><FontAwesomeIcon icon={faFileInvoice} className="me-2 text-muted" /> Transacciones del mes</h5>
              <div className="small fw-bold text-muted text-uppercase">{ventas.length} Facturas procesadas</div>
            </div>
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4 border-0">Factura</th>
                    <th className="py-3 border-0 text-center">Fecha</th>
                    <th className="py-3 border-0 text-end">Base Imponible</th>
                    <th className="py-3 border-0 text-end">IVA ({porcentajeIva}%)</th>
                    <th className="py-3 border-0 text-end px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">No hay facturas registradas en este mes.</td>
                    </tr>
                  ) : (
                    ventas.map(v => {
                      const totalN = v.total || 0;
                      const baseI = totalN / (1 + (porcentajeIva / 100));
                      const ivaC = totalN - baseI;
                      return (
                        <tr key={v.id} className="border-bottom-light">
                          <td className="px-4 fw-bold text-dark">#{v.noFactura}</td>
                          <td className="text-center text-muted small">{dayjs(v.fecha).format('DD/MM/YYYY')}</td>
                          <td className="text-end text-muted">C$ {baseI.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-end text-danger fw-semibold">C$ {ivaC.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-end fw-bold px-4 text-primary">C$ {totalN.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* SECCIÓN DE IMPRESIÓN (PARA EL CONTADOR) */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef} style={{ padding: '40px', color: '#000', backgroundColor: '#fff', width: '210mm' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontWeight: '900', color: '#1a1a1a', margin: '0 0 10px 0' }}>DECLARACIÓN DE IVA MENSUAL</h1>
            <div style={{ width: '100px', height: '4px', backgroundColor: '#333', margin: '0 auto 10px auto' }}></div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold' }}>Ferretería FERRONICA</p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>PERIODO FISCAL: {dayjs(mes).format('MMMM YYYY').toUpperCase()}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ border: '1px solid #333', padding: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Resumen de Operaciones</h4>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0' }}>Facturas Emitidas:</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{ventas.length}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}>Tasa IVA Aplicada:</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{porcentajeIva}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}>Total Ingresos (Bruto):</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>C$ {stats.ventasTotales.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ border: '2px solid #1a1a1a', padding: '20px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #1a1a1a', paddingBottom: '10px', textAlign: 'center' }}>LIQUIDACIÓN DE IMPUESTOS</h4>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 0' }}>Base Imponible Total:</td>
                    <td style={{ textAlign: 'right' }}>C$ {stats.baseImponible.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #ccc' }}>
                    <td style={{ padding: '15px 0', fontWeight: 'bold', fontSize: '16px' }}>IVA A DECLARAR:</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>C$ {stats.ivaRetenido.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '150px', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>PREPARADO POR</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Administración</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>REVISADO POR</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Contador General</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteImpuestos;
