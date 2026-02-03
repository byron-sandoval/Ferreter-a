import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { IVenta } from 'app/shared/model';

interface DevolucionModalProps {
  isOpen: boolean;
  toggle: () => void;
  venta: IVenta | null;
  motivo: string;
  setMotivo: (value: string) => void;
  onConfirm: () => void;
}

export const DevolucionModal: React.FC<DevolucionModalProps> = ({ isOpen, toggle, venta, motivo, setMotivo, onConfirm }) => {
  if (!venta) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-danger text-white border-0">
        <FontAwesomeIcon icon={faUndo} className="me-2" /> Procesar Devolución
      </ModalHeader>
      <ModalBody className="p-4">
        <div className="bg-light p-3 rounded-4 mb-4 text-center">
          <small className="text-muted d-block text-uppercase fw-bold mb-1">Folio a Reversar</small>
          <h4 className="fw-bold text-danger m-0">#{venta.noFactura}</h4>
          <div className="mt-2 fw-bold fs-5">Monto Total: C$ {venta.total?.toFixed(2)}</div>
        </div>
        <Form>
          <FormGroup>
            <Label className="small fw-bold text-muted text-uppercase">Motivo de la Devolución</Label>
            <Input
              type="textarea"
              rows="4"
              placeholder="Ej: Producto defectuoso, Error en despacho, Cliente arrepentido..."
              className="bg-light border-0"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
            />
          </FormGroup>
        </Form>
        <div className="alert alert-warning border-0 small mb-0">
          <FontAwesomeIcon icon={faUndo} className="me-2" /> Al confirmar, se generará una nota de crédito y el inventario será ajustado
          automáticamente (si aplica).
        </div>
      </ModalBody>
      <ModalFooter className="border-0">
        <Button color="light" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="danger" className="px-4 fw-bold" onClick={onConfirm} disabled={!motivo}>
          Confirmar Devolución
        </Button>
      </ModalFooter>
    </Modal>
  );
};
