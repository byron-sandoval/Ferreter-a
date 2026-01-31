import React from 'react';
import { Row, Col, Card, CardBody, CardTitle } from 'reactstrap';

export const AdminDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">🔑 Panel de Administración</h2>
      <Row>
        <Col md="4">
          <Card className="text-white bg-primary mb-3">
            <CardBody>
              <CardTitle tag="h5">Total Ventas</CardTitle>
              <h3>C$ 0.00</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-white bg-success mb-3">
            <CardBody>
              <CardTitle tag="h5">Artículos</CardTitle>
              <h3>0</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-white bg-info mb-3">
            <CardBody>
              <CardTitle tag="h5">Usuarios</CardTitle>
              <h3>0</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
