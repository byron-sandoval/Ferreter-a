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
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRulerCombined,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import UnidadMedidaService from '../../services/unidad-medida.service';
import { IUnidadMedida } from '../../shared/model/unidad-medida.model';
import { toast } from 'react-toastify';

export const GestionUnidadMedida = () => {
  const isAdmin = useAppSelector(state => state.authentication.account?.authorities?.includes(AUTHORITIES.ADMIN));
  const [unidades, setUnidades] = useState<IUnidadMedida[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<IUnidadMedida>({ nombre: '', simbolo: '', activo: true });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = unidades.filter(u => {
    const matchesStatus = showInactive ? u.activo === false || u.activo === null : u.activo === true;
    return matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const res = await UnidadMedidaService.getAll();
      setUnidades(res.data);
    } catch (e) {
      toast.error('Error al cargar unidades de medida');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setModal(!modal);
    if (!modal) setCurrentUnidad({ nombre: '', simbolo: '', activo: true });
  };

  const handleEdit = (u: IUnidadMedida) => {
    setCurrentUnidad(u);
    setModal(true);
  };

  const checkProductsBeforeDeactivate = async (id: number) => {
    try {
      const res = await import('app/services/articulo.service').then(m => m.default.countByCriteria({ 'unidadMedidaId.equals': id, 'activo.equals': true }));
      return res.data;
    } catch (e) {
      return 0;
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    try {
      const count = await checkProductsBeforeDeactivate(id);
      let message = `¿Está seguro de eliminar la unidad "${nombre}"?`;
      if (count > 0) {
        message = `⚠️ ATENCIÓN: La unidad "${nombre}" es usada por ${count} productos. \n\nSi la desactivas, TODOS estos productos también se desactivarán. \n\n¿Deseas continuar?`;
      }

      if (window.confirm(message)) {
        await UnidadMedidaService.delete(id);
        toast.success(count > 0 ? 'Unidad y productos desactivados' : 'Unidad eliminada');
        loadUnidades();
      }
    } catch (e) {
      toast.error('Error al procesar la solicitud.');
    }
  };

  const saveUnidad = async () => {
    try {
      if (currentUnidad.id) {
        await UnidadMedidaService.update(currentUnidad);
        toast.success('Unidad actualizada');
      } else {
        await UnidadMedidaService.create(currentUnidad);
        toast.success('Unidad creada');
      }
      toggle();
      loadUnidades();
    } catch (e) {
      toast.error('Error al guardar la unidad');
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-2 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3 py-2 bg-primary text-white rounded shadow-sm">
        <h5 className="m-0 fw-bold">
          <FontAwesomeIcon icon={faRulerCombined} className="me-2" />
          Gestión de Unidades de Medida
        </h5>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch d-flex align-items-center m-0">
            <Input
              type="switch"
              id="showInactiveSwitchUM"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
              style={{ cursor: 'pointer' }}
            />
            <label className="form-check-label text-white ms-2 small fw-bold" htmlFor="showInactiveSwitchUM" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Ver Inactivos
            </label>
          </div>
          {isAdmin && (
            <Button onClick={toggle} color="success" size="sm" className="fw-bold border-0 px-3">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> AGREGAR UNIDAD
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
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3">Símbolo</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3 text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(u => (
                    <tr key={u.id}>
                      <td className="px-4 fw-bold text-dark">{u.nombre}</td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-3 border border-info border-opacity-25">
                          {u.simbolo}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 py-2 ${u.activo ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}
                        >
                          {u.activo ? '● Activo' : '● Inactivo'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <Button color="link" className="text-primary me-2 p-0" onClick={() => handleEdit(u)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        {isAdmin && (
                          <Button color="link" className="text-danger p-0" onClick={() => u.id && handleDelete(u.id, u.nombre)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {unidades.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted italic">
                        No hay unidades de medida registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
                  <small className="text-muted ps-2">
                    Mostrando {Math.min(indexOfLastItem, filtered.length)} de {filtered.length} unidades
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

      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader toggle={toggle} className="border-0 pb-0">
          <h5 className="fw-bold mb-0">{currentUnidad.id ? 'Editar Unidad' : 'Nueva Unidad de Medida'}</h5>
        </ModalHeader>
        <ModalBody className="pt-4">
          <Form>
            <FormGroup>
              <Label className="small fw-bold text-uppercase text-muted">Nombre Completo</Label>
              <Input
                type="text"
                placeholder="Ej: Kilogramos, Galones, Yardas..."
                value={currentUnidad.nombre}
                onChange={e => setCurrentUnidad({ ...currentUnidad, nombre: e.target.value })}
                className="rounded-3 border-2"
              />
            </FormGroup>
            <FormGroup>
              <Label className="small fw-bold text-uppercase text-muted">Símbolo / Abreviatura</Label>
              <Input
                type="text"
                placeholder="Ej: Kg, Gal, Yd..."
                value={currentUnidad.simbolo}
                onChange={e => setCurrentUnidad({ ...currentUnidad, simbolo: e.target.value })}
                className="rounded-3 border-2"
              />
            </FormGroup>
            {isAdmin && (
              <FormGroup check>
                <Label check className="small fw-bold text-muted">
                  <Input
                    type="checkbox"
                    checked={currentUnidad.activo || false}
                    onChange={e => setCurrentUnidad({ ...currentUnidad, activo: e.target.checked })}
                  />{' '}
                  Esta unidad estará disponible para nuevos productos
                </Label>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter className="border-0 pt-0">
          <Button color="light" onClick={toggle} className="rounded-3 px-4">
            Cancelar
          </Button>
          <Button color="primary" onClick={saveUnidad} className="rounded-3 px-4 shadow-sm fw-bold">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Guardar Unidad
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GestionUnidadMedida;
