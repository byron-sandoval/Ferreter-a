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
          <div
            ref={componentRef}
            style={{
              padding: '28px',
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              width: '800px',
              backgroundColor: '#fff',
              color: '#333',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            {/* Header Section - Balanced */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                borderBottom: '3px solid #fd7e14',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {empresa?.logo && (
                  <img
                    src={`data:${empresa.logoContentType};base64,${empresa.logo}`}
                    alt="logo"
                    style={{ maxHeight: '80px', marginRight: '20px' }}
                  />
                )}
                <div>
                  <h1 style={{ margin: 0, fontSize: '28px', color: '#fd7e14', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {empresa?.nombre || 'FERRONICA'}
                  </h1>
                  <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#666', fontWeight: '500' }}>
                    {empresa?.eslogan || 'Ferretería & Suministros de Confianza'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12.5px', color: '#444' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 'bold' }}></p>
                <p style={{ margin: '1px 0' }}>
                  <strong>RUC:</strong> {empresa?.ruc || 'N/A'}
                </p>
                <p style={{ margin: '1px 0' }}>{empresa?.direccion}</p>
                <p style={{ margin: '1px 0' }}>
                  <strong>Tel:</strong> {empresa?.telefono}
                </p>
                <p style={{ margin: '1px 0' }}>
                  <strong>Email:</strong> {empresa?.correo || 'ferronica@gmail.com'}
                </p>
              </div>
            </div>

            {/* Paid Stamp effect - Balanced */}
            <div
              style={{
                position: 'absolute',
                top: '160px',
                right: '50px',
                border: '5px solid #28a745',
                color: '#28a745',
                padding: '8px 25px',
                fontSize: '40px',
                fontWeight: 'bold',
                borderRadius: '12px',
                opacity: 0.12,
                transform: 'rotate(-22deg)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            >
              PAGADO
            </div>

            {/* Invoice Info Section - Balanced */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '15px',
                    marginBottom: '6px',
                    color: '#fd7e14',
                    borderBottom: '1px solid #eee',
                    display: 'inline-block',
                    paddingRight: '40px',
                  }}
                >
                  CLIENTE
                </h2>
                <p style={{ margin: '1px 0', fontSize: '15.5px', fontWeight: 'bold', color: '#000' }}>{ventaExitosa?.cliente?.nombre}</p>
                <div style={{ fontSize: '12.5px' }}>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Cédula:</strong> {ventaExitosa?.cliente?.cedula}
                  </p>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Dirección:</strong> {ventaExitosa?.cliente?.direccion || 'Ciudad'}
                  </p>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Teléfono:</strong> {ventaExitosa?.cliente?.telefono || 'N/A'}
                  </p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#fff',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid #fd7e14',
                  minWidth: '220px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Factura Pro-Forma</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>No. VENTA:</strong>
                  <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>#{ventaExitosa?.noFactura}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>FECHA:</strong>
                  <span>{dayjs(ventaExitosa?.fecha).format('DD/MM/YYYY')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <strong>USUARIO:</strong>
                  <span>{ventaExitosa?.usuario?.nombre || 'Administrador'}</span>
                </div>
              </div>
            </div>

            {/* Table Section - Grid Style */}
            <div style={{ position: 'relative', zIndex: 1, minHeight: '260px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fd7e14', color: '#fff' }}>
                    <th
                      style={{
                        width: '45%',
                        padding: '10px 15px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        fontSize: '12.5px',
                        borderRight: '1.5px solid #fff',
                      }}
                    >
                      Descripción
                    </th>
                    <th
                      style={{
                        width: '15%',
                        padding: '10px 15px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '12.5px',
                        borderRight: '1.5px solid #fff',
                      }}
                    >
                      Unidades
                    </th>
                    <th
                      style={{
                        width: '20%',
                        padding: '10px 15px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        fontSize: '12.5px',
                        borderRight: '1.5px solid #fff',
                      }}
                    >
                      Precio Unitario
                    </th>
                    <th style={{ width: '20%', padding: '10px 15px', textAlign: 'right', fontWeight: 'bold', fontSize: '12.5px' }}>
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1.2px solid #ccc' }}>
                      <td style={{ padding: '8px 15px', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.articulo.nombre}</div>
                      </td>
                      <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                        {item.cantidad}
                      </td>
                      <td style={{ padding: '8px 15px', textAlign: 'right', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                        C$ {item.articulo.precio?.toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 15px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                        C$ {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section - Grid Box Style */}
            <div
              style={{
                display: 'flex',
                width: '100%',
                border: '1.5px solid #ccc',
                marginTop: '-1.5px',
                position: 'relative',
                zIndex: 1,
                backgroundColor: '#fff',
              }}
            >
              {/* Observations Box */}
              <div style={{ width: '60%', padding: '10px', borderRight: '1.5px solid #ccc' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                  Observaciones:
                </p>
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', fontWeight: '500' }}>Gracias por su compra.</div>
              </div>

              {/* Totals Grid Box */}
              <div style={{ width: '40%' }}>
                <div style={{ display: 'flex', borderBottom: '1.2px solid #ccc' }}>
                  <div
                    style={{
                      width: '50%',
                      padding: '8px',
                      borderRight: '1.2px solid #ccc',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '11.5px',
                      color: '#444',
                    }}
                  >
                    Sub-total
                  </div>
                  <div style={{ width: '50%', padding: '8px', textAlign: 'right', fontSize: '11.5px' }}>
                    C$ {ventaExitosa?.subtotal?.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1.2px solid #ccc' }}>
                  <div
                    style={{
                      width: '50%',
                      padding: '8px',
                      borderRight: '1.2px solid #ccc',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '11.5px',
                      color: '#444',
                    }}
                  >
                    Descuento
                  </div>
                  <div style={{ width: '50%', padding: '8px', textAlign: 'right', fontSize: '11.5px', color: '#d9534f' }}>
                    - C$ {(ventaExitosa?.descuento || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1.2px solid #ccc' }}>
                  <div
                    style={{
                      width: '50%',
                      padding: '8px',
                      borderRight: '1.2px solid #ccc',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '11.5px',
                      color: '#444',
                    }}
                  >
                    IVA (15%)
                  </div>
                  <div style={{ width: '50%', padding: '8px', textAlign: 'right', fontSize: '11.5px' }}>
                    C$ {ventaExitosa?.iva?.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', backgroundColor: '#fef3e7' }}>
                  <div
                    style={{
                      width: '50%',
                      padding: '10px 8px',
                      borderRight: '1.5px solid #ccc',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '12.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    TOTAL FACTURA
                  </div>
                  <div
                    style={{
                      width: '50%',
                      padding: '10px 8px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#fd7e14',
                    }}
                  >
                    C$ {ventaExitosa?.total?.toFixed(2)}
                  </div>
                </div>
                {/* Info Recibido/Cambio Alineada */}
                <div style={{ borderTop: '1.2px solid #ccc', display: 'flex', fontSize: '12px', color: '#333' }}>
                  <div style={{ width: '50%', padding: '6px 10px', borderRight: '1.2px solid #ccc', textAlign: 'right' }}>
                    <strong>Recibido:</strong> C$ {ventaExitosa?.importeRecibido?.toFixed(2)}
                  </div>
                  <div style={{ width: '50%', padding: '6px 10px', textAlign: 'right' }}>
                    <strong>Cambio:</strong> C$ {ventaExitosa?.cambio?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 mt-4">
          <Button color="primary" className="fw-bold py-2 shadow-sm" onClick={() => handlePrint()}>
            <FontAwesomeIcon icon={faPrint} className="me-2" /> Imprimir
          </Button>
          <Button color="outline-dark" onClick={finalizarVentaYLimpiar}>
            Nueva Venta
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};
