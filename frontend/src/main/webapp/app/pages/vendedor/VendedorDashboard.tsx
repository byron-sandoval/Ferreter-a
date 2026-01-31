import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button } from 'reactstrap';

export const VendedorDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">💰 Panel de Ventas</h2>
      <Row>
        <Col md="6">
          <Card className="mb-3 border-left-primary">
            <CardBody>
              <CardTitle tag="h5">Ventas del Día</CardTitle>
              <h3>0</h3>
              <Button color="primary" className="mt-2">
                Nueva Venta
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VendedorDashboard;
