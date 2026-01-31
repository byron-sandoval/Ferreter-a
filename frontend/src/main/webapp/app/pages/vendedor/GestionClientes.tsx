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
      // JHipster usually supports filtering by client.id
      const res = await VentaService.getAll(); // Simplified for now, in real dev we filter by ID
      setHistorial(res.data.filter(v => v.cliente?.id === c.id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = clientes.filter(
    c => (c.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (c.cedula || '').toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="animate__animated animate__fadeIn p-2">
      <h3 className="fw-bold mb-4 text-secondary">
        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" /> Gestión de Clientes y Crédito
      </h3>

      <Row>
        <Col md="7">
          <Card className="shadow-sm border-0 mb-4 bg-white rounded-4 overflow-hidden">
            <CardBody className="p-0">
              <div className="p-3 bg-light border-bottom d-flex justify-content-between">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <Input
                    placeholder="Buscar cliente..."
                    className="border-start-0"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                </div>
                <Button color="primary" size="sm" className="px-3" outline>
                  <FontAwesomeIcon icon={faPlus} className="me-2" /> Nuevo Cliente
                </Button>
              </div>
              <Table hover className="mb-0 align-middle">
                <thead className="bg-white text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th>Cédula</th>
                    <th>Saldo</th>
                    <th className="text-center">Estado</th>
                    <th className="text-end px-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => verDetalle(c)}
                      style={{ cursor: 'pointer' }}
                      className={clienteSeleccionado?.id === c.id ? 'table-primary border-start border-primary border-4' : ''}
                    >
                      <td className="px-4 fw-bold">{c.nombre}</td>
                      <td className="small text-muted">{c.cedula}</td>
                      <td className="fw-bold">
                        <span className={(c.saldo || 0) > 0 ? 'text-danger' : 'text-success'}>C$ {c.saldo?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="text-center">
                        <Badge color={c.activo ? 'success' : 'secondary'} pill>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button color="light" size="sm" className="rounded-pill">
                          <FontAwesomeIcon icon={faUserEdit} />
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
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
                <div className="bg-primary p-4 text-white">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="fw-bold m-0">{clienteSeleccionado.nombre}</h4>
                      <small className="opacity-75">{clienteSeleccionado.cedula}</small>
                    </div>
                    <FontAwesomeIcon icon={faChartLine} size="2x" className="opacity-25" />
                  </div>
                  <div className="mt-4">
                    <small className="d-block text-uppercase opacity-75 fw-bold mb-1">Saldo Pendiente</small>
                    <h2 className="fw-bold m-0">C$ {(clienteSeleccionado.saldo || 0).toFixed(2)}</h2>
                  </div>
                </div>
                <CardBody>
                  <div className="mb-4">
                    <Label className="small fw-bold text-muted text-uppercase mb-2">Comportamiento de Pago</Label>
                    <Progress value={80} color="success" className="rounded-pill" style={{ height: '8px' }} />
                    <small className="text-muted mt-1 d-block text-end">Crédito Saludable</small>
                  </div>
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0 py-3 border-0">
                      <FontAwesomeIcon icon={faHistory} className="me-3 text-primary" />
                      <span>
                        <strong>Ultima Compra:</strong> {historial.length > 0 ? dayjs(historial[0].fecha).format('DD/MM/YYYY') : 'N/A'}
                      </span>
                    </div>
                    <div className="list-group-item px-0 py-3 border-0">
                      <FontAwesomeIcon icon={faExclamationCircle} className="me-3 text-danger" />
                      <span>
                        <strong>Alertas:</strong> {(clienteSeleccionado.saldo || 0) > 1000 ? 'Riesgo de Mora' : 'Sin Alertas'}
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
