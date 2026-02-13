import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Badge,
  Card,
  CardBody,
  Input,
  Row,
  Col,
  Progress,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faSearch,
  faUserEdit,
  faHistory,
  faExclamationCircle,
  faPlus,
  faChartLine,
  faVenusMars,
  faMapMarkerAlt,
  faTrash,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import ClienteService from 'app/services/cliente.service';
import VentaService from 'app/services/venta.service';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';
import { IVenta } from 'app/shared/model/venta.model';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

export const GestionClientes = () => {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente | null>(null);
  const [historial, setHistorial] = useState<IVenta[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<ICliente>({
    nombre: '',
    cedula: '',
    genero: GeneroEnum.MASCULINO,
    telefono: '',
    direccion: '',
    activo: true,
  });

  // --- Lógica de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reiniciar a la página 1 cuando se escribe en el buscador
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ClienteService.getAll();
      setClientes(res.data);
    } catch (e) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const abrirNuevo = () => {
    setClienteEditar({
      nombre: '',
      cedula: '',
      genero: GeneroEnum.MASCULINO,
      telefono: '',
      direccion: '',
      activo: true,
    });
    toggleModal();
  };

  const abrirEditar = (e: React.MouseEvent, c: ICliente) => {
    e.stopPropagation();
    setClienteEditar({ ...c });
    toggleModal();
  };

  const guardarCliente = async () => {
    if (!clienteEditar.nombre || !clienteEditar.cedula) {
      toast.error('Nombre y Cédula son requeridos');
      return;
    }

    // Validación de Cédula Nicaragüense (Formato: 001-010180-0005Y o 0010101800005Y)
    const cedulaLimpia = (clienteEditar.cedula || '').replace(/-/g, '').toUpperCase();
    const cedulaRegex = /^\d{13}[A-Z]$/;

    if (!cedulaRegex.test(cedulaLimpia)) {
      toast.error('La cédula no tiene un formato válido (Ej: 001-010180-0005Y)');
      return;
    }

    const clienteParaGuardar = {
      ...clienteEditar,
      cedula: cedulaLimpia,
    };

    try {
      if (clienteParaGuardar.id) {
        await ClienteService.update(clienteParaGuardar);
        toast.success('Cliente actualizado con éxito');
      } else {
        await ClienteService.create(clienteParaGuardar);
        toast.success('Cliente creado con éxito');
      }
      toggleModal();
      loadData();
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error('Error: Ya existe un cliente con esta cédula.');
      } else {
        toast.error('cédula existente');
      }
    }
  };

  const eliminarCliente = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await ClienteService.delete(id);
        toast.success('Cliente eliminado con éxito');
        if (clienteSeleccionado?.id === id) setClienteSeleccionado(null);
        loadData();
      } catch (err) {
        toast.error('No se pudo eliminar el cliente. Es posible que tenga registros asociados.');
      }
    }
  };

  const verDetalle = async (c: ICliente) => {
    setClienteSeleccionado(c);
    try {
      const res = await VentaService.getAll({
        size: 1000,
        sort: 'fecha,desc',
      });
      setHistorial(res.data.filter(v => v.cliente?.id === c.id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = clientes.filter(
    c => (c.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (c.cedula || '').toLowerCase().includes(filter.toLowerCase()),
  );

  // Cálculos para mostrar solo los 10 de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <h5 className="fw-bold text-dark mb-0">
          <FontAwesomeIcon icon={faUsers} className="me-2 text-info" /> Clientes registrados
        </h5>
        <Button color="black" size="sm" outline style={{ fontSize: '0.75rem' }} onClick={abrirNuevo}>
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Cliente
        </Button>
      </div>

      <Row className="g-2">
        <Col md="7">
          <Card className="shadow-sm border-0 mb-2 bg-white rounded-3 overflow-hidden">
            <CardBody className="p-0">
              <div className="p-2 bg-white border-bottom d-flex justify-content-start">
                <div className="input-group shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: '320px', borderColor: '#18a1bcff' }}>
                  <span className="input-group-text bg-white border-0 ps-3">
                    <FontAwesomeIcon icon={faSearch} className="text-info opacity-75" />
                  </span>
                  <Input
                    placeholder="Buscar cliente..."
                    className="border-0 shadow-none ps-0"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ fontSize: '0.85rem', height: '34px' }}
                  />
                </div>
              </div>
              <Table hover size="sm" className="mb-0 align-middle">
                <thead className="bg-white text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                  <tr>
                    <th className="py-2 px-3">Nombre</th>
                    <th>Cédula</th>
                    <th>Teléfono</th>
                    <th>Género</th>
                    <th className="text-center">Estado</th>
                    <th className="text-end px-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => verDetalle(c)}
                      style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                      className={clienteSeleccionado?.id === c.id ? 'table-primary border-start border-primary border-4' : ''}
                    >
                      <td className="px-3 fw-bold">{c.nombre}</td>
                      <td className="small text-muted">{c.cedula}</td>
                      <td className="small text-muted">{c.telefono || '-'}</td>
                      <td className="small text-muted text-capitalize">{c.genero?.toLowerCase() || '-'}</td>
                      <td className="text-center">
                        <Badge color={c.activo ? 'success' : 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="text-end px-3">
                        <Button color="light" size="sm" className="p-1 me-1 text-primary" onClick={e => abrirEditar(e, c)}>
                          <FontAwesomeIcon icon={faUserEdit} fixedWidth />
                        </Button>
                        <Button color="light" size="sm" className="p-1 text-danger" onClick={e => eliminarCliente(e, c.id)}>
                          <FontAwesomeIcon icon={faTrash} fixedWidth />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
                  <small className="text-muted ps-2">
                    Mostrando {Math.min(indexOfLastItem, filtered.length)} de {filtered.length} clientes
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

        <Col md="5">
          {clienteSeleccionado ? (
            <div className="animate__animated animate__fadeIn">
              <Card className="shadow-lg border-0 rounded-3 overflow-hidden mb-2">
                <div className="bg-primary p-3 text-white">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold m-0">{clienteSeleccionado.nombre}</h5>
                      <small className="opacity-75" style={{ fontSize: '0.75rem' }}>
                        {clienteSeleccionado.cedula}
                      </small>
                    </div>
                  </div>
                </div>
                <CardBody className="p-2">
                  <div className="mb-2">
                    <Label className="fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
                      Perfil
                    </Label>
                    <Progress value={80} color="success" style={{ height: '4px' }} />
                  </div>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-1 border-0" style={{ fontSize: '0.8rem' }}>
                      <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                      <span>
                        <strong>Venta:</strong> {historial.length > 0 ? dayjs(historial[0].fecha).format('DD/MM/YY') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="shadow-sm border-0 rounded-4">
                <CardBody>
                  <h6 className="fw-bold text-muted text-uppercase mb-3 small">
                    <FontAwesomeIcon icon={faHistory} className="me-2" /> Historial Reciente
                  </h6>
                  {historial.map(v => (
                    <div key={v.id} className="d-flex justify-content-between align-items-center mb-3 p-2 rounded hover-light">
                      <div>
                        <div className="fw-bold small text-dark">Factura #{v.noFactura}</div>
                        <small className="text-muted">{dayjs(v.fecha).format('DD/MM/YYYY')}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">C$ {v.total?.toFixed(2)}</div>
                        <Badge color="light" pill className="text-dark border small">
                          {v.metodoPago}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {historial.length === 0 && <small className="text-muted d-block text-center py-3">No hay compras registradas.</small>}
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card className="shadow-sm border-0 rounded-4 h-100 d-flex align-items-center justify-content-center bg-light">
              <div className="text-center p-5">
                <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted opacity-25 mb-3" />
                <h6 className="text-muted">Selecciona un cliente para ver su historial y estado de cuenta.</h6>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <Modal isOpen={modalOpen} toggle={toggleModal} centered>
        <ModalHeader
          toggle={toggleModal}
          className="text-white border-0 py-4 text-center w-100"
          style={{
            background: 'linear-gradient(135deg, #595e66 0%, #11373f 100%)',
            boxShadow: '0 4px 15px rgba(29, 51, 56, 0.3)',
          }}
        >
          <div className="w-100 text-center">
            <FontAwesomeIcon
              icon={clienteEditar.id ? faUserEdit : faPlus}
              className="me-2 animate__animated animate__pulse animate__infinite"
            />
            <span className="fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
              {clienteEditar.id ? 'Actualizar Perfil de Cliente' : 'Registro de Nuevo Cliente'}
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
                    value={clienteEditar.cedula || ''}
                    placeholder="281-010180-0005Y"
                    className="bg-white border-1 shadow-sm"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: clienteEditar.id ? '#6c757d' : '#000',
                    }}
                    maxLength={16}
                    disabled={!!clienteEditar.id}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      const digitsOnly = raw.substring(0, 13).replace(/[^0-9]/g, '');
                      const lastChar =
                        raw.length > 13
                          ? raw
                            .substring(13, 14)
                            .replace(/[^a-zA-Z]/g, '')
                            .toUpperCase()
                          : '';
                      const input = digitsOnly + lastChar;

                      let formatted = input;
                      if (input.length > 3 && input.length <= 9) {
                        formatted = `${input.substring(0, 3)}-${input.substring(3)}`;
                      } else if (input.length > 9) {
                        formatted = `${input.substring(0, 3)}-${input.substring(3, 9)}-${input.substring(9)}`;
                      }
                      setClienteEditar({ ...clienteEditar, cedula: formatted });
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
                    Nombre Completo
                  </Label>
                  <Input
                    value={clienteEditar.nombre || ''}
                    placeholder="Ej. Juan Pérez"
                    className="bg-white border-1 shadow-sm"
                    style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                    maxLength={50}
                    onChange={e => {
                      const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                      setClienteEditar({ ...clienteEditar, nombre: val });
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
                    value={clienteEditar.genero || ''}
                    className="bg-white border-1 shadow-sm"
                    style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                    onChange={e => setClienteEditar({ ...clienteEditar, genero: e.target.value as GeneroEnum })}
                  >
                    <option value={GeneroEnum.MASCULINO}>Masculino</option>
                    <option value={GeneroEnum.FEMENINO}>Femenino</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
                    Teléfono
                  </Label>
                  <Input
                    value={clienteEditar.telefono || ''}
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
                      setClienteEditar({ ...clienteEditar, telefono: formatted });
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
                value={clienteEditar.direccion || ''}
                placeholder="Dirección exacta..."
                className="bg-white border-1 shadow-sm"
                style={{ borderRadius: '12px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#000' }}
                rows={2}
                onChange={e => setClienteEditar({ ...clienteEditar, direccion: e.target.value })}
              />
            </FormGroup>
            {clienteEditar.id && (
              <FormGroup check>
                <Label check className="small fw-bold text-uppercase" style={{ color: '#11373f' }}>
                  <Input
                    type="checkbox"
                    checked={!!clienteEditar.activo}
                    onChange={e => setClienteEditar({ ...clienteEditar, activo: e.target.checked })}
                  />{' '}
                  Cliente Activo
                </Label>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter className="border-0 bg-white pb-4 px-4">
          <Button color="link" className="text-muted fw-bold text-decoration-none" onClick={toggleModal}>
            CANCELAR
          </Button>
          <Button
            color="primary"
            className="px-5 fw-bold rounded-pill shadow"
            style={{ background: 'linear-gradient(135deg, #595e66 0%, #11373f 100%)', border: 'none' }}
            onClick={guardarCliente}
          >
            {clienteEditar.id ? 'ACTUALIZAR' : 'GUARDAR'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GestionClientes;
