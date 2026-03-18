import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import { IIngreso } from 'app/shared/model/ingreso.model';
import IngresoService from 'app/services/ingreso.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faSearch,
  faEye,
  faFileInvoice,
  faChevronLeft,
  faChevronRight,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import dayjs from 'dayjs';
import { useAppSelector } from 'app/config/store';
import { AUTHORITIES } from 'app/config/constants';

export const IngresoList = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = account?.authorities?.includes(AUTHORITIES.ADMIN);
  const isJefeBodega = account?.authorities?.includes(AUTHORITIES.JEFE_BODEGA);
  const navigate = useNavigate();
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<IIngreso | null>(null);

  // PAGINACIÓN DEL BACKEND
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed para JHipster
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadAll = async () => {
    setLoading(true);
    try {
      const baseParams = {
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,desc',
      };

      if (filter) {
        // Realizamos búsquedas en paralelo para simular un "OR" (Documento o Proveedor)
        const paramsDoc = { ...baseParams, 'noDocumento.contains': filter };
        const paramsProv = { ...baseParams, 'proveedorNombre.contains': filter };

        const [resDoc, resProv] = await Promise.all([
          IngresoService.getAll(paramsDoc),
          IngresoService.getAll(paramsProv),
        ]);

        // Unificar resultados y eliminar duplicados por ID
        const combined = [...resDoc.data, ...resProv.data];
        const seen = new Set();
        const uniqueEntries = combined.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        setIngresos(uniqueEntries);

        // El total es aproximado a la suma de ambos o el máximo encontrado en los headers
        const totalDoc = parseInt(resDoc.headers['x-total-count'] || '0', 10);
        const totalProv = parseInt(resProv.headers['x-total-count'] || '0', 10);
        setTotalItems(Math.max(totalDoc, totalProv, uniqueEntries.length));
      } else {
        const res = await IngresoService.getAll(baseParams);
        setIngresos(res.data);
        const total = res.headers['x-total-count'];
        setTotalItems(total ? parseInt(total, 10) : res.data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [currentPage, filter]);

  const verDetalles = async (id: number) => {
    try {
      const res = await IngresoService.get(id);
      setIngresoSeleccionado(res.data);
      setShowDetalleModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
              onChange={e => {
                setFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="border-end-0 border-secondary bg-white text-dark"
              style={{ fontSize: '0.8rem' }}
            />
            <span className="input-group-text bg-white border-secondary text-muted">
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </span>
          </div>
          {(isAdmin || isJefeBodega) && (
            <Button
              color="success"
              size="sm"
              onClick={() => navigate('/bodeguero/ingresos/nueva-compra')}
              style={{ fontSize: '0.75rem' }}
              className="fw-bold px-3"
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" /> NUEVA COMPRA
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="table-light text-dark text-center text-uppercase small fw-bold">
            <tr>
              <th className="py-2">Fecha</th>
              <th className="py-2">No. Documento</th>
              <th className="py-2 text-start">Proveedor</th>
              <th className="py-2 text-center" style={{ width: '100px' }}>
                Usuario
              </th>
              {isAdmin && <th className="py-2 text-end">Total</th>}
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.length > 0 ? (
              ingresos.map(i => (
                <tr key={i.id} className="text-center align-middle" style={{ fontSize: '0.8rem' }}>
                  <td>{dayjs(i.fecha).format('DD/MM/YY')}</td>
                  <td className="fw-bold">{i.noDocumento}</td>
                  <td className="text-start">{i.proveedor?.nombre}</td>
                  <td className="text-center">
                    <Badge color="light" className="text-dark border shadow-sm px-2 py-1">
                      {i.usuario?.username}
                    </Badge>
                  </td>
                  {isAdmin && <td className="text-end fw-bold text-primary">C$ {i.total?.toLocaleString()}</td>}
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
                <td colSpan={7} className="text-center py-5 text-muted">
                  {loading ? 'Cargando registros...' : 'No se encontraron compras registradas'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
            <small className="text-muted ps-2">
              Mostrando {ingresos.length} de {totalItems} facturas de compra
            </small>
            <Pagination size="sm" className="mb-0 pe-2">
              <PaginationItem disabled={currentPage === 0}>
                <PaginationLink previous onClick={() => paginate(currentPage - 1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </PaginationLink>
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem active={i === currentPage} key={i}>
                  <PaginationLink onClick={() => paginate(i)}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={currentPage === totalPages - 1}>
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
              <Label className="text-muted small text-uppercase fw-bold mb-0">Fecha de Compra</Label>
              <div className="fw-bold text-dark">{dayjs(ingresoSeleccionado?.fecha).format('DD/MM/YYYY')}</div>
              <div className="small mt-1">
                <span className="text-muted">Gestionado por:</span>{' '}
                <span className="fw-bold text-dark">{ingresoSeleccionado?.usuario?.username}</span>
              </div>
              <Badge
                color={ingresoSeleccionado?.activo ? 'success' : 'danger'}
                className="mt-2 shadow-sm border-0"
                style={{ fontSize: '0.7rem' }}
              >
                {ingresoSeleccionado?.activo ? 'Procesado' : 'Anulado'}
              </Badge>
            </div>
          </div>

          <Table hover responsive borderless className="align-middle">
            <thead className="table-dark small text-uppercase">
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                {isAdmin && <th className="text-end">Costo Unit.</th>}
                {isAdmin && <th className="text-end">Monto</th>}
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
                  {isAdmin && <td className="text-end">C$ {det.costoUnitario?.toLocaleString()}</td>}
                  {isAdmin && <td className="text-end fw-bold">C$ {det.monto?.toLocaleString()}</td>}
                </tr>
              ))}
            </tbody>
          </Table>

          {isAdmin && (
            <div className="mt-4 p-3 bg-light rounded-4 ms-auto" style={{ maxWidth: '300px' }}>
              <div className="d-flex justify-content-between border-top pt-2">
                <h5 className="fw-bold m-0">Total Compra:</h5>
                <h5 className="fw-bold text-dark m-0">C$ {ingresoSeleccionado?.total?.toLocaleString()}</h5>
              </div>
            </div>
          )}

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
