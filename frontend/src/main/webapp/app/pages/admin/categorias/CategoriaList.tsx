import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Badge,
  Card,
  CardBody,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faPencilAlt, faTrash, faTags } from '@fortawesome/free-solid-svg-icons';
import { ICategoria } from 'app/shared/model/categoria.model';
import CategoriaService from 'app/services/categoria.service';

import { toast } from 'react-toastify';

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
      import('axios').then(axios => axios.default.delete(`api/categorias/${id}`).then(loadAll));
    }
  };



  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div className="d-flex justify-content-between align-items-center mb-2 px-2 py-1 bg-primary text-white rounded shadow-sm">
        <h5 className="m-0 fw-bold">
          <FontAwesomeIcon icon={faTags} className="me-2" /> Categorías de Productos
        </h5>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={loadAll} disabled={loading} style={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faSync} spin={loading} className="me-1" /> Actualizar
          </Button>
          <Button color="success" size="sm" tag={Link} to="new" style={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nueva Categoría
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <Input
            bsSize="sm"
            type="text"
            placeholder="Buscar categoría..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ maxWidth: '300px', fontSize: '0.8rem' }}
          />
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <Table hover striped size="sm" className="mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2">Nombre</th>
                <th className="py-2">Descripción</th>
                <th className="py-2">Estado</th>
                <th className="py-2 text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id} style={{ fontSize: '0.8rem' }}>
                  <td className="px-3">{cat.id}</td>
                  <td className="fw-bold">{cat.nombre}</td>
                  <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                    {cat.descripcion}
                  </td>
                  <td>
                    {cat.activo ? (
                      <Badge color="success" pill style={{ fontSize: '0.65rem' }}>
                        Activo
                      </Badge>
                    ) : (
                      <Badge color="secondary" pill style={{ fontSize: '0.65rem' }}>
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="text-end px-3">
                    <Button color="info" size="sm" outline tag={Link} to={`${cat.id}/edit`} className="me-1 p-1">
                      <FontAwesomeIcon icon={faPencilAlt} fixedWidth />
                    </Button>
                    <Button color="danger" size="sm" outline onClick={() => handleDelete(cat.id)} className="p-1">
                      <FontAwesomeIcon icon={faTrash} fixedWidth />
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
