import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, CardHeader } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import CategoriaService from 'app/services/categoria.service';
import { ICategoria } from 'app/shared/model/categoria.model';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';

export const CategoriaUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const isAdmin = useAppSelector(state => state.authentication.account?.authorities?.includes(AUTHORITIES.ADMIN));
  const isNew = id === undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICategoria>({
    defaultValues: { activo: true },
  });

  useEffect(() => {
    if (!isNew) {
      CategoriaService.getById(Number(id)).then(res => reset(res.data));
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: ICategoria) => {
    try {
      if (isNew) {
        await axios.post('api/categorias', data);
        toast.success('Categoría creada');
      } else {
        await axios.put(`api/categorias/${data.id}`, data);
        toast.success('Categoría actualizada');
      }
      navigate('/admin/categorias');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Col md="8">
        <Card>
          <CardHeader className="bg-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-primary">{isNew ? 'Nueva Categoría' : 'Editar Categoría'}</h4>
            <Button tag={Link} to="/admin/categorias" outline>
              <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </Button>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nombre *</Label>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: 'Campo requerido' }}
                  render={({ field }) => <Input {...field} invalid={!!errors.nombre} />}
                />
                {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre.message}</div>}
              </FormGroup>

              <FormGroup>
                <Label>Descripción</Label>
                <Controller name="descripcion" control={control} render={({ field }) => <Input {...field} type="textarea" />} />
              </FormGroup>

              {isAdmin && (
                <FormGroup check>
                  <Label check>
                    <Controller
                      name="activo"
                      control={control}
                      render={({ field }) => <Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    />{' '}
                    Activo
                  </Label>
                </FormGroup>
              )}

              <Button color="primary" type="submit" className="mt-3">
                <FontAwesomeIcon icon={faSave} /> Guardar
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </div>
  );
};

export default CategoriaUpdate;
