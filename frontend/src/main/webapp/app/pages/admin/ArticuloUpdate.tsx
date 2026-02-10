import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, CardHeader, CardTitle, Badge } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faImage, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch } from 'app/config/store';
import ArticuloService from 'app/services/articulo.service';
import CategoriaService from 'app/services/categoria.service';
import UnidadMedidaService from 'app/services/unidad-medida.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICategoria } from 'app/shared/model/categoria.model';
import { IUnidadMedida } from 'app/shared/model/unidad-medida.model';
import { toast } from 'react-toastify';

export const ArticuloUpdate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [unidades, setUnidades] = useState<IUnidadMedida[]>([]);
  const [loadingObj, setLoadingObj] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalPrecio, setOriginalPrecio] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IArticulo>({
    defaultValues: {
      activo: true,
      existencia: 0,
      existenciaMinima: 5,
      precio: 0,
      costo: 0,
    },
  });

  const precioVenta = watch('precio');
  const costoUnitario = watch('costo');
  const esPrecioBajo = precioVenta > 0 && costoUnitario > 0 && Number(precioVenta) < Number(costoUnitario);

  useEffect(() => {
    // Cargar catálogos
    CategoriaService.getAll().then(res => setCategorias(res.data));
    UnidadMedidaService.getAll().then(res => setUnidades(res.data));

    if (!isNew) {
      setLoadingObj(true);
      ArticuloService.getById(Number(id))
        .then(res => {
          const articulo = res.data;
          reset(articulo);
          setOriginalPrecio(articulo.precio || 0);
          if (articulo.imagen && articulo.imagenContentType) {
            setImagePreview(`data:${articulo.imagenContentType};base64,${articulo.imagen}`);
          }
        })
        .catch(err => toast.error('Error al cargar el artículo'))
        .finally(() => setLoadingObj(false));
    }
  }, [id, isNew, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Split metadata from content
        const contentIndex = base64String.indexOf(',') + 1;
        const contentType = base64String.substring(5, contentIndex - 8);
        const content = base64String.substring(contentIndex);

        setValue('imagen', content);
        setValue('imagenContentType', contentType);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setValue('imagen', null);
    setValue('imagenContentType', null);
    setImagePreview(null);
  };

  const onSubmit = async (data: IArticulo) => {
    try {
      if (isNew) {
        await ArticuloService.create(data);
        toast.success('Articulo creado exitosamente');
      } else {
        await ArticuloService.update(data);
        toast.success('Articulo actualizado exitosamente');
      }
      navigate('/admin/articulos');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar');
    }
  };

  if (loadingObj) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="10">
          <Card className="shadow-sm">
            <CardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-primary">{isNew ? '✨ Nuevo Artículo' : '✏️ Editar Artículo'}</h4>
              <Button tag={Link} to="/admin/articulos" color="light" className="text-muted">
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
              </Button>
            </CardHeader>
            <CardBody className="p-4">
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md="8">
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="codigo" className="fw-bold">
                            Código *
                          </Label>
                          <Controller
                            name="codigo"
                            control={control}
                            rules={{ required: 'El código es obligatorio' }}
                            render={({ field }) => <Input {...field} invalid={!!errors.codigo} />}
                          />
                          {errors.codigo && <div className="invalid-feedback d-block">{errors.codigo.message}</div>}
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="categoria">Categoría</Label>
                          <Controller
                            name="categoria.id"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="select"
                                {...field}
                                value={field.value || ''}
                                onChange={e => {
                                  const selectedCat = categorias.find(c => c.id === Number(e.target.value));
                                  setValue('categoria', selectedCat);
                                  field.onChange(e);
                                }}
                              >
                                <option value="">Seleccione...</option>
                                {categorias
                                  .filter(cat => cat.activo || cat.id === watch('categoria')?.id)
                                  .map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.nombre} {!cat.activo && '(Inactivo)'}
                                    </option>
                                  ))}
                              </Input>
                            )}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label for="nombre" className="fw-bold">
                        Nombre del Producto *
                      </Label>
                      <Controller
                        name="nombre"
                        control={control}
                        rules={{ required: 'El nombre es obligatorio' }}
                        render={({ field }) => <Input {...field} invalid={!!errors.nombre} />}
                      />
                      {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre.message}</div>}
                    </FormGroup>

                    <FormGroup>
                      <Label for="descripcion">Descripción</Label>
                      <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => <Input type="textarea" {...field} rows="3" />}
                      />
                    </FormGroup>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label className={`fw-bold ${esPrecioBajo ? 'text-danger' : 'text-success'}`}>Precio Venta (C$) *</Label>
                          <Controller
                            name="precio"
                            control={control}
                            rules={{ required: true, min: 0 }}
                            render={({ field }) => <Input type="number" step="0.01" {...field} invalid={esPrecioBajo} />}
                          />
                          {esPrecioBajo && (
                            <div
                              className="animate__animated animate__headShake p-2 mt-2"
                              style={{
                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                borderLeft: '4px solid #dc3545',
                                borderRadius: '4px',
                                color: '#dc3545',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                              }}
                            >
                              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                              ¡Precio menor al costo! Perderás dinero.
                            </div>
                          )}
                          {!isNew && Number(watch('precio')) !== Number(originalPrecio) && (
                            <Controller
                              name="priceChangeReason"
                              control={control}
                              render={({ field }) => (
                                <div className="mt-3 animate__animated animate__fadeIn">
                                  <Label className="text-info fw-bold small text-uppercase">Motivo (Opcional)</Label>
                                  <Input
                                    {...field}
                                    type="text"
                                    placeholder="Ej: Aumento de costo de proveedor..."
                                    className="border-info"
                                    style={{ backgroundColor: 'rgba(13, 202, 240, 0.05)' }}
                                  />
                                </div>
                              )}
                            />
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label className="text-secondary fw-bold">Costo Unitario (C$) *</Label>
                          <Controller
                            name="costo"
                            control={control}
                            rules={{ required: true, min: 0 }}
                            render={({ field }) => <Input type="number" step="0.01" {...field} />}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label>Stock Actual</Label>
                          <Controller name="existencia" control={control} render={({ field }) => <Input type="number" {...field} />} />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Stock Mínimo</Label>
                          <Controller
                            name="existenciaMinima"
                            control={control}
                            render={({ field }) => <Input type="number" {...field} />}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Unidad Medida</Label>
                          <Controller
                            name="unidadMedida.id"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="select"
                                {...field}
                                value={field.value || ''}
                                onChange={e => {
                                  const selectedUnidad = unidades.find(u => u.id === Number(e.target.value));
                                  setValue('unidadMedida', selectedUnidad);
                                  field.onChange(e);
                                }}
                              >
                                <option value="">Seleccione...</option>
                                {unidades
                                  .filter(u => u.activo || u.id === watch('unidadMedida')?.id)
                                  .map(u => (
                                    <option key={u.id} value={u.id}>
                                      {u.nombre} ({u.simbolo}) {!u.activo && '(Inactivo)'}
                                    </option>
                                  ))}
                              </Input>
                            )}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>

                  <Col md="4">
                    <Card className="mb-3 border-0 bg-light">
                      <CardBody className="text-center">
                        <Label className="fw-bold mb-3 d-block">Imagen del Producto</Label>

                        <div
                          className="img-preview mb-3 d-flex align-items-center justify-content-center bg-white border rounded"
                          style={{ height: '200px', overflow: 'hidden', position: 'relative' }}
                        >
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                              <Button
                                color="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1 rounded-circle"
                                onClick={clearImage}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </Button>
                            </>
                          ) : (
                            <div className="text-muted">
                              <FontAwesomeIcon icon={faImage} size="3x" className="mb-2" />
                              <div className="small">Sin imagen</div>
                            </div>
                          )}
                        </div>

                        <div className="d-grid">
                          <Label className="btn btn-outline-primary btn-sm mb-0">
                            Subir Imagen <Input type="file" hidden accept="image/*" onChange={handleImageChange} />
                          </Label>
                        </div>
                      </CardBody>
                    </Card>

                    <FormGroup check className="mt-4 p-3 border rounded bg-white">
                      <Label check className="fw-bold">
                        <Controller
                          name="activo"
                          control={control}
                          render={({ field }) => (
                            <Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                          )}
                        />{' '}
                        Producto Activo
                        <div className="small text-muted fw-normal mt-1">Si se desactiva, no aparecerá en las búsquedas de venta.</div>
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-flex justify-content-end gap-3">
                  <Button tag={Link} to="/admin/articulos" color="light" className="text-dark border bg-white fw-bold text-uppercase px-4">
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit" disabled={isSubmitting} className="px-4">
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Artículo'}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ArticuloUpdate;
