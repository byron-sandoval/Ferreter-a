import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Input, Card, CardHeader, CardBody, Badge, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { IArticulo } from 'app/shared/model/articulo.model';
import ArticuloService from 'app/services/articulo.service';
import HistorialPrecioService from 'app/services/historial-precio.service';
import { IHistorialPrecio } from 'app/shared/model/historial-precio.model';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faSearch,
  faPencilAlt,
  faTrash,
  faEye,
  faFileExcel,
  faBoxOpen,
  faHistory,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

export const ArticuloList = () => {
  const [articulos, setArticulos] = useState<IArticulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedArticulo, setSelectedArticulo] = useState<IArticulo | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historial, setHistorial] = useState<IHistorialPrecio[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadAll = () => {
    setLoading(true);
    ArticuloService.getAll()
      .then(res => {
        setArticulos(res.data);
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

  const articulosFiltrados = articulos.filter(
    a => (a.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (a.codigo || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este artículo?')) {
      ArticuloService.delete(id).then(() => {
        loadAll();
        setSelectedArticulo(null);
      });
    }
  };

  const loadHistorial = (articuloId: number) => {
    setLoadingHistory(true);
    setShowHistory(true);
    HistorialPrecioService.getByArticulo(articuloId)
      .then(res => {
        setHistorial(res.data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  };

  // Estilos "INASOFTWARE" Style
  const headerStyle = { backgroundColor: '#6f42c1', color: 'white' }; // Purple header from image
  const subHeaderStyle = { backgroundColor: '#343a40', color: 'white', fontSize: '0.85rem' };
  const rowSelectedStyle = { backgroundColor: '#f3e5f5', borderLeft: '5px solid #6f42c1' };

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. Header de Acciones (Sub-bar style) */}
      <div className="d-flex justify-content-between align-items-center p-2 mb-0 shadow-sm" style={subHeaderStyle}>
        <div className="d-flex align-items-center gap-3 ps-3">
          <span className="fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
            Inventario de productos
          </span>
        </div>
        <div className="d-flex gap-2 pe-3">
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <Input
              type="text"
              placeholder="Buscar Producto..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border-end-0 border-secondary bg-dark text-white opacity-75"
              style={{ border: '1px solid #495057' }}
            />
            <span className="input-group-text bg-dark border-secondary text-white opacity-50">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <Button color="secondary" size="sm" className="opacity-75" onClick={loadAll}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Restablecer
          </Button>
          <Button
            color="dark"
            size="sm"
            tag={Link}
            to="new"
            className="fw-bold border-secondary shadow-sm"
            style={{ backgroundColor: '#2d0a4e' }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Nuevo Artículo
          </Button>
        </div>
      </div>

      <div className="p-3 px-md-4">
        <div className="bg-white p-3 border rounded shadow-sm d-flex align-items-center mb-3">
          <h4 className="m-0 fw-bold underline-blue">Productos en inventario</h4>
        </div>

        {/* 2. Tabla Densa */}
        <Card className="shadow-sm mb-4 border-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0 align-middle">
              <thead className="text-center text-uppercase small" style={headerStyle}>
                <tr>
                  <th className="py-2">ID</th>
                  <th className="py-2">Código</th>
                  <th className="py-2 text-start">Producto</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Existencias</th>
                  <th className="py-2">Ex. Mínima</th>
                  <th className="py-2 text-end">Precio de Compra</th>
                  <th className="py-2 text-end">Precio de Venta</th>
                  <th className="py-2 text-end">Precio Total</th>
                  <th className="py-2 text-start">Observaciones</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulosFiltrados.length > 0 ? (
                  articulosFiltrados.map(articulo => {
                    const hasStock = (articulo.existencia || 0) > 0;
                    const isLowStock = (articulo.existencia || 0) <= (articulo.existenciaMinima || 0);
                    const stockBg = !hasStock ? '#ff0000' : isLowStock ? '#ffc107' : '#00a000';
                    const isSelected = selectedArticulo?.id === articulo.id;

                    return (
                      <tr key={articulo.id} style={isSelected ? rowSelectedStyle : {}} className="text-center">
                        <td className="fw-bold text-primary">{articulo.id}</td>
                        <td>{articulo.codigo}</td>
                        <td className="text-start">{articulo.nombre}</td>
                        <td>
                          <Badge
                            color={articulo.activo ? 'light' : 'secondary'}
                            className={articulo.activo ? 'text-success border border-success' : ''}
                          >
                            {articulo.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td style={{ backgroundColor: stockBg, color: 'white', fontWeight: 'bold' }}>{articulo.existencia}</td>
                        <td>{articulo.existenciaMinima}</td>
                        <td className="text-end">C$ {articulo.costo?.toFixed(2)}</td>
                        <td className="text-end">C$ {articulo.precio?.toFixed(2)}</td>
                        <td className="text-end fw-bold">C$ {((articulo.existencia || 0) * (articulo.precio || 0)).toFixed(2)}</td>
                        <td className="text-start small text-muted">
                          <div className="text-truncate" style={{ maxWidth: '120px' }}>
                            {articulo.descripcion || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              color="info"
                              outline
                              title="Ver detalles"
                              onClick={e => {
                                e.stopPropagation();
                                if (selectedArticulo?.id === articulo.id) {
                                  setSelectedArticulo(null);
                                } else {
                                  setSelectedArticulo(articulo);
                                }
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button
                              size="sm"
                              color="warning"
                              outline
                              tag={Link}
                              to={`${articulo.id}/edit`}
                              title="Editar"
                              onClick={e => e.stopPropagation()}
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              outline
                              title="Eliminar"
                              onClick={e => {
                                e.stopPropagation();
                                handleDelete(articulo.id);
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-5 text-muted">
                      {loading ? 'Cargando inventario...' : 'No se encontraron artículos'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* 3. Panel de Detalles Inferior */}
        {selectedArticulo && (
          <Card className="shadow border-top-primary border-4 animate__animated animate__slideInUp">
            <CardHeader className="bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="m-0 text-primary">
                <FontAwesomeIcon icon={faEye} className="me-2" />
                Detalles del Producto: <strong>{selectedArticulo.nombre}</strong>
              </h5>
              <div className="d-flex gap-2">
                <Button size="sm" color="info" outline onClick={() => loadHistorial(selectedArticulo.id)}>
                  <FontAwesomeIcon icon={faHistory} className="me-2" /> Historial
                </Button>
                <Button size="sm" color="success" outline>
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Exportar
                </Button>
                <Button size="sm" color="danger" outline onClick={() => handleDelete(selectedArticulo.id)}>
                  <FontAwesomeIcon icon={faTrash} className="me-2" /> Eliminar
                </Button>
                <Button size="sm" color="secondary" className="ms-2" onClick={() => setSelectedArticulo(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="2" className="text-center border-end">
                  {selectedArticulo.imagen ? (
                    <img
                      src={`data:${selectedArticulo.imagenContentType};base64,${selectedArticulo.imagen}`}
                      alt={selectedArticulo.nombre}
                      className="img-fluid rounded shadow-sm mb-2"
                      style={{ maxHeight: '120px' }}
                    />
                  ) : (
                    <div
                      className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
                      style={{ height: '120px' }}
                    >
                      <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                    </div>
                  )}
                  <div className="small text-muted mt-2 fw-bold">{selectedArticulo.codigo}</div>
                </Col>
                <Col md="10">
                  <Row>
                    <Col md="4">
                      <div className="mb-3">
                        <label className="text-muted small text-uppercase fw-bold">Precio Compra</label>
                        <div className="fs-5">C$ {selectedArticulo.costo?.toFixed(2)}</div>
                      </div>
                      <div>
                        <label className="text-muted small text-uppercase fw-bold">Precio Venta</label>
                        <div className="fs-4 fw-bold text-success">C$ {selectedArticulo.precio?.toFixed(2)}</div>
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="mb-3">
                        <label className="text-muted small text-uppercase fw-bold">Stock Actual</label>
                        <div
                          className={`fs-5 ${(selectedArticulo.existencia || 0) <= (selectedArticulo.existenciaMinima || 0) ? 'text-danger' : 'text-dark'}`}
                        >
                          {selectedArticulo.existencia} {selectedArticulo.unidadMedida?.simbolo}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted small text-uppercase fw-bold">Inversión Total</label>
                        <div className="fs-5">C$ {((selectedArticulo.existencia || 0) * (selectedArticulo.costo || 0)).toFixed(2)}</div>
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="mb-2">
                        <label className="text-muted small text-uppercase fw-bold">Descripción</label>
                        <p className="text-secondary small">{selectedArticulo.descripcion || 'Sin descripción detallada.'}</p>
                      </div>
                      <div>
                        <label className="text-muted small text-uppercase fw-bold">Categoría</label>
                        <div>
                          <Badge color="info">{selectedArticulo.categoria?.nombre || 'General'}</Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
        )}

        {/* MODAL HISTORIAL DE PRECIOS */}
        <Modal isOpen={showHistory} toggle={() => setShowHistory(!showHistory)} centered size="lg">
          <ModalHeader toggle={() => setShowHistory(!showHistory)} className="bg-info text-white">
            <FontAwesomeIcon icon={faHistory} className="me-2" /> Historial de Cambios de Precio: {selectedArticulo?.nombre}
          </ModalHeader>
          <ModalBody className="p-0">
            <Table hover striped responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th className="text-end">Precio Ant.</th>
                  <th className="text-end">Precio Nuevo</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Cargando historial...
                    </td>
                  </tr>
                ) : historial.length > 0 ? (
                  historial.map(h => (
                    <tr key={h.id}>
                      <td>{dayjs(h.fecha).format('DD/MM/YYYY HH:mm')}</td>
                      <td className="text-end text-muted">C$ {h.precioAnterior?.toFixed(2)}</td>
                      <td className="text-end fw-bold text-success">C$ {h.precioNuevo?.toFixed(2)}</td>
                      <td>{h.motivo || 'Cambio general'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No hay registros de cambios para este producto.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default ArticuloList;
