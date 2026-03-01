import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Badge, Input, Button, Table, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCheck,
  faSearch,
  faUserPlus,
  faExclamationTriangle,
  faTimes,
  faShoppingCart,
  faMoneyBillWave,
  faPlus,
  faMinus,
  faTrashAlt,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICliente } from 'app/shared/model/cliente.model';
import { IMoneda } from 'app/shared/model/moneda.model';
import { INumeracionFactura } from 'app/shared/model/numeracion-factura.model';
import { MetodoPagoEnum, IVenta } from 'app/shared/model/venta.model';

interface IVentaSidebarProps {
  cliente: ICliente | null;
  usuarioActual: any;
  busquedaCedula: string;
  setBusquedaCedula: (v: string) => void;
  buscarCliente: () => void;
  setShowClienteModal: (v: boolean) => void;
  setCliente: (c: ICliente | null) => void;
  numeracion: INumeracionFactura | null;
  monedas: IMoneda[];
  monedaSeleccionada: IMoneda | null;
  setMonedaSeleccionada: (m: IMoneda | null) => void;
  carrito: any[];
  eliminarDelCarrito: (id: number) => void;
  metodoPago: MetodoPagoEnum;
  setMetodoPago: (m: MetodoPagoEnum) => void;
  esContado: boolean;
  setEsContado: (v: boolean) => void;
  subtotal: number;
  iva: number;
  total: number;
  totalEnMoneda: number;
  montoPagado: string;
  setMontoPagado: (v: string) => void;
  descuento: string;
  setDescuento: (v: string) => void;
  cambio: number;
  voucher: string;
  setVoucher: (v: string) => void;
  procesarVenta: () => void;
  loading: boolean;
  ventaExitosa: IVenta | null;
  quitarUnoDelCarrito: (id: number) => void;
  agregarAlCarrito: (prod: IArticulo) => void;
  limpiarTodo: () => void;
}

export const VentaSidebar: React.FC<IVentaSidebarProps> = ({
  cliente,
  usuarioActual,
  busquedaCedula,
  setBusquedaCedula,
  buscarCliente,
  setShowClienteModal,
  setCliente,
  numeracion,
  monedas,
  monedaSeleccionada,
  setMonedaSeleccionada,
  carrito,
  eliminarDelCarrito,
  metodoPago,
  setMetodoPago,
  esContado,
  setEsContado,
  subtotal,
  iva,
  total,
  totalEnMoneda,
  montoPagado,
  setMontoPagado,
  descuento,
  setDescuento,
  cambio,
  voucher,
  setVoucher,
  procesarVenta,
  loading,
  ventaExitosa,
  quitarUnoDelCarrito,
  agregarAlCarrito,
  limpiarTodo,
}) => {
  return (
    <Col md="5" className="sticky-top" style={{ top: '20px', height: 'fit-content' }}>
      <Card className="shadow-lg border-0 mb-3 bg-white rounded-4 overflow-hidden">
        <CardHeader className="bg-primary text-white p-2 px-3 d-flex justify-content-between align-items-center">
          <small className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faUserCheck} className="me-2" /> Información del Cliente
          </small>
          {usuarioActual && (
            <Badge color="light" className="text-primary">
              Usuario: {usuarioActual.nombre}
            </Badge>
          )}
        </CardHeader>
        <CardBody className="p-2">
          {!cliente ? (
            <div className="d-flex gap-2">
              <Input
                placeholder="Buscar por Nombre o Cédula..."
                value={busquedaCedula}
                className="bg-light border-0"
                autoComplete="off"
                maxLength={/^[\d\-]*[a-zA-Z]?$/.test(busquedaCedula) && busquedaCedula.length > 0 ? (busquedaCedula.includes('-') ? 16 : 14) : undefined}
                onChange={e => setBusquedaCedula(/^[\d\-]*[a-zA-Z]?$/.test(e.target.value) ? e.target.value.toUpperCase() : e.target.value)}
                onKeyPress={e => e.key === 'Enter' && buscarCliente()}
              />
              <Button color="dark" onClick={buscarCliente} className="px-3">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button color="outline-primary" onClick={() => setShowClienteModal(true)}>
                <FontAwesomeIcon icon={faUserPlus} />
              </Button>
            </div>
          ) : (
            <div className="d-flex justify-content-between align-items-start border border-primary border-opacity-25 p-2 rounded-3 bg-light">
              <div>
                <div className="fw-bold text-primary fs-6">{cliente.nombre}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  <FontAwesomeIcon icon={faUserCheck} className="me-1" /> {cliente.cedula}
                </div>
              </div>
              <Button color="soft-danger" className="btn-sm rounded-circle shadow-sm" onClick={() => setCliente(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="shadow-lg border-0 rounded-4 overflow-hidden h-100">
        <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2 px-3">
          <small className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" /> Ticket #
            {numeracion ? (numeracion.correlativoActual || 0) + 1 : '...'}
          </small>
          <div className="d-flex gap-2">
            <Input
              type="select"
              bsSize="sm"
              className="bg-primary text-white border-0 fw-bold"
              style={{ width: '80px' }}
              value={(monedaSeleccionada?.id || '') as any}
              onChange={e => setMonedaSeleccionada(monedas.find(m => m.id === Number(e.target.value)) || null)}
            >
              {monedas.map(m => (
                <option key={m.id} value={m.id || ''}>
                  {m.simbolo}
                </option>
              ))}
            </Input>
          </div>
        </CardHeader>
        <div className="table-responsive flex-grow-1 px-3" style={{ height: 'calc(100vh - 480px)', minHeight: '300px', overflowY: 'auto' }}>
          <Table borderless hover className="align-middle mb-0" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr className="border-bottom">
                <th className="py-2 text-muted">Productos ({carrito.length})</th>
                <th className="text-center py-2 text-muted">Cant.</th>
                <th className="text-end py-2 text-muted">Subt.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, idx) => (
                <tr key={idx} className="border-bottom border-light">
                  <td className="py-2" style={{ maxWidth: '180px' }}>
                    <div className="fw-bold text-dark text-truncate" title={item.articulo.nombre}>
                      {item.articulo.nombre}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                      C$ {item.articulo.precio?.toFixed(2)} / {item.articulo.unidadMedida?.simbolo || 'Ud'}
                    </div>
                  </td>
                  <td className="text-center py-2">
                    <div className="d-flex align-items-center justify-content-center gap-1 border rounded-pill bg-white px-1 shadow-sm" style={{ width: 'fit-content', margin: '0 auto' }}>
                      <Button
                        size="sm"
                        color="link"
                        className="p-0 text-muted"
                        style={{ width: '18px', height: '18px' }}
                        onClick={() => quitarUnoDelCarrito(item.articulo.id)}
                      >
                        <FontAwesomeIcon icon={faMinus} style={{ fontSize: '0.55rem' }} />
                      </Button>
                      <span className="fw-bold px-1" style={{ fontSize: '0.8rem', minWidth: '15px' }}>
                        {item.cantidad}
                      </span>
                      <Button
                        size="sm"
                        color="link"
                        className="p-0 text-primary"
                        style={{ width: '18px', height: '18px' }}
                        onClick={() => agregarAlCarrito(item.articulo)}
                      >
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.55rem' }} />
                      </Button>
                    </div>
                  </td>
                  <td className="text-end py-2 fw-bold text-primary">C$ {item.subtotal.toFixed(2)}</td>
                  <td className="text-end py-2">
                    <Button
                      size="sm"
                      color="link"
                      className="text-danger p-0"
                      onClick={() => eliminarDelCarrito(item.articulo.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} style={{ fontSize: '0.8rem' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="bg-light p-2 border-top">
          <div className="px-2">
            <div className="d-flex justify-content-between mb-1 small text-muted">
              <span>Subtotal:</span>
              <span>C$ {subtotal.toFixed(2)}</span>
            </div>
            {metodoPago === MetodoPagoEnum.EFECTIVO && (
              <div className="d-flex justify-content-between mb-1 small text-muted">
                <span>Descuento:</span>
                <span className="text-success fw-bold">- C$ {parseFloat(descuento || '0').toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-1 small text-muted">
              <span>IVA (15%):</span>
              <span className="text-danger fw-bold">C$ {iva.toFixed(2)}</span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center my-1 bg-dark text-white p-2 px-3 rounded-3 shadow-sm">
            <span className="fw-bold small text-uppercase" style={{ fontSize: '0.7rem' }}>Total a Pagar</span>
            <div className="text-end">
              <h5 className="fw-bold m-0" style={{ color: '#00d1ff' }}>C$ {total.toFixed(2)}</h5>
              {monedaSeleccionada?.simbolo !== 'C$' && (
                <div className="text-light opacity-75 fw-bold small">
                  {monedaSeleccionada?.simbolo} {totalEnMoneda.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="p-2 bg-white rounded-3 border mb-2">
            <Row className="g-2 align-items-center">
              <Col xs="4">
                <Label className="small text-muted mb-0 d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Pago con:</Label>
                <div className="d-flex gap-1 mt-1">
                  <Button
                    size="sm"
                    color={metodoPago === MetodoPagoEnum.EFECTIVO ? 'primary' : 'outline-dark'}
                    className="p-1 px-2 border-0"
                    title="Efectivo"
                    onClick={() => setMetodoPago(MetodoPagoEnum.EFECTIVO)}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </Button>
                  <Button
                    size="sm"
                    color={metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? 'primary' : 'outline-dark'}
                    className="p-1 px-2 border-0"
                    title="Tarjeta"
                    onClick={() => {
                      setMetodoPago(MetodoPagoEnum.TARJETA_STRIPE);
                      setDescuento('0');
                    }}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                  </Button>
                </div>
              </Col>

              {metodoPago === MetodoPagoEnum.EFECTIVO ? (
                <>
                  <Col xs="4">
                    <Label className="small text-muted mb-0 d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Desc. (C$)</Label>
                    <Input
                      type="number"
                      bsSize="sm"
                      className="fw-bold text-end text-success border-0 bg-light"
                      placeholder="0.00"
                      value={descuento}
                      onChange={e => setDescuento(e.target.value)}
                    />
                  </Col>

                  <Col xs="4">
                    <Label className="small text-muted mb-0 d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Recibido</Label>
                    <Input
                      type="number"
                      bsSize="sm"
                      className="fw-bold text-end border-0 bg-light"
                      placeholder="0.00"
                      value={montoPagado}
                      onChange={e => setMontoPagado(e.target.value)}
                    />
                  </Col>
                </>
              ) : (
                <Col xs="8">
                  <Label className="small text-muted mb-0 d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>N° Voucher / Referencia</Label>
                  <Input
                    type="text"
                    bsSize="sm"
                    className="fw-bold text-center border-0 bg-light"
                    placeholder="Ej: 123456"
                    value={voucher}
                    onChange={e => setVoucher(e.target.value)}
                  />
                </Col>
              )}
            </Row>

            {metodoPago === MetodoPagoEnum.EFECTIVO && parseFloat(montoPagado) >= total && (
              <div className="d-flex justify-content-between mt-1 px-1 text-success border-top pt-1 mt-2">
                <small className="fw-bold">Cambio:</small>
                <small className="fw-bold">C$ {cambio.toFixed(2)}</small>
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <Button
              color="outline-danger"
              size="md"
              title="Limpiar"
              style={{ borderRadius: '8px', width: '50px' }}
              onClick={() => {
                if (carrito.length > 0 && window.confirm('¿Desea limpiar la venta?')) {
                  limpiarTodo();
                } else if (carrito.length === 0) {
                  limpiarTodo();
                }
              }}
              disabled={loading || !!ventaExitosa}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
            <Button
              color={
                (metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total) ||
                  (metodoPago === MetodoPagoEnum.TARJETA_STRIPE && !voucher.trim())
                  ? 'secondary'
                  : 'success'
              }
              size="md"
              className="flex-grow-1 py-2 fw-bold shadow-sm text-uppercase"
              style={{ borderRadius: '8px', fontSize: '0.9rem' }}
              onClick={procesarVenta}
              disabled={
                carrito.length === 0 ||
                loading ||
                !!ventaExitosa ||
                (metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total) ||
                (metodoPago === MetodoPagoEnum.TARJETA_STRIPE && !voucher.trim())
              }
            >
              {loading ? (
                'Procesando...'
              ) : (
                <span>
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                  {(metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total) ? 'Esperando Pago' : 'Finalizar Venta'}
                </span>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </Col>
  );
};
