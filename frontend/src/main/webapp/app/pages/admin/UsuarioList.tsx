import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Badge } from 'reactstrap';
import { IUsuario } from 'app/shared/model/usuario.model';
import UsuarioService from 'app/services/usuario.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faPencilAlt, faTrash, faUsers, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { toast } from 'react-toastify';

export const UsuarioList = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const loadAll = () => {
    setLoading(true);
    UsuarioService.getAll()
      .then(res => {
        setUsuarios(res.data);
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

  const filtrados = Array.isArray(usuarios)
    ? usuarios.filter(
      v =>
        (v.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
        (v.apellido || '').toLowerCase().includes(filter.toLowerCase()) ||
        (v.cedula || '').toLowerCase().includes(filter.toLowerCase()),
    )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtrados.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        '¿Está seguro de que desea eliminar/inactivar este usuario? El sistema decidirá si borrarlo o solo inactivarlo según su historial.',
      )
    ) {
      UsuarioService.delete(id)
        .then(res => {
          if (res.data === true) {
            toast.success('Usuario eliminado físicamente del sistema.');
          } else {
            toast.info('Usuario inactivado correctamente. Se conservó por tener historial.');
          }
          loadAll();
        })
        .catch(err => {
          console.error(err);
          toast.error('Error al procesar la eliminación del usuario');
        });
    }
  };

  const headerStyle = { backgroundColor: '#6f42c1', color: 'white' };

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div
        className="d-flex justify-content-between align-items-center p-2 text-white shadow-sm mb-2 rounded"
        style={{ backgroundColor: '#343a40' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faUsers} />
          <h5 className="m-0 fw-bold">Gestión de Usuarios</h5>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <Input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border-end-0 border-secondary bg-white text-dark"
              style={{ fontSize: '0.8rem' }}
            />
            <span className="input-group-text bg-white border-secondary text-muted">
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </span>
          </div>
          <Button color="primary" size="sm" onClick={() => navigate('/admin/usuarios/new')} style={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="table-light text-dark text-center text-uppercase small fw-bold">
            <tr>
              <th className="py-2">ID</th>
              <th className="py-2">Nombre Completo</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(v => (
                <tr key={v.id} className="text-center align-middle" style={{ fontSize: '0.8rem' }}>
                  <td className="fw-bold text-muted">{v.id}</td>
                  <td className="text-center px-3">
                    {v.nombre} {v.apellido}
                  </td>
                  <td>{v.telefono || '-'}</td>
                  <td>
                    <Badge color="info" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {(v.rol || '').replace('ROLE_', '')}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={v.activo ? 'success' : 'danger'} pill style={{ fontSize: '0.65rem' }}>
                      {v.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3">
                    <Button size="sm" color="info" outline className="p-1 me-1" onClick={() => navigate(`/admin/usuarios/${v.id}/edit`)}>
                      <FontAwesomeIcon icon={faPencilAlt} fixedWidth />
                    </Button>
                    <Button size="sm" color="danger" outline className="p-1" onClick={() => v.id && handleDelete(v.id)}>
                      <FontAwesomeIcon icon={faTrash} fixedWidth />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-5 text-muted">
                  {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
            <small className="text-muted ps-2">
              Mostrando {Math.min(indexOfLastItem, filtrados.length)} de {filtrados.length} usuarios
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
      </Card>
    </div>
  );
};

export default UsuarioList;
