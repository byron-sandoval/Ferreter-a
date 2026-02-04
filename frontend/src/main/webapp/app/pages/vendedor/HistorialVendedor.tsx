import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Card, CardBody, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUndo, faEye, faSearch, faCalendarAlt, faSync } from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta, IDevolucion } from 'app/shared/model';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { VentaDetalleModal } from './components/VentaDetalleModal';
import { DevolucionModal } from './components/DevolucionModal';
import { EmpresaService } from 'app/services/empresa.service';
import { IEmpresa } from 'app/shared/model/empresa.model';

export const HistorialVendedor = () => {
  const [ventas, setVentas] = useState<IVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<IVenta | null>(null);
  const [motivo, setMotivo] = useState('');
  const [empresa, setEmpresa] = useState<IEmpresa | null>(null);

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
      setVentas(res.data);
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
    return dayjs().diff(dayjs(fecha), 'hour') <= 72;
  };

  const procesarDevolucion = async () => {
    if (!ventaSeleccionada || !motivo) return;
    try {
      const devData: IDevolucion = {
        fecha: dayjs(),
        motivo,
        total: ventaSeleccionada.total || 0,
        venta: ventaSeleccionada,
      };
      await DevolucionService.create(devData);
      toast.success('Devolución registrada correctamente');
      setShowDevolucionModal(false);
      setMotivo('');
      loadVentas();
    } catch (e) {
      toast.error('Error al procesar devolución');
    }
  };

  const filtered = ventas.filter(
    v => (v.noFactura?.toString() || '').includes(filter) || (v.cliente?.nombre || '').toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold text-secondary mb-0">
          <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" /> Historial de Ventas Recientes
        </h5>
        <Button color="light" size="sm" onClick={loadVentas} disabled={loading} style={{ fontSize: '0.75rem' }}>
          <FontAwesomeIcon icon={faSync} spin={loading} className="me-1" /> Actualizar
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
            <span className="input-group-text bg-white border-end-0">
              <FontAwesomeIcon icon={faSearch} className="text-muted" />
            </span>
            <Input
              placeholder="Buscar por Folio o Cliente..."
              className="border-start-0"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ fontSize: '0.8rem' }}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
        <Table hover responsive size="sm" className="mb-0 align-middle">
          <thead className="bg-light text-muted small text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="py-2 px-3">Folio</th>
              <th className="py-2">Fecha</th>
              <th className="py-2">Cliente</th>
              <th className="py-2">Total</th>
              <th className="py-2">Método</th>
              <th className="py-2 text-center">Garantía</th>
              <th className="py-2 text-end px-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const activa = puedeDevolver(v.fecha);
              return (
                <tr key={v.id}>
                  <td className="px-3 fw-bold text-primary" style={{ fontSize: '0.8rem' }}>#{v.noFactura}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1 opacity-50" />
                    {dayjs(v.fecha).format('DD/MM/YY HH:mm')}
                  </td>
                  <td className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{v.cliente?.nombre}</td>
                  <td className="fw-bold" style={{ fontSize: '0.8rem' }}>C$ {v.total?.toFixed(2)}</td>
                  <td>
                    <Badge color="light" className="text-dark border p-1" style={{ fontSize: '0.65rem' }}>
                      {v.metodoPago}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {activa ? (
                      <Badge color="soft-success" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem' }}>
                        Activa
                      </Badge>
                    ) : (
                      <Badge color="soft-danger" style={{ backgroundColor: '#ffebee', color: '#c62828', fontSize: '0.65rem' }}>
                        Vencida
                      </Badge>
                    )}
                  </td>
                  <td className="text-end px-3">
                    <Button color="light" size="sm" className="me-1 p-1" onClick={() => v.id && verDetalles(v.id)}>
                      <FontAwesomeIcon icon={faEye} fixedWidth />
                    </Button>
                    <Button
                      color="outline-danger"
                      size="sm"
                      className="p-1 px-2"
                      style={{ fontSize: '0.7rem' }}
                      disabled={!activa}
                      onClick={() => {
                        setVentaSeleccionada(v);
                        setShowDevolucionModal(true);
                      }}
                    >
                      Devolución
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <DevolucionModal
        isOpen={showDevolucionModal}
        toggle={() => setShowDevolucionModal(false)}
        venta={ventaSeleccionada}
        motivo={motivo}
        setMotivo={setMotivo}
        onConfirm={procesarDevolucion}
      />

      {/* MODAL DETALLES DE VENTA (Refactorizado) */}
      <VentaDetalleModal
        isOpen={showDetalleModal}
        toggle={() => setShowDetalleModal(false)}
        venta={ventaSeleccionada}
        empresa={empresa}
      />
    </div>
  );
};

export default HistorialVendedor;
