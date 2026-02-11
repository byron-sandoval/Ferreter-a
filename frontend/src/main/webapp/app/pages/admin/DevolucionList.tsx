import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Card, CardHeader, CardBody, Badge, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faEye,
    faFilePdf,
    faFileExcel,
    faUndoAlt,
    faChevronLeft,
    faChevronRight,
    faCalendarAlt,
    faFileInvoice,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import DevolucionService from 'app/services/devolucion.service';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const DevolucionList = () => {
    const [devoluciones, setDevoluciones] = useState<IDevolucion[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDevolucion, setSelectedDevolucion] = useState<IDevolucion | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const itemsPerPage = 10;

    const loadAll = () => {
        setLoading(true);
        DevolucionService.getAll()
            .then(res => {
                setDevoluciones(res.data);
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

    const toggleDetailModal = () => setShowDetailModal(!showDetailModal);

    const handleViewDetail = (dev: IDevolucion) => {
        setSelectedDevolucion(dev);
        toggleDetailModal();
    };

    const filteredDevoluciones = devoluciones.filter(d =>
        d.venta?.noFactura?.toString().includes(filter) ||
        d.motivo?.toLowerCase().includes(filter.toLowerCase()) ||
        d.venta?.cliente?.nombre?.toLowerCase().includes(filter.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDevoluciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <CardHeader className="bg-primary text-white p-4 border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="m-0 fw-bold">
                                <FontAwesomeIcon icon={faUndoAlt} className="me-2" />
                                Devoluciones Realizadas
                            </h3>
                            <p className="m-0 opacity-75 small">Consulta y gestiona las devoluciones de ventas</p>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-4">
                    <Row className="mb-4 align-items-center">
                        <Col md="6">
                            <div className="search-box position-relative">
                                <Input
                                    type="text"
                                    placeholder="Buscar por factura, motivo o cliente..."
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    className="ps-5 py-2 border-0 shadow-sm"
                                    style={{ borderRadius: '10px', backgroundColor: '#f1f3f9' }}
                                />
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="position-absolute text-muted"
                                    style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
                                />
                            </div>
                        </Col>
                        <Col md="6" className="text-end">
                            <Button color="success" className="me-2 shadow-sm border-0 py-2 px-3" style={{ borderRadius: '8px' }}>
                                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Excel
                            </Button>
                            <Button color="danger" className="shadow-sm border-0 py-2 px-3" style={{ borderRadius: '8px' }}>
                                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> PDF
                            </Button>
                        </Col>
                    </Row>

                    <div className="table-responsive">
                        <Table hover className="align-middle custom-table">
                            <thead style={{ backgroundColor: '#f1f3f9' }}>
                                <tr>
                                    <th className="border-0 px-4 py-3 text-secondary small text-uppercase">ID</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase">N° Factura</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase text-center">Fecha</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase">Cliente</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase">Motivo</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase text-end">Total</th>
                                    <th className="border-0 py-3 text-secondary small text-uppercase text-center px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map(d => (
                                        <tr key={d.id} className="border-bottom" style={{ transition: 'all 0.2s' }}>
                                            <td className="px-4 fw-bold text-primary">#{d.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faFileInvoice} className="text-muted me-2 opacity-50" />
                                                    <span className="fw-semibold text-dark">{d.venta?.noFactura || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex flex-column align-items-center">
                                                    <span className="text-dark small fw-medium">{dayjs(d.fecha).format('DD/MM/YYYY')}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>{dayjs(d.fecha).format('hh:mm A')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-2 text-primary" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FontAwesomeIcon icon={faUser} size="xs" />
                                                    </div>
                                                    <span className="text-dark fw-medium small">{d.venta?.cliente?.nombre || 'General'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted small d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                                                    {d.motivo || 'Sin motivo especificado'}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold text-dark">
                                                C$ {d.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-center px-4">
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="btn-icon shadow-sm border-0 me-2"
                                                    style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '8px' }}
                                                    onClick={() => handleViewDetail(d)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5 text-muted">
                                            No se encontraron devoluciones.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
                            <span className="text-muted small">
                                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDevoluciones.length)} de {filteredDevoluciones.length} resultados
                            </span>
                            <Pagination aria-label="Page navigation" className="m-0 border-0">
                                <PaginationItem disabled={currentPage === 1}>
                                    <PaginationLink previous onClick={() => paginate(currentPage - 1)} className="border-0 rounded-start shadow-sm" style={{ backgroundColor: '#f1f3f9' }}>
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </PaginationLink>
                                </PaginationItem>
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem active={i + 1 === currentPage} key={i}>
                                        <PaginationLink onClick={() => paginate(i + 1)} className="border-0 shadow-sm mx-1" style={{ borderRadius: '4px' }}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem disabled={currentPage === totalPages}>
                                    <PaginationLink next onClick={() => paginate(currentPage + 1)} className="border-0 rounded-end shadow-sm" style={{ backgroundColor: '#f1f3f9' }}>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </PaginationLink>
                                </PaginationItem>
                            </Pagination>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={showDetailModal} toggle={toggleDetailModal} size="lg" centered>
                <ModalHeader toggle={toggleDetailModal} className="border-0 pb-0">
                    <span className="fw-bold text-primary">Detalles de Devolución #{selectedDevolucion?.id}</span>
                </ModalHeader>
                <ModalBody className="pt-0">
                    <div className="mt-4">
                        <Row className="mb-4">
                            <Col md="6">
                                <div className="p-3 bg-light rounded-3">
                                    <p className="text-muted small text-uppercase mb-1">Información de Venta</p>
                                    <h6 className="m-0 fw-bold">Factura: {selectedDevolucion?.venta?.noFactura}</h6>
                                    <p className="m-0 small">Cliente: {selectedDevolucion?.venta?.cliente?.nombre || 'General'}</p>
                                    <p className="m-0 small">Fecha: {dayjs(selectedDevolucion?.fecha).format('DD/MM/YYYY hh:mm A')}</p>
                                </div>
                            </Col>
                            <Col md="6">
                                <div className="p-3 bg-light rounded-3">
                                    <p className="text-muted small text-uppercase mb-1">Motivo</p>
                                    <p className="m-0 small fw-medium">{selectedDevolucion?.motivo || 'Sin motivo especificado'}</p>
                                </div>
                            </Col>
                        </Row>

                        <h6 className="fw-bold mb-3 text-secondary small text-uppercase">Productos Devueltos</h6>
                        <div className="table-responsive">
                            <Table borderless hover className="align-middle">
                                <thead className="bg-light">
                                    <tr className="small text-muted text-uppercase">
                                        <th className="ps-3">Producto</th>
                                        <th className="text-center">Cantidad</th>
                                        <th className="text-end">Precio Un.</th>
                                        <th className="text-end pe-3">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDevolucion?.detalles?.map(det => (
                                        <tr key={det.id} className="border-bottom">
                                            <td className="ps-3 py-3">
                                                <span className="d-block fw-bold text-dark">{det.articulo?.nombre}</span>
                                                <small className="text-muted">{det.articulo?.codigo}</small>
                                            </td>
                                            <td className="text-center fw-medium text-primary">
                                                {det.cantidad} {det.articulo?.unidadMedida?.nombre}
                                            </td>
                                            <td className="text-end">
                                                C$ {det.precioUnitario?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-end pe-3 fw-bold">
                                                C$ {det.montoTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        <div className="d-flex justify-content-end mt-4 p-3 rounded-3" style={{ backgroundColor: '#f0f9ff' }}>
                            <div className="text-end">
                                <span className="text-muted small me-2">Monto Total de Retorno:</span>
                                <h4 className="m-0 fw-bold text-primary">
                                    C$ {selectedDevolucion?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default DevolucionList;
