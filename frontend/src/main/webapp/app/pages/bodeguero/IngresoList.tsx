import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Card, Badge } from 'reactstrap';
import { IIngreso } from 'app/shared/model/ingreso.model';
import IngresoService from 'app/services/ingreso.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faEye, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

export const IngresoList = () => {
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadAll = () => {
    setLoading(true);
    IngresoService.getAll()
      .then(res => {
        setIngresos(res.data);
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

  const filtrados = ingresos.filter(
    i =>
      (i.noDocumento || '').toLowerCase().includes(filter.toLowerCase()) ||
      (i.proveedor?.nombre || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const headerStyle = { backgroundColor: '#2d0a4e', color: 'white' };

  return (
    <div className="animate__animated animate__fadeIn p-3 px-md-4">
      <div
        className="d-flex justify-content-between align-items-center p-3 text-white shadow-sm mb-3 rounded"
        style={{ backgroundColor: '#1a0633' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFileInvoice} size="lg" />
          <h4 className="m-0 fw-bold">Registro de Compras (Ingresos)</h4>
        </div>
        <div className="d-flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por factura o proveedor..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-control-sm border-0"
            style={{ width: '300px' }}
          />
          <Button color="success" size="sm" onClick={() => {}}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Nueva Compra
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="text-center text-uppercase small" style={headerStyle}>
            <tr>
              <th className="py-2">Fecha</th>
              <th className="py-2">No. Documento</th>
              <th className="py-2 text-start">Proveedor</th>
              <th className="py-2 text-end">Total</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map(i => (
                <tr key={i.id} className="text-center align-middle">
                  <td className="small">{dayjs(i.fecha).format('DD/MM/YYYY')}</td>
                  <td className="fw-bold">{i.noDocumento}</td>
                  <td className="text-start">{i.proveedor?.nombre}</td>
                  <td className="text-end fw-bold text-primary">C$ {i.total?.toLocaleString()}</td>
                  <td>
                    <Badge color={i.activo ? 'success' : 'secondary'} pill>
                      {i.activo ? 'Recibido' : 'Anulado'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" outline className="me-1" title="Ver detalles">
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  {loading ? 'Cargando registros...' : 'No se encontraron compras registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      <div className="mt-3 text-muted small">
        <p>* Los ingresos representan las entradas de mercancía al almacén que aumentan el stock.</p>
      </div>
    </div>
  );
};

export default IngresoList;
