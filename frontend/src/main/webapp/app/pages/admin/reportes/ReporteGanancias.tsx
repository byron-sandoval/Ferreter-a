import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Table, Badge, Button, Input, FormGroup, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faArrowLeft, faDownload, faCalendarAlt, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import VentaService from 'app/services/venta.service';
import ArticuloService from 'app/services/articulo.service';
import DevolucionService from 'app/services/devolucion.service';
import DetalleDevolucionService from 'app/services/detalle-devolucion.service';
import { IDetalleVenta } from 'app/shared/model/detalle-venta.model';
import { IArticulo } from 'app/shared/model/articulo.model';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx-js-style';

export const ReporteGanancias = () => {
    const navigate = useNavigate();
    const [detalles, setDetalles] = useState<IDetalleVenta[]>([]);
    const [articulos, setArticulos] = useState<IArticulo[]>([]);
    const [devoluciones, setDevoluciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
    const [filterRange, setFilterRange] = useState({
        start: dayjs().startOf('month').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
    });

    useEffect(() => {
        fetchData();
    }, []);

    const handleFiltrar = () => {
        setFilterRange({ start: fechaInicio, end: fechaFin });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const artRes = await ArticuloService.getAll(0, 2000);
            const detRes = await VentaService.getAllDetalles({ size: 5000, sort: 'id,desc' });
            const devRes = await DetalleDevolucionService.getAll({ size: 2000, sort: 'id,desc' });
            setArticulos(artRes.data);
            setDetalles(detRes.data);
            setDevoluciones(devRes.data);
            console.warn('Ventas cargadas:', detRes.data.length);
            console.warn('Devoluciones cargadas:', devRes.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDetalles = detalles.filter(det => {
        if (!det.venta || !det.venta.fecha) {
            return false;
        }
        const fechaVenta = dayjs(det.venta.fecha);
        const isAnulada = det.venta.anulada === true;
        const isWithinRange =
            fechaVenta.isAfter(dayjs(filterRange.start).startOf('day').subtract(1, 'ms')) &&
            fechaVenta.isBefore(dayjs(filterRange.end).endOf('day').add(1, 'ms'));

        return !isAnulada && isWithinRange;
    });

    const filteredDevoluciones = devoluciones.filter(dev => {
        if (!dev.devolucion || !dev.devolucion.fecha) return false;
        const fechaDev = dayjs(dev.devolucion.fecha);
        const isWithinRange =
            fechaDev.isAfter(dayjs(filterRange.start).startOf('day').subtract(1, 'ms')) &&
            fechaDev.isBefore(dayjs(filterRange.end).endOf('day').add(1, 'ms'));
        return isWithinRange;
    });

    if (filteredDevoluciones.length > 0) {
        console.warn('Devoluciones encontradas:', filteredDevoluciones);
    }

    const processedData = filteredDetalles.map(det => {
        const articulo = articulos.find(a => a.id === det.articulo?.id);
        const costoUnitario = articulo?.costo || 0;
        const costoTotal = costoUnitario * (det.cantidad || 0);
        const montoVenta = det.monto || 0;
        const utilidad = montoVenta - costoTotal;
        const margen = montoVenta > 0 ? (utilidad / montoVenta) * 100 : 0;

        return {
            ...det,
            costoUnitario,
            costoTotal,
            utilidad,
            margen,
        };
    });

    const totalVendido = processedData.reduce((acc, d) => acc + (d.monto || 0), 0);
    const totalCosto = processedData.reduce((acc, d) => acc + d.costoTotal, 0);

    // Descontar Devoluciones (Solo el monto NETO para que coincida con el cálculo de ventas sin IVA)
    const totalDevueltoMonto = filteredDevoluciones.reduce((acc, d) => acc + (d.cantidad || 0) * (d.precioUnitario || 0), 0);
    const totalDevueltoCosto = filteredDevoluciones.reduce((acc, d) => {
        const articulo = articulos.find(a => a.id === d.articulo?.id);
        return acc + (articulo?.costo || 0) * (d.cantidad || 0);
    }, 0);

    const ventasNetas = totalVendido - totalDevueltoMonto;
    const costoNeto = totalCosto - totalDevueltoCosto;
    const totalUtilidad = ventasNetas - costoNeto;
    const margenPromedio = ventasNetas > 0 ? (totalUtilidad / ventasNetas) * 100 : 0;

    // Data for chart: Profit by category
    const profitByCategory = processedData.reduce((acc, d) => {
        const cat = d.articulo?.categoria?.nombre || 'General';
        acc[cat] = (acc[cat] || 0) + d.utilidad;
        return acc;
    }, {});

    const chartData = Object.keys(profitByCategory)
        .map(name => ({
            name,
            utilidad: profitByCategory[name],
        }))
        .sort((a, b) => b.utilidad - a.utilidad);

    const rankingArticulos = (() => {
        const accArt = processedData.reduce((acc, d) => {
            const id = d.articulo?.id;
            const existing = acc.find(item => item.id === id);
            const ventaMonto = d.monto || 0;
            if (existing) {
                existing.cant += d.cantidad || 0;
                existing.ganancia += d.utilidad;
                existing.ventaTotal += ventaMonto;
            } else {
                acc.push({
                    id,
                    nombre: d.articulo?.nombre,
                    codigo: d.articulo?.codigo,
                    cant: d.cantidad || 0,
                    ganancia: d.utilidad,
                    ventaTotal: ventaMonto,
                });
            }
            return acc;
        }, [] as any[]);

        // Restar devoluciones de la tabla de rentabilidad (Usando montos netos)
        filteredDevoluciones.forEach(dev => {
            const articulo = articulos.find(a => a.id === dev.articulo?.id);
            const montoNetoDev = (dev.cantidad || 0) * (dev.precioUnitario || 0);
            const costoTotalDev = (articulo?.costo || 0) * (dev.cantidad || 0);
            const utilidadPerdida = montoNetoDev - costoTotalDev;

            const item = accArt.find(a => a.id === dev.articulo?.id);
            if (item) {
                item.ganancia -= utilidadPerdida;
                item.ventaTotal -= montoNetoDev;
                item.cant -= dev.cantidad || 0;
            }
        });

        return accArt.sort((a, b) => b.ganancia - a.ganancia);
    })();

    const exportToExcel = () => {
        // 1. Preparar encabezados y metadatos
        const wb = XLSX.utils.book_new();

        // Hoja de Resumen
        const resumenData = [
            ['REPORTE DE GANANCIAS'],
            ['FECHA INICIO', filterRange.start],
            ['FECHA FIN', filterRange.end],
            [''],
            ['INDICADORES GENERALES'],
            ['Utilidad Real', Number(totalUtilidad || 0)],
            ['Margen Promedio', `${(margenPromedio || 0).toFixed(2)}%`],
            [''],
            ['DETALLE DE RENTABILIDAD POR ARTÍCULO']
        ];

        // 2. Preparar tabla de artículos
        const tablaArticulos = rankingArticulos.map(item => ({
            'Código': item.codigo,
            'Artículo': item.nombre,
            'Vendidos (Neto)': item.cant,
            'Venta Total (C$)': item.ventaTotal,
            'Utilidad (C$)': item.ganancia,
            'Margen (%)': item.ventaTotal > 0 ? ((item.ganancia / item.ventaTotal) * 100).toFixed(2) : '0.00'
        }));

        const ws = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.sheet_add_json(ws, tablaArticulos, { origin: 'A12' });

        // Estilos
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4B0082" } }, // Indigo/Purple
            alignment: { horizontal: "center" }
        };

        // Aplicar estilos a encabezados de tabla
        const tableHeaderRow = 12;
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
            if (ws[col + tableHeaderRow]) {
                ws[col + tableHeaderRow].s = headerStyle;
            }
        });

        // Configurar anchos de columna
        ws['!cols'] = [
            { wch: 15 }, // Código
            { wch: 40 }, // Artículo
            { wch: 15 }, // Vendidos
            { wch: 18 }, // Venta Total
            { wch: 18 }, // Utilidad
            { wch: 12 }  // Margen
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Ganancias');

        const fileName = `Reporte_Ganancias_${filterRange.start}_a_${filterRange.end}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="p-3 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button color="link" className="text-decoration-none p-0" onClick={() => navigate('/admin/reportes')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver a Reportes
                </Button>
                <h4 className="text-primary fw-bold m-0">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> Reporte de Ganancias
                </h4>
                <Button color="success" size="sm" className="shadow-sm" onClick={exportToExcel}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" /> Exportar Excel
                </Button>
            </div>

            <Card className="shadow-sm border-0 mb-4 bg-white">
                <CardBody className="py-3">
                    <Row className="align-items-end g-3 justify-content-center">
                        <Col md="3">
                            <FormGroup className="mb-0">
                                <Label className="small fw-bold text-muted mb-1 x-small text-uppercase">Fecha Inicio</Label>
                                <Input
                                    type="date"
                                    bsSize="sm"
                                    value={fechaInicio}
                                    onChange={e => setFechaInicio(e.target.value)}
                                    className="border-0 bg-light shadow-none"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="3">
                            <FormGroup className="mb-0">
                                <Label className="small fw-bold text-muted mb-1 x-small text-uppercase">Fecha Fin</Label>
                                <Input
                                    type="date"
                                    bsSize="sm"
                                    value={fechaFin}
                                    onChange={e => setFechaFin(e.target.value)}
                                    className="border-0 bg-light shadow-none"
                                />
                            </FormGroup>
                        </Col>
                        <Col md="auto">
                            <Button
                                color="primary"
                                size="sm"
                                className="px-4 shadow-sm fw-bold border-0"
                                onClick={handleFiltrar}
                                style={{ height: '31px' }}
                            >
                                <FontAwesomeIcon icon={faFilter} className="me-2 text-white-50" /> FILTRAR
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {filteredDetalles.length === 0 && !loading && (
                <Card className="border-0 shadow-sm mb-4 bg-light">
                    <CardBody className="text-center py-5 text-muted">
                        <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="mb-3 opacity-25" />
                        <p className="mb-0">No se encontraron ventas en el rango seleccionado.</p>
                        <small>Asegúrate de que las ventas no estén anuladas y que la fecha esté correcta.</small>
                    </CardBody>
                </Card>
            )}

            <Row className="mb-4 g-3">
                <Col md="6">
                    <Card className="border-0 shadow-sm bg-success text-white">
                        <CardBody className="py-4 d-flex align-items-center">
                            <div className="me-3 bg-white bg-opacity-25 p-3 rounded-circle">
                                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
                            </div>
                            <div>
                                <div className="small opacity-75 text-uppercase fw-bold">Utilidad Real (Ganancia)</div>
                                <h2 className="fw-bold mb-0">C$ {totalUtilidad.toLocaleString()}</h2>
                                <div className="small opacity-75 mt-1">
                                    Ganancia neta
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md="6">
                    <Card className="border-0 shadow-sm bg-info text-white">
                        <CardBody className="py-4 d-flex align-items-center">
                            <div className="me-3 bg-white bg-opacity-25 p-3 rounded-circle">
                                <FontAwesomeIcon icon={faFilter} size="2x" />
                            </div>
                            <div>
                                <div className="small opacity-75 text-uppercase fw-bold">Margen de Ganancia Promedio</div>
                                <h2 className="fw-bold mb-0">{margenPromedio.toFixed(1)}%</h2>
                                <div className="small opacity-75 mt-1">Rentabilidad neta sobre el costo</div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md="12">
                    <Card className="shadow-sm border-0 mb-4 py-2">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
                                <h6 className="fw-bold m-0 text-primary uppercase">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 opacity-50" />
                                    Artículos más Rentables
                                </h6>
                                <Badge color="soft-success" pill style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}>
                                    Análisis por Producto
                                </Badge>
                            </div>
                            <Row className="g-4">
                                {rankingArticulos.slice(0, 8).map((item, idx) => {
                                    const margenArt = item.ventaTotal > 0 ? (item.ganancia / item.ventaTotal) * 100 : 0;
                                    return (
                                        <Col md="3" key={idx}>
                                            <div className="p-3 border-0 rounded shadow-sm bg-light position-relative overflow-hidden h-100">
                                                <div className="text-muted small fw-bold mb-2 text-truncate pe-4" title={item.nombre}>
                                                    {item.nombre}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-end">
                                                    <div>
                                                        <div className="h4 fw-bold text-success mb-1">C$ {item.ganancia.toLocaleString()}</div>
                                                        <div className="text-muted x-small">
                                                            Vendidos: <span className="fw-bold">{item.cant}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <Badge color={margenArt > 25 ? 'success' : 'warning'} className="mb-1">
                                                            {margenArt.toFixed(1)}%
                                                        </Badge>
                                                        <div className="text-muted" style={{ fontSize: '0.6rem' }}>
                                                            MARGEN
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="position-absolute" style={{ right: '-10px', top: '-10px', opacity: 0.05 }}>
                                                    <FontAwesomeIcon icon={faMoneyBillWave} size="4x" />
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                                {processedData.length === 0 && !loading && (
                                    <Col className="text-center py-4 text-muted small">No hay datos de ventas para mostrar el ranking.</Col>
                                )}
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReporteGanancias;
