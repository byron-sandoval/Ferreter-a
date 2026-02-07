import React from 'react';
import { Row, Col, Card, CardBody, Input, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICategoria } from 'app/shared/model/categoria.model';

interface IProductCatalogProps {
  articulos: IArticulo[];
  categorias: ICategoria[];
  termino: string;
  setTermino: (val: string) => void;
  categoriaFiltro: string;
  setCategoriaFiltro: (val: string) => void;
  agregarAlCarrito: (prod: IArticulo) => void;
}

export const ProductCatalog: React.FC<IProductCatalogProps> = ({
  articulos,
  categorias,
  termino,
  setTermino,
  categoriaFiltro,
  setCategoriaFiltro,
  agregarAlCarrito,
}) => {
  return (
    <Col md="7">
      <Card className="shadow-sm mb-2 border">
        <CardBody className="py-2 px-3 bg-white rounded">
          <Row className="align-items-center g-0">
            <Col className="d-flex align-items-center">
              <span className="text-muted me-2">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <Input
                placeholder="Escribe el nombre o código..."
                className="border-0 shadow-none ps-0 bg-transparent"
                style={{ fontSize: '0.9rem', fontWeight: '400' }}
                autoFocus
                value={termino}
                onChange={e => setTermino(e.target.value)}
              />
            </Col>
            <Col xs="auto" className="border-start ps-3">
              <Input
                type="select"
                className="border-0 shadow-none bg-transparent fw-bold text-primary"
                style={{ fontSize: '0.85rem', width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="todas">Todas las Categorías</option>
                {categorias
                  .filter(c => c.activo !== false)
                  .map(cat => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div style={{ height: 'calc(100vh - 180px)', overflowY: 'auto', overflowX: 'hidden', paddingRight: '10px' }}>
        <Row className="g-3">
          {articulos
            .filter(p => {
              const term = termino
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              const nombre = (p.nombre || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              const codigo = (p.codigo || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              const uniNombre = (p.unidadMedida?.nombre || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              const uniSimbolo = (p.unidadMedida?.simbolo || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

              const matchesSearch = nombre.includes(term) || codigo.includes(term) || uniNombre.includes(term) || uniSimbolo.includes(term);

              const matchesCategory = categoriaFiltro === 'todas' || p.categoria?.nombre === categoriaFiltro;
              const categoryIsActive = p.categoria ? p.categoria.activo !== false : true;
              return p.activo !== false && categoryIsActive && matchesSearch && matchesCategory;
            })
            .map(prod => (
              <Col md="3" key={prod.id}>
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
                        style={{ height: '75px', objectFit: 'contain' }}
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
