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
      <ModalHeader toggle={toggle} className="bg-primary text-white border-0 py-3 text-center w-100">
        <div className="w-100 text-center">
          <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Registrar Nuevo Cliente
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        <Form>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-muted text-uppercase">Cédula</Label>
                <Input
                  value={nuevoCliente.cedula}
                  placeholder="281-010180-0005Y"
                  className="bg-light border-0"
                  maxLength={16}
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
                <Label className="small fw-bold text-muted text-uppercase">Nombre Completo</Label>
                <Input
                  value={nuevoCliente.nombre}
                  placeholder="Ej. Juan Pérez"
                  className="bg-light border-0"
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
                <Label className="small fw-bold text-muted text-uppercase">
                  <FontAwesomeIcon icon={faVenusMars} className="me-1" /> Género
                </Label>
                <Input
                  type="select"
                  value={nuevoCliente.genero}
                  className="bg-light border-0"
                  onChange={e => setNuevoCliente({ ...nuevoCliente, genero: e.target.value as GeneroEnum })}
                >
                  <option value={GeneroEnum.MASCULINO}>Masculino</option>
                  <option value={GeneroEnum.FEMENINO}>Femenino</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label className="small fw-bold text-muted text-uppercase">Teléfono</Label>
                <Input
                  value={nuevoCliente.telefono || ''}
                  placeholder="8888-8888"
                  className="bg-light border-0"
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
            <Label className="small fw-bold text-muted text-uppercase">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> Dirección
            </Label>
            <Input
              type="textarea"
              value={nuevoCliente.direccion || ''}
              placeholder="Dirección exacta del cliente..."
              className="bg-light border-0"
              rows={2}
              onChange={e => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="border-0 bg-light rounded-bottom-4">
        <Button color="link" className="text-muted text-decoration-none" onClick={toggle}>
          CANCELAR
        </Button>
        <Button color="primary" className="px-5 fw-bold rounded-pill shadow-sm" onClick={guardarNuevoCliente}>
          GUARDAR
        </Button>
      </ModalFooter>
    </Modal>
  );
};
