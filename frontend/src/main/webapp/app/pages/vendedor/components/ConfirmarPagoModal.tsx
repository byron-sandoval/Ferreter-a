import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Input, Label, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faCreditCard, faExchangeAlt, faHandHoldingUsd, faCoins } from '@fortawesome/free-solid-svg-icons';
import { MetodoPagoEnum } from 'app/shared/model/venta.model';
import { IMoneda } from 'app/shared/model/moneda.model';

interface IConfirmarPagoModalProps {
  isOpen: boolean;
  toggle: () => void;
  total: number; // Total en C$
  monedas: IMoneda[];
  onConfirm: (metodo: MetodoPagoEnum, montoRecibido: number, cambio: number, voucher: string, monedaId: number) => void;
  loading: boolean;
}

export const ConfirmarPagoModal: React.FC<IConfirmarPagoModalProps> = ({ isOpen, toggle, total, monedas, onConfirm, loading }) => {
  const [metodoPago, setMetodoPago] = useState<MetodoPagoEnum>(MetodoPagoEnum.EFECTIVO);
  const [monedaPago, setMonedaPago] = useState<IMoneda | null>(null);
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [voucher, setVoucher] = useState('');

  const activeMonedas = monedas.filter(m => m.activo !== false);

  const cordoba = activeMonedas.find(m => m.simbolo === 'C$') || activeMonedas[0] || { tipoCambio: 1, simbolo: 'C$', id: 1, nombre: 'Córdobas' };
  const dolar = activeMonedas.find(m => m.simbolo === '$') || { tipoCambio: 36.60, simbolo: '$', id: 2, nombre: 'Dólares' };

  useEffect(() => {
    if (isOpen) {
      setMonedaPago(cordoba);
      setMontoRecibido('');
      setVoucher('');
    }
  }, [isOpen]);

  const tipoCambio = monedaPago?.tipoCambio || 1;
  const totalEnMoneda = total / tipoCambio;
  const montoRecibidoNum = parseFloat(montoRecibido) || 0;

  // El cambio siempre lo daremos en Córdobas por defecto, o calculamos el equivalente
  const montoRecibidoEnCordobas = montoRecibidoNum * tipoCambio;
  const cambioCordobas = Math.max(0, montoRecibidoEnCordobas - total);

  const handleConfirm = () => {
    onConfirm(metodoPago, montoRecibidoNum, cambioCordobas, voucher, monedaPago?.id || 1);
  };

  const puedeFinalizar =
    metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? voucher.trim() !== '' :
      montoRecibidoEnCordobas >= (total - 0.01); // Margen por redondeo

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-dark text-white border-0 py-2">
        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />
        <small className="fw-bold">PAGO</small>
      </ModalHeader>
      <ModalBody className="p-3 bg-light">
        <div className="text-center mb-3 p-2 bg-white rounded-4 shadow-sm border border-primary border-opacity-10">
          <small className="text-muted text-uppercase fw-bold mb-0 d-block" style={{ fontSize: '0.65rem' }}>Total a Cobrar</small>
          <h3 className="fw-bold text-dark m-0">C$ {total.toFixed(2)}</h3>
          {monedaPago?.simbolo !== 'C$' && (
            <Badge color="info" pill className="mt-1 px-2 py-1" style={{ fontSize: '0.75rem' }}>
              {monedaPago?.simbolo} {totalEnMoneda.toFixed(2)}
            </Badge>
          )}
        </div>

        <Row className="mb-3">
          <Col xs="12">
            <Label className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Método de Pago</Label>
            <div className="d-flex gap-2">
              <Button
                color={metodoPago === MetodoPagoEnum.EFECTIVO ? 'primary' : 'outline-dark'}
                className="flex-fill py-2 fw-bold border-2 d-flex flex-column align-items-center shadow-sm"
                onClick={() => setMetodoPago(MetodoPagoEnum.EFECTIVO)}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="mb-1" />
                <small>EFECTIVO</small>
              </Button>
              <Button
                color={metodoPago === MetodoPagoEnum.TARJETA_STRIPE ? 'primary' : 'outline-dark'}
                className="flex-fill py-2 fw-bold border-2 d-flex flex-column align-items-center shadow-sm"
                onClick={() => setMetodoPago(MetodoPagoEnum.TARJETA_STRIPE)}
              >
                <FontAwesomeIcon icon={faCreditCard} className="mb-1" />
                <small>TARJETA</small>
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="6">
            <Label className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Moneda</Label>
            <Input
              type="select"
              bsSize="sm"
              className="fw-bold border-0 shadow-sm"
              value={monedaPago?.id || ''}
              onChange={(e) => setMonedaPago(activeMonedas.find(m => m.id === Number(e.target.value)) || null)}
            >
              {activeMonedas.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.simbolo})
                </option>
              ))}
            </Input>
          </Col>
          <Col md="6">
            <Label className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>
              {metodoPago === MetodoPagoEnum.EFECTIVO ? 'Recibido' : 'Referencia'}
            </Label>
            {metodoPago === MetodoPagoEnum.EFECTIVO ? (
              <div className="position-relative shadow-sm rounded">
                <span className="position-absolute start-0 top-50 translate-middle-y ms-2 fw-bold text-muted small">
                  {monedaPago?.simbolo === 'C$' ? 'C$' : '$'}
                </span>
                <Input
                  type="number"
                  bsSize="sm"
                  placeholder="0.00"
                  className="fw-bold ps-4 border-0"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <Input
                type="text"
                bsSize="sm"
                placeholder="Voucher #"
                className="fw-bold border-0 shadow-sm"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
              />
            )}
          </Col>
        </Row>

        {metodoPago === MetodoPagoEnum.EFECTIVO && montoRecibidoNum > 0 && (
          <div className="bg-white p-3 rounded-4 border shadow-sm animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-medium"><FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" /> Cambio a entregar:</span>
              <h4 className="fw-bold text-success m-0">C$ {cambioCordobas.toFixed(2)}</h4>
            </div>

          </div>
        )}
      </ModalBody>
      <ModalFooter className="border-0 p-3 bg-white">
        <Button color="link" className="text-muted fw-bold text-decoration-none me-auto px-0" onClick={toggle}>
          <small>CANCELAR</small>
        </Button>
        <Button
          color="success"
          className="px-4 fw-bold shadow-sm"
          disabled={!puedeFinalizar || loading}
          onClick={handleConfirm}
        >
          {loading ? '...' : 'EMITIR TICKET'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
