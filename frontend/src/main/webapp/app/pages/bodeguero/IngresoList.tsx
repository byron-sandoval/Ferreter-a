import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import { IIngreso } from 'app/shared/model/ingreso.model';
import IngresoService from 'app/services/ingreso.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faSearch, faEye, faFileInvoice, faChevronLeft, faChevronRight, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import dayjs from 'dayjs';

export const IngresoList = () => {
  const navigate = useNavigate();
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<IIngreso | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const loadAll = () => {
    setLoading(true);
    // Solicitamos un tamaño grande para que la paginación y el filtro del cliente funcionen
    // y ordenamos por ID de forma descendente para ver lo más nuevo primero.
    IngresoService.getAll({ sort: 'id,desc', size: 2000 })
      .then(res => {
        setIngresos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const verDetalles = async (id: number) => {
    try {
      const res = await IngresoService.get(id);
      setIngresoSeleccionado(res.data);
      setShowDetalleModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtrados = ingresos.filter(
    i =>
      (i.noDocumento || '').toLowerCase().includes(filter.toLowerCase()) ||
      (i.proveedor?.nombre || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtrados.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const headerStyle = { backgroundColor: '#2d0a4e', color: 'white' };

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div
        className="d-flex justify-content-between align-items-center p-2 text-white shadow-sm mb-2 rounded"
        style={{ backgroundColor: '#343a40' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFileInvoice} />
          <h5 className="m-0 fw-bold">Registro de Compras</h5>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <Input
              type="text"
              placeholder="Factura o proveedor..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border-end-0 border-secondary bg-white text-dark"
              style={{ fontSize: '0.8rem' }}
            />
            <span className="input-group-text bg-white border-secondary text-muted">
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </span>
          </div>
          <Button color="primary" size="sm" onClick={() => navigate('/bodeguero/ingresos/nuevo')} style={{ fontSize: '0.75rem' }} className="fw-bold">
            <FontAwesomeIcon icon={faPlus} className="me-1" /> ACTUALIZAR STOCK
          </Button>
          <Button color="success" size="sm" onClick={() => navigate('/bodeguero/ingresos/nueva-compra')} style={{ fontSize: '0.75rem' }} className="fw-bold">
            <FontAwesomeIcon icon={faShoppingCart} className="me-1" /> NUEVA COMPRA
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="table-light text-dark text-center text-uppercase small fw-bold">
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
            {currentItems.length > 0 ? (
              currentItems.map(i => (
                <tr key={i.id} className="text-center align-middle" style={{ fontSize: '0.8rem' }}>
                  <td>{dayjs(i.fecha).format('DD/MM/YY')}</td>
                  <td className="fw-bold">{i.noDocumento}</td>
                  <td className="text-start">{i.proveedor?.nombre}</td>
                  <td className="text-end fw-bold text-primary">C$ {i.total?.toLocaleString()}</td>
                  <td>
                    <Badge color={i.activo ? 'success' : 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                      {i.activo ? 'Recibido' : 'Anulado'}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" outline className="p-1" title="Ver detalles" onClick={() => i.id && verDetalles(i.id)}>
                      <FontAwesomeIcon icon={faEye} fixedWidth />
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
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
            <small className="text-muted ps-2">
              Mostrando {Math.min(indexOfLastItem, filtrados.length)} de {filtrados.length} facturas de compra
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

      {/* MODAL DETALLES DE COMPRA (INGRESO) */}
      <Modal isOpen={showDetalleModal} toggle={() => setShowDetalleModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowDetalleModal(false)} className="bg-dark text-white">
          <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-info" /> Detalles de Compra #{ingresoSeleccionado?.noDocumento}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
            <div>
              <Label className="text-muted small text-uppercase fw-bold mb-0">Proveedor</Label>
              <div className="fw-bold fs-5 text-dark">{ingresoSeleccionado?.proveedor?.nombre}</div>
              <small className="d-block text-dark">
                <span className="fw-bold">RUC:</span> {ingresoSeleccionado?.proveedor?.ruc || 'N/D'}
              </small>
              <small className="text-dark">
                <span className="fw-bold">Teléfono:</span> {ingresoSeleccionado?.proveedor?.telefono || 'N/D'}
              </small>
            </div>
            <div className="text-end">
              <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha de Ingreso</Label>
              <div className="fw-bold">{dayjs(ingresoSeleccionado?.fecha).format('DD/MM/YYYY')}</div>
              <Badge color={ingresoSeleccionado?.activo ? 'success' : 'danger'}>
                {ingresoSeleccionado?.activo ? 'Procesado' : 'Anulado'}
              </Badge>
            </div>
          </div>

          <Table hover responsive borderless className="align-middle">
            <thead className="table-dark small text-uppercase">
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th className="text-end">Costo Unit.</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {ingresoSeleccionado?.detalles?.map((det, i) => (
                <tr key={i} className="border-bottom border-light">
                  <td>
                    <div className="fw-bold">{det.articulo?.nombre}</div>
                    <small className="text-muted">{det.articulo?.codigo}</small>
                  </td>
                  <td className="text-center">
                    <Badge color="info" pill className="px-3">
                      {det.cantidad}
                    </Badge>
                  </td>
                  <td className="text-end">C$ {det.costoUnitario?.toLocaleString()}</td>
                  <td className="text-end fw-bold">C$ {det.monto?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-4 p-3 bg-light rounded-4 ms-auto" style={{ maxWidth: '300px' }}>
            <div className="d-flex justify-content-between border-top pt-2">
              <h5 className="fw-bold m-0">Total Compra:</h5>
              <h5 className="fw-bold text-dark m-0">C$ {ingresoSeleccionado?.total?.toLocaleString()}</h5>
            </div>
          </div>

          {ingresoSeleccionado?.observaciones && (
            <div className="mt-4 p-3 bg-warning bg-opacity-10 border-start border-4 border-warning rounded">
              <h6 className="fw-bold text-dark mb-1">OBSERVACIONES:</h6>
              <p className="mb-0 text-dark fst-italic">{ingresoSeleccionado.observaciones}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-0">
          <Button color="secondary" size="sm" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default IngresoList;
