import React, { useEffect, useState, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Table,
  Badge,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faTimes,
  faCheck,
  faMoneyBillWave,
  faBoxOpen,
  faUserPlus,
  faUserCheck,
  faCreditCard,
  faHandHoldingUsd,
  faPrint,
  faExclamationTriangle,
  faVenusMars,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import VentaService from 'app/services/venta.service';
import ClienteService from 'app/services/cliente.service';
import MonedaService from 'app/services/moneda.service';
import NumeracionService from 'app/services/numeracion.service';
import VendedorService from 'app/services/vendedor.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';
import { IMoneda } from 'app/shared/model/moneda.model';
import { INumeracionFactura } from 'app/shared/model/numeracion-factura.model';
import { MetodoPagoEnum, IVenta } from 'app/shared/model/venta.model';
import { useAppSelector } from 'app/config/store';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

export const NuevaVenta = () => {
  const account = useAppSelector(state => state.authentication.account);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [termino, setTermino] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Datos del Cliente
  const [cliente, setCliente] = useState<ICliente | null>(null);
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<ICliente>({
    cedula: '',
    nombre: '',
    activo: true,
    genero: GeneroEnum.MASCULINO,
    direccion: '',
  });

  // Configuración Venta
  const [metodoPago, setMetodoPago] = useState<MetodoPagoEnum>(MetodoPagoEnum.EFECTIVO);
  const [esContado, setEsContado] = useState(true);
  const [monedas, setMonedas] = useState<IMoneda[]>([]);
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<IMoneda | null>(null);
  const [numeracion, setNumeracion] = useState<INumeracionFactura | null>(null);
  const [vendedorActual, setVendedorActual] = useState<any>(null);

  // Impresion
  const componentRef = useRef<any>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [ventaExitosa, setVentaExitosa] = useState<IVenta | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [resArt, resMon, resNum] = await Promise.all([ArticuloService.getAll(), MonedaService.getAll(), NumeracionService.getAll()]);
      setArticulos(resArt.data);
      setMonedas(resMon.data);
      if (resMon.data.length > 0) setMonedaSeleccionada(resMon.data[0]);
      if (resNum.data.length > 0) setNumeracion(resNum.data.find(n => n.activo) || resNum.data[0]);

      // Cargar vendedor por Keycloak ID
      if (account?.id) {
        const resVend = await VendedorService.getByKeycloakId(account.id);
        if (resVend.data.length > 0) setVendedorActual(resVend.data[0]);
      }
    } catch (e) {
      toast.error('Error al cargar datos iniciales');
    }
  };

  const buscarCliente = async () => {
    if (!busquedaCedula) return;
    try {
      const res = await ClienteService.getByCedula(busquedaCedula);
      if (res.data.length > 0) {
        const c = res.data[0];
        setCliente(c);
        if ((c.saldo || 0) > 0) {
          toast.warning(`Atención: El cliente ${c.nombre} tiene un saldo pendiente de C$ ${c.saldo?.toFixed(2)}`, { autoClose: 5000 });
        } else {
          toast.success(`Cliente seleccionado: ${c.nombre}`);
        }
      } else {
        toast.info('Cliente no encontrado. Por favor regístrelo.');
        setNuevoCliente({ ...nuevoCliente, cedula: busquedaCedula });
        setShowClienteModal(true);
      }
    } catch (e) {
      toast.error('Error al buscar cliente');
    }
  };

  const guardarNuevoCliente = async () => {
    try {
      if (!nuevoCliente.cedula || !nuevoCliente.nombre) {
        toast.error('Cédula y Nombre son obligatorios');
        return;
      }
      const res = await ClienteService.create(nuevoCliente);
      setCliente(res.data);
      setShowClienteModal(false);
      toast.success('Cliente registrado con éxito');
    } catch (e) {
      toast.error('Error al registrar cliente');
    }
  };

  const agregarAlCarrito = (producto: IArticulo) => {
    const existente = carrito.find(item => item.articulo.id === producto.id);
    const cantActual = existente ? existente.cantidad : 0;

    if (cantActual + 1 > (producto.existencia || 0)) {
      toast.error(`No hay suficiente stock para ${producto.nombre}. Disponible: ${producto.existencia}`);
      return;
    }

    if (existente) {
      const actualizados = carrito.map(item =>
        item.articulo.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * (producto.precio || 0) }
          : item,
      );
      setCarrito(actualizados);
    } else {
      setCarrito([
        ...carrito,
        {
          articulo: producto,
          cantidad: 1,
          subtotal: producto.precio || 0,
        },
      ]);
    }
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.articulo.id !== id));
  };

  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  // Calculo en moneda extranjera
  const conversionRate = monedaSeleccionada?.tipoCambio || 1;
  const totalEnMoneda = total / conversionRate;

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast.warning('El carrito está vacío');
      return;
    }
    if (!cliente) {
      toast.warning('Por favor seleccione un cliente');
      return;
    }

    if (!esContado && (cliente.saldo || 0) > 5000) {
      // Ejemplo de limite de credito
      toast.error('El cliente excede su límite de crédito. La venta debe ser de contado.');
      return;
    }

    try {
      setLoading(true);

      const ventaData: IVenta = {
        fecha: dayjs(),
        subtotal,
        iva,
        total,
        totalEnMonedaBase: total, // Todo se asume en base C$ inicialmente
        metodoPago,
        esContado,
        cliente,
        vendedor: vendedorActual,
        moneda: monedaSeleccionada,
        numeracion,
        noFactura: (numeracion?.correlativoActual || 0) + 1,
      };

      const resVenta = await VentaService.createVenta(ventaData);
      const ventaId = resVenta.data.id;

      for (const item of carrito) {
        await VentaService.addDetalle({
          cantidad: item.cantidad,
          precioVenta: item.articulo.precio,
          monto: item.subtotal,
          articulo: item.articulo,
          venta: { id: ventaId },
        });
      }

      toast.success(`¡Venta #${resVenta.data.noFactura} registrada con éxito!`);
      setVentaExitosa(resVenta.data);
      // Limpieza se hace despues de cerrar el modal de ticket o manual
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar la venta.');
    } finally {
      setLoading(false);
    }
  };

  const finalizarVentaYLimpiar = () => {
    setCarrito([]);
    setCliente(null);
    setBusquedaCedula('');
    setVentaExitosa(null);
    cargarDatosIniciales(); // Recargar stock y numeracion
  };

  return (
    <div className="pos-container animate__animated animate__fadeIn">
      <Row>
        {/* PARTE IZQUIERDA: CATÁLOGO */}
        <Col md="7">
          <Card className="shadow-sm mb-3 border-0">
            <CardBody
              className="rounded-3 p-3"
              style={{ backgroundColor: '#ffc107', backgroundImage: 'linear-gradient(45deg, #ffc107 0%, #ffdb58 100%)' }}
            >
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-transparent border-end-0 text-dark opacity-75">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <Input
                  placeholder="Escribe el nombre o código del producto..."
                  className="bg-transparent border-start-0 text-dark placeholder-dark"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', fontWeight: '500' }}
                  autoFocus
                  value={termino}
                  onChange={e => setTermino(e.target.value)}
                />
              </div>
            </CardBody>
          </Card>

          <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            <Row className="g-3">
              {articulos
                .filter(
                  p =>
                    (p.nombre || '').toLowerCase().includes(termino.toLowerCase()) ||
                    (p.codigo || '').toLowerCase().includes(termino.toLowerCase()),
                )
                .map(prod => (
                  <Col md="4" key={prod.id}>
                    <Card
                      className="h-100 shadow-sm border-0 product-card cursor-pointer"
                      onClick={() => agregarAlCarrito(prod)}
                      style={{ transition: '0.2s' }}
                    >
                      <div className="position-relative text-center p-3 bg-light">
                        {prod.imagen ? (
                          <img
                            src={`data:${prod.imagenContentType};base64,${prod.imagen}`}
                            alt={prod.nombre}
                            style={{ height: '90px', objectFit: 'contain' }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faBoxOpen} size="3x" className="text-muted opacity-50" />
                        )}
                        <Badge
                          color={(prod.existencia || 0) > 0 ? 'success' : 'danger'}
                          className="position-absolute top-0 end-0 m-2 px-2 py-1"
                        >
                          Stock: {prod.existencia}
                        </Badge>
                      </div>
                      <CardBody className="p-2">
                        <div className="fw-bold text-dark text-truncate small" title={prod.nombre}>
                          {prod.nombre}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                          <span className="text-primary fw-bold">C$ {prod.precio?.toFixed(2)}</span>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {prod.codigo}
                          </small>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        </Col>

        {/* PARTE DERECHA: FACTURA */}
        <Col md="5">
          <Card className="shadow-lg border-0 mb-3 bg-white rounded-4 overflow-hidden">
            <CardHeader className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <FontAwesomeIcon icon={faUserCheck} className="me-2" /> Información del Cliente
              </h6>
              {vendedorActual && (
                <Badge color="light" className="text-primary">
                  Vendedor: {vendedorActual.nombre}
                </Badge>
              )}
            </CardHeader>
            <CardBody className="p-3">
              {!cliente ? (
                <div className="d-flex gap-2">
                  <Input
                    placeholder="Ingrese Cédula Rápida..."
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
                <div className="d-flex justify-content-between align-items-start border border-primary border-opacity-25 p-3 rounded-4 bg-light">
                  <div>
                    <div className="fw-bold text-primary fs-5">{cliente.nombre}</div>
                    <div className="text-muted small">
                      <FontAwesomeIcon icon={faUserCheck} className="me-1" /> {cliente.cedula}
                    </div>
                    {(cliente.saldo || 0) > 0 && (
                      <Badge color="danger" className="mt-2 p-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" /> Debe: C$ {cliente.saldo?.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <Button color="soft-danger" className="btn-sm rounded-circle shadow-sm" onClick={() => setCliente(null)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 rounded-4 overflow-hidden h-100">
            <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
              <h6 className="mb-0 fw-bold">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" /> Ticket #
                {numeracion ? (numeracion.correlativoActual || 0) + 1 : '...'}
              </h6>
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
            <div className="table-responsive flex-grow-1 px-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <Table borderless hover className="align-middle small">
                <thead>
                  <tr className="border-bottom">
                    <th className="py-3 text-muted">Items</th>
                    <th className="text-center py-3 text-muted">Cant.</th>
                    <th className="text-end py-3 text-muted">Subt.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, idx) => (
                    <tr key={idx} className="border-bottom border-light">
                      <td className="py-3">
                        <div className="fw-bold text-dark">{item.articulo.nombre}</div>
                        <small className="text-muted">Unit: C$ {item.articulo.precio?.toFixed(2)}</small>
                      </td>
                      <td className="text-center py-3">
                        <Badge color="light" className="text-dark border px-2 py-1 fs-6">
                          {item.cantidad}
                        </Badge>
                      </td>
                      <td className="text-end py-3 fw-bold">C$ {item.subtotal.toFixed(2)}</td>
                      <td className="text-end py-3">
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

            <div className="bg-light p-4">
              <Row className="mb-3 g-2">
                <Col>
                  <Card className="border-0 shadow-sm">
                    <CardBody className="p-2">
                      <Label className="small text-muted mb-1 d-block text-uppercase fw-bold">Método</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        className="border-0 p-0 fw-bold"
                        value={metodoPago}
                        onChange={e => setMetodoPago(e.target.value as any)}
                      >
                        <option value={MetodoPagoEnum.EFECTIVO}>Efectivo</option>
                        <option value={MetodoPagoEnum.TARJETA}>Tarjeta</option>
                        <option value={MetodoPagoEnum.TRANSFERENCIA}>Transferencia</option>
                      </Input>
                    </CardBody>
                  </Card>
                </Col>
                <Col>
                  <Card className="border-0 shadow-sm">
                    <CardBody className="p-2">
                      <Label className="small text-muted mb-1 d-block text-uppercase fw-bold">Condición</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        className="border-0 p-0 fw-bold"
                        value={esContado ? 'true' : 'false'}
                        onChange={e => setEsContado(e.target.value === 'true')}
                      >
                        <option value="true">Contado</option>
                        <option value="false">Crédito</option>
                      </Input>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mb-1 small text-muted">
                <span>Subtotal:</span>
                <span className="fw-bold">C$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small text-muted">
                <span>IVA (15%):</span>
                <span className="fw-bold text-danger">C$ {iva.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 bg-primary bg-opacity-10 p-3 rounded-4">
                <h5 className="fw-bold text-dark m-0">Total Final</h5>
                <div className="text-end">
                  <h2 className="fw-bold text-primary m-0">C$ {total.toFixed(2)}</h2>
                  {monedaSeleccionada?.simbolo !== 'C$' && (
                    <div className="text-secondary fw-bold small">
                      {monedaSeleccionada?.simbolo} {totalEnMoneda.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <Button
                color="primary"
                size="lg"
                block
                className="w-100 py-3 fw-bold shadow-lg rounded-pill"
                onClick={procesarVenta}
                disabled={carrito.length === 0 || loading || !!ventaExitosa}
              >
                {loading ? (
                  'Validando...'
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" /> COBRAR AHORA
                  </span>
                )}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* MODAL NUEVO CLIENTE */}
      <Modal isOpen={showClienteModal} toggle={() => setShowClienteModal(!showClienteModal)} centered>
        <ModalHeader
          toggle={() => setShowClienteModal(!showClienteModal)}
          className="bg-primary text-white border-0 py-3 text-center w-100"
        >
          <div className="w-100 text-center">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Registrar Nuevo Cliente
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-muted text-uppercase">Cédula</Label>
                  <Input
                    value={nuevoCliente.cedula}
                    placeholder="281-XXXXXX-XXXXX"
                    className="bg-light border-0"
                    onChange={e => setNuevoCliente({ ...nuevoCliente, cedula: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-muted text-uppercase">Nombre Completo</Label>
                  <Input
                    value={nuevoCliente.nombre}
                    placeholder="Ej. Juan Pérez"
                    className="bg-light border-0"
                    onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-muted text-uppercase">
                    <FontAwesomeIcon icon={faVenusMars} className="me-1" /> Género
                  </Label>
                  <Input
                    type="select"
                    value={nuevoCliente.genero}
                    className="bg-light border-0"
                    onChange={e => setNuevoCliente({ ...nuevoCliente, genero: e.target.value as GeneroEnum })}
                  >
                    <option value={GeneroEnum.MASCULINO}>Masculino</option>
                    <option value={GeneroEnum.FEMENINO}>Femenino</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-muted text-uppercase">Teléfono</Label>
                  <Input
                    value={nuevoCliente.telefono || ''}
                    placeholder="8888-8888"
                    className="bg-light border-0"
                    onChange={e => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label className="small fw-bold text-muted text-uppercase">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> Dirección
              </Label>
              <Input
                type="textarea"
                value={nuevoCliente.direccion || ''}
                placeholder="Dirección exacta del cliente..."
                className="bg-light border-0"
                rows={2}
                onChange={e => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="border-0 bg-light rounded-bottom-4">
          <Button color="link" className="text-muted text-decoration-none" onClick={() => setShowClienteModal(false)}>
            CANCELAR
          </Button>
          <Button color="primary" className="px-5 fw-bold rounded-pill shadow-sm" onClick={guardarNuevoCliente}>
            GUARDAR
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL TICKET EXITOSO */}
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
                <h2 style={{ margin: '0' }}>FERRONICA</h2>
                <p style={{ margin: '0', fontSize: '12px' }}>Ferretería & Suministros</p>
                <p style={{ margin: '0', fontSize: '10px' }}>RUC: 0000000000000</p>
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
                <p style={{ margin: '2px 0' }}>IVA (15%): C$ {ventaExitosa?.iva?.toFixed(2)}</p>
                <h3 style={{ margin: '5px 0' }}>TOTAL: C$ {ventaExitosa?.total?.toFixed(2)}</h3>
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
    </div>
  );
};

export default NuevaVenta;
