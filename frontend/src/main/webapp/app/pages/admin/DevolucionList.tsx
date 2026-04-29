import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  faUser,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import DevolucionService from 'app/services/devolucion.service';
import { IDevolucion } from 'app/shared/model/devolucion.model';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DevolucionList = () => {
  const navigate = useNavigate();
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

  const filteredDevoluciones = devoluciones.filter(
    d =>
      d.venta?.noFactura?.toString().includes(filter) ||
      d.motivo?.toLowerCase().includes(filter.toLowerCase()) ||
      d.venta?.cliente?.nombre?.toLowerCase().includes(filter.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevoluciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    // Preparar datos para exportar
    const dataToExport = filteredDevoluciones.map(d => ({
      ID: d.id,
      'N° Factura': d.venta?.noFactura || 'N/A',
      Fecha: dayjs(d.fecha).format('DD/MM/YYYY HH:mm'),
      Cliente: d.venta?.cliente?.nombre || 'General',
      Motivo: d.motivo || 'Sin motivo especificado',
      Total: `C$ ${d.total?.toFixed(2) || '0.00'}`,
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');

    // Apply styles to headers (Row 1 / Index 0)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'EEEEEE' } },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: '000000' } } },
      };
    }

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 8 }, // ID
      { wch: 12 }, // N° Factura
      { wch: 18 }, // Fecha
      { wch: 25 }, // Cliente
      { wch: 35 }, // Motivo
      { wch: 15 }, // Total
    ];
    ws['!cols'] = colWidths;

    // Generar archivo
    const fileName = `Devoluciones_${dayjs().format('YYYY-MM-DD_HHmm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('Reporte de Devoluciones', 14, 20);

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 28);
    doc.text(`Total de registros: ${filteredDevoluciones.length}`, 14, 34);

    if (filter) {
      doc.text(`Filtro aplicado: "${filter}"`, 14, 40);
    }

    // Preparar datos para la tabla
    const tableData = filteredDevoluciones.map(d => [
      d.id?.toString() || '',
      d.venta?.noFactura?.toString() || 'N/A',
      dayjs(d.fecha).format('DD/MM/YYYY'),
      d.venta?.cliente?.nombre || 'General',
      d.motivo || 'Sin motivo',
      `C$ ${d.total?.toFixed(2) || '0.00'}`,
    ]);

    // Generar tabla
    autoTable(doc, {
      startY: filter ? 45 : 40,
      head: [['ID', 'N° Factura', 'Fecha', 'Cliente', 'Motivo', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'left', cellWidth: 40 },
        4: { halign: 'left', cellWidth: 50 },
        5: { halign: 'right', cellWidth: 25 },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Guardar PDF
    const fileName = `Devoluciones_${dayjs().format('YYYY-MM-DD_HHmm')}.pdf`;
    doc.save(fileName);
  };



  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
        <CardHeader
          className="bg-primary text-white p-3 border-0"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button
                color="link"
                className="text-white me-3 p-0"
                onClick={() => navigate('/vendedor/historial-ventas')}
                style={{ fontSize: '1.2rem' }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <div>
                <h4 className="m-0 fw-bold">Devoluciones Realizadas</h4>
                <p className="m-0 opacity-75" style={{ fontSize: '0.75rem' }}>
                  Consulta y gestiona las devoluciones de ventas
                </p>
              </div>
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
              <Button color="success" className="me-2 shadow-sm border-0 py-2 px-3" style={{ borderRadius: '8px' }} onClick={exportToExcel}>
                <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Excel
              </Button>
              <Button color="danger" className="shadow-sm border-0 py-2 px-3" style={{ borderRadius: '8px' }} onClick={exportToPDF}>
                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> PDF
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="align-middle custom-table">
              <thead style={{ backgroundColor: '#f1f3f9' }}>
                <tr>
                  <th className="border-0 px-4 py-3 text-dark small text-uppercase fw-bold">ID</th>
                  <th className="border-0 py-3 text-dark small text-uppercase fw-bold">N° Factura</th>
                  <th className="border-0 py-3 text-dark small text-uppercase text-center fw-bold">Fecha</th>
                  <th className="border-0 py-3 text-dark small text-uppercase fw-bold">Cliente</th>
                  <th className="border-0 py-3 text-dark small text-uppercase fw-bold">Motivo</th>
                  <th className="border-0 py-3 text-dark small text-uppercase text-end fw-bold">Total</th>
                  <th className="border-0 py-3 text-dark small text-uppercase text-center px-4 fw-bold">Acciones</th>
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
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {dayjs(d.fecha).format('hh:mm A')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-light rounded-circle p-2 me-2 text-primary"
                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
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
                Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDevoluciones.length)} de {filteredDevoluciones.length}{' '}
                resultados
              </span>
              <Pagination aria-label="Page navigation" className="m-0 border-0">
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink
                    previous
                    onClick={() => paginate(currentPage - 1)}
                    className="border-0 rounded-start shadow-sm"
                    style={{ backgroundColor: '#f1f3f9' }}
                  >
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
                  <PaginationLink
                    next
                    onClick={() => paginate(currentPage + 1)}
                    className="border-0 rounded-end shadow-sm"
                    style={{ backgroundColor: '#f1f3f9' }}
                  >
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
          <div className="d-flex justify-content-between align-items-center w-100 me-4">
            <span className="fw-bold text-primary">Detalles de Devolución #{selectedDevolucion?.id}</span>
          </div>
        </ModalHeader>
        <ModalBody className="pt-0">
          <div className="mt-4">
            <Row className="mb-4">
              <Col md="6">
                <div className="p-3 bg-light rounded-3">
                  <p className="text-muted small text-uppercase mb-1">Información de Venta</p>
                  <h6 className="m-0 fw-bold">Factura: {selectedDevolucion?.venta?.noFactura}</h6>
                  <p className="m-0 small">
                    <span className="fw-bold">Cliente:</span> {selectedDevolucion?.venta?.cliente?.nombre || 'General'}
                  </p>
                  <p className="m-0 small">
                    <span className="fw-bold">Fecha:</span> {dayjs(selectedDevolucion?.fecha).format('DD/MM/YYYY hh:mm A')}
                  </p>
                </div>
              </Col>
              <Col md="6">
                <div className="p-3 bg-light rounded-3">
                  <p className="text-muted small text-uppercase mb-1">Motivo</p>
                  <p className="m-0 small fw-medium">{selectedDevolucion?.motivo || 'Sin motivo especificado'}</p>
                </div>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-primary small text-uppercase">Productos Devueltos</h6>
            <div className="table-responsive">
              <Table borderless hover className="align-middle">
                <thead className="bg-light">
                  <tr className="small text-muted text-uppercase">
                    <th className="ps-3">Producto</th>
                    <th className="text-center">Código</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Precio Un.</th>
                    <th className="text-end pe-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDevolucion?.detalles?.map(det => (
                    <tr key={det.id} className="border-bottom">
                      <td className="ps-3 py-3">
                        <span className="fw-bold text-dark">{det.articulo?.nombre}</span>
                      </td>
                      <td className="text-center">
                        <small className="text-muted">{det.articulo?.codigo}</small>
                      </td>
                      <td className="text-center fw-medium text-primary">
                        {det.cantidad} {det.articulo?.unidadMedida?.nombre}
                      </td>
                      <td className="text-end">C$ {det.precioUnitario?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end pe-3 fw-bold">C$ {det.montoTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end mt-4 p-3 rounded-3" style={{ backgroundColor: '#f0f9ff' }}>
              <div className="text-end">
                <span className="text-muted small me-2 fw-bold">Monto Total de Retorno:</span>
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
