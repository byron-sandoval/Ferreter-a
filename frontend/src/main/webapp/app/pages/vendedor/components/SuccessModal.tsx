import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPrint, faFileAlt, faReceipt } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { IVenta } from 'app/shared/model/venta.model';
import { IEmpresa } from 'app/shared/model/empresa.model';

interface ISuccessModalProps {
  ventaExitosa: IVenta | null;
  finalizarVentaYLimpiar: () => void;
  handlePrint: () => void;
  handlePrintTicket: () => void;
  componentRef: React.RefObject<any>;
  ticketRef: React.RefObject<any>;
  carrito: any[];
  empresa: IEmpresa | null;
}

export const SuccessModal: React.FC<ISuccessModalProps> = ({
  ventaExitosa,
  finalizarVentaYLimpiar,
  handlePrint,
  handlePrintTicket,
  componentRef,
  ticketRef,
  carrito,
  empresa,
}) => {
  const [formatoImpresion, setFormatoImpresion] = useState<'a4' | 'ticket'>('a4');
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
                borderBottom: '3px solid #1a56db',
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
                  <h1 style={{ margin: 0, fontSize: '28px', color: '#1a56db', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {empresa?.nombre || 'FERRONICA'}
                  </h1>
                  <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#666', fontWeight: '500' }}>
                    {empresa?.eslogan || 'Ferretería & Suministros de Confianza'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12.5px', color: '#444' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 'bold' }}></p>
                <p style={{ margin: '1px 0' }}><strong>Dir:</strong> {empresa?.direccion}</p>
                <p style={{ margin: '1px 0' }}>
                  <strong>RUC:</strong> {empresa?.ruc || 'N/A'}
                </p>
                <p style={{ margin: '1px 0' }}>
                  <strong>Tel:</strong> {empresa?.telefono}
                </p>
                <p style={{ margin: '1px 0' }}>
                  <strong>Email:</strong> {empresa?.correo || 'ferronica@gmail.com'}
                </p>
              </div>
            </div>


            {/* Invoice Info Section - Balanced */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '15px',
                    marginBottom: '6px',
                    color: '#1a56db',
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
                  border: '2px solid #1a56db',
                  minWidth: '220px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Factura de venta</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>Nº:</strong>
                  <span style={{ color: '#1a56db', fontWeight: 'bold' }}>{ventaExitosa?.noFactura}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>FECHA:</strong>
                  <span>{dayjs(ventaExitosa?.fecha).format('DD/MM/YYYY - HH:mm')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <strong>VENDEDOR:</strong>
                  <span>{ventaExitosa?.usuario?.nombre || 'Administrador'}</span>
                </div>
              </div>
            </div>

            {/* Table Section - Grid Style */}
            <div style={{ position: 'relative', zIndex: 1, minHeight: '260px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #ccc' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a56db', color: '#fff' }}>
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
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <>
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
                    {Array.from({ length: Math.max(0, 8 - carrito.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} style={{ borderBottom: '1.2px solid #ccc' }}>
                        <td style={{ padding: '8px 15px', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                        <td style={{ padding: '8px 15px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                        <td style={{ padding: '8px 15px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                        <td style={{ padding: '8px 15px' }}>&nbsp;</td>
                      </tr>
                    ))}
                  </>
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
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', fontWeight: '500' }}>
                  <div>Gracias por su compra.</div>
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#555' }}>
                    Cambios únicamente con factura y dentro de 24 horas.
                  </div>
                </div>
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
                <div style={{ display: 'flex', backgroundColor: '#e8f0fe' }}>
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
                      color: '#1a56db',
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

        {/* TICKET TERMICO 80mm (OCULTO EN PANTALLA) */}
        <div style={{ display: 'none' }}>
          <div
            ref={ticketRef}
            style={{
              width: '280px',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              color: '#000',
              padding: '8px',
              backgroundColor: '#fff',
            }}
          >
            {/* Cabecera */}
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              {empresa?.logo && (
                <img
                  src={`data:${empresa.logoContentType};base64,${empresa.logo}`}
                  alt="logo"
                  style={{
                    maxHeight: '60px',
                    maxWidth: '200px',
                    display: 'block',
                    margin: '0 auto 6px auto',
                    filter: 'grayscale(100%)',
                    objectFit: 'contain',
                  }}
                />
              )}
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{empresa?.nombre || 'FERRONICA'}</div>
              <div style={{ fontSize: '10px' }}>{empresa?.direccion}</div>
              <div style={{ fontSize: '10px' }}>Tel: {empresa?.telefono} | RUC: {empresa?.ruc}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '4px' }}>
              <strong>FACTURA #{ventaExitosa?.noFactura}</strong>
              <div>{dayjs(ventaExitosa?.fecha).format('DD/MM/YYYY HH:mm')}</div>
              <div>Vendedor: {ventaExitosa?.usuario?.nombre || 'Admin'}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            {/* Cliente */}
            <div style={{ marginBottom: '4px', fontSize: '10px' }}>
              <strong>Cliente:</strong> {ventaExitosa?.cliente?.nombre}
              <div><strong>Cédula:</strong> {ventaExitosa?.cliente?.cedula}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            {/* Items */}
            <div style={{ marginBottom: '4px' }}>
              {carrito.map((item, i) => (
                <div key={i} style={{ marginBottom: '3px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{item.articulo.nombre}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>{item.cantidad} x C$ {item.articulo.precio?.toFixed(2)}</span>
                    <span><strong>C$ {item.subtotal.toFixed(2)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            {/* Totales */}
            <div style={{ fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span><span>C$ {ventaExitosa?.subtotal?.toFixed(2)}</span>
              </div>
              {(ventaExitosa?.descuento || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Descuento:</span><span>- C$ {ventaExitosa?.descuento?.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IVA (15%):</span><span>C$ {ventaExitosa?.iva?.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ borderTop: '2px solid #000', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>TOTAL:</span><span>C$ {ventaExitosa?.total?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
              <span>Recibido: C$ {ventaExitosa?.importeRecibido?.toFixed(2)}</span>
              <span>Cambio: C$ {ventaExitosa?.cambio?.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0 4px' }} />
            <div style={{ textAlign: 'center', fontSize: '10px' }}>
              <div>¡Gracias por su compra!</div>
              <div>Cambios solo con factura en 24 hrs.</div>
            </div>
          </div>
        </div>

        {/* Botones de impresión */}
        <div className="d-grid gap-2 mt-4">
          {/* Selector de formato */}
          <div className="d-flex gap-2">
            <button
              onClick={() => setFormatoImpresion('a4')}
              style={{
                flex: 1, padding: '12px 8px',
                border: `2px solid ${formatoImpresion === 'a4' ? '#1a56db' : '#dee2e6'}`,
                borderRadius: '12px',
                background: formatoImpresion === 'a4' ? '#1a56db' : '#fff',
                color: formatoImpresion === 'a4' ? '#fff' : '#333',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px', transition: 'all 0.2s',
              }}
            >
              <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1.4rem' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>A4</span>
            </button>
            <button
              onClick={() => setFormatoImpresion('ticket')}
              style={{
                flex: 1, padding: '12px 8px',
                border: `2px solid ${formatoImpresion === 'ticket' ? '#198754' : '#dee2e6'}`,
                borderRadius: '12px',
                background: formatoImpresion === 'ticket' ? '#198754' : '#fff',
                color: formatoImpresion === 'ticket' ? '#fff' : '#333',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px', transition: 'all 0.2s',
              }}
            >
              <FontAwesomeIcon icon={faReceipt} style={{ fontSize: '1.4rem' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Ticket 80mm</span>
            </button>
          </div>

          {/* Boton imprimir unico */}
          <Button
            color={formatoImpresion === 'a4' ? 'primary' : 'success'}
            className="fw-bold py-2 shadow-sm"
            onClick={() => formatoImpresion === 'a4' ? handlePrint() : handlePrintTicket()}
          >
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Imprimir {formatoImpresion === 'a4' ? 'A4' : 'Ticket'}
          </Button>

          <Button color="outline-dark" onClick={finalizarVentaYLimpiar}>
            Nueva Venta
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};
