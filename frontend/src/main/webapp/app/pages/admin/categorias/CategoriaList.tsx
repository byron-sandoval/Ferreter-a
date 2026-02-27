import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Badge, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faPencilAlt, faTrash, faTags, faChevronLeft, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';
import { ICategoria } from 'app/shared/model/categoria.model';
import CategoriaService from 'app/services/categoria.service';

import { toast } from 'react-toastify';

export const CategoriaList = () => {
  const isAdmin = useAppSelector(state => state.authentication.account.authorities.includes(AUTHORITIES.ADMIN));
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
    c => {
      const matchesSearch = (c.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (c.descripcion || '').toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = showInactive ? c.activo === false || c.activo === null : c.activo === true;
      return matchesSearch && matchesStatus;
    }
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (id: number, nombre: string) => {
    try {
      // Primero contamos cuántos productos tiene esta categoría
      const res = await import('app/services/articulo.service').then(m => m.default.countByCriteria({ 'categoriaId.equals': id, 'activo.equals': true }));
      const count = res.data;

      let message = `¿Está seguro de desactivar la categoría "${nombre}"?`;
      if (count > 0) {
        message = `⚠️ ATENCIÓN: La categoría "${nombre}" tiene ${count} productos asociados. \n\nSi la desactivas, TODOS estos productos también se desactivarán y no se podrán vender. \n\n¿Deseas desactivar la categoría y sus ${count} productos?`;
      }

      if (window.confirm(message)) {
        import('axios').then(axios => axios.default.delete(`api/categorias/${id}`).then(loadAll));
      }
    } catch (error) {
      toast.error('Error al verificar productos asociados');
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
          {isAdmin && (
            <Button color="success" size="sm" tag={Link} to="new" style={{ fontSize: '0.75rem' }}>
              <FontAwesomeIcon icon={faPlus} className="me-1" /> Nueva Categoría
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-2 bg-light">
        <CardBody className="p-2">
          <div className="d-flex justify-content-between align-items-center">
            <div
              className="d-flex align-items-center flex-grow-1"
              style={{
                maxWidth: '300px',
                borderBottom: '2px solid #18a1bcff',
                paddingBottom: '2px',
              }}
            >
              <FontAwesomeIcon icon={faSearch} className="text-info opacity-75 me-2" />
              <Input
                placeholder="Buscar categoría..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="border-0 shadow-none p-0 bg-transparent flex-grow-1"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
            <div className="form-check form-switch ms-3 d-flex align-items-center">
              <Input
                type="switch"
                id="showInactiveSwitch"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label text-muted ms-2 small fw-bold" htmlFor="showInactiveSwitch" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Ver Inactivos
              </label>
            </div>
          </div>
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
              {currentItems.map(cat => (
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
                      <Badge color="danger" pill style={{ fontSize: '0.65rem' }}>
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="text-end px-3">
                    <Button color="info" size="sm" outline tag={Link} to={`${cat.id}/edit`} className="me-1 p-1">
                      <FontAwesomeIcon icon={faPencilAlt} fixedWidth />
                    </Button>
                    {isAdmin && (
                      <Button color="danger" size="sm" outline onClick={() => handleDelete(cat.id, cat.nombre)} className="p-1">
                        <FontAwesomeIcon icon={faTrash} fixedWidth />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
              <small className="text-muted ps-2">
                Mostrando {Math.min(indexOfLastItem, filtered.length)} de {filtered.length} categorías
              </small>
              <Pagination size="sm" className="mb-0 pe-2">
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink previous onClick={() => paginate(currentPage - 1)}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </PaginationLink>
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem active={i + 1 === currentPage} key={i}>
                    <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink next onClick={() => paginate(currentPage + 1)}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </PaginationLink>
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoriaList;
