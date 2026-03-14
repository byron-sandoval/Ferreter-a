import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col, Table, Badge, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faArrowLeft,
  faPlus,
  faTrash,
  faShoppingCart,
  faClipboardList,
  faPlusCircle,
  faBarcode,
  faBoxes,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import UsuarioService from 'app/services/usuario.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { IIngreso } from 'app/shared/model/ingreso.model';
import { IDetalleIngreso } from 'app/shared/model/detalle-ingreso.model';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IProveedor } from 'app/shared/model/proveedor.model';
import { ICategoria } from 'app/shared/model/categoria.model';
import { IUnidadMedida } from 'app/shared/model/unidad-medida.model';
import IngresoService from 'app/services/ingreso.service';
import ArticuloService from 'app/services/articulo.service';
import ProveedorService from 'app/services/proveedor.service';
import CategoriaService from 'app/services/categoria.service';
import UnidadMedidaService from 'app/services/unidad-medida.service';

export const IngresoNuevaCompra = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = account?.authorities?.includes(AUTHORITIES.ADMIN);
  const isJefeBodega = account?.authorities?.includes(AUTHORITIES.JEFE_BODEGA);
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [unidades, setUnidades] = useState<IUnidadMedida[]>([]);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);

  // Estado del ingreso principal
  const [proveedorId, setProveedorId] = useState<string>('');
  const [noDocumento, setNoDocumento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<IDetalleIngreso[]>([]);

  // UI Unificada Tabs
  const [tipoIngreso, setTipoIngreso] = useState<'existente' | 'nuevo'>('existente');

  // Estado Proveedor
  const [isProveedorOpen, setIsProveedorOpen] = useState(false);
  const [searchProveedorTerm, setSearchProveedorTerm] = useState('');

  // --- ESTADO PARA EXISTENTE ---
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cambiarPrecio, setCambiarPrecio] = useState(false);

  // --- ESTADO PARA NUEVO ---
  const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
  const [searchCategoriaTerm, setSearchCategoriaTerm] = useState('');
  const [isUnidadOpen, setIsUnidadOpen] = useState(false);
  const [searchUnidadTerm, setSearchUnidadTerm] = useState('');

  const [nombreNuevo, setNombreNuevo] = useState('');
  const [codigoNuevo, setCodigoNuevo] = useState('');
  const [descripcionNuevo, setDescripcionNuevo] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [unidadId, setUnidadId] = useState<string>('');
  const [existenciaMinima, setExistenciaMinima] = useState<number>(5);

  // --- ESTADO COMPARTIDO ---
  const [cantidad, setCantidad] = useState<number>(1);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);

  useEffect(() => {
    ProveedorService.getAll().then(res => setProveedores(res.data));
    CategoriaService.getAll().then(res => setCategorias(res.data));
    UnidadMedidaService.getAll().then(res => setUnidades(res.data));
    ArticuloService.getAll().then(res => setArticulos(res.data));

    if (account?.id) {
      UsuarioService.getByKeycloakId(account.id).then(res => {
        if (res.data.length > 0) setUsuarioActual(res.data[0]);
      });
    }
  }, [account]);

  // Limpiar campos compartidos al cambiar de pestaña
  useEffect(() => {
    setCantidad(1);
    setCostoUnitario(0);
    setPrecioVenta(0);
    setCambiarPrecio(false);
    setArticuloSeleccionado('');
    setNombreNuevo('');
    setCodigoNuevo('');
    setDescripcionNuevo('');
  }, [tipoIngreso]);

  const agregarDetalle = async () => {
    if (tipoIngreso === 'existente') {
      if (!articuloSeleccionado || cantidad <= 0 || costoUnitario < 0) {
        toast.error('Complete correctamente los datos del producto');
        return;
      }

      const articulo = articulos.find(a => a.id?.toString() === articuloSeleccionado);
      if (!articulo) return;

      const duplicado = detalles.find(d => d.articulo?.id === articulo.id);
      if (duplicado) {
        toast.warning('Este producto ya está en la lista de la compra');
        return;
      }

      if (cambiarPrecio) {
        try {
          await ArticuloService.update({ ...articulo, costo: costoUnitario, precio: precioVenta });
          articulo.costo = costoUnitario;
          articulo.precio = precioVenta;
          toast.success('Precio del producto actualizado.');
        } catch (err) {
          toast.error('Error al actualizar precio del producto');
        }
      }

      const nuevoDetalle: IDetalleIngreso = {
        articulo,
        cantidad,
        costoUnitario,
        monto: cantidad * costoUnitario,
      };

      setDetalles([...detalles, nuevoDetalle]);
      setArticuloSeleccionado('');
      setSearchTerm('');
      setCantidad(1);
      setCostoUnitario(0);
      setPrecioVenta(0);
      setCambiarPrecio(false);
      toast.info('Producto  añadido a la factura');
    } else {
      // Producto Nuevo
      if (!nombreNuevo || !codigoNuevo || cantidad <= 0 || costoUnitario < 0 || precioVenta < 0) {
        toast.error('Por favor complete todos los datos del producto');
        return;
      }

      const duplicadoLista = detalles.find(d => d.articulo?.codigo === codigoNuevo);
      if (duplicadoLista) {
        toast.warning('Este código ya está en la factura actual');
        return;
      }

      const duplicadoBD = articulos.find(a => a.codigo === codigoNuevo);
      if (duplicadoBD) {
        toast.warning('Este código ya existe en el catálogo. Seleccione la opción "Producto Existente".');
        return;
      }

      const nuevoArt: IArticulo = {
        nombre: nombreNuevo,
        codigo: codigoNuevo,
        descripcion: descripcionNuevo,
        costo: costoUnitario,
        precio: precioVenta,
        existencia: 0,
        existenciaMinima,
        activo: true,
        categoria: categoriaId
          ? { id: parseInt(categoriaId, 10), nombre: categorias.find(c => c.id === parseInt(categoriaId, 10))?.nombre }
          : null,
        unidadMedida: unidadId ? { id: parseInt(unidadId, 10), nombre: unidades.find(u => u.id === parseInt(unidadId, 10))?.nombre } : null,
      };

      const nuevoDetalle: IDetalleIngreso = {
        articulo: nuevoArt,
        cantidad,
        costoUnitario,
        monto: cantidad * costoUnitario,
      };

      setDetalles([...detalles, nuevoDetalle]);

      setNombreNuevo('');
      setCodigoNuevo('');
      setDescripcionNuevo('');
      setExistenciaMinima(5);
      setPrecioVenta(0);
      setCantidad(1);
      setCostoUnitario(0);
      toast.info('Nuevo producto añadido a la factura');
    }
  };

  const eliminarDetalle = (index: number) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles.splice(index, 1);
    setDetalles(nuevosDetalles);
  };

  const calcularTotal = () => {
    return detalles.reduce((acc, curr) => acc + (curr.monto || 0), 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorId || !noDocumento || detalles.length === 0) {
      toast.error('Complete proveedor, factura y añada al menos un producto');
      return;
    }

    toast.info('Procesando factura y stock...', { autoClose: false, toastId: 'saving' });

    try {
      const detallesFinalizados: any[] = [];

      // 1. Guardar primero los artículos que aún no tienen ID (Los Nuevos)
      for (const d of detalles) {
        try {
          if (!d.articulo?.id) {
            const res = await ArticuloService.create(d.articulo);
            detallesFinalizados.push({
              articulo: { id: res.data.id },
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
              monto: d.monto,
            });
          } else {
            // Ya existe en BD
            detallesFinalizados.push({
              articulo: { id: d.articulo.id },
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
              monto: d.monto,
            });
          }
        } catch (errArt) {
          toast.dismiss('saving');
          toast.error(`Error al crear producto nuevo: ${d.articulo?.nombre}. Revisar el código.`);
          return;
        }
      }

      // 2. Crear y finalizar la factura completa
      const nuevoIngreso: any = {
        noDocumento,
        observaciones,
        total: calcularTotal(),
        activo: true,
        proveedor: { id: parseInt(proveedorId, 10) },
        usuario: usuarioActual,
        detalles: detallesFinalizados,
      };

      await IngresoService.create(nuevoIngreso);
      toast.dismiss('saving');
      toast.success('Compra registrada y stock actualizado con éxito.');
      navigate('/bodeguero/ingresos');
    } catch (error) {
      toast.dismiss('saving');
      console.error(error);
      toast.error('Error al procesar la factura');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">
            <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
            Registro de Nueva Compra
          </h4>
          <p className="text-muted small m-0">Ingrese facturas agrupando productos nuevos y ya existentes.</p>
        </div>
        <Button color="dark" size="sm" outline className="fw-bold px-3" onClick={() => navigate('/bodeguero/ingresos')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver
        </Button>
      </div>

      <Row>
        <Col md="4">
          <Card className="shadow-sm border-0 mb-3">
            <CardBody>
              <h6 className="fw-bold border-bottom pb-2">Datos de Facturación</h6>
              <Form onSubmit={handleSave}>
                <FormGroup className="position-relative">
                  <Label className="small fw-bold">Proveedor</Label>
                  <div
                    className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                    style={{ cursor: 'pointer', minHeight: '31px' }}
                    onClick={() => setIsProveedorOpen(!isProveedorOpen)}
                  >
                    <span className="text-truncate">
                      {proveedores.find(p => p.id?.toString() === proveedorId)?.nombre || 'Seleccione un proveedor...'}
                    </span>
                    <small className="text-muted">▼</small>
                  </div>

                  {isProveedorOpen && (
                    <div className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2" style={{ zIndex: 1050 }}>
                      <Input
                        autoFocus
                        type="text"
                        placeholder="Escriba para buscar..."
                        value={searchProveedorTerm}
                        onChange={e => setSearchProveedorTerm(e.target.value)}
                        className="form-control-sm mb-2"
                        onClick={e => e.stopPropagation()}
                      />

                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {proveedores
                          .filter(p => p.activo && p.nombre?.toLowerCase().includes(searchProveedorTerm.toLowerCase()))
                          .map(p => (
                            <div
                              key={p.id}
                              className="p-2 border-bottom small product-item-hover-selector"
                              style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                              onClick={() => {
                                setProveedorId(p.id.toString());
                                setIsProveedorOpen(false);
                                setSearchProveedorTerm('');
                              }}
                            >
                              <div className="fw-bold">{p.nombre}</div>
                            </div>
                          ))}
                      </div>

                      <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                        onClick={e => {
                          e.stopPropagation();
                          setIsProveedorOpen(false);
                        }}
                      />
                    </div>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-bold">No. Factura</Label>
                  <Input
                    type="text"
                    placeholder="Ej: FAC-001"
                    value={noDocumento}
                    onChange={e => setNoDocumento(e.target.value)}
                    required
                    bsSize="sm"
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="small fw-bold">Observaciones</Label>
                  <Input
                    type="textarea"
                    rows="2"
                    value={observaciones || ''}
                    onChange={e => setObservaciones(e.target.value)}
                    bsSize="sm"
                  />
                </FormGroup>
                <div className="p-3 bg-primary bg-opacity-10 rounded text-center mb-3">
                  <span className="text-dark fw-bold me-2 fs-6">TOTAL A PAGAR:</span>
                  <span className="fw-bold text-primary fs-4">C$ {calcularTotal().toLocaleString()}</span>
                </div>
                <Button color="primary" block type="submit" className="fw-bolder shadow-sm py-3">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  REALIZAR COMPRA
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md="8">
          {!(isAdmin || isJefeBodega) ? (
            <Card className="shadow-sm border-0 mb-3 text-center p-5">
              <CardBody>
                <FontAwesomeIcon icon={faShoppingCart} size="4x" className="text-muted mb-4 opacity-25" />
                <h4 className="fw-bold">Acceso Denegado</h4>
                <p className="text-muted">No tiene permisos para ingresar facturas.</p>
              </CardBody>
            </Card>
          ) : (
            <Card className="shadow-sm border-0 mb-3">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold m-0 border-bottom pb-2 w-100 text-primary">
                    <FontAwesomeIcon icon={faBoxes} className="me-2" />
                    Añadir Productos a la Factura
                  </h6>
                </div>
                <Row className="mb-4">
                  <Col md="12">
                    <ButtonGroup className="w-100 shadow-sm">
                      <Button
                        color={tipoIngreso === 'existente' ? 'primary' : 'light'}
                        onClick={() => setTipoIngreso('existente')}
                        className="fw-bold border"
                        style={{ transition: 'all 0.2s' }}
                      >
                        <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                        Actualizar Stock
                      </Button>
                      <Button
                        color={tipoIngreso === 'nuevo' ? 'success' : 'light'}
                        onClick={() => setTipoIngreso('nuevo')}
                        className="fw-bold border"
                        style={{ transition: 'all 0.2s' }}
                      >
                        <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                        Crear Producto Nuevo
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>

                {/* FORMULARIO SEGUN TIPO */}
                {tipoIngreso === 'existente' ? (
                  <div className="p-3 bg-light rounded border border-primary border-opacity-25">
                    <Row className="g-2 align-items-end">
                      <Col md="5" className="position-relative">
                        <Label className="small fw-bold">Seleccionar Producto del Catálogo</Label>
                        <div
                          className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                          style={{ cursor: 'pointer', minHeight: '31px' }}
                          onClick={() => setIsOpen(!isOpen)}
                        >
                          <span className="text-truncate">
                            {articulos.find(a => a.id?.toString() === articuloSeleccionado)?.nombre || 'Seleccione un producto...'}
                          </span>
                          <small className="text-muted">▼</small>
                        </div>

                        {isOpen && (
                          <div className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2" style={{ zIndex: 1050 }}>
                            <Input
                              autoFocus
                              type="text"
                              placeholder="Escriba para buscar..."
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="form-control-sm mb-2"
                              onClick={e => e.stopPropagation()}
                            />
                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                              {articulos
                                .filter(a => a.activo && a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(a => (
                                  <div
                                    key={a.id}
                                    className="p-2 border-bottom small product-item-hover-selector"
                                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    onClick={() => {
                                      setArticuloSeleccionado(a.id.toString());
                                      setCostoUnitario(a.costo || 0);
                                      setPrecioVenta(a.precio || 0);
                                      setIsOpen(false);
                                      setSearchTerm('');
                                    }}
                                  >
                                    <div className="fw-bold">{a.nombre}</div>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                      Cod: {a.codigo} | Stock: {a.existencia}
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <div
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                              onClick={e => {
                                e.stopPropagation();
                                setIsOpen(false);
                              }}
                            />
                          </div>
                        )}
                      </Col>
                      <Col md="3">
                        <Label className="small fw-bold">Código</Label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light">
                            <FontAwesomeIcon icon={faBarcode} />
                          </span>
                          <Input
                            type="text"
                            readOnly
                            placeholder="----"
                            value={articulos.find(a => a.id?.toString() === articuloSeleccionado)?.codigo || ''}
                            className="bg-white fw-bold text-dark border-start-0"
                          />
                        </div>
                      </Col>
                      <Col md="2">
                        <Label className="small fw-bold">Stock Actual</Label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-primary">
                            <FontAwesomeIcon icon={faBoxOpen} />
                          </span>
                          <Input
                            type="text"
                            readOnly
                            placeholder="0"
                            value={articulos.find(a => a.id?.toString() === articuloSeleccionado)?.existencia || ''}
                            className="bg-white fw-bold text-primary border-start-0"
                          />
                        </div>
                      </Col>
                      <Col md="2">
                        <Label className="small fw-bold">Cant. Entrante</Label>
                        <Input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={e => setCantidad(parseInt(e.target.value, 10))}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="2" className="mt-2">
                        <Label className="small fw-bold">Costo Und.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={costoUnitario}
                          onChange={e => setCostoUnitario(parseFloat(e.target.value))}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="2" className="mt-2">
                        <Label className="small fw-bold text-muted">Venta Actual</Label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-success">C$</span>
                          <Input
                            type="text"
                            readOnly
                            value={articulos.find(a => a.id?.toString() === articuloSeleccionado)?.precio || '0'}
                            className="bg-white fw-bold text-success border-start-0"
                          />
                        </div>
                      </Col>
                      <Col md="5" className="mt-2 d-flex align-items-center">
                        {articuloSeleccionado && costoUnitario > 0 && (
                          <div className="w-100">
                            {(() => {
                              const art = articulos.find(a => a.id?.toString() === articuloSeleccionado);
                              if (!art || !art.precio) return null;
                              const margenAmt = art.precio - costoUnitario;
                              const percent = (margenAmt / art.precio) * 100;

                              if (percent < 15) {
                                return (
                                  <Badge color="danger" className="w-100 py-2 d-flex align-items-center justify-content-center">
                                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                    Margen Crítico: {percent.toFixed(1)}% {percent <= 0 ? '(PÉRDIDA)' : '(Revisar)'}
                                  </Badge>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </Col>
                      <Col md="6" className="mt-2">
                        {isAdmin && (
                          <div className="d-flex align-items-center h-100">
                            <FormGroup check className="mb-0 me-3">
                              <Label check className="small fw-bold">
                                <Input type="checkbox" checked={cambiarPrecio} onChange={e => setCambiarPrecio(e.target.checked)} />{' '}
                                ¿Actualizar precios?
                              </Label>
                            </FormGroup>
                            {cambiarPrecio && (
                              <Input
                                type="number"
                                placeholder="Nuevo precio venta"
                                value={precioVenta}
                                onChange={e => setPrecioVenta(parseFloat(e.target.value))}
                                bsSize="sm"
                                style={{ maxWidth: '150px' }}
                              />
                            )}
                          </div>
                        )}
                      </Col>
                      <Col md="3" className="mt-2">
                        <Button color="primary" block onClick={agregarDetalle} className="fw-bold btn-sm">
                          <FontAwesomeIcon icon={faPlus} className="me-1" /> Añadir a la Lista
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded border border-success border-opacity-25">
                    <Row className="g-2">
                      <Col md="8">
                        <Label className="small fw-bold">Nombre del Producto Nuevo</Label>
                        <Input
                          placeholder="Ej: Taladro Manual"
                          value={nombreNuevo}
                          onChange={e => setNombreNuevo(e.target.value)}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="4">
                        <Label className="small fw-bold">Código / Barcode</Label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white">
                            <FontAwesomeIcon icon={faBarcode} />
                          </span>
                          <Input placeholder="Código único" value={codigoNuevo} onChange={e => setCodigoNuevo(e.target.value)} />
                        </div>
                      </Col>
                      <Col md="12">
                        <Label className="small fw-bold">Descripción (Opcional)</Label>
                        <Input
                          type="textarea"
                          rows="1"
                          placeholder="Detalles técnicos..."
                          value={descripcionNuevo || ''}
                          onChange={e => setDescripcionNuevo(e.target.value)}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="6">
                        <Label className="small fw-bold">Categoría</Label>
                        <div className="position-relative">
                          <div
                            className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                            style={{ cursor: 'pointer', minHeight: '31px' }}
                            onClick={() => setIsCategoriaOpen(!isCategoriaOpen)}
                          >
                            <span className="text-truncate">
                              {categorias.find(c => c.id?.toString() === categoriaId)?.nombre || 'Seleccione...'}
                            </span>
                            <small className="text-muted">▼</small>
                          </div>

                          {isCategoriaOpen && (
                            <div className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2" style={{ zIndex: 1050 }}>
                              <Input
                                autoFocus
                                type="text"
                                placeholder="Buscar categoría..."
                                value={searchCategoriaTerm}
                                onChange={e => setSearchCategoriaTerm(e.target.value)}
                                className="form-control-sm mb-2"
                                onClick={e => e.stopPropagation()}
                              />
                              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {categorias
                                  .filter(c => c.activo !== false && c.nombre?.toLowerCase().includes(searchCategoriaTerm.toLowerCase()))
                                  .map(c => (
                                    <div
                                      key={c.id}
                                      className="p-2 border-bottom small product-item-hover-selector"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        setCategoriaId(c.id.toString());
                                        setIsCategoriaOpen(false);
                                        setSearchCategoriaTerm('');
                                      }}
                                    >
                                      {c.nombre}
                                    </div>
                                  ))}
                              </div>
                              <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setIsCategoriaOpen(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md="6">
                        <Label className="small fw-bold">Unidad Medida</Label>
                        <div className="position-relative">
                          <div
                            className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                            style={{ cursor: 'pointer', minHeight: '31px' }}
                            onClick={() => setIsUnidadOpen(!isUnidadOpen)}
                          >
                            <span className="text-truncate">
                              {unidades.find(u => u.id?.toString() === unidadId)?.nombre || 'Seleccione...'}
                            </span>
                            <small className="text-muted">▼</small>
                          </div>

                          {isUnidadOpen && (
                            <div className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2" style={{ zIndex: 1050 }}>
                              <Input
                                autoFocus
                                type="text"
                                placeholder="Buscar unidad..."
                                value={searchUnidadTerm}
                                onChange={e => setSearchUnidadTerm(e.target.value)}
                                className="form-control-sm mb-2"
                                onClick={e => e.stopPropagation()}
                              />
                              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {unidades
                                  .filter(u => u.activo !== false && u.nombre?.toLowerCase().includes(searchUnidadTerm.toLowerCase()))
                                  .map(u => (
                                    <div
                                      key={u.id}
                                      className="p-2 border-bottom small product-item-hover-selector"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        setUnidadId(u.id.toString());
                                        setIsUnidadOpen(false);
                                        setSearchUnidadTerm('');
                                      }}
                                    >
                                      {u.nombre}
                                    </div>
                                  ))}
                              </div>
                              <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setIsUnidadOpen(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md="2">
                        <Label className="small fw-bold">Stock Mín.</Label>
                        <Input
                          type="number"
                          min="0"
                          value={existenciaMinima}
                          onChange={e => setExistenciaMinima(parseInt(e.target.value, 10))}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="2">
                        <Label className="small fw-bold">Cant. Compra</Label>
                        <Input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={e => setCantidad(parseInt(e.target.value, 10))}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="4">
                        <Label className="small fw-bold">Costo Unitario</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={costoUnitario}
                          onChange={e => setCostoUnitario(parseFloat(e.target.value))}
                          bsSize="sm"
                        />
                      </Col>
                      <Col md="4">
                        <Label className="small fw-bold">Precio (Venta)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={precioVenta}
                          onChange={e => setPrecioVenta(parseFloat(e.target.value))}
                          bsSize="sm"
                          readOnly={!isAdmin}
                          className={!isAdmin ? 'bg-light text-muted' : ''}
                        />
                      </Col>
                      <Col md="12" className="mt-3">
                        <Button color="success" block onClick={agregarDetalle} className="fw-bold btn-sm shadow-sm">
                          <FontAwesomeIcon icon={faPlus} className="me-1" /> Registrar Nuevo Producto
                        </Button>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* TABLA COMPARTIDA */}
                <Table responsive size="sm" hover className="mt-4 border">
                  <thead className="table-dark small">
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-end">Costo Unit.</th>
                      {(isAdmin || isJefeBodega) && <th className="text-end">Monto</th>}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.length > 0 ? (
                      detalles.map((d, index) => (
                        <tr key={index} className="align-middle">
                          <td className="small text-muted">{d.articulo?.codigo}</td>
                          <td className="fw-bold text-dark">{d.articulo?.nombre}</td>
                          <td className="text-center">
                            <Badge color="secondary" pill bg="light" className="text-dark border">
                              {d.cantidad}
                            </Badge>
                          </td>
                          <td className="text-end text-muted">C$ {d.costoUnitario?.toLocaleString()}</td>
                          {(isAdmin || isJefeBodega) && <td className="text-end fw-bold">C$ {d.monto?.toLocaleString()}</td>}
                          <td className="text-center">
                            <Button color="danger" size="sm" outline onClick={() => eliminarDetalle(index)} className="border-0">
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin || isJefeBodega ? 6 : 5} className="text-center py-4 text-muted fst-italic">
                          No hay productos añadidos a esta factura.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default IngresoNuevaCompra;
