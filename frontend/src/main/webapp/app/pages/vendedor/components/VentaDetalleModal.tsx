import React, { useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Badge, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPrint } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { IVenta } from 'app/shared/model';

interface VentaDetalleModalProps {
  isOpen: boolean;
  toggle: () => void;
  venta: IVenta | null;
}

export const VentaDetalleModal: React.FC<VentaDetalleModalProps> = ({ isOpen, toggle, venta }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!venta) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" /> Detalles de Factura #{venta.noFactura}
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
          <div>
            <Label className="text-muted small text-uppercase fw-bold mb-0">Cliente</Label>
            <div className="fw-bold fs-5 text-primary">{venta.cliente?.nombre || 'General'}</div>
            <small className="text-muted">{venta.cliente?.cedula}</small>
          </div>
          <div className="text-end">
            <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha y Hora</Label>
            <div className="fw-bold">{dayjs(venta.fecha).format('DD/MM/YYYY HH:mm')}</div>
            <Badge color={venta.esContado ? 'success' : 'warning'}>{venta.esContado ? 'Contado' : 'Crédito'}</Badge>
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
            {venta.detalles?.map((det, i) => (
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
            <span className="fw-bold">C$ {venta.subtotal?.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">IVA (15%):</span>
            <span className="text-danger fw-bold">C$ {venta.iva?.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between border-top pt-2">
            <h5 className="fw-bold m-0">Total:</h5>
            <h5 className="fw-bold text-primary m-0">C$ {venta.total?.toFixed(2)}</h5>
          </div>
          {venta.importeRecibido != null && (
            <div className="d-flex justify-content-between mt-2 pt-2 border-top border-light">
              <span className="text-muted">Efectivo:</span>
              <span className="fw-bold">C$ {venta.importeRecibido?.toFixed(2)}</span>
            </div>
          )}
          {venta.cambio != null && (
            <div className="d-flex justify-content-between">
              <span className="text-muted">Cambio:</span>
              <span className="fw-bold text-success">C$ {venta.cambio?.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* TICKET OCULTO PARA IMPRESIÓN */}
        <div style={{ display: 'none' }}>
          <div ref={componentRef} style={{ padding: '20px', fontFamily: 'monospace', width: '300px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h2 style={{ margin: '0' }}>FERRONICA</h2>
              <p style={{ margin: '0', fontSize: '12px' }}>Ferretería & Suministros</p>
              <p style={{ margin: '0', fontSize: '10px' }}>RUC: 0000000000000</p>
            </div>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>
            <div style={{ fontSize: '12px' }}>
              <p style={{ margin: '2px 0' }}>
                <strong>No. Factura:</strong> {venta.noFactura}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Fecha:</strong> {dayjs(venta.fecha).format('DD/MM/YYYY HH:mm')}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Cliente:</strong> {venta.cliente?.nombre || 'Consumidor Final'}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Vendedor:</strong> {venta.vendedor?.nombre || 'Cajero'}
              </p>
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Cant</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {venta.detalles?.map((det, i) => (
                  <tr key={i}>
                    <td>{det.articulo?.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{det.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>C$ {det.monto?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ fontSize: '12px', textAlign: 'right' }}>
              <p style={{ margin: '2px 0' }}>Subtotal: C$ {venta.subtotal?.toFixed(2)}</p>
              <p style={{ margin: '2px 0' }}>IVA (15%): C$ {venta.iva?.toFixed(2)}</p>
              <h3 style={{ margin: '5px 0' }}>TOTAL: C$ {venta.total?.toFixed(2)}</h3>
              {venta.importeRecibido != null && <p style={{ margin: '2px 0' }}>Efectivo: C$ {venta.importeRecibido?.toFixed(2)}</p>}
              {venta.cambio != null && <p style={{ margin: '2px 0' }}>Cambio: C$ {venta.cambio?.toFixed(2)}</p>}
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ textAlign: 'center', fontSize: '10px' }}>
              <p>¡Gracias por su compra!</p>
              <p>COPIA DE REIMPRESIÓN</p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="border-0">
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
        <Button color="primary" onClick={() => handlePrint()}>
          <FontAwesomeIcon icon={faPrint} className="me-2" /> Reimprimir
        </Button>
      </ModalFooter>
    </Modal>
  );
};
