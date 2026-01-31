import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Row, Col, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import { IArticulo } from '../../shared/model/articulo.model';
import ArticuloService from '../../services/articulo.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

export const ArticuloList = () => {
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadAll = () => {
    setLoading(true);
    ArticuloService.getAll()
      .then(res => {
        setArticulos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const articulosFiltrados = articulos.filter(
    a => a.nombre?.toLowerCase().includes(filter.toLowerCase()) || a.codigo?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <h2 id="articulo-heading" className="d-flex justify-content-between align-items-center mb-4">
        📦 Inventario de Artículos
        <div className="d-flex gap-2">
          <Button color="info" onClick={loadAll} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Actualizar
          </Button>
          <Button color="primary" id="jh-create-entity">
            <FontAwesomeIcon icon={faPlus} /> Nuevo Artículo
          </Button>
        </div>
      </h2>

      <Card className="mb-4">
        <CardBody>
          <Row>
            <Col md="6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <Input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="border-start-0"
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="bg-white py-3">
          <h5 className="mb-0 text-primary">Listado de Existencias</h5>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0">
              <thead className="bg-light text-center uppercase">
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Existencia</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulosFiltrados.length > 0 ? (
                  articulosFiltrados.map(articulo => (
                    <tr key={articulo.id} className="align-middle">
                      <td className="text-center">{articulo.id}</td>
                      <td className="fw-bold">{articulo.codigo}</td>
                      <td>
                        <div>{articulo.nombre}</div>
                        <small className="text-muted">{articulo.descripcion}</small>
                      </td>
                      <td>{articulo.categoria?.nombre || '-'}</td>
                      <td className="text-center">
                        <Badge color={articulo.existencia <= articulo.existenciaMinima ? 'danger' : 'success'} pill>
                          {articulo.existencia} {articulo.unidadMedida?.simbolo}
                        </Badge>
                      </td>
                      <td className="text-end fw-bold">C$ {articulo.precio?.toFixed(2)}</td>
                      <td className="text-center">
                        {articulo.activo ? <Badge color="success">Activo</Badge> : <Badge color="secondary">Inactivo</Badge>}
                      </td>
                      <td className="text-end">
                        <div className="btn-group flex-btn-group-container">
                          <Button color="info" size="sm" outline>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </Button>
                          <Button color="danger" size="sm" outline className="ms-1">
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      {loading ? 'Cargando inventario...' : 'No se encontraron artículos'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ArticuloList;
