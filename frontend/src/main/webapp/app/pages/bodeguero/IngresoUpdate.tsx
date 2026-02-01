import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col, Table, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faPlus, faTrash, faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { IIngreso } from 'app/shared/model/ingreso.model';
import { IDetalleIngreso } from 'app/shared/model/detalle-ingreso.model';
import { IArticulo } from 'app/shared/model/articulo.model';
import { IProveedor } from 'app/shared/model/proveedor.model';
import IngresoService from 'app/services/ingreso.service';
import ArticuloService from 'app/services/articulo.service';
import ProveedorService from 'app/services/proveedor.service';

export const IngresoUpdate = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [articulos, setArticulos] = useState<IArticulo[]>([]);

  // Estado del formulario
  const [proveedorId, setProveedorId] = useState<string>('');
  const [noDocumento, setNoDocumento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<IDetalleIngreso[]>([]);

  // Estado para agregar un producto al detalle
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);

  useEffect(() => {
    // Cargar proveedores y artículos
    ProveedorService.getAll().then(res => setProveedores(res.data));
    ArticuloService.getAll().then(res => setArticulos(res.data));
  }, []);

  const agregarDetalle = () => {
    if (!articuloSeleccionado || cantidad <= 0 || costoUnitario < 0) {
      toast.error('Por favor complete los datos del producto correctamente');
      return;
    }

    const articulo = articulos.find(a => a.id?.toString() === articuloSeleccionado);
    if (!articulo) return;

    // Verificar si ya existe en la lista
    const existe = detalles.find(d => d.articulo?.id === articulo.id);
    if (existe) {
      toast.warning('Este producto ya está en la lista de la compra');
      return;
    }

    const nuevoDetalle: IDetalleIngreso = {
      articulo,
      cantidad,
      costoUnitario,
      monto: cantidad * costoUnitario,
    };

    setDetalles([...detalles, nuevoDetalle]);
    // Limpiar campos
    setArticuloSeleccionado('');
    setCantidad(1);
    setCostoUnitario(0);
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
      vendedor: null, // Podría ser el usuario logueado
      detalles: detalles.map(d => ({
        articulo: { id: d.articulo?.id },
        cantidad: d.cantidad,
        costoUnitario: d.costoUnitario,
        monto: d.monto,
      })),
    };

    try {
      await IngresoService.create(nuevoIngreso);
      toast.success('Compra registrada exitosamente. El stock ha sido actualizado.');
      navigate('/bodeguero/ingresos');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar la compra');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-dark m-0">
          <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
          Nueva Compra (Ingreso de Mercancía)
        </h4>
        <Button color="secondary" size="sm" outline onClick={() => navigate('/bodeguero/ingresos')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver
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
                    Proveedor
                  </Label>
                  <Input type="select" id="proveedor" value={proveedorId} onChange={e => setProveedorId(e.target.value)} required>
                    <option value="">Seleccione un proveedor...</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="noDocumento" className="small fw-bold">
                    No. Factura / Documento
                  </Label>
                  <Input
                    type="text"
                    id="noDocumento"
                    placeholder="Ej: FAC-12345"
                    value={noDocumento}
                    onChange={e => setNoDocumento(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="observaciones" className="small fw-bold">
                    Observaciones
                  </Label>
                  <Input
                    type="textarea"
                    id="observaciones"
                    rows="3"
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                  />
                </FormGroup>
                <div className="p-3 bg-primary bg-opacity-10 rounded text-center mb-3">
                  <small className="text-muted d-block fw-bold text-uppercase">Total de la Compra</small>
                  <h3 className="fw-bold text-primary m-0">C$ {calcularTotal().toLocaleString()}</h3>
                </div>
                <Button color="success" block type="submit" className="fw-bold shadow-sm">
                  <FontAwesomeIcon icon={faSave} className="me-2" /> Procesar Compra
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md="8">
          <Card className="shadow-sm border-0 mb-3">
            <CardBody>
              <h6 className="fw-bold border-bottom pb-2">Agregar Productos al Detalle</h6>
              <Row className="mb-3 g-2 align-items-end">
                <Col md="5">
                  <Label className="small fw-bold">Producto</Label>
                  <Input
                    type="select"
                    value={articuloSeleccionado}
                    onChange={e => {
                      setArticuloSeleccionado(e.target.value);
                      const art = articulos.find(a => a.id?.toString() === e.target.value);
                      if (art) setCostoUnitario(art.costo || 0);
                    }}
                  >
                    <option value="">Buscar producto...</option>
                    {articulos.map(a => (
                      <option key={a.id} value={a.id}>
                        ({a.codigo}) {a.nombre}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md="2">
                  <Label className="small fw-bold">Cant.</Label>
                  <Input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value, 10))} />
                </Col>
                <Col md="3">
                  <Label className="small fw-bold">Costo Unit.</Label>
                  <Input type="number" step="0.01" value={costoUnitario} onChange={e => setCostoUnitario(parseFloat(e.target.value))} />
                </Col>
                <Col md="2">
                  <Button color="primary" block onClick={agregarDetalle}>
                    <FontAwesomeIcon icon={faPlus} />
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
                          <Badge color="info" outline>
                            {d.cantidad}
                          </Badge>
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
                        No hay productos agregados a esta compra todavía.
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
