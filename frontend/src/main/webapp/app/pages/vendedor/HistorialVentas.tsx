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

  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<IVenta | null>(null);
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadVentas();
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
      const res = await VentaService.getAll({ size: 1000, sort: 'fecha,desc' });
      // JHipster returns the list directly or in an array. Let's ensure it's an array.
      const data = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
      setVentas(data);
    } catch (e) {
      toast.error('Error al cargar historial');
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
    if (window.confirm(`¿Está seguro de ANULAR la factura #${noFactura}? \n\nEsto devolverá los productos al inventario y la venta ya no contará en sus reportes.`)) {
      try {
        await VentaService.anular(id);
        toast.success(`Factura #${noFactura} anulada correctamente`);
        loadVentas();
      } catch (e) {
        toast.error('Error al anular la factura. Verifique sus permisos de Administrador.');
      }
    }
  };

  const filtered = ventas.filter(
    v => (v.noFactura?.toString() || '').includes(filter) || (v.cliente?.nombre || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

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
            onClick={() => navigate('/admin/devoluciones')}
            style={{ fontSize: '0.75rem' }}
          >
            <FontAwesomeIcon icon={faUndoAlt} className="me-1" /> Devoluciones
          </Button>
          <Button color="light" size="sm" onClick={loadVentas} disabled={loading} style={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faSync} spin={loading} className="me-1" /> Actualizar
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <div
            className="d-flex align-items-center"
            style={{
              maxWidth: '350px',
              borderBottom: '2px solid #18a1bcff',
              paddingBottom: '2px',
            }}
          >
            <FontAwesomeIcon icon={faSearch} className="text-info opacity-75 me-2" />
            <Input
              placeholder="Buscar por Folio o Cliente..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border-0 shadow-none p-0 bg-transparent"
              style={{ fontSize: '0.8rem' }}
            />
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
            {currentItems.map(v => {
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
                    ) : activa ? (
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
                      disabled={!activa || v.anulada}
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
                        onClick={() => v.id && v.noFactura && handleAnular(v.id as number, v.noFactura as number)}
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
              Mostrando {Math.min(indexOfLastItem, filtered.length)} de {filtered.length} ventas
            </small>
            <Pagination size="sm" className="mb-0 pe-2">
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink previous onClick={() => paginate(currentPage - 1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PaginationLink>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem active={i + 1 === currentPage} key={i}>
                  <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={currentPage === totalPages}>
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
