import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Input, Badge, Table, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBox, faTags, faSync, faImages } from '@fortawesome/free-solid-svg-icons';
import ArticuloService from 'app/services/articulo.service';
import CategoriaService from 'app/services/categoria.service';
import { IArticulo } from 'app/shared/model/articulo.model';
import { ICategoria } from 'app/shared/model/categoria.model';

export const ConsultaInventario = () => {
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resArt, resCat] = await Promise.all([ArticuloService.getAll(), CategoriaService.getAll()]);
      setArticulos(resArt.data);
      setCategorias(resCat.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = articulos.filter(a => {
    const matchText =
      (a.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (a.codigo || '').toLowerCase().includes(filter.toLowerCase());
    const matchCat = catFilter === '' || a.categoria?.id === Number(catFilter);
    return a.activo !== false && matchText && matchCat;
  });

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold text-secondary mb-0">
          <FontAwesomeIcon icon={faBox} className="me-2 text-primary" /> Consulta Rápida
        </h5>
        <Button color="light" size="sm" onClick={loadData} disabled={loading} style={{ fontSize: '0.75rem' }}>
          <FontAwesomeIcon icon={faSync} spin={loading} className="me-1" /> Actualizar
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <Row className="g-2">
            <Col md="8">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <Input
                  placeholder="Buscar por Nombre o Código de Barras..."
                  className="border-start-0"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </Col>
            <Col md="4">
              <Input
                type="select"
                bsSize="sm"
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="">Todas las Categorías</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Row className="g-2">
        {filtered.map(a => (
          <Col md="2" sm="4" xs="6" key={a.id}>
            <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
              <div className="text-center p-2 bg-white d-flex align-items-center justify-content-center" style={{ height: '110px' }}>
                {a.imagen ? (
                  <img
                    src={`data:${a.imagenContentType};base64,${a.imagen}`}
                    alt={a.nombre}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faImages} size="2x" className="text-muted opacity-25" />
                )}
              </div>
              <CardBody className="border-top p-2">
                <div className="d-flex justify-content-between align-items-start mb-1 gap-1">
                  <Badge color="info" className="p-1 opacity-75" style={{ fontSize: '0.65rem' }}>
                    {a.categoria?.nombre || 'General'}
                  </Badge>
                  <Badge
                    color={(a.existencia || 0) > (a.existenciaMinima || 0) ? 'success' : 'danger'}
                    pill
                    className="px-1"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {a.existencia} disp.
                  </Badge>
                </div>
                <div className="fw-bold text-dark mb-0 text-truncate" title={a.nombre} style={{ fontSize: '0.8rem' }}>
                  {a.nombre}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {a.codigo}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                    C$ {a.precio?.toFixed(2)}
                  </span>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                    mín: {a.existenciaMinima}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}

        {filtered.length === 0 && (
          <Col xs="12" className="text-center py-5">
            <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted opacity-25 mb-3" />
            <h5 className="text-muted">No encontramos productos con esos filtros.</h5>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ConsultaInventario;
