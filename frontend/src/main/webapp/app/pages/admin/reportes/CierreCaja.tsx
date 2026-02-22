import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
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
    faPrint,
} from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import CierreCajaService from 'app/services/cierre-caja.service';
import { IVenta } from 'app/shared/model/venta.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import dayjs from 'dayjs';

const CierreCaja = () => {
    const navigate = useNavigate();
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
    const [ventas, setVentas] = useState<IVenta[]>([]);
    const [devoluciones, setDevoluciones] = useState<IDevolucion[]>([]);
    const [montoFisico, setMontoFisico] = useState<string>('');
    const [montoSiguienteCaja, setMontoSiguienteCaja] = useState<string>('');
    const [saldoApertura, setSaldoApertura] = useState<string>('0');
    const [observaciones, setObservaciones] = useState<string>('');

    // Totales desglosados
    const [stats, setStats] = useState({
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0,
        devoluciones: 0,
        totalVentas: 0
    });

    useEffect(() => {
        fetchLastClosing();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fecha]);

    const fetchLastClosing = async () => {
        try {
            const res = await CierreCajaService.getLast();
            if (res.data && res.data.montoSiguienteCaja != null) {
                setSaldoApertura(res.data.montoSiguienteCaja.toString());
            }
        } catch (error) {
            // Si no hay cierres anteriores (404), simplemente se deja en 0
            console.warn('Sin cierre anterior registrado.');
        }
    };

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
            const tarj = ventasDia.filter(v => v.metodoPago === 'TARJETA_STRIPE').reduce((acc, v) => acc + (v.total || 0), 0);
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

    const efectivoEnCaja = Number(saldoApertura) + stats.efectivo + stats.tarjeta - stats.devoluciones;
    const diferencia = (Number(montoFisico) || 0) - efectivoEnCaja;
    const montoAEntregar = (Number(montoFisico) || 0) - (Number(montoSiguienteCaja) || 0);

    const handleSaveAndPrint = async () => {
        if (!montoFisico) {
            toast.error('Debe ingresar el monto físico contado');
            return;
        }

        setSaving(true);
        try {
            const nuevoCierre = {
                fecha: dayjs().toISOString(),
                montoApertura: Number(saldoApertura),
                montoVentasEfectivo: stats.efectivo,
                montoVentasTarjeta: stats.tarjeta,
                montoVentasTransferencia: stats.transferencia,
                montoDevoluciones: stats.devoluciones,
                totalVentasBrutas: stats.totalVentas,
                montoEsperado: efectivoEnCaja,
                montoFisico: Number(montoFisico),
                montoSiguienteCaja: Number(montoSiguienteCaja),
                diferencia,
                observaciones
            };

            await CierreCajaService.create(nuevoCierre);
            toast.success('Cierre de caja registrado correctamente');

            // Disparar impresión nativa del navegador
            setTimeout(() => {
                handlePrint();
            }, 500);

        } catch (error) {
            console.error('Error saving cierre de caja:', error);
            toast.error('Error al guardar el cierre de caja');
        } finally {
            setSaving(false);
        }
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
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="opacity-75" title="No suma al efectivo de la gaveta">+ Ventas Tarjeta</span>
                                    <span className="fw-bold text-light">C$ {stats.tarjeta.toLocaleString()}</span>
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
                                                                {v.metodoPago === 'TARJETA_STRIPE' ? 'TARJETA' : v.metodoPago}
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
                            <CardBody className="p-3">
                                <h6 className="fw-bold text-success mb-2 text-center text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>Cuadre de Efectivo</h6>
                                <FormGroup className="mb-2">
                                    <Label className="small fw-bold text-muted mb-1 text-center d-block" style={{ fontSize: '0.72rem' }}>MONTO FÍSICO CONTADO</Label>
                                    <div className="position-relative">
                                        <span className="position-absolute h-100 d-flex align-items-center px-3 text-muted border-end" style={{ top: 0, left: 0, fontSize: '0.82rem' }}>C$</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="border-2 fw-bold text-center"
                                            style={{ fontSize: '1.4rem', height: '52px', borderRadius: '10px', paddingLeft: '50px' }}
                                            value={montoFisico}
                                            onChange={(e) => setMontoFisico(e.target.value)}
                                        />
                                    </div>
                                </FormGroup>

                                {montoFisico !== '' && (
                                    <div className={`p-2 rounded-3 text-center mb-2 ${diferencia === 0 ? 'bg-light' : diferencia > 0 ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                                        <div className="fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.68rem' }}>Diferencia / Descuadre</div>
                                        <div className={`fw-bold ${diferencia === 0 ? 'text-dark' : diferencia > 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '1.3rem' }}>
                                            {diferencia >= 0 ? '+' : ''} C$ {diferencia.toLocaleString()}
                                        </div>
                                        <div className="small mt-1 px-2 py-1 rounded-pill d-inline-block fw-bold" style={{ backgroundColor: 'white', fontSize: '0.72rem' }}>
                                            {diferencia === 0 ? '👍 Caja Cuadrada' : diferencia > 0 ? '💰 Sobrante' : '⚠️ Faltante'}
                                        </div>
                                    </div>
                                )}

                                <Card className="border-0 bg-light p-2 mb-2" style={{ borderRadius: '10px' }}>
                                    <FormGroup className="mb-0">
                                        <Label className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Fondo para Siguiente Caja</Label>
                                        <div className="position-relative">
                                            <span className="position-absolute h-100 d-flex align-items-center ps-3 text-muted" style={{ fontSize: '0.82rem' }}>C$</span>
                                            <Input
                                                type="number"
                                                bsSize="sm"
                                                className="fw-bold border-0 bg-white"
                                                style={{ borderRadius: '8px', paddingLeft: '40px' }}
                                                value={montoSiguienteCaja}
                                                onChange={(e) => setMontoSiguienteCaja(e.target.value)}
                                            />
                                        </div>
                                    </FormGroup>
                                </Card>

                                <div className="p-2 border-top border-bottom mb-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Monto a Entregar</span>
                                        <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>C$ {montoAEntregar.toLocaleString()}</span>
                                    </div>
                                </div>

                                <FormGroup className="mb-2">
                                    <Label className="small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>OBSERVACIONES</Label>
                                    <Input
                                        type="textarea"
                                        placeholder="Comentarios sobre el arqueo..."
                                        rows={2}
                                        bsSize="sm"
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '0.82rem' }}
                                    />
                                </FormGroup>

                                <Button color="success" block size="sm" className="fw-bold mt-1 shadow-sm" style={{ borderRadius: '8px' }}
                                    disabled={!montoFisico || saving} onClick={handleSaveAndPrint}>
                                    <FontAwesomeIcon icon={saving ? faMoneyBillWave : faPrint} spin={saving} className="me-2" />
                                    {saving ? 'GUARDANDO...' : 'IMPRIMIR Y REGISTRAR CIERRE'}
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* SECCIÓN OCULTA PARA IMPRESIÓN */}
            <div style={{ display: 'none' }}>
                <div
                    ref={componentRef}
                    style={{
                        padding: '40px',
                        fontFamily: 'Arial, sans-serif',
                        width: '800px',
                        backgroundColor: 'white',
                        color: 'black'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                        <h2 style={{ margin: 0, fontWeight: 'bold' }}>FERRONICA</h2>
                        <h4 style={{ margin: '5px 0', textTransform: 'uppercase' }}>Comprobante de Arqueo Diario</h4>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'black', marginTop: '10px' }}>Emitido: {dayjs().format('DD/MM/YYYY hh:mm A')}</div>
                    </div>


                    {/* CONCILIACIÓN DE EFECTIVO - Formato estado de cuenta */}
                    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '30px', fontFamily: 'monospace', fontSize: '13px' }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', letterSpacing: '1px' }}>CONCILIACIÓN DE EFECTIVO</div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Fondo Inicial:</span>
                            <span>C$ {Number(saldoApertura).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>+ Ventas en Efectivo:</span>
                            <span>C$ {stats.efectivo.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>+ Ventas con Tarjeta:</span>
                            <span>C$ {stats.tarjeta.toLocaleString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'red' }}>
                            <span>- Devoluciones:</span>
                            <span>C$ {stats.devoluciones.toLocaleString()}</span>
                        </div>

                        <div style={{ borderTop: '1px solid black', marginTop: '8px', marginBottom: '8px' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                            <span>Total Esperado en Caja:</span>
                            <span>C$ {efectivoEnCaja.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Saldo Contabilizado (físico):</span>
                            <span style={{ fontWeight: 'bold' }}>C$ {Number(montoFisico).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: diferencia >= 0 ? 'green' : 'red' }}>
                            <span>Diferencia ({diferencia >= 0 ? 'Sobrante' : 'Faltante'}):</span>
                            <span style={{ fontWeight: 'bold' }}>C$ {diferencia.toLocaleString()}</span>
                        </div>

                        <div style={{ borderTop: '1px dashed black', marginTop: '8px', marginBottom: '8px' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Fondo para Siguiente Caja:</span>
                            <span style={{ fontWeight: 'bold' }}>C$ {Number(montoSiguienteCaja).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                            <span>Monto a Entregar:</span>
                            <span>C$ {montoAEntregar.toLocaleString()}</span>
                        </div>
                    </div>

                    {observaciones && (
                        <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '10px' }}>
                            <strong>Observaciones:</strong> {observaciones}
                        </div>
                    )}
                    <h5 style={{ fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '5px', marginTop: '30px' }}>Resumen de Ventas por Vendedor</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '30px', pageBreakInside: 'avoid' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <td style={{ border: '1px solid black', padding: '10px', fontWeight: 'bold', textAlign: 'left' }}>Vendedor</td>
                                <td style={{ border: '1px solid black', padding: '10px', fontWeight: 'bold', textAlign: 'right' }}>Monto Total Vendido</td>
                            </tr>
                            {Object.entries(
                                ventas.reduce((acc: any, v) => {
                                    const nombre = v.usuario?.nombre || 'Admin';
                                    acc[nombre] = (acc[nombre] || 0) + (v.total || 0);
                                    return acc;
                                }, {})
                            ).map(([vendedor, total]: [string, any]) => (
                                <tr key={vendedor}>
                                    <td style={{ border: '1px solid black', padding: '10px' }}>{vendedor}</td>
                                    <td style={{ border: '1px solid black', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>C$ {total.toLocaleString()}</td>
                                </tr>
                            ))}
                            {ventas.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ border: '1px solid black', padding: '20px', textAlign: 'center' }}>
                                        Sin movimientos de venta en la fecha seleccionada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CierreCaja;
