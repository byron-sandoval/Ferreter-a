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
  const [debouncedFiltro, setDebouncedFiltro] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFiltro(filtro);
    }, 400); 
    return () => clearTimeout(timer);
  }, [filtro]);

  // Cargar clientes cuando se abre la modal o cambia el filtro de búsqueda
  useEffect(() => {
    if (isOpen) {
      cargarClientes();
    } else {
      // Limpiar al cerrar
      setFiltro('');
      setClientes([]);
    }
  }, [isOpen, debouncedFiltro]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const params: any = { page: 0, size: 20, sort: 'nombre,asc', 'activo.equals': true };
      
      // Búsqueda inteligente en backend
      if (debouncedFiltro) {
        if (/^\d+/.test(debouncedFiltro)) {
          // Si empieza con números, buscamos por cédula (o teléfono si estuviera mapeado)
          params['cedula.contains'] = debouncedFiltro;
        } else {
          // Buscamos por nombre
          params['nombre.contains'] = debouncedFiltro;
        }
      }

      // Reutilizamos el getAll de venta pasándole params (si el backend lo soporta globalmente, 
      // y asumiendo que el Service no lo fuerza a sin parámetros. axios.get(API_URL, {params}))
      // Como ClienteService.getAll en cliente.service.ts quizás no acepta params, usamos axios directo
      // O ajustamos la petición al endpoint search de Spring:
      const axios = require('axios').default;
      const res = await axios.get('api/clientes', { params });
      
      setClientes(res.data || []);
    } catch (e) {
      console.error('Error al cargar clientes', e);
    } finally {
      setLoading(false);
    }
  };

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
                  <td colSpan={5} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Buscando...
                  </td>
                </tr>
              ) : clientes.length > 0 ? (
                clientes.map(c => (
                  <tr key={c.id}>
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
                      <div className="small text-muted">{c.genero === GeneroEnum.MASCULINO ? 'M' : 'F'}</div>
                    </td>
                    <td className="text-end pe-3">
                      <Button color="primary" size="sm" className="rounded-pill px-3 shadow-sm hover-scale" onClick={() => onSelect(c)}>
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
