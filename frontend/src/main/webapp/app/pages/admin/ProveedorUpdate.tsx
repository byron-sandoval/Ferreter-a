import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faTruck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import { IProveedor } from 'app/shared/model/proveedor.model';
import ProveedorService from 'app/services/proveedor.service';

export const ProveedorUpdate = () => {
  const isAdmin = useAppSelector(state => state.authentication.account.authorities.includes(AUTHORITIES.ADMIN));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;

  const [proveedor, setProveedor] = useState<IProveedor>({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    activo: true,
  });

  useEffect(() => {
    if (!isNew && id) {
      ProveedorService.get(parseInt(id, 10))
        .then(res => setProveedor(res.data))
        .catch(err => {
          console.error(err);
          toast.error('Error al cargar el proveedor');
        });
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProveedor({
      ...proveedor,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedor.nombre || !proveedor.telefono) {
      toast.error('Complete al menos el nombre y teléfono del proveedor');
      return;
    }

    try {
      if (isNew) {
        await ProveedorService.create(proveedor);
        toast.success('Proveedor creado exitosamente');
      } else {
        await ProveedorService.update(proveedor);
        toast.success('Proveedor actualizado exitosamente');
      }
      navigate('/admin/proveedores');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar el proveedor');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-dark m-0">
          <FontAwesomeIcon icon={faTruck} className="me-2 text-primary" />
          {isNew ? 'Nuevo Proveedor' : 'Editar Proveedor'}
        </h4>
        <Button color="black" size="sm" outline onClick={() => navigate('/admin/proveedores')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver
        </Button>
      </div>

      <Row className="justify-content-center">
        <Col md="5">
          <Card className="shadow-sm border-0">
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="nombre" className="fw-bold">
                    Nombre del Proveedor <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Distribuidora Central"
                    value={proveedor.nombre}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="ruc" className="fw-bold">
                    RUC / Identificación
                  </Label>
                  <Input
                    type="text"
                    id="ruc"
                    name="ruc"
                    placeholder="Ej: J0310000000000"
                    value={proveedor.ruc || ''}
                    onChange={handleChange}
                    readOnly={!isAdmin}
                    className={!isAdmin ? 'bg-light text-muted' : ''}
                  />
                </FormGroup>

                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="telefono" className="fw-bold">
                        Teléfono <span className="text-danger">*</span>
                      </Label>
                      <Input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        placeholder="Ej: 8888-8888"
                        value={proveedor.telefono}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="email" className="fw-bold">
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="proveedor@ejemplo.com"
                        value={proveedor.email}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="direccion" className="fw-bold">
                    Dirección
                  </Label>
                  <Input
                    type="textarea"
                    id="direccion"
                    name="direccion"
                    rows="3"
                    placeholder="Dirección completa del proveedor"
                    value={proveedor.direccion}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup check>
                  <Input type="checkbox" id="activo" name="activo" checked={proveedor.activo} onChange={handleChange} />
                  <Label check for="activo" className="fw-bold">
                    Proveedor Activo
                  </Label>
                </FormGroup>

                <div className="d-flex gap-2 mt-4">
                  <Button color="success" type="submit" className="fw-bold flex-fill">
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {isNew ? 'Crear Proveedor' : 'Guardar Cambios'}
                  </Button>
                  <Button color="black" outline onClick={() => navigate('/admin/proveedores')}>
                    Cancelar
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

export default ProveedorUpdate;
