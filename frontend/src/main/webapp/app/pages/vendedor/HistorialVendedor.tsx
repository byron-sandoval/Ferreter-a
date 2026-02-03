import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Card, CardBody, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUndo, faEye, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta, IDevolucion } from 'app/shared/model';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { VentaDetalleModal } from './components/VentaDetalleModal';
import { DevolucionModal } from './components/DevolucionModal';

export const HistorialVendedor = () => {
  const [ventas, setVentas] = useState<IVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<IVenta | null>(null);
  const [motivo, setMotivo] = useState('');
  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    setLoading(true);
    try {
      const res = await VentaService.getAll();
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
    <div className="animate__animated animate__fadeIn p-2">
      <h3 className="fw-bold mb-4 text-secondary">
        <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" /> Historial de Ventas Recientes
      </h3>

      <Card className="shadow-sm border-0 mb-4">
        <CardBody className="p-3">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <FontAwesomeIcon icon={faSearch} className="text-muted" />
            </span>
            <Input
              placeholder="Buscar por Folio o Cliente..."
              className="border-start-0"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light text-muted small text-uppercase fw-bold">
            <tr>
              <th className="py-3 px-4">Folio</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Método</th>
              <th className="text-center">Estado Garantía</th>
              <th className="text-end px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const activa = puedeDevolver(v.fecha);
              return (
                <tr key={v.id}>
                  <td className="px-4 fw-bold text-primary">#{v.noFactura}</td>
                  <td className="small text-muted">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1 opacity-50" />
                    {dayjs(v.fecha).format('DD/MM/YYYY HH:mm')}
                  </td>
                  <td className="fw-bold text-dark">{v.cliente?.nombre}</td>
                  <td className="fw-bold">C$ {v.total?.toFixed(2)}</td>
                  <td>
                    <Badge pill color="light" className="text-dark border">
                      {v.metodoPago}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {activa ? (
                      <Badge color="soft-success" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                        Dentro de 72h
                      </Badge>
                    ) : (
                      <Badge color="soft-danger" style={{ backgroundColor: '#ffebee', color: '#c62828' }}>
                        Garantía Vencida
                      </Badge>
                    )}
                  </td>
                  <td className="text-end px-4">
                    <Button color="light" size="sm" className="me-2 rounded-pill" onClick={() => v.id && verDetalles(v.id)}>
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                      color="outline-danger"
                      size="sm"
                      className="rounded-pill"
                      disabled={!activa}
                      onClick={() => {
                        setVentaSeleccionada(v);
                        setShowDevolucionModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faUndo} className="me-1" /> Devolución
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
      <VentaDetalleModal isOpen={showDetalleModal} toggle={() => setShowDetalleModal(false)} venta={ventaSeleccionada} />
    </div>
  );
};

export default HistorialVendedor;
