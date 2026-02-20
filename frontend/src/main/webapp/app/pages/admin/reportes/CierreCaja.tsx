import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    Table,
    Badge,
    Button,
    Input,
    FormGroup,
    Label,
    Alert,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faMoneyBillWave,
    faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta } from 'app/shared/model/venta.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import dayjs from 'dayjs';

const CierreCaja = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
    const [ventas, setVentas] = useState<IVenta[]>([]);
    const [devoluciones, setDevoluciones] = useState<IDevolucion[]>([]);
    const [montoFisico, setMontoFisico] = useState<string>('');
    const [saldoApertura, setSaldoApertura] = useState<string>('0');

    // Totales desglosados
    const [stats, setStats] = useState({
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0,
        devoluciones: 0,
        totalVentas: 0
    });

    useEffect(() => {
        fetchData();
    }, [fecha]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resVentas = await VentaService.getAll({ size: 1000, sort: 'fecha,desc' });
            const resDevoluciones = await DevolucionService.getAll();

            const fechaSeleccionada = dayjs(fecha).startOf('day');

            // Todas las ventas del día (no anuladas) para el resumen
            const ventasDia = resVentas.data.filter(v =>
                dayjs(v.fecha).isSame(fechaSeleccionada, 'day') && !v.anulada
            );

            // Devoluciones del día
            const devolucionesDia = resDevoluciones.data.filter(d => {
                const fechaDev = dayjs(d.fecha).format('YYYY-MM-DD');
                const fechaSel = dayjs(fecha).format('YYYY-MM-DD');
                return fechaDev === fechaSel;
            });

            setVentas(ventasDia);
            setDevoluciones(devolucionesDia);

            // Cálculos
            const efec = ventasDia.filter(v => v.metodoPago === 'EFECTIVO').reduce((acc, v) => acc + (v.total || 0), 0);
            const tarj = ventasDia.filter(v => v.metodoPago === 'TARJETA').reduce((acc, v) => acc + (v.total || 0), 0);
            const trans = ventasDia.filter(v => v.metodoPago === 'TRANSFERENCIA').reduce((acc, v) => acc + (v.total || 0), 0);
            const dev = devolucionesDia.reduce((acc, d) => acc + (d.total || 0), 0);

            setStats({
                efectivo: efec,
                tarjeta: tarj,
                transferencia: trans,
                devoluciones: dev,
                totalVentas: efec + tarj + trans
            });

        } catch (error) {
            console.error('Error fetching data for Cierre de Caja:', error);
        } finally {
            setLoading(false);
        }
    };

    const efectivoEnCaja = Number(saldoApertura) + stats.efectivo - stats.devoluciones;
    const diferencia = (Number(montoFisico) || 0) - efectivoEnCaja;

    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Título y Encabezado
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('FERRONICA - CIERRE DE CAJA', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Comprobante de Arqueo Diario', pageWidth / 2, 28, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Fecha Reportada: ${dayjs(fecha).format('DD/MM/YYYY')}`, 14, 40);
        doc.text(`Emitido el: ${dayjs().format('DD/MM/YYYY hh:mm A')}`, pageWidth - 14, 40, { align: 'right' });

        // Tabla de Resumen
        autoTable(doc, {
            startY: 45,
            head: [['RESUMEN DE MOVIMIENTOS', 'MONTO (C$)']],
            body: [
                ['Ventas en Efectivo', `C$ ${stats.efectivo.toLocaleString()}`],
                ['Ventas con Tarjeta', `C$ ${stats.tarjeta.toLocaleString()}`],
                ['Ventas por Transferencia', `C$ ${stats.transferencia.toLocaleString()}`],
                [{ content: 'TOTAL VENTAS BRUTAS', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: `C$ ${stats.totalVentas.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
                ['(-) Total Devoluciones', `C$ ${stats.devoluciones.toLocaleString()}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [70, 70, 70], halign: 'center' },
            columnStyles: { 1: { halign: 'right' } }
        });

        // Sección de Conciliación
        const lastY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFillColor(248, 249, 250);
        doc.rect(14, lastY, pageWidth - 28, 35, 'F');
        doc.rect(14, lastY, pageWidth - 28, 35, 'S');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CONCILIACIÓN DE EFECTIVO', pageWidth / 2, lastY + 10, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Fondo Inicial: C$ ${Number(saldoApertura).toLocaleString()}`, 30, lastY + 20);
        doc.text(`+ Ventas Efectivo: C$ ${stats.efectivo.toLocaleString()}`, 30, lastY + 25);
        doc.text(`- Devoluciones: C$ ${stats.devoluciones.toLocaleString()}`, 30, lastY + 30);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL ESPERADO EN CAJA: C$ ${efectivoEnCaja.toLocaleString()}`, pageWidth - 30, lastY + 25, { align: 'right' });

        // Tabla de Detalle de Facturas
        autoTable(doc, {
            startY: lastY + 45,
            head: [['NO. FACTURA', 'HORA', 'VENDEDOR', 'CLIENTE', 'MONTO (C$)']],
            body: ventas.length > 0
                ? ventas.map(v => [
                    `#${v.noFactura}`,
                    dayjs(v.fecha).format('hh:mm A'),
                    v.usuario?.nombre || 'Admin',
                    v.cliente?.nombre || 'General',
                    `C$ ${v.total?.toLocaleString()}`
                ])
                : [['-', '-', '-', 'Sin movimientos', 'C$ 0.00']],
            headStyles: { fillColor: [40, 40, 40] },
            columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
            margin: { top: 40 }
        });

        // Firmas
        const finalY = (doc as any).lastAutoTable.finalY + 40;
        doc.line(30, finalY, 90, finalY);
        doc.text('FIRMA CAJERO', 60, finalY + 5, { align: 'center' });

        doc.line(pageWidth - 90, finalY, pageWidth - 30, finalY);
        doc.text('ADMINISTRACIÓN', pageWidth - 60, finalY + 5, { align: 'center' });

        doc.save(`Cierre_Caja_${dayjs(fecha).format('DD_MM_YYYY')}.pdf`);
    };

    return (
        <div className="bg-light min-vh-100">
            {/* VISTA PARA PANTALLA (INTERACTIVA) */}
            <div className="p-4 animate__animated animate__fadeIn d-print-none">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <Button color="link" className="text-decoration-none p-0 text-muted" onClick={() => navigate('/admin/reportes')}>
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver
                        </Button>
                        <h3 className="text-dark fw-bold m-0 mt-2">Cierre de Caja Diario</h3>
                        <p className="text-muted small mb-0">Gestión y control de efectivo en punto de venta</p>
                    </div>
                    <div className="d-flex gap-3 align-items-end">
                        <FormGroup className="mb-0">
                            <Label className="small fw-bold text-muted text-uppercase mb-1">Fecha de Consulta</Label>
                            <Input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="border-0 shadow-sm px-3 fw-bold text-primary"
                                style={{ borderRadius: '10px' }}
                            />
                        </FormGroup>
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    {/* Bloque 1: Ventas */}
                    <Col md="4">
                        <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                            <CardBody className="p-4">
                                <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">Resumen de Ventas</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Ventas Efectivo</span>
                                    <span className="fw-bold">C$ {stats.efectivo.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Ventas Tarjeta</span>
                                    <span className="fw-bold">C$ {stats.tarjeta.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                    <span className="text-muted">Ventas Transferencia</span>
                                    <span className="fw-bold">C$ {stats.transferencia.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="h6 fw-bold mb-0 text-uppercase">Total Ventas</span>
                                    <span className="h5 fw-bold text-primary mb-0">C$ {stats.totalVentas.toLocaleString()}</span>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Bloque 2: Salidas (Devoluciones) */}
                    <Col md="4">
                        <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                            <CardBody className="p-4">
                                <h6 className="fw-bold text-uppercase text-danger border-bottom pb-2 mb-3">Salidas de Dinero</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Retiros Efectivo</span>
                                    <span className="fw-bold">C$ 0.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 border-bottom pb-2 text-danger">
                                    <span className="">Total Devoluciones</span>
                                    <span className="fw-bold">C$ {stats.devoluciones.toLocaleString()}</span>
                                </div>
                                <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-danger">TOTAL SALIDAS</span>
                                        <span className="h5 fw-bold text-danger mb-0">C$ {stats.devoluciones.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Bloque 3: Cálculo de Efectivo esperado */}
                    <Col md="4">
                        <Card className="shadow-sm border-0 h-100 bg-primary text-white" style={{ borderRadius: '15px' }}>
                            <CardBody className="p-4">
                                <h6 className="fw-bold text-uppercase opacity-75 border-bottom border-white border-opacity-25 pb-2 mb-3 text-white">Efectivo en Caja</h6>
                                <div className="d-flex justify-content-between mb-2 align-items-center">
                                    <span className="opacity-75">Saldo Apertura</span>
                                    <Input
                                        type="number"
                                        bsSize="sm"
                                        value={saldoApertura}
                                        onChange={(e) => setSaldoApertura(e.target.value)}
                                        className="bg-transparent border-0 border-bottom border-white border-opacity-25 text-white text-end fw-bold p-0 shadow-none w-25"
                                    />
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="opacity-75">+ Ventas Efectivo</span>
                                    <span className="fw-bold">C$ {stats.efectivo.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-25 pb-2">
                                    <span className="opacity-75">- Total Devoluciones</span>
                                    <span className="fw-bold">C$ {stats.devoluciones.toLocaleString()}</span>
                                </div>
                                <div className="text-center pt-2">
                                    <div className="small opacity-75 mb-1 text-uppercase">Total que debe haber en caja</div>
                                    <h2 className="fw-bold mb-0">C$ {efectivoEnCaja.toLocaleString()}</h2>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4 mb-4">
                    <Col md="8">
                        {/* Tabla de Detalle */}
                        <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold m-0"><FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />Detalle de Operaciones</h6>
                                    <Badge color="primary" pill>{ventas.length} Facturas</Badge>
                                </div>
                                <div className="table-responsive">
                                    <Table hover size="sm" className="align-middle">
                                        <thead>
                                            <tr className="text-muted small">
                                                <th className="border-0">No. Factura</th>
                                                <th className="border-0 text-center">Hora</th>
                                                <th className="border-0 text-center">Vendedor</th>
                                                <th className="border-0">Cliente</th>
                                                <th className="border-0 text-center">Método</th>
                                                <th className="border-0 text-end">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventas.length > 0 ? (
                                                ventas.map((v) => (
                                                    <tr key={v.id} className="small">
                                                        <td className="fw-bold">#{v.noFactura}</td>
                                                        <td className="text-muted text-center">{dayjs(v.fecha).format('hh:mm A')}</td>
                                                        <td className="text-center">{v.usuario?.nombre || 'Admin'}</td>
                                                        <td>{v.cliente?.nombre || 'General'}</td>
                                                        <td className="text-center">
                                                            <Badge color={v.metodoPago === 'EFECTIVO' ? 'success' : 'info'} pill style={{ fontSize: '0.65rem' }}>
                                                                {v.metodoPago}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end fw-bold">C$ {v.total?.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={6} className="text-center py-5 text-muted">No hay registros para este día.</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md="4">
                        {/* Arqueo Físico */}
                        <Card className="shadow-sm border-0 border-top border-4 border-success" style={{ borderRadius: '15px' }}>
                            <CardBody className="p-4">
                                <h6 className="fw-bold text-success mb-4 text-center text-uppercase">Cuadre de Efectivo</h6>
                                <FormGroup className="mb-4">
                                    <Label className="small fw-bold text-muted mb-2 text-center d-block">MONTO FÍSICO CONTADO</Label>
                                    <div className="position-relative">
                                        <span className="position-absolute h-100 d-flex align-items-center px-4 text-muted border-end" style={{ top: 0, left: 0 }}>C$</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="form-control-lg border-2 ps-5 ms-3 fw-bold text-center"
                                            style={{ fontSize: '2rem', height: '80px', borderRadius: '15px' }}
                                            value={montoFisico}
                                            onChange={(e) => setMontoFisico(e.target.value)}
                                        />
                                    </div>
                                </FormGroup>

                                <div className={`p-4 rounded-3 text-center ${diferencia === 0 ? 'bg-light' : diferencia > 0 ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                                    <div className="small fw-bold text-muted text-uppercase mb-1">Diferencia / Descuadre</div>
                                    <h3 className={`fw-bold mb-0 ${diferencia === 0 ? 'text-dark' : diferencia > 0 ? 'text-success' : 'text-danger'}`}>
                                        {diferencia >= 0 ? '+' : ''} C$ {diferencia.toLocaleString()}
                                    </h3>
                                    <div className="small mt-2 px-2 py-1 rounded-pill d-inline-block fw-bold" style={{ backgroundColor: 'white' }}>
                                        {diferencia === 0 ? '👍 Caja Cuadrada' : diferencia > 0 ? '💰 Sobrante' : '⚠️ Faltante'}
                                    </div>
                                </div>

                                <Button color="danger" block className="fw-bold py-3 mt-4 w-100 shadow-sm" style={{ borderRadius: '12px' }}
                                    disabled={!montoFisico} onClick={exportToPDF}>
                                    <FontAwesomeIcon icon={faFilePdf} className="me-2" /> GENERAR PDF CIERRE
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CierreCaja;
