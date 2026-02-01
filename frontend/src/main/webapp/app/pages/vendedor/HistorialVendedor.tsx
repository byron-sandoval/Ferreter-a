import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Badge,
  Card,
  CardBody,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUndo, faEye, faSearch, faCalendarAlt, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import VentaService from 'app/services/venta.service';
import DevolucionService from 'app/services/devolucion.service';
import { IVenta, IDevolucion } from 'app/shared/model';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

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
        montoTotal: ventaSeleccionada.total || 0,
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

      <Modal isOpen={showDevolucionModal} toggle={() => setShowDevolucionModal(false)} centered>
        <ModalHeader toggle={() => setShowDevolucionModal(false)} className="bg-danger text-white border-0">
          <FontAwesomeIcon icon={faUndo} className="me-2" /> Procesar Devolución
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="bg-light p-3 rounded-4 mb-4 text-center">
            <small className="text-muted d-block text-uppercase fw-bold mb-1">Folio a Reversar</small>
            <h4 className="fw-bold text-danger m-0">#{ventaSeleccionada?.noFactura}</h4>
            <div className="mt-2 fw-bold fs-5">Monto Total: C$ {ventaSeleccionada?.total?.toFixed(2)}</div>
          </div>
          <Form>
            <FormGroup>
              <Label className="small fw-bold text-muted text-uppercase">Motivo de la Devolución</Label>
              <Input
                type="textarea"
                rows="4"
                placeholder="Ej: Producto defectuoso, Error en despacho, Cliente arrepentido..."
                className="bg-light border-0"
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
              />
            </FormGroup>
          </Form>
          <div className="alert alert-warning border-0 small mb-0">
            <FontAwesomeIcon icon={faUndo} className="me-2" /> Al confirmar, se generará una nota de crédito y el inventario será ajustado
            automáticamente (si aplica).
          </div>
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="light" onClick={() => setShowDevolucionModal(false)}>
            Cancelar
          </Button>
          <Button color="danger" className="px-4 fw-bold" onClick={procesarDevolucion} disabled={!motivo}>
            Confirmar Devolución
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL DETALLES DE VENTA */}
      <Modal isOpen={showDetalleModal} toggle={() => setShowDetalleModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowDetalleModal(false)} className="bg-primary text-white">
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" /> Detalles de Factura #{ventaSeleccionada?.noFactura}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
            <div>
              <Label className="text-muted small text-uppercase fw-bold mb-0">Cliente</Label>
              <div className="fw-bold fs-5 text-primary">{ventaSeleccionada?.cliente?.nombre || 'General'}</div>
              <small className="text-muted">{ventaSeleccionada?.cliente?.cedula}</small>
            </div>
            <div className="text-end">
              <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha y Hora</Label>
              <div className="fw-bold">{dayjs(ventaSeleccionada?.fecha).format('DD/MM/YYYY HH:mm')}</div>
              <Badge color={ventaSeleccionada?.esContado ? 'success' : 'warning'}>
                {ventaSeleccionada?.esContado ? 'Contado' : 'Crédito'}
              </Badge>
            </div>
          </div>

          <Table hover responsive borderless className="align-middle">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Producto</th>
                <th className="text-center">Cant.</th>
                <th className="text-end">Precio</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ventaSeleccionada?.detalles?.map((det, i) => (
                <tr key={i} className="border-bottom border-light">
                  <td>
                    <div className="fw-bold">{det.articulo?.nombre}</div>
                    <small className="text-muted">{det.articulo?.codigo}</small>
                  </td>
                  <td className="text-center">
                    <Badge color="light" className="text-dark border px-3">
                      {det.cantidad}
                    </Badge>
                  </td>
                  <td className="text-end">C$ {det.precioVenta?.toFixed(2)}</td>
                  <td className="text-end fw-bold">C$ {det.monto?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-4 p-3 bg-light rounded-4 ms-auto" style={{ maxWidth: '300px' }}>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Subtotal:</span>
              <span className="fw-bold">C$ {ventaSeleccionada?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">IVA (15%):</span>
              <span className="text-danger fw-bold">C$ {ventaSeleccionada?.iva?.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2">
              <h5 className="fw-bold m-0">Total:</h5>
              <h5 className="fw-bold text-primary m-0">C$ {ventaSeleccionada?.total?.toFixed(2)}</h5>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="secondary" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
          <Button color="primary">
            <FontAwesomeIcon icon={faEye} className="me-2" /> Reimprimir
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default HistorialVendedor;
