import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col, Table, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faPlus, faTrash, faBoxes, faShoppingCart, faClipboardList, faBarcode, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import UsuarioService from 'app/services/usuario.service';
import { IUsuario } from 'app/shared/model/usuario.model';
import { IIngreso } from 'app/shared/model/ingreso.model';
import { IDetalleIngreso } from 'app/shared/model/detalle-ingreso.model';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IProveedor } from 'app/shared/model/proveedor.model';
import IngresoService from 'app/services/ingreso.service';
import ArticuloService from 'app/services/articulo.service';
import ProveedorService from 'app/services/proveedor.service';

export const IngresoUpdate = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = account?.authorities?.includes(AUTHORITIES.ADMIN);
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);

  // Estado del formulario
  const [proveedorId, setProveedorId] = useState<string>('');
  const [noDocumento, setNoDocumento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<IDetalleIngreso[]>([]);

  // Estado para agregar un producto al detalle
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [cambiarPrecio, setCambiarPrecio] = useState(false);

  useEffect(() => {
    ProveedorService.getAll().then(res => setProveedores(res.data));
    ArticuloService.getAll().then(res => setArticulos(res.data));

    if (account?.id) {
      UsuarioService.getByKeycloakId(account.id).then(res => {
        if (res.data.length > 0) setUsuarioActual(res.data[0]);
      });
    }
  }, [account]);

  const agregarDetalle = async () => {
    if (!articuloSeleccionado || cantidad <= 0 || costoUnitario < 0) {
      toast.error('Por favor complete los datos del producto correctamente');
      return;
    }

    const articulo = articulos.find(a => a.id?.toString() === articuloSeleccionado);
    if (!articulo) return;

    const existe = detalles.find(d => d.articulo?.id === articulo.id);
    if (existe) {
      toast.warning('Este producto ya está en la lista de la compra');
      return;
    }

    if (cambiarPrecio) {
      try {
        await ArticuloService.update({ ...articulo, costo: costoUnitario, precio: precioVenta });
        articulo.costo = costoUnitario;
        articulo.precio = precioVenta;
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
    setCantidad(1);
    setCostoUnitario(0);
    setPrecioVenta(0);
    setCambiarPrecio(false);
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
      toast.error('Complete el proveedor, el número de documento y agregue al menos un producto');
      return;
    }

    const nuevoIngreso: any = {
      noDocumento,
      observaciones,
      total: calcularTotal(),
      activo: true,
      proveedor: { id: parseInt(proveedorId, 10) },
      usuario: usuarioActual,
      detalles: detalles.map(d => ({
        articulo: { id: d.articulo?.id },
        cantidad: d.cantidad,
        costoUnitario: d.costoUnitario,
        monto: d.monto,
      })),
    };

    try {
      await IngresoService.create(nuevoIngreso);
      toast.success('Stock actualizado exitosamente.');
      navigate('/bodeguero/ingresos');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">
            <FontAwesomeIcon icon={faBoxes} className="me-2 text-primary" />
            Actualizar Stock
          </h4>
          <p className="text-muted small m-0">Incremente las existencias de productos ya registrados</p>
        </div>
        <Button color="dark" size="sm" outline className="fw-bold px-3" onClick={() => navigate('/bodeguero/ingresos')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver al Historial
        </Button>
      </div>

      <Row>
        <Col md="4">
          <Card className="shadow-sm border-0 mb-3">
            <CardBody>
              <h6 className="fw-bold border-bottom pb-2">Datos Generales</h6>
              <Form onSubmit={handleSave}>
                <FormGroup>
                  <Label for="proveedor" className="small fw-bold">
                    <FontAwesomeIcon icon={faPlus} className="me-1 text-primary small" /> Proveedor
                  </Label>
                  <Input type="select" id="proveedor" value={proveedorId} onChange={e => setProveedorId(e.target.value)} required className="form-select-sm">
                    <option value="">Seleccione un proveedor...</option>
                    {proveedores.filter(p => p.activo).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="noDocumento" className="small fw-bold">
                    <FontAwesomeIcon icon={faClipboardList} className="me-1 text-primary small" /> No. Factura / Documento
                  </Label>
                  <Input
                    type="text"
                    id="noDocumento"
                    placeholder="Ej: FAC-12345"
                    value={noDocumento}
                    onChange={e => setNoDocumento(e.target.value)}
                    required
                    className="form-control-sm"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="observaciones" className="small fw-bold">Observaciones</Label>
                  <Input
                    type="textarea"
                    id="observaciones"
                    rows="3"
                    value={observaciones || ''}
                    onChange={e => setObservaciones(e.target.value)}
                  />
                </FormGroup>
                <div className="p-3 bg-primary bg-opacity-10 rounded text-center mb-3">
                  <span className="text-dark fw-bold me-2 fs-6">TOTAL COMPRA:</span>
                  <span className="fw-bold text-primary fs-4">C$ {calcularTotal().toLocaleString()}</span>
                </div>
                <Button color="primary" block type="submit" className="fw-bolder shadow-sm py-3 fs-7">
                  <FontAwesomeIcon icon={faSave} className="me-3" /> PROCESAR ACTUALIZACIÓN
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md="8">
          <Card className="shadow-sm border-0 mb-3">
            <CardBody>
              <h6 className="fw-bold border-bottom pb-2">
                <FontAwesomeIcon icon={faBoxes} className="me-2 text-primary" />
                Añadir Productos al Inventario
              </h6>

              <Row className="mb-3 g-2 align-items-end">
                <Col md="6" className="mb-2">
                  <Label className="small fw-bold">Buscar Producto Existente</Label>
                  <Input
                    type="select"
                    value={articuloSeleccionado}
                    onChange={e => {
                      setArticuloSeleccionado(e.target.value);
                      const art = articulos.find(a => a.id?.toString() === e.target.value);
                      if (art) {
                        setCostoUnitario(art.costo || 0);
                        setPrecioVenta(art.precio || 0);
                      }
                    }}
                    className="form-select-sm"
                  >
                    <option value="">Seleccione un producto...</option>
                    {articulos.filter(a => a.activo).map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md="3" className="mb-2">
                  <Label className="small fw-bold">Código</Label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light"><FontAwesomeIcon icon={faBarcode} /></span>
                    <Input
                      type="text"
                      readOnly
                      placeholder="----"
                      value={articulos.find(a => a.id?.toString() === articuloSeleccionado)?.codigo || ''}
                      className="bg-white fw-bold text-dark border-start-0"
                    />
                  </div>
                </Col>
                <Col md="3" className="mb-2">
                  <Label className="small fw-bold">Stock Actual</Label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light text-primary"><FontAwesomeIcon icon={faBoxOpen} /></span>
                    <Input
                      type="text"
                      readOnly
                      placeholder="0"
                      value={articulos.find(a => a.id?.toString() === articuloSeleccionado)?.existencia || ''}
                      className="bg-white fw-bold text-primary border-start-0"
                    />
                  </div>
                </Col>

                <Col md="3">
                  <Label className="small fw-bold">Cantidad</Label>
                  <Input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value, 10))} />
                </Col>
                <Col md="3">
                  <Label className="small fw-bold">Costo Unitario</Label>
                  <Input type="number" step="0.01" value={costoUnitario} onChange={e => setCostoUnitario(parseFloat(e.target.value))} />
                </Col>
                <Col md="4">
                  {isAdmin && (
                    <>
                      <FormGroup check className="mb-2">
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
                        />
                      )}
                    </>
                  )}
                </Col>
                <Col md="2">
                  <Button color="primary" block onClick={agregarDetalle} className="fw-bold">
                    <FontAwesomeIcon icon={faPlus} className="me-1" /> Añadir
                  </Button>
                </Col>
              </Row>

              <Table responsive size="sm" hover className="mt-3">
                <thead className="table-dark small">
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-end">Costo Unit.</th>
                    <th className="text-end">Monto</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.length > 0 ? (
                    detalles.map((d, index) => (
                      <tr key={index} className="align-middle">
                        <td className="small">{d.articulo?.codigo}</td>
                        <td className="fw-bold">{d.articulo?.nombre}</td>
                        <td className="text-center">
                          <Badge color="info" pill>{d.cantidad}</Badge>
                        </td>
                        <td className="text-end text-muted small">C$ {d.costoUnitario?.toLocaleString()}</td>
                        <td className="text-end fw-bold">C$ {d.monto?.toLocaleString()}</td>
                        <td className="text-center">
                          <Button color="danger" size="sm" outline onClick={() => eliminarDetalle(index)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted small italic">
                        No hay productos agregados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IngresoUpdate;
