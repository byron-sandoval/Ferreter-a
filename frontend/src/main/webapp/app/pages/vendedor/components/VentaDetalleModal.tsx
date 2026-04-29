import React, { useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Badge, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPrint, faFileAlt, faReceipt } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { IVenta, MetodoPagoEnum } from 'app/shared/model/venta.model';
import { IEmpresa } from 'app/shared/model/empresa.model';

interface VentaDetalleModalProps {
  isOpen: boolean;
  toggle: () => void;
  venta: IVenta | null;
  empresa: IEmpresa | null;
}

export const VentaDetalleModal: React.FC<VentaDetalleModalProps> = ({ isOpen, toggle, venta, empresa }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [formatoImpresion, setFormatoImpresion] = useState<'a4' | 'ticket'>('a4');

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handlePrintTicket = useReactToPrint({
    contentRef: ticketRef,
    pageStyle: `@page { size: 80mm auto; margin: 0; } body { margin: 0; display: flex; justify-content: center; }`,
  });

  if (!venta) return null;

  // Calculamos el porcentaje de IVA histórico aplicando regla de 3 con los montos guardados
  const baseCalculo = (venta.subtotal || 0) - (venta.descuento || 0);
  const historicalPorcentajeIva = baseCalculo > 0 ? Math.round(((venta.iva || 0) / baseCalculo) * 100) : (empresa?.porcentajeIva ?? 15);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" /> Detalles de Factura {venta.numeracion?.serie || 'F'}-{String(venta.noFactura || '').padStart(6, '0')}
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
          <div>
            <Label className="text-muted small text-uppercase fw-bold mb-0">Cliente</Label>
            <div className="fw-bold fs-5 text-primary">{venta.anulada ? 'ANULADA' : venta.cliente?.nombre || 'General'}</div>
            <small className="text-muted">{venta.anulada ? 'ANULADA' : venta.cliente?.cedula}</small>
          </div>
          <div className="text-end">
            <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha y Hora</Label>
            <div className="fw-bold">{dayjs(venta.fecha).format('DD/MM/YYYY HH:mm')}</div>
            <Badge color={venta.anulada ? 'danger' : venta.esContado ? 'success' : 'warning'}>
              {venta.anulada ? 'ANULADA' : venta.esContado ? 'Contado' : 'Crédito'}
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
            <span className="fw-bold">C$ {venta.anulada ? '0.00' : venta.subtotal?.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Descuento:</span>
            <span className="text-success fw-bold">- C$ {venta.anulada ? '0.00' : (venta.descuento || 0).toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">IVA ({historicalPorcentajeIva}%):</span>
            <span className="text-primary fw-bold">C$ {venta.anulada ? '0.00' : venta.iva?.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between border-top pt-2">
            <h5 className="fw-bold m-0">Total:</h5>
            <h5 className={`fw-bold m-0 ${venta.anulada ? 'text-danger' : 'text-primary'}`}>
              C$ {venta.anulada ? '0.00' : venta.total?.toFixed(2)}
            </h5>
          </div>
          {!venta.anulada && (
            <>
              {venta.metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? (
                <>
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top border-light">
                    <span className="text-muted">Método:</span>
                    <span className="fw-bold">Tarjeta</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">ID Trans.:</span>
                    <span className="fw-bold" style={{ fontSize: '0.85em' }}>{venta.stripeId?.slice(-10) || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  {venta.importeRecibido != null && (
                    <div className="d-flex justify-content-between mt-2 pt-2 border-top border-light">
                      <span className="text-muted">Efectivo:</span>
                      <span className="fw-bold">{venta.moneda?.simbolo === 'U$' ? '$' : (venta.moneda?.simbolo || 'C$')} {venta.importeRecibido?.toFixed(2)}</span>
                    </div>
                  )}
                  {venta.cambio != null && (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Cambio:</span>
                      <span className="fw-bold text-success">C$ {venta.cambio?.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* TICKET OCULTO PARA IMPRESIÓN - NUEVO FORMATO CARTA */}
        <div style={{ display: 'none' }}>
          <div
            ref={componentRef}
            style={{
              padding: '40px',
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              width: '794px',
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
                <p style={{ margin: '1px 0' }}>
                  <strong>Dir:</strong> {empresa?.direccion}
                </p>
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
                <p style={{ margin: '1px 0', fontSize: '15.5px', fontWeight: 'bold', color: venta.anulada ? '#dc3545' : '#000' }}>
                  {venta.anulada ? 'ANULADA' : venta.cliente?.nombre || 'Consumidor Final'}
                </p>
                <div style={{ fontSize: '12.5px' }}>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Cédula:</strong> {venta.anulada ? 'ANULADA' : venta.cliente?.cedula}
                  </p>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Dirección:</strong> {venta.anulada ? 'ANULADA' : venta.cliente?.direccion || 'Ciudad'}
                  </p>
                  <p style={{ margin: '1px 0' }}>
                    <strong>Teléfono:</strong> {venta.anulada ? 'ANULADA' : venta.cliente?.telefono || 'N/A'}
                  </p>
                </div>
              </div>
              <div
                style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '10px', border: '2px solid #1a56db', minWidth: '220px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>
                    Copia de Reimpresión
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>Nº:</strong>
                  <span style={{ color: '#333', fontWeight: 'bold' }}>{venta.numeracion?.serie || 'F'}-{String(venta.noFactura || '').padStart(6, '0')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <strong>FECHA:</strong>
                  <span>{dayjs(venta.fecha).format('DD/MM/YYYY - HH:mm')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <strong>VENDEDOR:</strong>
                  <span>{venta.usuario?.nombre || 'Administrador'}</span>
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
                  {venta.anulada ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}
                      >
                        **** F A C T U R A A N U L A D A ****
                      </td>
                    </tr>
                  ) : (
                    <>
                      {venta.detalles?.map((det, i) => (
                        <tr key={i} style={{ borderBottom: '1.2px solid #ccc' }}>
                          <td style={{ padding: '8px 15px', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                            <div style={{ fontWeight: 'bold' }}>{det.articulo?.nombre}</div>
                          </td>
                          <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                            {det.cantidad}
                          </td>
                          <td style={{ padding: '8px 15px', textAlign: 'right', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>
                            C$ {det.precioVenta?.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 15px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                            C$ {det.monto?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 8 - (venta.detalles?.length || 0)) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ borderBottom: '1.2px solid #ccc' }}>
                          <td style={{ padding: '8px 15px', fontSize: '12px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                          <td style={{ padding: '8px 15px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                          <td style={{ padding: '8px 15px', borderRight: '1.2px solid #ccc' }}>&nbsp;</td>
                          <td style={{ padding: '8px 15px' }}>&nbsp;</td>
                        </tr>
                      ))}
                    </>
                  )}
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
                  <div>¡Gracias por su compra!</div>
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#555' }}>
                    <strong>NO SE ACEPTAN DEVOLUCIONES DE MERCANCÍA.</strong><br/>
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
                    C$ {venta.anulada ? '0.00' : venta.subtotal?.toFixed(2)}
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
                    - C$ {venta.anulada ? '0.00' : (venta.descuento || 0).toFixed(2)}
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
                    IVA ({historicalPorcentajeIva}%)
                  </div>
                  <div style={{ width: '50%', padding: '8px', textAlign: 'right', fontSize: '11.5px' }}>
                    C$ {venta.anulada ? '0.00' : venta.iva?.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', backgroundColor: venta.anulada ? '#dbeafe' : '#e8f0fe' }}>
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
                      color: venta.anulada ? '#dc3545' : '#1a56db',
                    }}
                  >
                    C$ {venta.anulada ? '0.00' : venta.total?.toFixed(2)}
                  </div>
                </div>
                {/* Info Recibido/Cambio Alineada */}
                {!venta.anulada && (
                  <div style={{ borderTop: '1.2px solid #ccc', display: 'flex', fontSize: '12px', color: '#333' }}>
                    {venta.metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? (
                      <>
                        <div style={{ width: '50%', padding: '6px 15px 6px 10px', borderRight: '1.2px solid #ccc', textAlign: 'right' }}>
                          <strong>Método:</strong> Tarjeta
                        </div>
                        <div style={{ width: '50%', padding: '6px 15px 6px 10px', textAlign: 'right', fontSize: '10.5px' }}>
                          <strong>ID:</strong> {venta.stripeId?.slice(-10) || 'N/A'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '50%', padding: '6px 10px', borderRight: '1.2px solid #ccc', textAlign: 'right' }}>
                          <strong>Recibido:</strong> {venta.moneda?.simbolo === 'U$' ? '$' : (venta.moneda?.simbolo || 'C$')} {venta.importeRecibido?.toFixed(2)}
                        </div>
                        <div style={{ width: '50%', padding: '6px 15px 6px 10px', textAlign: 'right' }}>
                          <strong>Cambio:</strong> C$ {venta.cambio?.toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* TICKET TERMICO 80mm OCULTO */}
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
              <div style={{ fontSize: '10px' }}>
                Tel: {empresa?.telefono} | RUC: {empresa?.ruc}
              </div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            {venta.anulada && (
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  border: '2px solid #120f0fff',
                  color: '#000000ff',
                  padding: '4px',
                  margin: '4px 0',
                  letterSpacing: '2px',
                }}
              >
                *** FACTURA ANULADA ***
              </div>
            )}
            <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '4px' }}>
              <strong>COPIA - FACTURA {venta.numeracion?.serie || 'F'}-{String(venta.noFactura || '').padStart(6, '0')}</strong>
              <div>{dayjs(venta.fecha).format('DD/MM/YYYY HH:mm')}</div>
              <div>Vendedor: {venta.usuario?.nombre || 'Admin'}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            <div style={{ marginBottom: '4px', fontSize: '10px' }}>
              <strong>Cliente:</strong> {venta.cliente?.nombre || 'Consumidor Final'}
              <div>
                <strong>Cédula:</strong> {venta.cliente?.cedula}
              </div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            <div style={{ marginBottom: '4px' }}>
              {venta.detalles?.map((det, i) => (
                <div key={i} style={{ marginBottom: '3px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{det.articulo?.nombre}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span>
                      {det.cantidad} x C$ {det.precioVenta?.toFixed(2)}
                    </span>
                    <span>
                      <strong>C$ {det.monto?.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            <div style={{ fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>C$ {venta.subtotal?.toFixed(2)}</span>
              </div>
              {(venta.descuento || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Descuento:</span>
                  <span>- C$ {venta.descuento?.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IVA ({historicalPorcentajeIva}%):</span>
                <span>C$ {venta.iva?.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ borderTop: '2px solid #000', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>TOTAL:</span>
              <span>C$ {venta.total?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
              {venta.metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? (
                <>
                  <span>Tarjeta:</span>
                  <span>{venta.stripeId?.slice(-10) || 'N/A'}</span>
                </>
              ) : (
                <>
                  <span>Recibido: {venta.moneda?.simbolo === 'U$' ? '$' : (venta.moneda?.simbolo || 'C$')} {venta.importeRecibido?.toFixed(2)}</span>
                  <span>Cambio: C$ {venta.cambio?.toFixed(2)}</span>
                </>
              )}
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '8px 0 4px' }} />
            <div style={{ textAlign: 'center', fontSize: '10px' }}>
              <div>¡Gracias por su compra!</div>
              <div style={{ fontWeight: 'bold', marginTop: '2px' }}>NO SE ACEPTAN DEVOLUCIONES DE MERCANCÍA.</div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="border-0 d-flex gap-2 align-items-center">
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>

        {/* Selector de formato compacto */}
        <div className="d-flex gap-1 ms-auto">
          <button
            onClick={() => setFormatoImpresion('a4')}
            title="Formato A4"
            style={{
              padding: '6px 12px',
              border: `2px solid ${formatoImpresion === 'a4' ? '#1a56db' : '#dee2e6'}`,
              borderRadius: '8px',
              background: formatoImpresion === 'a4' ? '#1a56db' : '#fff',
              color: formatoImpresion === 'a4' ? '#fff' : '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} /> A4
          </button>
          <button
            onClick={() => setFormatoImpresion('ticket')}
            title="Ticket 80mm"
            style={{
              padding: '6px 12px',
              border: `2px solid ${formatoImpresion === 'ticket' ? '#198754' : '#dee2e6'}`,
              borderRadius: '8px',
              background: formatoImpresion === 'ticket' ? '#198754' : '#fff',
              color: formatoImpresion === 'ticket' ? '#fff' : '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}
          >
            <FontAwesomeIcon icon={faReceipt} /> Ticket
          </button>
        </div>

        <Button
          color={formatoImpresion === 'a4' ? 'primary' : 'success'}
          className="fw-bold"
          onClick={() => (formatoImpresion === 'a4' ? handlePrint() : handlePrintTicket())}
        >
          <FontAwesomeIcon icon={faPrint} className="me-1" />
          Reimprimir
        </Button>
      </ModalFooter>
    </Modal>
  );
};
