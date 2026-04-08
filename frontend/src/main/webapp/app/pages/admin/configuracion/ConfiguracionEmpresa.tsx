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
import {
  faBuilding,
  faHistory,
  faDatabase,
  faSave,
  faImage,
  faUpload,
  faInfoCircle,
  faRulerCombined,
  faIdCard,
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faUser,
  faTrashAlt,
  faExclamationTriangle,
  faCloudUploadAlt,
  faCoins,
} from '@fortawesome/free-solid-svg-icons';
import GestionUnidadMedida from '../GestionUnidadMedida';
import GestionMonedas from './GestionMonedas';
import GestionRespaldo from './GestionRespaldo';
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
        <h3 className="fw-bold m-0" style={{ color: '#00264d' }}>
          Configuraciones del Programa
        </h3>
      </div>

      <Row>
        <Col md="3">
          <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <Nav vertical className="p-2">
              <NavItem className="mb-2">
                <NavLink
                  className={`p-3 d-flex align-items-center rounded-3 ${activeTab === '1' ? 'active-tab' : 'inactive-tab text-dark'}`}
                  onClick={() => setActiveTab('1')}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div className={`icon-box me-2 bg-primary`}>
                    <FontAwesomeIcon icon={faInfoCircle} className="text-white" />
                  </div>
                  <span className="small fw-bold">Información del Negocio</span>
                </NavLink>
              </NavItem>
              <NavItem className="mb-2">
                <NavLink
                  className={`p-3 d-flex align-items-center rounded-3 ${activeTab === '4' ? 'active-tab' : 'inactive-tab text-dark'}`}
                  onClick={() => setActiveTab('4')}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div className={`icon-box me-2`} style={{ backgroundColor: '#ff6b00' }}>
                    <FontAwesomeIcon icon={faRulerCombined} className="text-white" />
                  </div>
                  <span className="small fw-bold">Unidades de Medida</span>
                </NavLink>
              </NavItem>
              <NavItem className="mb-2">
                <NavLink
                  className={`p-3 d-flex align-items-center rounded-3 ${activeTab === '5' ? 'active-tab' : 'inactive-tab text-dark'}`}
                  onClick={() => setActiveTab('5')}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div className={`icon-box me-2`} style={{ backgroundColor: '#0dcaf0' }}>
                    <FontAwesomeIcon icon={faCoins} className="text-white" />
                  </div>
                  <span className="small fw-bold">Monedas y Tasas</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`p-3 d-flex align-items-center rounded-3 ${activeTab === '3' ? 'active-tab' : 'inactive-tab text-dark'}`}
                  onClick={() => setActiveTab('3')}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div className={`icon-box me-2`} style={{ backgroundColor: '#28a745' }}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="text-white" />
                  </div>
                  <span className="small fw-bold">Respaldo</span>
                </NavLink>
              </NavItem>
            </Nav>
          </Card>
        </Col>

        <Col md="9">
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <CardBody className="p-4 bg-glass-card">
                  <h5 className="mb-4 fw-bold" style={{ color: '#00264d' }}>
                    Información General del Negocio
                  </h5>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md="7">
                        <FormGroup className="mb-3 position-relative">
                          <Label for="nombre" className="small fw-bold text-dark mb-1">
                            Nombre del Negocio *
                          </Label>
                          <div className="input-with-icon">
                            <Input
                              type="text"
                              name="nombre"
                              id="nombre"
                              value={empresa.nombre || ''}
                              onChange={handleInputChange}
                              required
                              className="custom-input"
                            />
                            <FontAwesomeIcon icon={faUser} className="field-icon text-info" />
                          </div>
                        </FormGroup>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3 position-relative">
                              <Label for="ruc" className="small fw-bold text-dark mb-1">
                                RUC / Identificación Fiscal *
                              </Label>
                              <div className="input-with-icon">
                                <Input
                                  type="text"
                                  name="ruc"
                                  id="ruc"
                                  value={empresa.ruc || ''}
                                  onChange={handleInputChange}
                                  required
                                  className="custom-input"
                                />
                                <FontAwesomeIcon icon={faIdCard} className="field-icon" style={{ color: '#ff9800' }} />
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3 position-relative">
                              <Label for="porcentajeIva" className="small fw-bold text-dark mb-1">
                                Porcentaje IVA / Impuesto (%) *
                              </Label>
                              <div className="input-with-icon">
                                <Input
                                  type="number"
                                  name="porcentajeIva"
                                  id="porcentajeIva"
                                  value={empresa.porcentajeIva || ''}
                                  onChange={handleInputChange}
                                  className="custom-input"
                                  min="0"
                                  max="100"
                                  required
                                />
                                <FontAwesomeIcon icon={faCoins} className="field-icon text-warning" />
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                        <FormGroup className="mb-3 position-relative">
                          <Label for="direccion" className="small fw-bold text-dark mb-1">
                            Dirección Exacta *
                          </Label>
                          <div className="input-with-icon">
                            <Input
                              type="textarea"
                              name="direccion"
                              id="direccion"
                              value={empresa.direccion || ''}
                              onChange={handleInputChange}
                              required
                              className="custom-input"
                              rows={3}
                            />
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="field-icon text-primary" />
                          </div>
                        </FormGroup>
                        <Row>
                          <Col md="6">
                            <FormGroup className="mb-3 position-relative">
                              <Label for="telefono" className="small fw-bold text-dark mb-1">
                                Teléfonos
                              </Label>
                              <div className="input-with-icon">
                                <Input
                                  type="text"
                                  name="telefono"
                                  id="telefono"
                                  value={empresa.telefono || ''}
                                  onChange={handleInputChange}
                                  className="custom-input"
                                />
                                <FontAwesomeIcon icon={faPhoneAlt} className="field-icon text-success" />
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup className="mb-3 position-relative">
                              <Label for="correo" className="small fw-bold text-dark mb-1">
                                Correo Electrónico
                              </Label>
                              <div className="input-with-icon">
                                <Input
                                  type="email"
                                  name="correo"
                                  id="correo"
                                  value={empresa.correo || ''}
                                  onChange={handleInputChange}
                                  className="custom-input"
                                />
                                <FontAwesomeIcon icon={faEnvelope} className="field-icon text-primary" />
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                        <FormGroup className="mb-4 position-relative">
                          <Label for="eslogan" className="small fw-bold text-dark mb-1">
                            Eslogan o Lema
                          </Label>
                          <div className="input-with-icon">
                            <Input
                              type="text"
                              name="eslogan"
                              id="eslogan"
                              value={empresa.eslogan || ''}
                              onChange={handleInputChange}
                              className="custom-input"
                            />
                          </div>
                        </FormGroup>


                      </Col>

                      <Col md="5" className="ps-md-5">
                        <div className="text-center mb-4">
                          <Label className="small fw-bold text-dark d-block mb-3">Logo del Negocio</Label>
                          <div className="logo-container mx-auto mb-3">
                            {empresa.logo ? (
                              <img
                                src={`data:${empresa.logoContentType};base64,${empresa.logo}`}
                                alt="Logo"
                                className="img-fluid"
                                style={{ maxHeight: '100%', borderRadius: '10px' }}
                              />
                            ) : (
                              <div className="text-muted opacity-50">
                                <FontAwesomeIcon icon={faCloudUploadAlt} size="4x" />
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
                            <Button className="custom-btn primary" size="sm" onClick={() => document.getElementById('logoFile')?.click()}>
                              <FontAwesomeIcon icon={faUpload} className="me-2" /> SELECCIONAR
                            </Button>
                            {empresa.logo && (
                              <Button
                                className="custom-btn danger"
                                size="sm"
                                onClick={() => setEmpresa({ ...empresa, logo: null, logoContentType: null })}
                              >
                                QUITAR
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="alert-box-vibrant d-flex align-items-center">
                          <div className="alert-icon-wrap me-3">
                            <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="text-warning" />
                          </div>
                          <div>
                            <strong className="d-block">¡OJO!</strong>
                            <span className="small">
                              Esta información aparecerá en sus facturas oficiales. ¡Revise con cuidado!
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <hr className="my-4" />

                    <div className="d-flex justify-content-end">
                      <Button className="btn-save-vibrant shadow-sm" disabled={saving}>
                        {saving ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                        )}
                        GUARDAR
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </TabPane>
            <TabPane tabId="4">
              <GestionUnidadMedida />
            </TabPane>
            <TabPane tabId="5">
              <GestionMonedas />
            </TabPane>
            <TabPane tabId="3">
              <GestionRespaldo />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
      <style>
        {`
          .animate__fadeIn {
            background: linear-gradient(135deg, #e3edf7 0%, #ccdcf1 100%);
            min-vh-100;
          }
          .active-tab {
            background: linear-gradient(90deg, #1080ee, #3ea0f5) !important;
            color: white !important;
            box-shadow: 0 4px 15px rgba(16, 128, 238, 0.4);
          }
          .inactive-tab:hover {
            background-color: rgba(255, 255, 255, 0.8) !important;
          }
          .icon-box {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
          }
          .bg-glass-card {
            background: rgba(255, 255, 255, 0.6) !important;
            backdrop-filter: blur(5px);
          }
          .input-with-icon {
            position: relative;
          }
          .custom-input {
            border: 1px solid #c9d6e4 !important;
            border-radius: 8px !important;
            padding: 10px 12px !important;
            background-color: #f0f7ff !important;
            transition: all 0.3s;
          }
          .custom-input:focus {
            background-color: #ffffff !important;
            border-color: #008cff !important;
            box-shadow: 0 0 8px rgba(0, 140, 255, 0.2) !important;
          }
          /* Ocultar las flechitas nativas de los inputs de tipo número para que no se sobrepongan al icono de FontAwesome */
          .custom-input[type='number']::-webkit-inner-spin-button, 
          .custom-input[type='number']::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          .custom-input[type='number'] {
            -moz-appearance: textfield;
          }
          .field-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.7;
            font-size: 0.9rem;
          }
          .logo-container {
             width: 200px;
             height: 200px;
             border-radius: 12px;
             background: white;
             display: flex;
             align-items: center;
             justify-content: center;
             box-shadow: 0 0 20px rgba(0, 140, 255, 0.4);
             padding: 5px;
             overflow: hidden;
          }
          .custom-btn {
            border-radius: 6px !important;
            font-weight: bold !important;
            font-size: 0.7rem !important;
            padding: 6px 12px !important;
            border: 1px solid #dee2e6 !important;
          }
          .custom-btn.primary { color: #008cff; background: white; border-color: #008cff; }
          .custom-btn.danger { color: #ff4757; background: white; border-color: #ff4757; }
          
          .alert-box-vibrant {
            background: linear-gradient(90deg, #c026d3, #9d174d) !important;
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            margin-top: 15px;
            box-shadow: 0 5px 15px rgba(157, 23, 77, 0.3);
          }
          .alert-icon-wrap {
            background: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .btn-save-vibrant {
            background: linear-gradient(90deg, #1e88e5, #1565c0) !important;
            border: none !important;
            color: white !important;
            padding: 10px 40px !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(21, 101, 192, 0.4);
            transition: all 0.3s;
          }
          .btn-save-vibrant:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(21, 101, 192, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default ConfiguracionEmpresa;
