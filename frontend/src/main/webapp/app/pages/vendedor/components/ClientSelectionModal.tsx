import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Input, Table, Button, InputGroup, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCheck, faIdCard, faPhone, faVenusMars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ICliente, GeneroEnum } from 'app/shared/model/cliente.model';
import ClienteService from 'app/services/cliente.service';

interface IClientSelectionModalProps {
    isOpen: boolean;
    toggle: () => void;
    onSelect: (cliente: ICliente) => void;
}

export const ClientSelectionModal: React.FC<IClientSelectionModalProps> = ({ isOpen, toggle, onSelect }) => {
    const [clientes, setClientes] = useState<ICliente[]>([]);
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            cargarClientes();
        }
    }, [isOpen]);

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const res = await ClienteService.getAll();
            // Filtrar solo clientes activos
            setClientes(res.data.filter(c => c.activo !== false));
        } catch (e) {
            console.error('Error al cargar clientes', e);
        } finally {
            setLoading(false);
        }
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.cedula?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.telefono?.includes(filtro)
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
            <ModalHeader toggle={toggle} className="bg-primary text-white border-0">
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    <span className="fw-bold">BÚSQUEDA DE CLIENTES</span>
                </div>
            </ModalHeader>
            <ModalBody className="p-0">
                <div className="p-3 bg-light border-bottom">
                    <InputGroup className="shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                            <FontAwesomeIcon icon={faSearch} className="text-muted" />
                        </span>
                        <Input
                            placeholder="Escribe el nombre, cédula o teléfono para filtrar..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                            className="border-start-0 ps-0"
                            autoFocus
                        />
                        {filtro && (
                            <Button color="link" className="bg-white border-start-0 text-muted p-2" onClick={() => setFiltro('')}>
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        )}
                    </InputGroup>
                </div>

                <div className="table-responsive" style={{ maxHeight: '360px' }}>
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-white sticky-top shadow-sm" style={{ zIndex: 1 }}>
                            <tr>
                                <th className="border-0 ps-3">Cliente</th>
                                <th className="border-0">Identificación</th>
                                <th className="border-0">Contacto</th>
                                <th className="border-0">Sexo</th>
                                <th className="border-0 text-end pe-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5 text-muted">Cargando clientes...</td>
                                </tr>
                            ) : clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map(c => (
                                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(c)}>
                                        <td className="ps-3 py-3">
                                            <div className="fw-bold text-primary">{c.nombre}</div>
                                        </td>
                                        <td>
                                            <div className="small text-muted text-uppercase">
                                                <FontAwesomeIcon icon={faIdCard} className="me-1 opacity-50" />
                                                {c.cedula}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small">
                                                <FontAwesomeIcon icon={faPhone} className="me-1 text-muted" />
                                                {c.telefono || '---'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="small text-muted">
                                                {c.genero === GeneroEnum.MASCULINO ? 'M' : 'F'}
                                            </div>
                                        </td>
                                        <td className="text-end pe-3">
                                            <Button color="primary" size="sm" className="rounded-pill px-3 shadow-sm hover-scale">
                                                <FontAwesomeIcon icon={faUserCheck} className="me-1" /> Seleccionar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-5 text-muted">
                                        No se encontraron clientes que coincidan con &quot;{filtro}&quot;
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </ModalBody>
        </Modal>
    );
};
