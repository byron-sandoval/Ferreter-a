import React from 'react';
import { Row, Col, Card, CardBody, Input, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { IArticulo } from 'app/shared/model/articulo.model';

interface IProductCatalogProps {
  articulos: IArticulo[];
  termino: string;
  setTermino: (val: string) => void;
  agregarAlCarrito: (prod: IArticulo) => void;
}

export const ProductCatalog: React.FC<IProductCatalogProps> = ({ articulos, termino, setTermino, agregarAlCarrito }) => {
  return (
    <Col md="7">
      <Card className="shadow-sm mb-3 border-0">
        <CardBody
          className="rounded-3 p-3"
          style={{ backgroundColor: '#ffc107', backgroundImage: 'linear-gradient(45deg, #ffc107 0%, #ffdb58 100%)' }}
        >
          <div className="input-group input-group-lg">
            <span className="input-group-text bg-transparent border-end-0 text-dark opacity-75">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <Input
              placeholder="Escribe el nombre o código del producto..."
              className="bg-transparent border-start-0 text-dark placeholder-dark"
              style={{ border: '1px solid rgba(0,0,0,0.1)', fontWeight: '500' }}
              autoFocus
              value={termino}
              onChange={e => setTermino(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        <Row className="g-3">
          {articulos
            .filter(
              p =>
                (p.nombre || '').toLowerCase().includes(termino.toLowerCase()) ||
                (p.codigo || '').toLowerCase().includes(termino.toLowerCase()),
            )
            .map(prod => (
              <Col md="4" key={prod.id}>
                <Card
                  className="h-100 shadow-sm border-0 product-card cursor-pointer"
                  onClick={() => agregarAlCarrito(prod)}
                  style={{ transition: '0.2s' }}
                >
                  <div className="position-relative text-center p-3 bg-light">
                    {prod.imagen ? (
                      <img
                        src={`data:${prod.imagenContentType};base64,${prod.imagen}`}
                        alt={prod.nombre}
                        style={{ height: '90px', objectFit: 'contain' }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faBoxOpen} size="3x" className="text-muted opacity-50" />
                    )}
                    <Badge
                      color={(prod.existencia || 0) > 0 ? 'success' : 'danger'}
                      className="position-absolute top-0 end-0 m-2 px-2 py-1"
                    >
                      Stock: {prod.existencia}
                    </Badge>
                  </div>
                  <CardBody className="p-2">
                    <div className="fw-bold text-dark text-truncate small" title={prod.nombre}>
                      {prod.nombre}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="text-primary fw-bold">C$ {prod.precio?.toFixed(2)}</span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {prod.codigo}
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
    </Col>
  );
};
