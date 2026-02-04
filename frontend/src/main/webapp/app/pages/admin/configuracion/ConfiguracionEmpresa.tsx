import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    CardBody,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Alert,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHistory, faDatabase, faSave, faImage, faUpload, faInfoCircle, faRulerCombined } from '@fortawesome/free-solid-svg-icons';
import GestionUnidadMedida from '../GestionUnidadMedida';
import { EmpresaService } from 'app/services/empresa.service';
import { IEmpresa, defaultEmpresa } from 'app/shared/model/empresa.model';
import { toast } from 'react-toastify';

export const ConfiguracionEmpresa = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [empresa, setEmpresa] = useState<IEmpresa>(defaultEmpresa);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEmpresa();
    }, []);

    const loadEmpresa = async () => {
        try {
            const response = await EmpresaService.getAll();
            if (response.data && response.data.length > 0) {
                setEmpresa(response.data[0]);
            }
        } catch (error) {
            console.error('Error cargando empresa:', error);
            toast.error('No se pudo cargar la información de la empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmpresa({ ...empresa, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const empresaToSave = {
            ...empresa,
            regimenFiscal: empresa.regimenFiscal || 'General',
        };
        try {
            if (empresa.id) {
                await EmpresaService.update(empresaToSave);
                toast.success('Configuración actualizada correctamente');
            } else {
                await EmpresaService.create(empresaToSave);
                toast.success('Configuración creada correctamente');
                loadEmpresa(); // Recargar para obtener el ID
            }
        } catch (error) {
            console.error('Error guardando empresa:', error);
            toast.error('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-secondary fw-bold m-0">
                    <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                    Configuraciones del Programa
                </h2>
            </div>

            <Row>
                <Col md="3">
                    <Card className="shadow-sm border-0 mb-4 overflow-hidden">
                        <Nav vertical className="p-0">
                            <NavItem>
                                <NavLink
                                    className={`p-3 border-start border-4 ${activeTab === '1' ? 'bg-light border-primary fw-bold text-primary' : 'border-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('1')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FontAwesomeIcon icon={faBuilding} className="me-2" /> Información del Negocio
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={`p-3 border-start border-4 ${activeTab === '4' ? 'bg-light border-primary fw-bold text-primary' : 'border-transparent text-secondary'}`}
                                    onClick={() => setActiveTab('4')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <FontAwesomeIcon icon={faRulerCombined} className="me-2" /> Unidades de Medida
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={`p-3 border-start border-4 ${activeTab === '2' ? 'bg-light border-primary fw-bold text-primary' : 'border-transparent text-secondary text-opacity-50'}`}
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <FontAwesomeIcon icon={faHistory} className="me-2" /> Logs
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={`p-3 border-start border-4 ${activeTab === '3' ? 'bg-light border-primary fw-bold text-primary' : 'border-transparent text-secondary text-opacity-50'}`}
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <FontAwesomeIcon icon={faDatabase} className="me-2" /> Respaldo
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Card>
                </Col>

                <Col md="9">
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <Card className="shadow-sm border-0">
                                <CardBody className="p-4">
                                    <h5 className="border-bottom pb-3 mb-4 text-primary fw-bold">Información del Negocio</h5>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md="7">
                                                <FormGroup className="mb-3">
                                                    <Label for="nombre" className="small fw-bold text-secondary">
                                                        Nombre del Negocio *
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="nombre"
                                                        id="nombre"
                                                        value={empresa.nombre || ''}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Ej: Ferretería Luz - El Viejo"
                                                        className="form-control-lg border-2"
                                                    />
                                                </FormGroup>

                                                <FormGroup className="mb-3">
                                                    <Label for="ruc" className="small fw-bold text-secondary">
                                                        RUC / Identificación Fiscal *
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="ruc"
                                                        id="ruc"
                                                        value={empresa.ruc || ''}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Ingrese el RUC"
                                                        className="border-2"
                                                    />
                                                </FormGroup>

                                                <FormGroup className="mb-3">
                                                    <Label for="direccion" className="small fw-bold text-secondary">
                                                        Dirección Exacta *
                                                    </Label>
                                                    <Input
                                                        type="textarea"
                                                        name="direccion"
                                                        id="direccion"
                                                        value={empresa.direccion || ''}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Dirección del local"
                                                        className="border-2"
                                                        rows={3}
                                                    />
                                                </FormGroup>

                                                <Row>
                                                    <Col md="6">
                                                        <FormGroup className="mb-3">
                                                            <Label for="telefono" className="small fw-bold text-secondary">
                                                                Teléfonos
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                name="telefono"
                                                                id="telefono"
                                                                value={empresa.telefono || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="7717-6886 / 8810-9566"
                                                                className="border-2"
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="6">
                                                        <FormGroup className="mb-3">
                                                            <Label for="correo" className="small fw-bold text-secondary">
                                                                Correo Electrónico
                                                            </Label>
                                                            <Input
                                                                type="email"
                                                                name="correo"
                                                                id="correo"
                                                                value={empresa.correo || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="ejemplo@correo.com"
                                                                className="border-2"
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <FormGroup className="mb-4">
                                                    <Label for="eslogan" className="small fw-bold text-secondary">
                                                        Eslogan o Lema
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        name="eslogan"
                                                        id="eslogan"
                                                        value={empresa.eslogan || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Ej: Siempre contigo"
                                                        className="border-2 italic"
                                                    />
                                                </FormGroup>
                                            </Col>

                                            <Col md="5" className="ps-md-5 border-start">
                                                <div className="text-center mb-4">
                                                    <Label className="small fw-bold text-secondary d-block mb-3">Logo del Negocio</Label>
                                                    <div
                                                        className="mx-auto bg-light rounded shadow-sm d-flex align-items-center justify-content-center overflow-hidden mb-3"
                                                        style={{ width: '200px', height: '200px', border: '2px dashed #dee2e6' }}
                                                    >
                                                        {empresa.logo ? (
                                                            <img
                                                                src={`data:${empresa.logoContentType};base64,${empresa.logo}`}
                                                                alt="Logo"
                                                                className="img-fluid"
                                                                style={{ maxHeight: '100%' }}
                                                            />
                                                        ) : (
                                                            <div className="text-muted opacity-50">
                                                                <FontAwesomeIcon icon={faImage} size="4x" />
                                                                <div className="mt-2 small">Sin Logo</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Input
                                                            type="file"
                                                            id="logoFile"
                                                            style={{ display: 'none' }}
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event: any) => {
                                                                        const base64 = event.target.result.split(',')[1];
                                                                        setEmpresa({
                                                                            ...empresa,
                                                                            logo: base64,
                                                                            logoContentType: file.type,
                                                                        });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            accept="image/*"
                                                        />
                                                        <Button
                                                            color="outline-primary"
                                                            size="sm"
                                                            className="px-3"
                                                            onClick={() => document.getElementById('logoFile')?.click()}
                                                        >
                                                            <FontAwesomeIcon icon={faUpload} className="me-2" /> Seleccionar
                                                        </Button>
                                                        {empresa.logo && (
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                className="px-3"
                                                                outline
                                                                onClick={() => setEmpresa({ ...empresa, logo: null, logoContentType: null })}
                                                            >
                                                                Quitar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <Alert color="info" className="small border-0 shadow-sm">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                                    Esta información se verá reflejada en tus facturas impresas y reportes oficiales.
                                                </Alert>
                                            </Col>
                                        </Row>

                                        <hr className="my-4" />

                                        <div className="d-flex justify-content-end">
                                            <Button color="primary" size="lg" className="px-5 shadow-sm fw-bold" disabled={saving}>
                                                {saving ? (
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                ) : (
                                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                                )}
                                                Guardar Información
                                            </Button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </TabPane>
                        <TabPane tabId="4">
                            <GestionUnidadMedida />
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
        </div >
    );
};

export default ConfiguracionEmpresa;
