import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Table, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faBox, faCalculator, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { IVenta, IDetalleVenta } from 'app/shared/model';
import { IDetalleDevolucion } from 'app/shared/model/detalle-devolucion.model';
import { DevolucionService } from 'app/services/devolucion.service';
import { IDevolucion } from 'app/shared/model/devolucion.model';

interface DevolucionModalProps {
  isOpen: boolean;
  toggle: () => void;
  venta: IVenta | null;
  onConfirm: (total: number, detalles: IDetalleDevolucion[], motivo: string) => void;
}

export const DevolucionModal: React.FC<DevolucionModalProps> = ({ isOpen, toggle, venta, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [cantidadesParaDevolver, setCantidadesParaDevolver] = useState<{ [key: number]: number }>({});
  const [cantidadesDevueltasPrevias, setCantidadesDevueltasPrevias] = useState<{ [key: number]: number }>({});
  const [totalDevolucion, setTotalDevolucion] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (venta && isOpen) {
      setMotivo('');
      setCantidadesParaDevolver({});
      setCantidadesDevueltasPrevias({});
      setTotalDevolucion(0);
      cargarDevolucionesPrevias();
    }
  }, [venta, isOpen]);

  const cargarDevolucionesPrevias = async () => {
    if (!venta?.id) return;
    setLoading(true);
    try {
      const resp = await DevolucionService.getByVenta(venta.id);
      const devoluciones = resp.data;

      const previas: { [key: number]: number } = {};
      devoluciones.forEach(dev => {
        dev.detalles?.forEach(det => {
          if (det.articulo?.id) {
            previas[det.articulo.id] = (previas[det.articulo.id] || 0) + (det.cantidad || 0);
          }
        });
      });
      setCantidadesDevueltasPrevias(previas);
    } catch (error) {
      console.error('Error cargando devoluciones previas', error);
    } finally {
      setLoading(false);
    }
  };

  if (!venta) return null;

  // Calcular el factor de proporción (Total Final / Subtotal Original) 
  // Esto aplica IVA y Descuentos proporcionalmente a cada producto devuelto.
  const factorProporcional = (venta.subtotal && venta.subtotal > 0) ? (venta.total || 0) / venta.subtotal : 1;

  const handleCantidadChange = (detalleId: number, cantidad: number, max: number, precio: number) => {
    const val = Math.min(Math.max(0, cantidad), max);
    const newCantidades = { ...cantidadesParaDevolver, [detalleId]: val };
    setCantidadesParaDevolver(newCantidades);

    // Calcular nuevo total con el factor proporcional (IVA incluido)
    let newTotal = 0;
    venta.detalles?.forEach(det => {
      const q = newCantidades[det.id] || 0;
      newTotal += q * (det.precioVenta || 0) * factorProporcional;
    });
    setTotalDevolucion(newTotal);
  };

  const handleConfirm = () => {
    const detalles: IDetalleDevolucion[] = [];
    venta.detalles?.forEach(det => {
      const q = cantidadesParaDevolver[det.id] || 0;
      if (q > 0) {
        // El monto total del detalle de devolución ahora incluye el IVA proporcional
        const montoConIVA = q * (det.precioVenta || 0) * factorProporcional;
        detalles.push({
          cantidad: q,
          precioUnitario: det.precioVenta, // Mantenemos el unitario base
          montoTotal: montoConIVA,       // Pero el monto total de retorno tiene su IVA
          articulo: det.articulo,
        });
      }
    });

    onConfirm(totalDevolucion, detalles, motivo);
  };

  const puedeConfirmar = motivo.trim().length > 0 && totalDevolucion > 0;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered shadow="lg">
      <ModalHeader toggle={toggle} className="bg-danger text-white border-0 py-3">
        <div className="d-flex align-items-center">
          <div
            className="bg-white bg-opacity-25 rounded-circle p-2 me-3"
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon icon={faUndo} />
          </div>
          <div>
            <h5 className="m-0 fw-bold">Procesar Devolución</h5>
            <small className="opacity-75">
              Factura #{venta.noFactura} - {venta.cliente?.nombre || 'General'}
            </small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-4" style={{ backgroundColor: '#fdfdfd' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Cargando historial...</span>
            </div>
            <p className="mt-2 text-muted small">Consultando historial de devoluciones...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Label className="small fw-bold text-secondary text-uppercase mb-2">1. Motivo de la Devolución</Label>
              <Input
                type="textarea"
                rows="3"
                placeholder="Escriba la razón detallada del retorno del producto..."
                className="border-0 shadow-sm bg-white p-3"
                style={{ borderRadius: '12px', resize: 'none' }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <Label className="small fw-bold text-secondary text-uppercase mb-2">2. Seleccione Productos y Cantidades</Label>
              <div className="border rounded-4 overflow-hidden shadow-sm bg-white">
                <Table hover responsive borderless className="mb-0 align-middle">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr className="small text-muted text-uppercase">
                      <th className="ps-4 py-3">Producto</th>
                      <th className="text-center py-3">Cant. Facturada</th>
                      <th className="text-center py-3">A Devolver</th>
                      <th className="text-end pe-4 py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venta.detalles?.map((det, i) => {
                      const yaDevuelto = cantidadesDevueltasPrevias[det.articulo?.id] || 0;
                      const maxDisponible = (det.cantidad || 0) - yaDevuelto;

                      return (
                        <tr key={det.id} className={i !== 0 ? 'border-top' : ''}>
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-dark">{det.articulo?.nombre}</div>
                            <small className="text-muted">{det.articulo?.codigo}</small>
                          </td>
                          <td className="text-center">
                            <div className="fw-medium text-dark">
                              {det.cantidad} {det.articulo?.unidadMedida?.nombre}
                            </div>
                            {yaDevuelto > 0 && maxDisponible > 0 && (
                              <div className="mt-1">
                                <span
                                  className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {maxDisponible} disponibles
                                </span>
                              </div>
                            )}
                            {maxDisponible <= 0 && (
                              <div className="mt-1">
                                <span
                                  className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Devolución Completa
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="text-center" style={{ width: '150px' }}>
                            <div className="d-flex align-items-center justify-content-center">
                              <Input
                                type="number"
                                min="0"
                                max={maxDisponible}
                                disabled={maxDisponible <= 0}
                                className={`text-center border-0 fw-bold ${maxDisponible <= 0 ? 'bg-light text-muted' : 'bg-light text-danger'}`}
                                style={{ width: '80px', borderRadius: '8px', opacity: maxDisponible <= 0 ? 0.5 : 1 }}
                                value={cantidadesParaDevolver[det.id] || 0}
                                onChange={e =>
                                  handleCantidadChange(det.id, parseFloat(e.target.value), maxDisponible, det.precioVenta || 0)
                                }
                              />
                            </div>
                          </td>
                          <td className="text-end pe-4 fw-bold text-dark">
                            C$ {((cantidadesParaDevolver[det.id] || 0) * (det.precioVenta || 0)).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>

            <div
              className="d-flex justify-content-between align-items-center p-3 rounded-4"
              style={{ backgroundColor: '#fff5f5', border: '1px dashed #feb2b2' }}
            >
              <div className="d-flex align-items-center text-danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <span className="small fw-medium">Se ajustará el inventario automáticamente.</span>
              </div>
              <div className="text-end">
                <span className="text-muted me-2 small">Total a Devolver:</span>
                <span className="fs-4 fw-bold text-danger">C$ {totalDevolucion.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </ModalBody>

      <ModalFooter className="border-0 bg-light p-3">
        <Button color="link" className="text-muted text-decoration-none me-auto" onClick={toggle}>
          Cancelar
        </Button>
        <Button
          disabled={!puedeConfirmar}
          onClick={handleConfirm}
          style={{
            backgroundColor: '#f56565',
            borderColor: '#f56565',
            borderRadius: '10px',
            padding: '10px 30px',
          }}
          className="fw-bold shadow-sm"
        >
          <FontAwesomeIcon icon={faUndo} className="me-2" />
          Procesar Devolución
        </Button>
      </ModalFooter>
    </Modal>
  );
};
