import React from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPrint } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { IVenta } from 'app/shared/model/venta.model';
import { IEmpresa } from 'app/shared/model/empresa.model';

interface ISuccessModalProps {
  ventaExitosa: IVenta | null;
  finalizarVentaYLimpiar: () => void;
  handlePrint: () => void;
  componentRef: React.RefObject<any>;
  carrito: any[];
  empresa: IEmpresa | null;
}

export const SuccessModal: React.FC<ISuccessModalProps> = ({
  ventaExitosa,
  finalizarVentaYLimpiar,
  handlePrint,
  componentRef,
  carrito,
  empresa,
}) => {
  return (
    <Modal isOpen={!!ventaExitosa} toggle={finalizarVentaYLimpiar} centered size="sm">
      <ModalHeader className="bg-success text-white border-0 py-3">
        <FontAwesomeIcon icon={faCheck} className="me-2" /> ¡Venta Exitosa!
      </ModalHeader>
      <ModalBody className="p-4 text-center">
        <h5 className="fw-bold mb-3">Factura #{ventaExitosa?.noFactura}</h5>
        <p className="text-muted small">La transacción se ha registrado correctamente en el sistema.</p>

        {/* TICKET DE IMPRESIÓN (OCULTO EN PANTALLA, VISIBLE EN IMPRESIÓN) */}
        <div style={{ display: 'none' }}>
          <div ref={componentRef} style={{ padding: '20px', fontFamily: 'monospace', width: '300px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              {empresa?.logo && (
                <img
                  src={`data:${empresa.logoContentType};base64,${empresa.logo}`}
                  alt="logo"
                  style={{ maxHeight: '60px', marginBottom: '10px' }}
                />
              )}
              <h2 style={{ margin: '0', fontSize: '18px', textTransform: 'uppercase' }}>{empresa?.nombre || 'FERRONICA'}</h2>
              <p style={{ margin: '0', fontSize: '11px' }}>{empresa?.eslogan || 'Ferretería & Suministros'}</p>
              <p style={{ margin: '0', fontSize: '10px' }}>RUC: {empresa?.ruc || '0000000000000'}</p>
              <p style={{ margin: '0', fontSize: '9px' }}>{empresa?.direccion}</p>
              <p style={{ margin: '0', fontSize: '9px' }}>Tel: {empresa?.telefono}</p>
            </div>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>
            <div style={{ fontSize: '12px' }}>
              <p style={{ margin: '2px 0' }}>
                <strong>No. Factura:</strong> {ventaExitosa?.noFactura}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Fecha:</strong> {dayjs(ventaExitosa?.fecha).format('DD/MM/YYYY HH:mm')}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Cliente:</strong> {ventaExitosa?.cliente?.nombre}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Vendedor:</strong> {ventaExitosa?.vendedor?.nombre}
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
                {carrito.map((item, i) => (
                  <tr key={i}>
                    <td>{item.articulo.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>C$ {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ fontSize: '12px', textAlign: 'right' }}>
              <p style={{ margin: '2px 0' }}>Subtotal: C$ {ventaExitosa?.subtotal?.toFixed(2)}</p>
              <p style={{ margin: '2px 0' }}>Descuento: - C$ {(ventaExitosa?.descuento || 0).toFixed(2)}</p>
              <p style={{ margin: '2px 0' }}>IVA (15%): C$ {ventaExitosa?.iva?.toFixed(2)}</p>
              <h3 style={{ margin: '5px 0' }}>TOTAL: C$ {ventaExitosa?.total?.toFixed(2)}</h3>
              {ventaExitosa?.importeRecibido != null && (
                <p style={{ margin: '2px 0' }}>Efectivo: C$ {ventaExitosa?.importeRecibido?.toFixed(2)}</p>
              )}
              {ventaExitosa?.cambio != null && <p style={{ margin: '2px 0' }}>Cambio: C$ {ventaExitosa?.cambio?.toFixed(2)}</p>}
            </div>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ textAlign: 'center', fontSize: '10px' }}>
              <p>¡Gracias por su compra!</p>
              <p>Revise su mercadería antes de salir.</p>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 mt-4">
          <Button color="primary" className="fw-bold py-2 shadow-sm" onClick={() => handlePrint()}>
            <FontAwesomeIcon icon={faPrint} className="me-2" /> Imprimir Ticket
          </Button>
          <Button color="outline-dark" onClick={finalizarVentaYLimpiar}>
            Nueva Venta
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};
