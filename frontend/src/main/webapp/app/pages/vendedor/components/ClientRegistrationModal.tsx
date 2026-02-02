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
                  placeholder="281-XXXXXX-XXXXX"
                  className="bg-light border-0"
                  onChange={e => setNuevoCliente({ ...nuevoCliente, cedula: e.target.value })}
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
                  onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
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
                  onChange={e => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
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
