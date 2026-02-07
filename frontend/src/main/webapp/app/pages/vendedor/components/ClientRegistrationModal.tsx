import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faVenusMars, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';

interface IClientRegistrationModalProps {
  isOpen: boolean;
  toggle: () => void;
  nuevoCliente: ICliente;
  setNuevoCliente: (c: ICliente) => void;
  guardarNuevoCliente: () => void;
}

export const ClientRegistrationModal: React.FC<IClientRegistrationModalProps> = ({
  isOpen,
  toggle,
  nuevoCliente,
  setNuevoCliente,
  guardarNuevoCliente,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader
        toggle={toggle}
        className="text-white border-0 py-4 text-center w-100"
        style={{
          background: 'linear-gradient(135deg, #595e66ff 0%, #11373fff 100%)',
          boxShadow: '0 4px 15px rgba(29, 51, 56, 0.3)',
        }}
      >
        <div className="w-100 text-center">
          <FontAwesomeIcon icon={faUserPlus} className="me-2 animate__animated animate__pulse animate__infinite" />
          <span className="fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
            {nuevoCliente.id ? 'Actualizar Perfil de Cliente' : 'Registro de Nuevo Cliente'}
          </span>
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        <Form>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
                  Cédula
                </Label>
                <Input
                  value={nuevoCliente.cedula}
                  placeholder="281-010180-0005Y"
                  className="bg-white border-1 shadow-sm"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    color: nuevoCliente.id ? '#6c757d' : '#000'
                  }}
                  maxLength={16}
                  disabled={!!nuevoCliente.id}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    const digitsOnly = raw.substring(0, 13).replace(/[^0-9]/g, '');
                    const lastChar = raw.length > 13 ? raw.substring(13, 14).replace(/[^a-zA-Z]/g, '').toUpperCase() : '';
                    const input = digitsOnly + lastChar;

                    let formatted = input;
                    if (input.length > 3 && input.length <= 9) {
                      formatted = `${input.substring(0, 3)}-${input.substring(3)}`;
                    } else if (input.length > 9) {
                      formatted = `${input.substring(0, 3)}-${input.substring(3, 9)}-${input.substring(9)}`;
                    }
                    setNuevoCliente({ ...nuevoCliente, cedula: formatted });
                  }}
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>Nombre Completo</Label>
                <Input
                  value={nuevoCliente.nombre}
                  placeholder="Ej. Juan Pérez"
                  className="bg-white border-1 shadow-sm"
                  style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                  maxLength={50}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                    setNuevoCliente({ ...nuevoCliente, nombre: val });
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
                  <FontAwesomeIcon icon={faVenusMars} className="me-1" style={{ color: '#595e66' }} /> Género
                </Label>
                <Input
                  type="select"
                  value={nuevoCliente.genero}
                  className="bg-white border-1 shadow-sm"
                  style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                  onChange={e => setNuevoCliente({ ...nuevoCliente, genero: e.target.value as GeneroEnum })}
                >
                  <option value={GeneroEnum.MASCULINO}>Masculino</option>
                  <option value={GeneroEnum.FEMENINO}>Femenino</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>Teléfono</Label>
                <Input
                  value={nuevoCliente.telefono || ''}
                  placeholder="8888-8888"
                  className="bg-white border-1 shadow-sm"
                  style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                  maxLength={9}
                  onChange={e => {
                    const input = e.target.value.replace(/[^0-9]/g, '').substring(0, 8);
                    let formatted = input;
                    if (input.length > 4) {
                      formatted = `${input.substring(0, 4)}-${input.substring(4)}`;
                    }
                    setNuevoCliente({ ...nuevoCliente, telefono: formatted });
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" style={{ color: '#595e66' }} /> Dirección
            </Label>
            <Input
              type="textarea"
              value={nuevoCliente.direccion || ''}
              placeholder="Dirección exacta del cliente..."
              className="bg-white border-1 shadow-sm"
              style={{ borderRadius: '12px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
              rows={2}
              onChange={e => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="border-0 bg-white pb-4 px-4">
        <Button color="link" className="text-muted fw-bold text-decoration-none" onClick={toggle}>
          CANCELAR
        </Button>
        <Button
          color="primary"
          className="px-5 fw-bold rounded-pill shadow"
          style={{ background: 'linear-gradient(135deg, #595e66 0%, #11373f 100%)', border: 'none' }}
          onClick={guardarNuevoCliente}
        >
          {nuevoCliente.id ? 'ACTUALIZAR' : 'GUARDAR'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
