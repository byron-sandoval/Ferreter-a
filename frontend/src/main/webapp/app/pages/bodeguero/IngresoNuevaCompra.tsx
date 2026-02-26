import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col, Table, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faPlus, faTrash, faShoppingCart, faClipboardList, faPlusCircle, faBarcode } from '@fortawesome/free-solid-svg-icons';
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
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState<IProveedor[]>([]);
    const [usuarioActual, setUsuarioActual] = useState<IUsuario | null>(null);
    const [categorias, setCategorias] = useState<ICategoria[]>([]);
    const [unidades, setUnidades] = useState<IUnidadMedida[]>([]);

    // Estado del ingreso principal
    const [proveedorId, setProveedorId] = useState<string>('');
    const [noDocumento, setNoDocumento] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [detalles, setDetalles] = useState<IDetalleIngreso[]>([]);

    // Estado para Proveedor con búsqueda
    const [isProveedorOpen, setIsProveedorOpen] = useState(false);
    const [searchProveedorTerm, setSearchProveedorTerm] = useState('');

    // Estado para Categoría con búsqueda
    const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
    const [searchCategoriaTerm, setSearchCategoriaTerm] = useState('');

    // Estado para Unidad de Medida con búsqueda
    const [isUnidadOpen, setIsUnidadOpen] = useState(false);
    const [searchUnidadTerm, setSearchUnidadTerm] = useState('');

    // Estado para el nuevo producto que se está armando
    const [nombreNuevo, setNombreNuevo] = useState('');
    const [codigoNuevo, setCodigoNuevo] = useState('');
    const [descripcionNuevo, setDescripcionNuevo] = useState('');
    const [categoriaId, setCategoriaId] = useState<string>('');
    const [unidadId, setUnidadId] = useState<string>('');
    const [existenciaMinima, setExistenciaMinima] = useState<number>(5);
    const [cantidad, setCantidad] = useState<number>(1);
    const [costoUnitario, setCostoUnitario] = useState<number>(0);
    const [precioVenta, setPrecioVenta] = useState<number>(0);

    useEffect(() => {
        ProveedorService.getAll().then(res => setProveedores(res.data));
        CategoriaService.getAll().then(res => setCategorias(res.data));
        UnidadMedidaService.getAll().then(res => setUnidades(res.data));

        if (account?.id) {
            UsuarioService.getByKeycloakId(account.id).then(res => {
                if (res.data.length > 0) setUsuarioActual(res.data[0]);
            });
        }
    }, [account]);

    const agregarDetalle = () => {
        if (!nombreNuevo || !codigoNuevo || cantidad <= 0 || costoUnitario < 0 || precioVenta < 0) {
            toast.error('Por favor complete todos los datos del producto');
            return;
        }

        // 1. Validar que el código no se repita localmente
        const duplicado = detalles.find(d => d.articulo?.codigo === codigoNuevo);
        if (duplicado) {
            toast.warning('Este código ya está en la lista actual');
            return;
        }

        // 2. Preparar el objeto artículo (SIN ID todavía)
        const nuevoArt: IArticulo = {
            nombre: nombreNuevo,
            codigo: codigoNuevo,
            descripcion: descripcionNuevo,
            costo: costoUnitario,
            precio: precioVenta,
            existencia: 0,
            existenciaMinima,
            activo: true,
            categoria: categoriaId ? { id: parseInt(categoriaId, 10), nombre: categorias.find(c => c.id === parseInt(categoriaId, 10))?.nombre } : null,
            unidadMedida: unidadId ? { id: parseInt(unidadId, 10), nombre: unidades.find(u => u.id === parseInt(unidadId, 10))?.nombre } : null,
        };

        // 3. Añadirlo a la lista de detalles temporal
        const nuevoDetalle: IDetalleIngreso = {
            articulo: nuevoArt,
            cantidad,
            costoUnitario,
            monto: cantidad * costoUnitario,
        };

        setDetalles([...detalles, nuevoDetalle]);

        // 4. Limpiar los campos del "constructor"
        setNombreNuevo('');
        setCodigoNuevo('');
        setDescripcionNuevo('');
        setExistenciaMinima(5);
        setPrecioVenta(0);
        setCantidad(1);
        setCostoUnitario(0);

        toast.info('Producto añadido a la lista temporal');
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

        toast.info('Procesando productos y compra...', { autoClose: false, toastId: 'saving' });

        try {
            const detallesFinalizados: any[] = [];

            // 1. Crear CADA artículo de la lista antes de crear el Ingreso
            for (const d of detalles) {
                try {
                    // Solo creamos si no tiene ID (aunque en esta vista todos son nuevos)
                    if (!d.articulo?.id) {
                        const res = await ArticuloService.create(d.articulo!);
                        detallesFinalizados.push({
                            articulo: { id: res.data.id },
                            cantidad: d.cantidad,
                            costoUnitario: d.costoUnitario,
                            monto: d.monto,
                        });
                    } else {
                        detallesFinalizados.push({
                            articulo: { id: d.articulo.id },
                            cantidad: d.cantidad,
                            costoUnitario: d.costoUnitario,
                            monto: d.monto,
                        });
                    }
                } catch (errArt) {
                    toast.dismiss('saving');
                    toast.error(`Error al crear el producto: ${d.articulo?.nombre}. Posible código duplicado.`);
                    return; // Abortamos todo si un producto falla
                }
            }

            // 2. Crear el Ingreso con los artículos ya existentes
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
            toast.success('Compra y productos registrados exitosamente.');
            navigate('/bodeguero/ingresos');
        } catch (error) {
            toast.dismiss('saving');
            toast.error('Error al procesar la compra final');
        }
    };

    return (
        <div className="animate__animated animate__fadeIn p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark m-0">
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-success" />
                        Nueva Compra
                    </h4>
                    <p className="text-muted small m-0">Inscriba nuevos productos en su catálogo mientras realiza la compra</p>
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
                                        <div
                                            className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2"
                                            style={{ zIndex: 1050 }}
                                        >
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
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            onClick={() => {
                                                                setProveedorId(p.id!.toString());
                                                                setIsProveedorOpen(false);
                                                                setSearchProveedorTerm('');
                                                            }}
                                                        >
                                                            <div className="fw-bold">{p.nombre}</div>
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            <div
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                                onClick={(e) => { e.stopPropagation(); setIsProveedorOpen(false); }}
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
                                    <Input type="textarea" rows="2" value={observaciones || ''} onChange={e => setObservaciones(e.target.value)} bsSize="sm" />
                                </FormGroup>
                                <div className="p-3 bg-success bg-opacity-10 rounded text-center mb-3">
                                    <span className="text-dark fw-bold me-2 fs-6">TOTAL A PAGAR:</span>
                                    <span className="fw-bold text-success fs-4">C$ {calcularTotal().toLocaleString()}</span>
                                </div>
                                <Button color="success" block type="submit" className="fw-bolder shadow-sm py-3">
                                    REALIZAR COMPRA
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col md="8">
                    <Card className="shadow-sm border-0 mb-3">
                        <CardBody>
                            <h6 className="fw-bold border-bottom pb-2 text-success">
                                <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                                Registrar Nuevo Producto para esta Compra
                            </h6>

                            <Row className="g-2">
                                <Col md="8">
                                    <Label className="small fw-bold">Nombre del Producto</Label>
                                    <Input placeholder="Ej: Taladro Manual" value={nombreNuevo} onChange={e => setNombreNuevo(e.target.value)} bsSize="sm" />
                                </Col>
                                <Col md="4">
                                    <Label className="small fw-bold">Código / Barcode</Label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light"><FontAwesomeIcon icon={faBarcode} /></span>
                                        <Input placeholder="Código único" value={codigoNuevo} onChange={e => setCodigoNuevo(e.target.value)} />
                                    </div>
                                </Col>
                                <Col md="12">
                                    <Label className="small fw-bold">Descripción (Opcional)</Label>
                                    <Input type="textarea" rows="1" placeholder="Detalles técnicos..." value={descripcionNuevo || ''} onChange={e => setDescripcionNuevo(e.target.value)} bsSize="sm" />
                                </Col>
                                <Col md="4">
                                    <Label className="small fw-bold">Categoría</Label>
                                    <div className="position-relative">
                                        <div
                                            className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                                            style={{ cursor: 'pointer', minHeight: '31px' }}
                                            onClick={() => setIsCategoriaOpen(!isCategoriaOpen)}
                                        >
                                            <span className="text-truncate">
                                                {categorias.find(c => c.id?.toString() === categoriaId)?.nombre || 'Seleccione categoría...'}
                                            </span>
                                            <small className="text-muted">▼</small>
                                        </div>

                                        {isCategoriaOpen && (
                                            <div
                                                className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2"
                                                style={{ zIndex: 1050 }}
                                            >
                                                <Input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Buscar categoría..."
                                                    value={searchCategoriaTerm}
                                                    onChange={e => setSearchCategoriaTerm(e.target.value)}
                                                    className="form-control-sm mb-2"
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {categorias
                                                        .filter(c => c.activo !== false && c.nombre?.toLowerCase().includes(searchCategoriaTerm.toLowerCase()))
                                                        .map(c => (
                                                            <div
                                                                key={c.id}
                                                                className="p-2 border-bottom small product-item-hover-selector"
                                                                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                onClick={() => {
                                                                    setCategoriaId(c.id!.toString());
                                                                    setIsCategoriaOpen(false);
                                                                    setSearchCategoriaTerm('');
                                                                }}
                                                            >
                                                                <div className="fw-bold">{c.nombre}</div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                                <div
                                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                                    onClick={(e) => { e.stopPropagation(); setIsCategoriaOpen(false); }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md="4">
                                    <Label className="small fw-bold">Unidad Medida</Label>
                                    <div className="position-relative">
                                        <div
                                            className="form-control form-control-sm d-flex justify-content-between align-items-center bg-white border-secondary"
                                            style={{ cursor: 'pointer', minHeight: '31px' }}
                                            onClick={() => setIsUnidadOpen(!isUnidadOpen)}
                                        >
                                            <span className="text-truncate">
                                                {unidades.find(u => u.id?.toString() === unidadId)?.nombre || 'Seleccione unidad...'}
                                            </span>
                                            <small className="text-muted">▼</small>
                                        </div>

                                        {isUnidadOpen && (
                                            <div
                                                className="position-absolute w-100 shadow-lg border rounded bg-white mt-1 p-2"
                                                style={{ zIndex: 1050 }}
                                            >
                                                <Input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Buscar unidad..."
                                                    value={searchUnidadTerm}
                                                    onChange={e => setSearchUnidadTerm(e.target.value)}
                                                    className="form-control-sm mb-2"
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {unidades
                                                        .filter(u => u.activo !== false && u.nombre?.toLowerCase().includes(searchUnidadTerm.toLowerCase()))
                                                        .map(u => (
                                                            <div
                                                                key={u.id}
                                                                className="p-2 border-bottom small product-item-hover-selector"
                                                                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                onClick={() => {
                                                                    setUnidadId(u.id!.toString());
                                                                    setIsUnidadOpen(false);
                                                                    setSearchUnidadTerm('');
                                                                }}
                                                            >
                                                                <div className="fw-bold">{u.nombre}</div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                                <div
                                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                                    onClick={(e) => { e.stopPropagation(); setIsUnidadOpen(false); }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md="2">
                                    <Label className="small fw-bold">Stock Mín.</Label>
                                    <Input type="number" min="0" value={existenciaMinima} onChange={e => setExistenciaMinima(parseInt(e.target.value, 10))} bsSize="sm" />
                                </Col>
                                <Col md="2">
                                    <Label className="small fw-bold">Cant. Comprada</Label>
                                    <Input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value, 10))} bsSize="sm" />
                                </Col>
                                <Col md="4">
                                    <Label className="small fw-bold">Costo Unitario (Compra)</Label>
                                    <Input type="number" step="0.01" value={costoUnitario} onChange={e => setCostoUnitario(parseFloat(e.target.value))} bsSize="sm" />
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
                                <Col md="4" className="d-flex align-items-end">
                                    <Button color="success" block onClick={agregarDetalle} className="fw-bold btn-sm">
                                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Añadir a la Lista
                                    </Button>
                                </Col>
                            </Row>

                            <Table responsive size="sm" hover className="mt-4 border">
                                <thead className="table-success small">
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th className="text-center">Cant.</th>
                                        <th className="text-end">Costo</th>
                                        <th className="text-end">Monto</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.length > 0 ? (
                                        detalles.map((d, index) => (
                                            <tr key={index} className="align-middle">
                                                <td>{d.articulo?.codigo}</td>
                                                <td className="fw-bold">{d.articulo?.nombre}</td>
                                                <td className="text-center">{d.cantidad}</td>
                                                <td className="text-end">C$ {d.costoUnitario?.toLocaleString()}</td>
                                                <td className="text-end fw-bold">C$ {d.monto?.toLocaleString()}</td>
                                                <td className="text-center">
                                                    <Button color="danger" size="sm" outline onClick={() => eliminarDetalle(index)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={6} className="text-center py-3 text-muted">No hay productos en esta compra.</td></tr>
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

export default IngresoNuevaCompra;
