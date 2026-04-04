import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Card, CardBody, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHistory,
  faUndo,
  faEye,
  faSearch,
  faCalendarAlt,
  faSync,
  faChevronLeft,
  faChevronRight,
  faUndoAlt,
  faPlusCircle,
  faBan,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta, IDevolucion } from 'app/shared/model';
import { IDetalleDevolucion } from 'app/shared/model/detalle-devolucion.model';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { VentaDetalleModal } from './components/VentaDetalleModal';
import { DevolucionModal } from './components/DevolucionModal';
import { EmpresaService } from 'app/services/empresa.service';
import { IEmpresa } from 'app/shared/model/empresa.model';

export const HistorialVentas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<IVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [fechaInicioInput, setFechaInicioInput] = useState('');
  const [fechaFinInput, setFechaFinInput] = useState('');
  const [devolucionesMap, setDevolucionesMap] = useState<Record<number, number>>({});

  const aplicarFiltros = () => {
    setFechaInicio(fechaInicioInput);
    setFechaFin(fechaFinInput);
    setCurrentPage(0);
  };

  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<IVenta | null>(null);
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);

  // Paginación del BACKEND (page es 0-indexed en JHipster)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    loadVentas();
  }, [currentPage, fechaInicio, fechaFin]);

  useEffect(() => {
    loadEmpresa();
  }, []);

  const loadEmpresa = async () => {
    try {
      const res = await EmpresaService.getAll();
      if (res.data.length > 0) setEmpresa(res.data[0]);
    } catch (e) {
      console.error('Error cargando empresa', e);
    }
  };

  const loadVentas = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: itemsPerPage,
        sort: 'fecha,desc',
      };
      // Filtros de fecha: convertimos medianoche/fin de día en hora LOCAL a UTC con dayjs
      if (fechaInicio) params['fecha.greaterThanOrEqual'] = dayjs(fechaInicio).startOf('day').toISOString();
      if (fechaFin)    params['fecha.lessThanOrEqual']    = dayjs(fechaFin).endOf('day').toISOString();

      const res = await VentaService.getAll(params);
      // JHipster returns the list directly or in an array. Let's ensure it's an array.
      const data = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
      setVentas(data);
      // JHipster devuelve el total en el header X-Total-Count
      const total = res.headers?.['x-total-count'];
      setTotalItems(total ? parseInt(total, 10) : data.length);

      // Cargar devoluciones de estas ventas para identificar saldos
      if (data.length > 0) {
        try {
          const resDev = await DevolucionService.getAll(); // Podemos optimizar esto luego si crece mucho
          const devData = Array.isArray(resDev.data) ? resDev.data : (resDev.data as any).content || [];
          const map: Record<number, number> = {};
          devData.forEach((d: IDevolucion) => {
            if (d.venta?.id) {
              map[d.venta.id] = (map[d.venta.id] || 0) + (d.total || 0);
            }
          });
          setDevolucionesMap(map);
        } catch (e) {
          console.error('Error al cargar saldos de devolución', e);
        }
      }
    } catch (e) {
      console.error('Error al cargar historial', e);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (id: number) => {
    try {
      const res = await VentaService.getFactura(id);
      setVentaSeleccionada(res.data);
      setShowDetalleModal(true);
    } catch (e) {
      toast.error('Error al cargar detalles de la venta');
    }
  };

  const puedeDevolver = (fecha?: string | dayjs.Dayjs | null) => {
    if (!fecha) return false;
    return dayjs().diff(dayjs(fecha), 'hour') <= 24;
  };

  const procesarDevolucion = async (total: number, detalles: IDetalleDevolucion[], motivoDev: string) => {
    if (!ventaSeleccionada) return;
    try {
      const devData: IDevolucion = {
        fecha: dayjs(),
        motivo: motivoDev,
        total,
        venta: ventaSeleccionada,
        detalles,
      };
      await DevolucionService.create(devData);
      toast.success('Devolución registrada correctamente');
      setShowDevolucionModal(false);
      loadVentas();
    } catch (e) {
      toast.error('Error al procesar devolución');
    }
  };

  const handleAnular = async (id: number, noFactura: number) => {
    if (
      window.confirm(
        `¿Está seguro de ANULAR la factura #${noFactura}? \n\nEsto devolverá los productos al inventario y la venta ya no contará en sus reportes.`,
      )
    ) {
      try {
        await VentaService.anular(id);
        toast.success(`Factura #${noFactura} anulada correctamente`);
        loadVentas();
      } catch (e) {
        toast.error('Error al anular la factura. Verifique sus permisos de Administrador.');
      }
    }
  };

  // Búsqueda local por folio/cliente dentro de la página actual
  const filtered = ventas.filter(v => {
    const searchLow = filter.toLowerCase();
    return (v.noFactura?.toString() || '').includes(searchLow) || (v.cliente?.nombre || '').toLowerCase().includes(searchLow);
  });

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold text-dark mb-0">
          <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" /> Historial de Ventas Recientes
        </h5>
        <div>
          <Button
            color="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => navigate('/vendedor/devoluciones')}
            style={{ fontSize: '0.75rem' }}
          >
            <FontAwesomeIcon icon={faUndoAlt} className="me-1" /> Devoluciones
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-3">
          <div className="row align-items-end g-3">
            <div className="col-md-4 d-flex justify-content-md-start mb-2 mb-md-0">
              <div
                className="d-flex align-items-center w-100 bg-white"
                style={{
                  maxWidth: '350px',
                  border: '2px solid #adb5bd',
                  borderRadius: '6px',
                  padding: '6px 12px',
                }}
              >
                <FontAwesomeIcon icon={faSearch} className="opacity-75 me-2" style={{ color: '#a855f7' }} />
                <Input
                  placeholder="Buscar por Folio o Cliente..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="border-0 shadow-none p-0 bg-transparent flex-grow-1"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>
            
            <div className="col-md-8 d-flex justify-content-start align-items-end gap-3">
              <div className="d-flex flex-column">
                <span className="text-dark mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>FECHA INICIO</span>
                <div className="d-flex align-items-center bg-white" style={{ border: '2px solid #adb5bd', borderRadius: '6px', padding: '4px 8px' }}>
                  <Input
                    type="date"
                    bsSize="sm"
                    value={fechaInicioInput}
                    onChange={e => setFechaInicioInput(e.target.value)}
                    className="border-0 bg-transparent shadow-none p-0 text-dark"
                    style={{ fontSize: '0.9rem', outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <span className="text-dark mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>FECHA FIN</span>
                <div className="d-flex align-items-center bg-white" style={{ border: '2px solid #adb5bd', borderRadius: '6px', padding: '4px 8px' }}>
                  <Input
                    type="date"
                    bsSize="sm"
                    value={fechaFinInput}
                    onChange={e => setFechaFinInput(e.target.value)}
                    className="border-0 bg-transparent shadow-none p-0 text-dark"
                    style={{ fontSize: '0.9rem', outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              <Button color="primary" onClick={aplicarFiltros} className="shadow-none d-flex align-items-center" style={{ padding: '0.45rem 1.2rem', borderRadius: '6px', fontWeight: '500' }}>
                <FontAwesomeIcon icon={faFilter} className="me-2" /> FILTRAR
              </Button>
            </div>

            <div className="col-md-2 d-none d-md-block">
              {/* Espaciador */}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
        <Table hover responsive size="sm" className="mb-0 align-middle">
          <thead className="bg-light text-dark small text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="py-2 px-3 fw-bold">Folio</th>
              <th className="py-2 fw-bold">Fecha</th>
              <th className="py-2 fw-bold">Cliente</th>
              <th className="py-2 fw-bold">Total</th>
              <th className="py-2 fw-bold">Método</th>
              <th className="py-2 text-center fw-bold">Estado / Garantía</th>
              <th className="py-2 text-center fw-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const activa = puedeDevolver(v.fecha);
              return (
                <tr key={v.id}>
                  <td className="px-3 fw-bold text-primary" style={{ fontSize: '0.8rem' }}>
                    #{v.noFactura}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1 opacity-50" />
                    {dayjs(v.fecha).format('DD/MM/YY HH:mm')}
                  </td>
                  <td className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>
                    {v.cliente?.nombre}
                  </td>
                  <td className="fw-bold" style={{ fontSize: '0.8rem' }}>
                    C$ {v.total?.toFixed(2)}
                  </td>
                  <td>
                    <Badge color="light" className="text-dark border p-1" style={{ fontSize: '0.65rem' }}>
                      {v.metodoPago === 'TARJETA_STRIPE' ? 'TARJETA' : v.metodoPago}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {v.anulada ? (
                      <Badge color="soft-danger" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.65rem' }}>
                        ANULADA
                      </Badge>
                    ) : (activa && (devolucionesMap[v.id || 0] || 0) < (v.total || 0) - 0.01) ? (
                      <Badge color="soft-success" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem' }}>
                        Activa
                      </Badge>
                    ) : (
                      <Badge color="soft-danger" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.65rem' }}>
                        Vencida
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <Button color="light" size="sm" className="me-1 p-1" onClick={() => v.id && verDetalles(v.id)}>
                      <FontAwesomeIcon icon={faEye} fixedWidth />
                    </Button>
                    <Button
                      color="outline-danger"
                      size="sm"
                      className="p-1 px-2"
                      style={{ fontSize: '0.7rem' }}
                      disabled={!activa || v.anulada || (devolucionesMap[v.id || 0] || 0) >= (v.total || 0) - 0.01}
                      onClick={() => {
                        setVentaSeleccionada(v);
                        setShowDevolucionModal(true);
                      }}
                    >
                      Devolución
                    </Button>
                    {!v.anulada && (
                      <Button
                        color="danger"
                        size="sm"
                        className="ms-1 p-1"
                        title="Anular Factura"
                        onClick={() => v.id && v.noFactura && handleAnular(v.id, v.noFactura)}
                      >
                        <FontAwesomeIcon icon={faBan} fixedWidth />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
            <small className="text-muted ps-2">
              Mostrando {currentPage * itemsPerPage + filtered.length} de {totalItems} ventas
            </small>
            <Pagination size="sm" className="mb-0 pe-2">
              <PaginationItem disabled={currentPage === 0}>
                <PaginationLink previous onClick={() => paginate(currentPage - 1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PaginationLink>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem active={i === currentPage} key={i}>
                  <PaginationLink onClick={() => paginate(i)}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={currentPage === totalPages - 1}>
                <PaginationLink next onClick={() => paginate(currentPage + 1)}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </div>
        )}
      </Card>

      <DevolucionModal
        isOpen={showDevolucionModal}
        toggle={() => setShowDevolucionModal(false)}
        venta={ventaSeleccionada}
        onConfirm={procesarDevolucion}
      />

      {/* MODAL DETALLES DE VENTA (Refactorizado) */}
      <VentaDetalleModal isOpen={showDetalleModal} toggle={() => setShowDetalleModal(false)} venta={ventaSeleccionada} empresa={empresa} />
    </div>
  );
};

export default HistorialVentas;
