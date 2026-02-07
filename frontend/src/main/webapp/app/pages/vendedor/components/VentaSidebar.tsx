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
} from '@fortawesome/free-solid-svg-icons';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICliente } from 'app/shared/model/cliente.model';
import { IMoneda } from 'app/shared/model/moneda.model';
import { INumeracionFactura } from 'app/shared/model/numeracion-factura.model';
import { MetodoPagoEnum, IVenta } from 'app/shared/model/venta.model';

interface IVentaSidebarProps {
  cliente: ICliente | null;
  vendedorActual: any;
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
  procesarVenta: () => void;
  loading: boolean;
  ventaExitosa: IVenta | null;
  quitarUnoDelCarrito: (id: number) => void;
  agregarAlCarrito: (prod: IArticulo) => void;
}

export const VentaSidebar: React.FC<IVentaSidebarProps> = ({
  cliente,
  vendedorActual,
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
  procesarVenta,
  loading,
  ventaExitosa,
  quitarUnoDelCarrito,
  agregarAlCarrito,
}) => {
  return (
    <Col md="5" className="sticky-top" style={{ top: '20px', height: 'fit-content' }}>
      <Card className="shadow-lg border-0 mb-3 bg-white rounded-4 overflow-hidden">
        <CardHeader className="bg-primary text-white p-2 px-3 d-flex justify-content-between align-items-center">
          <small className="mb-0 fw-bold">
            <FontAwesomeIcon icon={faUserCheck} className="me-2" /> Información del Cliente
          </small>
          {vendedorActual && (
            <Badge color="light" className="text-primary">
              Vendedor: {vendedorActual.nombre}
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
                onChange={e => setBusquedaCedula(e.target.value)}
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
                <div className="fw-bold text-primary fs-5">{cliente.nombre}</div>
                <div className="text-muted small">
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
        <div className="table-responsive flex-grow-1 px-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
          <Table borderless hover className="align-middle" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr className="border-bottom">
                <th className="py-2 text-muted">Items</th>
                <th className="text-center py-2 text-muted">Cant.</th>
                <th className="text-end py-2 text-muted">Subt.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, idx) => (
                <tr key={idx} className="border-bottom border-light">
                  <td className="py-2">
                    <div className="fw-bold text-dark">{item.articulo.nombre}</div>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Unit: C$ {item.articulo.precio?.toFixed(2)}
                    </small>
                  </td>
                  <td className="text-center py-2">
                    <div className="d-flex align-items-center justify-content-center gap-1 border rounded-pill bg-white px-1">
                      <Button
                        size="sm"
                        color="link"
                        className="p-0 text-muted"
                        style={{ width: '20px', height: '20px' }}
                        onClick={() => quitarUnoDelCarrito(item.articulo.id)}
                      >
                        <FontAwesomeIcon icon={faMinus} style={{ fontSize: '0.6rem' }} />
                      </Button>
                      <span className="fw-bold px-1" style={{ fontSize: '0.85rem', minWidth: '20px' }}>
                        {item.cantidad}
                      </span>
                      <Button
                        size="sm"
                        color="link"
                        className="p-0 text-primary"
                        style={{ width: '20px', height: '20px' }}
                        onClick={() => agregarAlCarrito(item.articulo)}
                      >
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.6rem' }} />
                      </Button>
                    </div>
                  </td>
                  <td className="text-end py-2 fw-bold">C$ {item.subtotal.toFixed(2)}</td>
                  <td className="text-end py-2">
                    <Button
                      size="sm"
                      color="link"
                      className="text-danger opacity-50 hover-opacity-100"
                      onClick={() => eliminarDelCarrito(item.articulo.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="bg-light p-3">
          <Row className="mb-3 g-2">
            <Col md="12">
              <Card className="border-0 shadow-sm">
                <CardBody className="p-2">
                  <Label className="small text-muted mb-1 d-block text-uppercase fw-bold">Método de Pago</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    className="border-0 p-0 fw-bold text-primary"
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value as any)}
                  >
                    <option value={MetodoPagoEnum.EFECTIVO}>Efectivo</option>
                  </Input>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-between mb-1 small text-muted">
            <span>Subtotal:</span>
            <span className="fw-bold">C$ {subtotal.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between mb-1 small text-muted">
            <span>Descuento:</span>
            <span className="fw-bold text-success">- C$ {parseFloat(descuento || '0').toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-3 small text-muted">
            <span>IVA (15%):</span>
            <span className="fw-bold text-danger">C$ {iva.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 bg-primary bg-opacity-10 p-2 px-3 rounded-3">
            <span className="fw-bold text-dark m-0 small">Total Final</span>
            <div className="text-end">
              <h4 className="fw-bold text-primary m-0">C$ {total.toFixed(2)}</h4>
              {monedaSeleccionada?.simbolo !== 'C$' && (
                <div className="text-secondary fw-bold small">
                  {monedaSeleccionada?.simbolo} {totalEnMoneda.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* INPUT PAGO CASH */}
          {metodoPago === MetodoPagoEnum.EFECTIVO ? (
            <div className="mb-4">
              <Row className="g-2">
                <Col md="6">
                  <Label className="fw-bold small text-muted text-uppercase">Descuento (C$)</Label>
                  <Input
                    type="number"
                    bsSize="lg"
                    className="fw-bold text-end text-success"
                    placeholder="0.00"
                    value={descuento}
                    onChange={e => setDescuento(e.target.value)}
                  />
                </Col>
                <Col md="6">
                  <Label className="fw-bold small text-muted text-uppercase">Efectivo Recibido (C$)</Label>
                  <Input
                    type="number"
                    bsSize="lg"
                    className="fw-bold text-end"
                    placeholder="0.00"
                    value={montoPagado}
                    onChange={e => setMontoPagado(e.target.value)}
                  />
                </Col>
              </Row>
              <div className={`d-flex justify-content-between mt-2 px-2 ${cambio >= 0 ? 'text-success' : 'text-danger'}`}>
                <span className="fw-bold">Cambio:</span>
                <span className="fw-bold fs-5">C$ {cambio.toFixed(2)}</span>
              </div>
              {parseFloat(montoPagado) > 0 && cambio < 0 && (
                <div className="text-danger small fw-bold text-center mt-2 animate__animated animate__shakeX">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                  Monto insuficiente por C$ {Math.abs(cambio).toFixed(2)}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <Label className="fw-bold small text-muted text-uppercase">Descuento (C$)</Label>
              <Input
                type="number"
                bsSize="lg"
                className="fw-bold text-end text-success border-0 shadow-sm"
                placeholder="0.00"
                value={descuento}
                onChange={e => setDescuento(e.target.value)}
              />
            </div>
          )}

          <Button
            color={metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total ? 'secondary' : 'primary'}
            size="md"
            block
            className="w-100 py-2 fw-bold shadow-sm"
            style={{ borderRadius: '10px' }}
            onClick={procesarVenta}
            disabled={
              carrito.length === 0 ||
              loading ||
              !!ventaExitosa ||
              (metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total)
            }
          >
            {loading ? (
              'Validando...'
            ) : metodoPago === MetodoPagoEnum.EFECTIVO && (parseFloat(montoPagado) || 0) < total ? (
              'ESPERANDO PAGO...'
            ) : (
              <span>
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> COBRAR AHORA
              </span>
            )}
          </Button>
        </div>
      </Card>
    </Col>
  );
};
