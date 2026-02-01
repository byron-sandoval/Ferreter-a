import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Row, Col, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ICategoria } from 'app/shared/model/categoria.model';
import CategoriaService from 'app/services/categoria.service';

export const CategoriaList = () => {
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadAll = () => {
    setLoading(true);
    CategoriaService.getAll()
      .then(res => {
        setCategorias(res.data);
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

  const filtered = categorias.filter(
    c =>
      (c.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (c.descripcion || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar categoría?')) {
      // Assuming delete method exists or using generic axios call
      // CategoriaService.delete(id).then(loadAll);
      // Since I didn't add delete to CategoriaService yet, I'll assume standard API
      import('axios').then(axios => axios.default.delete(`api/categorias/${id}`).then(loadAll));
    }
  };

  return (
    <div>
      <h2 className="d-flex justify-content-between align-items-center mb-4">
        📂 Categorías
        <div className="d-flex gap-2">
          <Button color="info" onClick={loadAll} disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Actualizar
          </Button>
          <Button color="primary" tag={Link} to="new">
            <FontAwesomeIcon icon={faPlus} /> Nueva Categoría
          </Button>
        </div>
      </h2>

      <Card className="mb-4">
        <CardBody>
          <Input type="text" placeholder="Buscar categoría..." value={filter} onChange={e => setFilter(e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <Table hover striped className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td className="fw-bold">{cat.nombre}</td>
                  <td>{cat.descripcion}</td>
                  <td>{cat.activo ? <Badge color="success">Activo</Badge> : <Badge color="secondary">Inactivo</Badge>}</td>
                  <td className="text-end">
                    <Button color="info" size="sm" outline tag={Link} to={`${cat.id}/edit`} className="me-1">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button color="danger" size="sm" outline onClick={() => handleDelete(cat.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoriaList;
