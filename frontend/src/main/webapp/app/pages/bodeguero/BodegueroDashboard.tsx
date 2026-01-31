import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, Button } from 'reactstrap';

export const BodegueroDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">📦 Panel de Bodega</h2>
      <Row>
        <Col md="6">
          <Card className="mb-3">
            <CardBody>
              <CardTitle tag="h5">Stock Bajo</CardTitle>
              <h3 className="text-danger">0 Artículos</h3>
              <Button color="info" className="mt-2">
                Ver Inventario
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BodegueroDashboard;
