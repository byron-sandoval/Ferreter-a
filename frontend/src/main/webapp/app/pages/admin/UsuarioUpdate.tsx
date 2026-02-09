import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUsers } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { IUsuario } from 'app/shared/model/usuario.model';
import UsuarioService from 'app/services/usuario.service';

export const UsuarioUpdate = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id;

    const [usuario, setUsuario] = useState<IUsuario>({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        idKeycloak: '',
        activo: true,
        email: '',
        password: '',
        rol: 'ROLE_VENDEDOR',
    });

    useEffect(() => {
        if (!isNew && id) {
            UsuarioService.getById(parseInt(id, 10))
                .then(res => setUsuario(res.data))
                .catch(err => {
                    console.error(err);
                    toast.error('Error al cargar el usuario');
                });
        }
    }, [id, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUsuario({
            ...usuario,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!usuario.nombre || !usuario.cedula) {
            toast.error('Complete al menos el nombre y la cédula del usuario');
            return;
        }

        try {
            if (isNew) {
                await UsuarioService.create(usuario);
                toast.success('Usuario creado exitosamente');
            } else {
                await UsuarioService.update(usuario);
                toast.success('Usuario actualizado exitosamente');
            }
            navigate('/admin/usuarios');
        } catch (error: any) {
            console.error('Error al guardar usuario:', error);
            const message = error.response?.data?.message || error.response?.data?.title || 'Ocurrió un error al guardar el usuario';
            toast.error(message);
        }
    };

    return (
        <div className="animate__animated animate__fadeIn p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold text-dark m-0">
                    <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                    {isNew ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h4>
                <Button color="secondary" size="sm" outline onClick={() => navigate('/admin/usuarios')}>
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
                                                value={usuario.nombre}
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
                                                value={usuario.apellido || ''}
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
                                        value={usuario.cedula}
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
                                                value={usuario.telefono || ''}
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
                                                value={usuario.idKeycloak || ''}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {isNew && (
                                    <>
                                        <div className="border-top my-3"></div>
                                        <h5 className="mb-3 text-secondary">
                                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                                            Cuenta de Acceso (Keycloak)
                                        </h5>
                                        <Row>
                                            <Col md="6">
                                                <FormGroup>
                                                    <Label for="email" className="fw-bold">
                                                        Usuario / Email <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        id="email"
                                                        name="email"
                                                        placeholder="nombre.usuario"
                                                        value={usuario.email || ''}
                                                        onChange={handleChange}
                                                        required={isNew}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup>
                                                    <Label for="password" className="fw-bold">
                                                        Contraseña <span className="text-danger">*</span>
                                                    </Label>
                                                    <Input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        placeholder="********"
                                                        value={usuario.password || ''}
                                                        onChange={handleChange}
                                                        required={isNew}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <FormGroup>
                                            <Label for="rol" className="fw-bold">
                                                Rol de Usuario <span className="text-danger">*</span>
                                            </Label>
                                            <Input type="select" id="rol" name="rol" value={usuario.rol || 'ROLE_VENDEDOR'} onChange={handleChange}>
                                                <option value="ROLE_VENDEDOR">Vendedor</option>
                                                <option value="ROLE_BODEGUERO">Bodeguero</option>
                                                <option value="ROLE_ADMIN">Administrador</option>
                                            </Input>
                                        </FormGroup>
                                        <div className="border-bottom my-3"></div>
                                    </>
                                )}

                                <FormGroup check className="mb-3">
                                    <Input type="checkbox" id="activo" name="activo" checked={usuario.activo || false} onChange={handleChange} />
                                    <Label check for="activo" className="fw-bold">
                                        Usuario Activo
                                    </Label>
                                </FormGroup>

                                <div className="d-flex gap-2 mt-4">
                                    <Button color="success" type="submit" className="fw-bold flex-fill">
                                        <FontAwesomeIcon icon={faSave} className="me-2" />
                                        {isNew ? 'Crear Usuario' : 'Guardar Cambios'}
                                    </Button>
                                    <Button color="secondary" outline onClick={() => navigate('/admin/usuarios')}>
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

export default UsuarioUpdate;
