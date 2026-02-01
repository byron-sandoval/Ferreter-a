import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import { IIngreso } from 'app/shared/model/ingreso.model';
import IngresoService from 'app/services/ingreso.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faEye, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

export const IngresoList = () => {
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<IIngreso | null>(null);

  const loadAll = () => {
    setLoading(true);
    IngresoService.getAll()
      .then(res => {
        setIngresos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const verDetalles = async (id: number) => {
    try {
      const res = await IngresoService.get(id);
      setIngresoSeleccionado(res.data);
      setShowDetalleModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtrados = ingresos.filter(
    i =>
      (i.noDocumento || '').toLowerCase().includes(filter.toLowerCase()) ||
      (i.proveedor?.nombre || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const headerStyle = { backgroundColor: '#2d0a4e', color: 'white' };

  return (
    <div className="animate__animated animate__fadeIn p-3 px-md-4">
      <div
        className="d-flex justify-content-between align-items-center p-3 text-white shadow-sm mb-3 rounded"
        style={{ backgroundColor: '#1a0633' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFileInvoice} size="lg" />
          <h4 className="m-0 fw-bold">Registro de Compras (Ingresos)</h4>
        </div>
        <div className="d-flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por factura o proveedor..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-control-sm border-0"
            style={{ width: '300px' }}
          />
          <Button color="success" size="sm" onClick={() => {}}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Compra
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="text-center text-uppercase small" style={headerStyle}>
            <tr>
              <th className="py-2">Fecha</th>
              <th className="py-2">No. Documento</th>
              <th className="py-2 text-start">Proveedor</th>
              <th className="py-2 text-end">Total</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map(i => (
                <tr key={i.id} className="text-center align-middle">
                  <td className="small">{dayjs(i.fecha).format('DD/MM/YYYY')}</td>
                  <td className="fw-bold">{i.noDocumento}</td>
                  <td className="text-start">{i.proveedor?.nombre}</td>
                  <td className="text-end fw-bold text-primary">C$ {i.total?.toLocaleString()}</td>
                  <td>
                    <Badge color={i.activo ? 'success' : 'secondary'} pill>
                      {i.activo ? 'Recibido' : 'Anulado'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" outline className="me-1" title="Ver detalles" onClick={() => i.id && verDetalles(i.id)}>
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  {loading ? 'Cargando registros...' : 'No se encontraron compras registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      <div className="mt-3 text-muted small">
        <p>* Los ingresos representan las entradas de mercancía al almacén que aumentan el stock.</p>
      </div>

      {/* MODAL DETALLES DE COMPRA (INGRESO) */}
      <Modal isOpen={showDetalleModal} toggle={() => setShowDetalleModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowDetalleModal(false)} className="bg-dark text-white">
          <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-info" /> Detalles de Compra #{ingresoSeleccionado?.noDocumento}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
            <div>
              <Label className="text-muted small text-uppercase fw-bold mb-0">Proveedor</Label>
              <div className="fw-bold fs-5 text-dark">{ingresoSeleccionado?.proveedor?.nombre}</div>
              <small className="text-muted">{ingresoSeleccionado?.proveedor?.telefono}</small>
            </div>
            <div className="text-end">
              <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha de Ingreso</Label>
              <div className="fw-bold">{dayjs(ingresoSeleccionado?.fecha).format('DD/MM/YYYY')}</div>
              <Badge color={ingresoSeleccionado?.activo ? 'success' : 'danger'}>
                {ingresoSeleccionado?.activo ? 'Procesado' : 'Anulado'}
              </Badge>
            </div>
          </div>

          <Table hover responsive borderless className="align-middle">
            <thead className="table-dark small text-uppercase">
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th className="text-end">Costo Unit.</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {ingresoSeleccionado?.detalles?.map((det, i) => (
                <tr key={i} className="border-bottom border-light">
                  <td>
                    <div className="fw-bold">{det.articulo?.nombre}</div>
                    <small className="text-muted">{det.articulo?.codigo}</small>
                  </td>
                  <td className="text-center">
                    <Badge color="info" outline className="px-3">
                      {det.cantidad}
                    </Badge>
                  </td>
                  <td className="text-end">C$ {det.costoUnitario?.toLocaleString()}</td>
                  <td className="text-end fw-bold">C$ {det.monto?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-4 p-3 bg-light rounded-4 ms-auto" style={{ maxWidth: '300px' }}>
            <div className="d-flex justify-content-between border-top pt-2">
              <h5 className="fw-bold m-0">Total Compra:</h5>
              <h5 className="fw-bold text-dark m-0">C$ {ingresoSeleccionado?.total?.toLocaleString()}</h5>
            </div>
          </div>

          {ingresoSeleccionado?.observaciones && (
            <div className="mt-3 p-2 bg-warning bg-opacity-10 border-start border-warning border-3 rounded">
              <small className="fw-bold text-muted d-block text-uppercase">Observaciones:</small>
              {ingresoSeleccionado.observaciones}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="secondary" size="sm" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
          <Button color="dark" size="sm">
            <FontAwesomeIcon icon={faEye} className="me-2 text-info" /> Imprimir Comprobante
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default IngresoList;
