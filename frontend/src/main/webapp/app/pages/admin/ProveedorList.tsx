import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Badge } from 'reactstrap';
import { IProveedor } from 'app/shared/model/proveedor.model';
import ProveedorService from 'app/services/proveedor.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faPencilAlt, faTrash, faTruck } from '@fortawesome/free-solid-svg-icons';

export const ProveedorList = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadAll = () => {
    setLoading(true);
    ProveedorService.getAll()
      .then(res => {
        setProveedores(res.data);
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

  const filtrados = proveedores.filter(p => (p.nombre || '').toLowerCase().includes(filter.toLowerCase()));

  const headerStyle = { backgroundColor: '#6f42c1', color: 'white' };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white shadow-sm mb-3 rounded">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faTruck} size="lg" />
          <h4 className="m-0 fw-bold">Gestión de Proveedores</h4>
        </div>
        <div className="d-flex gap-2">
          <Input
            type="text"
            placeholder="Buscar proveedor..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-control-sm"
            style={{ width: '250px' }}
          />
          <Button color="primary" size="sm" onClick={() => navigate('/admin/proveedores/new')}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Nuevo Proveedor
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="text-center text-uppercase small" style={headerStyle}>
            <tr>
              <th className="py-2">Nombre</th>
              <th className="py-2">RUC / ID</th>
              <th className="py-2">Dirección</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">Email</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map(p => (
                <tr key={p.id} className="text-center align-middle">
                  <td className="text-start fw-bold">{p.nombre}</td>
                  <td className="small text-muted">{p.ruc || '-'}</td>
                  <td className="text-start small">{p.direccion || '-'}</td>
                  <td>{p.telefono || '-'}</td>
                  <td>{p.email || '-'}</td>
                  <td>
                    <Badge color={p.activo ? 'success' : 'secondary'} pill>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" outline className="me-1">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button size="sm" color="danger" outline>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  {loading ? 'Cargando proveedores...' : 'No se encontraron proveedores'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ProveedorList;
