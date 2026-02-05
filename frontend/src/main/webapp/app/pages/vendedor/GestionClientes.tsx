import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Card, CardBody, Input, Row, Col, Progress, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSearch, faUserEdit, faHistory, faExclamationCircle, faPlus, faChartLine } from '@fortawesome/free-solid-svg-icons';
import ClienteService from 'app/services/cliente.service';
import VentaService from 'app/services/venta.service';
import { ICliente } from 'app/shared/model/cliente.model';
import { IVenta } from 'app/shared/model/venta.model';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

export const GestionClientes = () => {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente | null>(null);
  const [historial, setHistorial] = useState<IVenta[]>([]);

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

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <h5 className="fw-bold text-secondary mb-0">
          <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" /> Clientes registrados
        </h5>
        <Button color="primary" size="sm" outline style={{ fontSize: '0.75rem' }}>
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Cliente
        </Button>
      </div>

      <Row className="g-2">
        <Col md="7">
          <Card className="shadow-sm border-0 mb-2 bg-white rounded-3 overflow-hidden">
            <CardBody className="p-0">
              <div className="p-2 bg-light border-bottom">
                <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <Input
                    placeholder="Buscar cliente..."
                    className="border-start-0"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
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
                  {filtered.map(c => (
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
                        <Button color="light" size="sm" className="p-1">
                          <FontAwesomeIcon icon={faUserEdit} fixedWidth />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
    </div>
  );
};

export default GestionClientes;
