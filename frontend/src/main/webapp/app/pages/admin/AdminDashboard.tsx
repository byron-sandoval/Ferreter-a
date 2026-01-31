import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Table, Badge, Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faBoxes, faUsers, faExclamationTriangle, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import { IArticulo } from 'app/shared/model/articulo.model';

export const AdminDashboard = () => {
  const [bajoStock, setBajoStock] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar productos con bajo stock
    // Nota: El backend debe soportar este filtro, si no, traerá todos.
    // Asumiremos que el endpoint existe o traeremos todos y filtraremos en front por ahora si falla.
    ArticuloService.getAll()
      .then(res => {
        const low = res.data.filter(a => (a.existencia || 0) <= (a.existenciaMinima || 0));
        setBajoStock(low);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-primary fw-bold">
        <FontAwesomeIcon icon={faChartLine} className="me-2" /> Panel de Control Gerencial
      </h2>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md="3">
          <Card className="shadow-sm border-start border-primary border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted small fw-bold mb-1">Ventas del Día</div>
                  <h3 className="mb-0 text-primary">C$ 0.00</h3>
                </div>
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" className="text-gray-300" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-success border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted small fw-bold mb-1">Ventas del Mes</div>
                  <h3 className="mb-0 text-success">C$ 0.00</h3>
                </div>
                <FontAwesomeIcon icon={faChartLine} size="2x" className="text-gray-300" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-info border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted small fw-bold mb-1">Inventario Total</div>
                  <h3 className="mb-0 text-info">0 Items</h3>
                </div>
                <FontAwesomeIcon icon={faBoxes} size="2x" className="text-gray-300" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="shadow-sm border-start border-warning border-4 h-100">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase text-muted small fw-bold mb-1">Usuarios Activos</div>
                  <h3 className="mb-0 text-warning">0</h3>
                </div>
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-gray-300" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="8">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h5" className="text-primary border-bottom pb-3 mb-3">
                📊 Rendimiento de Ventas (Últimos 7 días)
              </CardTitle>
              <div className="text-center text-muted py-5" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                [Gráfico de Ventas Aquí]
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Alertas de Stock */}
        <Col md="4">
          <Card className="shadow mb-4">
            <CardBody>
              <CardTitle tag="h5" className="text-danger border-bottom pb-3 mb-3 d-flex justify-content-between">
                <span>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Alertas de Stock
                </span>
                <Badge color="danger" pill>
                  {bajoStock.length}
                </Badge>
              </CardTitle>

              {loading ? (
                <div className="text-center">checking stock...</div>
              ) : bajoStock.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table size="sm" borderless>
                    <tbody>
                      {bajoStock.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="fw-bold">{p.nombre}</div>
                            <small className="text-muted">{p.codigo}</small>
                          </td>
                          <td className="text-end text-danger fw-bold">
                            {p.existencia} / {p.existenciaMinima}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-success py-4">
                  <FontAwesomeIcon icon={faBoxes} size="2x" className="mb-2" />
                  <p>¡Todo en orden! No hay stock bajo.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
