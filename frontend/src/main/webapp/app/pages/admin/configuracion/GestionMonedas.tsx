import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faChevronLeft,
  faChevronRight,
  faExchangeAlt,
  faCoins,
  faSync,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import MonedaService from 'app/services/moneda.service';
import { IMoneda } from 'app/shared/model/moneda.model';
import { toast } from 'react-toastify';

export const GestionMonedas = () => {
  const isAdmin = useAppSelector(state => state.authentication.account?.authorities?.includes(AUTHORITIES.ADMIN));
  const [monedas, setMonedas] = useState<IMoneda[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [currentMoneda, setCurrentMoneda] = useState<IMoneda>({ nombre: '', simbolo: '', tipoCambio: 1, activo: true });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = monedas.filter(m => {
    const matchesStatus = showInactive ? m.activo === false || m.activo === null : m.activo === true;
    return matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    loadMonedas();
  }, []);

  const loadMonedas = async () => {
    setLoading(true);
    try {
      const res = await MonedaService.getAll();
      setMonedas(res.data);
    } catch (e) {
      console.error('Error al cargar monedas', e);
      // No mostramos toast si el sistema está limpio/vacío
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
    if (!modal) setCurrentMoneda({ nombre: '', simbolo: '', tipoCambio: 1, activo: true });
  };

  const handleEdit = (m: IMoneda) => {
    setCurrentMoneda(m);
    setModal(true);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de de desactivar la moneda "${nombre}"? \n\nEsto no la borrará definitivamente, pero no se podrá usar para nuevas ventas.`)) {
      try {
        const moneda = monedas.find(m => m.id === id);
        if (moneda) {
          await MonedaService.update({ ...moneda, activo: false });
          toast.success('Moneda desactivada');
          loadMonedas();
        }
      } catch (e) {
        toast.error('Error al desactivar la moneda.');
      }
    }
  };

  const handleReactivate = async (id: number, nombre: string) => {
    try {
      const moneda = monedas.find(m => m.id === id);
      if (moneda) {
        await MonedaService.update({ ...moneda, activo: true });
        toast.success(`Moneda "${nombre}" reactivada con éxito`);
        loadMonedas();
      }
    } catch (e) {
      toast.error('Error al reactivar la moneda.');
    }
  };

  const saveMoneda = async () => {
    try {
      if (currentMoneda.id) {
        await MonedaService.update(currentMoneda);
        toast.success('Moneda actualizada');
      } else {
        await MonedaService.create({ ...currentMoneda, activo: true });
        toast.success('Moneda creada');
      }
      toggle();
      loadMonedas();
    } catch (e) {
      toast.error('Error al guardar la moneda');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-2 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3 py-2 bg-primary text-white rounded shadow-sm">
        <h5 className="m-0 fw-bold">
          <FontAwesomeIcon icon={faCoins} className="me-2" />
          Gestión de Monedas y Tasas
        </h5>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch d-flex align-items-center m-0">
            <Input
              type="switch"
              id="showInactiveSwitchMoneda"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
              style={{ cursor: 'pointer' }}
            />
            <label
              className="form-check-label text-white ms-2 small fw-bold"
              htmlFor="showInactiveSwitchMoneda"
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Ver Inactivos
            </label>
          </div>
          {isAdmin && (
            <Button onClick={toggle} color="success" size="sm" className="fw-bold border-0 px-3">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> AGREGAR MONEDA
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col md="12">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <CardBody className="p-0">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="bg-light text-muted small text-uppercase fw-bold">
                  <tr>
                    <th className="py-3 px-4">Moneda</th>
                    <th className="py-3">Símbolo</th>
                    <th className="py-3">Tipo de Cambio</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3 text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 fw-bold text-dark">{m.nombre}</td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-3 border border-info border-opacity-25 fw-bold">
                          {m.simbolo}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faExchangeAlt} className="text-muted me-2 small" />
                          <span className="fw-semibold text-primary">
                            1.00 {m.simbolo} = {(m.tipoCambio || 1).toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${m.activo ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}
                        >
                          {m.activo ? '● Activo' : '● Inactivo'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        {isAdmin && m.activo && (
                          <Button color="link" className="text-danger me-2 p-0" title="Desactivar" onClick={() => m.id && handleDelete(m.id, m.nombre || '')}>
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        )}
                        {isAdmin && !m.activo && (
                          <Button color="link" className="text-success me-2 p-0" title="Reactivar" onClick={() => m.id && handleReactivate(m.id, m.nombre || '')}>
                            <FontAwesomeIcon icon={faSync} />
                          </Button>
                        )}
                        <Button color="link" className="text-primary p-0" title="Editar" onClick={() => handleEdit(m)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted italic">
                        No hay monedas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
                  <small className="text-muted ps-2">
                    Mostrando {Math.min(indexOfLastItem, filtered.length)} de {filtered.length} monedas
                  </small>
                  <Pagination size="sm" className="mb-0 pe-2">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink previous onClick={() => paginate(currentPage - 1)}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </PaginationLink>
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem active={i + 1 === currentPage} key={i}>
                        <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink next onClick={() => paginate(currentPage + 1)}>
                        <FontAwesomeIcon icon={faChevronRight} />
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="mt-4 info-box-premium d-flex align-items-center animate__animated animate__fadeInUp">
        <div className="info-icon-circle me-3">
          <FontAwesomeIcon icon={faMoneyBillWave} />
        </div>
        <div>
          <h6 className="fw-bold mb-1" style={{ color: '#00264d' }}>Nota sobre el Tipo de Cambio</h6>
          <p className="small mb-0 opacity-75 text-dark">
            El tipo de cambio se utiliza para convertir precios entre monedas. Si desactivas una moneda, 
            ya no se podrá seleccionar para nuevas ventas ni compras, pero se mantendrá en tu historial.
          </p>
        </div>
      </div>

      <Modal isOpen={modal} toggle={toggle} centered className="modal-custom-styled">
        <ModalHeader toggle={toggle} className="border-0 pb-0">
          <h5 className="fw-bold mb-0" style={{ color: '#00264d' }}>
            {currentMoneda.id ? 'Editar Moneda' : 'Nueva Moneda'}
          </h5>
        </ModalHeader>
        <ModalBody className="pt-4">
          <Form>
            <FormGroup>
              <Label className="small fw-bold text-uppercase text-muted mb-2">Nombre de la Moneda</Label>
              <Input
                type="text"
                placeholder="Ej: Dólares, Córdobas, Quetzales..."
                value={currentMoneda.nombre}
                onChange={e => setCurrentMoneda({ ...currentMoneda, nombre: e.target.value })}
                className="custom-input"
              />
            </FormGroup>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label className="small fw-bold text-uppercase text-muted mb-2">Símbolo</Label>
                  <Input
                    type="text"
                    placeholder="Ej: $, C$, U$"
                    value={currentMoneda.simbolo}
                    onChange={e => setCurrentMoneda({ ...currentMoneda, simbolo: e.target.value })}
                    className="custom-input"
                  />
                </FormGroup>
              </Col>
              <Col md="8">
                <FormGroup>
                  <Label className="small fw-bold text-uppercase text-muted mb-2">Tipo de Cambio</Label>
                  <InputGroup className="exchange-input-group shadow-sm">
                    <InputGroupText className="bg-white border-0 py-0 px-3 small fw-bold text-muted border-end">
                      1 {currentMoneda.simbolo || '?'} =
                    </InputGroupText>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Ej: 36.50"
                      value={currentMoneda.tipoCambio}
                      onChange={e => setCurrentMoneda({ ...currentMoneda, tipoCambio: parseFloat(e.target.value) })}
                      className="border-0 shadow-none ps-2"
                      style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#00264d' }}
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>
            {isAdmin && currentMoneda.id && (
              <FormGroup check className="mt-2">
                <Label check className="small fw-bold text-muted">
                  <Input
                    type="checkbox"
                    checked={currentMoneda.activo || false}
                    onChange={e => setCurrentMoneda({ ...currentMoneda, activo: e.target.checked })}
                  />{' '}
                  Moneda Activa (Disponible para el sistema)
                </Label>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter className="border-0 pt-0 pb-4 justify-content-center">
          <Button color="light" onClick={toggle} className="btn-cancel-custom mx-2">
            CANCELAR
          </Button>
          <Button color="primary" onClick={saveMoneda} className="btn-save-vibrant mx-2">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            GUARDAR CONFIGURACIÓN
          </Button>
        </ModalFooter>
      </Modal>

      <style>
        {`
          .info-box-premium {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 140, 255, 0.2);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
          }
          .info-icon-circle {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #0dcaf0, #008cff);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(13, 202, 240, 0.3);
          }
          .modal-custom-styled .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          }
          .exchange-input-group {
            border: 1px solid #c9d6e4;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            display: flex;
            align-items: center;
            transition: all 0.3s;
          }
          .exchange-input-group:focus-within {
            border-color: #008cff;
            box-shadow: 0 0 0 4px rgba(0, 140, 255, 0.1) !important;
          }
          .btn-cancel-custom {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #64748b !important;
            padding: 10px 25px !important;
            border-radius: 10px !important;
            font-weight: bold !important;
            letter-spacing: 0.5px;
          }
          .btn-save-vibrant {
            background: linear-gradient(90deg, #1e88e5, #1565c0) !important;
            border: none !important;
            color: white !important;
            padding: 10px 30px !important;
            border-radius: 10px !important;
            font-weight: bold !important;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(21, 101, 192, 0.4);
          }
        `}
      </style>
    </div>
  );
};

export default GestionMonedas;
