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
                  className="h-100 shadow-sm border-0 product-card cursor-pointer overflow-hidden"
                  onClick={() => agregarAlCarrito(prod)}
                  style={{
                    transition: 'all 0.3s ease',
                    borderRadius: '12px',
                    backgroundColor: '#fff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                  }}
                >
                  {/* Top Bar with Code and Stock */}
                  <div className="d-flex justify-content-between align-items-center px-2 pt-1">
                    <div className="text-muted fw-bold" style={{ fontSize: '0.55rem' }}>
                      #{prod.codigo}
                    </div>
                    <Badge
                      color={(prod.existencia || 0) > 0 ? 'success' : 'danger'}
                      className="px-2 py-1 shadow-sm"
                      style={{ fontSize: '0.70rem', borderRadius: '5px' }}
                    >
                      Stock: {prod.existencia}
                    </Badge>
                  </div>

                  {/* Image Container */}
                  <div className="text-center d-flex align-items-center justify-content-center bg-white" style={{ height: '100px', padding: '5px' }}>
                    {prod.imagen ? (
                      <img
                        src={`data:${prod.imagenContentType};base64,${prod.imagen}`}
                        alt={prod.nombre}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faBoxOpen} size="lg" className="text-muted opacity-50" />
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="px-2 pb-1 pt-0 text-start bg-white">
                    <div
                      className="fw-bold text-uppercase"
                      style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.4px',
                        color: '#444',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.2',
                        height: '2.4em',
                        wordBreak: 'break-word'
                      }}
                      title={prod.nombre}
                    >
                      {prod.nombre}
                    </div>
                    <div className="fw-bold" style={{ color: '#007bff', fontSize: '0.90rem' }}>
                      C$ {prod.precio?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
    </Col>
  );
};
