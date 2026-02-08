import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Badge } from 'reactstrap';
import { IVendedor } from 'app/shared/model/vendedor.model';
import VendedorService from 'app/services/vendedor.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faPencilAlt, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';

export const VendedorList = () => {
    const navigate = useNavigate();
    const [vendedores, setVendedores] = useState<IVendedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    const loadAll = () => {
        setLoading(true);
        VendedorService.getAll()
            .then(res => {
                setVendedores(res.data);
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

    const filtrados = vendedores.filter(
        v =>
            (v.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
            (v.apellido || '').toLowerCase().includes(filter.toLowerCase()) ||
            (v.cedula || '').toLowerCase().includes(filter.toLowerCase())
    );

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
                    <Button color="primary" size="sm" onClick={() => navigate('/admin/vendedores/new')} style={{ fontSize: '0.75rem' }}>
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Usuario
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-0">
                <Table hover responsive size="sm" className="mb-0">
                    <thead className="text-center text-uppercase small" style={headerStyle}>
                        <tr>
                            <th className="py-2">Cédula</th>
                            <th className="py-2">Nombre Completo</th>
                            <th className="py-2">Teléfono</th>
                            <th className="py-2">Keycloak ID</th>
                            <th className="py-2">Estado</th>
                            <th className="py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.length > 0 ? (
                            filtrados.map(v => (
                                <tr key={v.id} className="text-center align-middle" style={{ fontSize: '0.8rem' }}>
                                    <td className="fw-bold px-3">{v.cedula}</td>
                                    <td className="text-start px-3">
                                        {v.nombre} {v.apellido}
                                    </td>
                                    <td>{v.telefono || '-'}</td>
                                    <td className="small text-muted" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {v.idKeycloak || '-'}
                                    </td>
                                    <td>
                                        <Badge color={v.activo ? 'success' : 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                                            {v.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-3">
                                        <Button size="sm" color="info" outline className="p-1 me-1" onClick={() => navigate(`/admin/vendedores/${v.id}/edit`)}>
                                            <FontAwesomeIcon icon={faPencilAlt} fixedWidth />
                                        </Button>
                                        <Button size="sm" color="danger" outline className="p-1">
                                            <FontAwesomeIcon icon={faTrash} fixedWidth />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted">
                                    {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default VendedorList;
