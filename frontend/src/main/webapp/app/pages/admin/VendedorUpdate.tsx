import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUsers } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { IVendedor } from 'app/shared/model/vendedor.model';
import VendedorService from 'app/services/vendedor.service';

export const VendedorUpdate = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id;

    const [vendedor, setVendedor] = useState<IVendedor>({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        idKeycloak: '',
        activo: true,
    });

    useEffect(() => {
        if (!isNew && id) {
            VendedorService.getById(parseInt(id, 10))
                .then(res => setVendedor(res.data))
                .catch(err => {
                    console.error(err);
                    toast.error('Error al cargar el usuario');
                });
        }
    }, [id, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setVendedor({
            ...vendedor,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vendedor.nombre || !vendedor.cedula) {
            toast.error('Complete al menos el nombre y la cédula del usuario');
            return;
        }

        try {
            if (isNew) {
                await VendedorService.create(vendedor);
                toast.success('Usuario creado exitosamente');
            } else {
                await VendedorService.update(vendedor);
                toast.success('Usuario actualizado exitosamente');
            }
            navigate('/admin/vendedores');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el usuario');
        }
    };

    return (
        <div className="animate__animated animate__fadeIn p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark m-0">
                    <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                    {isNew ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h4>
                <Button color="secondary" size="sm" outline onClick={() => navigate('/admin/vendedores')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col md="8">
                    <Card className="shadow-sm border-0">
                        <CardBody>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="nombre" className="fw-bold">
                                                Nombre <span className="text-danger">*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                placeholder="Ej: Juan"
                                                value={vendedor.nombre}
                                                onChange={handleChange}
                                                required
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="apellido" className="fw-bold">
                                                Apellido
                                            </Label>
                                            <Input
                                                type="text"
                                                id="apellido"
                                                name="apellido"
                                                placeholder="Ej: Pérez"
                                                value={vendedor.apellido || ''}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <FormGroup>
                                    <Label for="cedula" className="fw-bold">
                                        Cédula / Identificación <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        id="cedula"
                                        name="cedula"
                                        placeholder="Ej: 001-000000-0000A"
                                        value={vendedor.cedula}
                                        onChange={handleChange}
                                        required
                                    />
                                </FormGroup>

                                <Row>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="telefono" className="fw-bold">
                                                Teléfono
                                            </Label>
                                            <Input
                                                type="tel"
                                                id="telefono"
                                                name="telefono"
                                                placeholder="Ej: 8888-8888"
                                                value={vendedor.telefono || ''}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label for="idKeycloak" className="fw-bold">
                                                Keycloak ID (Opcional)
                                            </Label>
                                            <Input
                                                type="text"
                                                id="idKeycloak"
                                                name="idKeycloak"
                                                placeholder="ID de usuario de Keycloak"
                                                value={vendedor.idKeycloak || ''}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <FormGroup check className="mb-3">
                                    <Input type="checkbox" id="activo" name="activo" checked={vendedor.activo || false} onChange={handleChange} />
                                    <Label check for="activo" className="fw-bold">
                                        Usuario Activo
                                    </Label>
                                </FormGroup>

                                <div className="d-flex gap-2 mt-4">
                                    <Button color="success" type="submit" className="fw-bold flex-fill">
                                        <FontAwesomeIcon icon={faSave} className="me-2" />
                                        {isNew ? 'Crear Usuario' : 'Guardar Cambios'}
                                    </Button>
                                    <Button color="secondary" outline onClick={() => navigate('/admin/vendedores')}>
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

export default VendedorUpdate;
