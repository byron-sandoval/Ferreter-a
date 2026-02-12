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
  faFilePdf,
  faBoxOpen,
  faHistory,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadAll();
  }, []);

  const articulosFiltrados = articulos.filter(
    a => (a.nombre || '').toLowerCase().includes(filter.toLowerCase()) || (a.codigo || '').toLowerCase().includes(filter.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articulosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articulosFiltrados.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


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

  const exportToExcel = () => {
    if (!selectedArticulo) return;

    // Preparar datos para exportar en formato horizontal (igual a exportAll)
    const data = [{
      ID: selectedArticulo.id,
      Código: selectedArticulo.codigo,
      Producto: selectedArticulo.nombre,
      Estado: selectedArticulo.activo ? 'Activo' : 'Inactivo',
      Stock: selectedArticulo.existencia,
      'Stock Mínimo': selectedArticulo.existenciaMinima,
      'Unidad': selectedArticulo.unidadMedida?.simbolo || '',
      'Precio Compra': selectedArticulo.costo?.toFixed(2),
      'Precio Venta': selectedArticulo.precio?.toFixed(2),
      'Inversión Total': ((selectedArticulo.existencia || 0) * (selectedArticulo.costo || 0)).toFixed(2),
      'Valor Total': ((selectedArticulo.existencia || 0) * (selectedArticulo.precio || 0)).toFixed(2),
      Categoría: selectedArticulo.categoria?.nombre || 'General',
      Descripción: selectedArticulo.descripcion || '',
    }];

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Producto');

    // Aplicar estilos a los encabezados (Fila 1)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } },
        alignment: { horizontal: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 15 }, // Código
      { wch: 30 }, // Producto
      { wch: 10 }, // Estado
      { wch: 10 }, // Stock
      { wch: 12 }, // Stock Mínimo
      { wch: 10 }, // Unidad
      { wch: 15 }, // Precio Compra
      { wch: 15 }, // Precio Venta
      { wch: 15 }, // Inversión Total
      { wch: 15 }, // Valor Total
      { wch: 20 }, // Categoría
      { wch: 40 }, // Descripción
    ];

    // Generar archivo
    const fileName = `Producto_${selectedArticulo.codigo}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportAllToExcel = () => {
    // Preparar datos de todos los productos filtrados
    const data = articulosFiltrados.map(articulo => ({
      ID: articulo.id,
      Código: articulo.codigo,
      Producto: articulo.nombre,
      Estado: articulo.activo ? 'Activo' : 'Inactivo',
      Stock: articulo.existencia,
      'Stock Mínimo': articulo.existenciaMinima,
      'Unidad': articulo.unidadMedida?.simbolo || '',
      'Precio Compra': articulo.costo?.toFixed(2),
      'Precio Venta': articulo.precio?.toFixed(2),
      'Inversión Total': ((articulo.existencia || 0) * (articulo.costo || 0)).toFixed(2),
      'Valor Total': ((articulo.existencia || 0) * (articulo.precio || 0)).toFixed(2),
      Categoría: articulo.categoria?.nombre || 'General',
      Descripción: articulo.descripcion || '',
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

    // Aplicar estilos a los encabezados (Fila 1)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } },
        alignment: { horizontal: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 15 }, // Código
      { wch: 30 }, // Producto
      { wch: 10 }, // Estado
      { wch: 10 }, // Stock
      { wch: 12 }, // Stock Mínimo
      { wch: 10 }, // Unidad
      { wch: 15 }, // Precio Compra
      { wch: 15 }, // Precio Venta
      { wch: 15 }, // Inversión Total
      { wch: 15 }, // Valor Total
      { wch: 20 }, // Categoría
      { wch: 40 }, // Descripción
    ];

    // Generar archivo
    const fileName = `Inventario_Completo_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    if (!selectedArticulo) return;

    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(52, 58, 64); // Dark gray header
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Ficha Técnica de Producto', 105, 20, { align: 'center' });

    // Información Principal
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Título del Producto
    doc.setFont(undefined, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(111, 66, 193); // Purple color
    doc.text(selectedArticulo.nombre || 'Producto Sin Nombre', 14, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const startY = 55;

    // Columna Izquierda
    doc.setFont(undefined, 'bold');
    doc.text(`Código:`, 14, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`${selectedArticulo.codigo}`, 50, startY);

    doc.setFont(undefined, 'bold');
    doc.text(`Categoría:`, 14, startY + 10);
    doc.setFont(undefined, 'normal');
    doc.text(`${selectedArticulo.categoria?.nombre || 'General'}`, 50, startY + 10);

    doc.setFont(undefined, 'bold');
    doc.text(`Estado:`, 14, startY + 20);
    doc.setFont(undefined, 'normal');
    const estado = selectedArticulo.activo ? 'Activo' : 'Inactivo';
    doc.setTextColor(selectedArticulo.activo ? 0 : 200, selectedArticulo.activo ? 128 : 0, 0);
    doc.text(estado, 50, startY + 20);
    doc.setTextColor(0, 0, 0);

    // Columna Derecha
    const col2X = 110;
    doc.setFont(undefined, 'bold');
    doc.text(`Stock Actual:`, col2X, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`${selectedArticulo.existencia} ${selectedArticulo.unidadMedida?.simbolo || ''}`, col2X + 40, startY);

    doc.setFont(undefined, 'bold');
    doc.text(`Stock Mínimo:`, col2X, startY + 10);
    doc.setFont(undefined, 'normal');
    doc.text(`${selectedArticulo.existenciaMinima}`, col2X + 40, startY + 10);

    // Descripción
    const descY = startY + 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Descripción:', 14, descY);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const desc = selectedArticulo.descripcion || 'Sin descripción detallada.';
    const splitDesc = doc.splitTextToSize(desc, 180);
    doc.text(splitDesc, 14, descY + 6);

    const descHeight = (splitDesc.length * 5) + 15;

    // Sección de Precios
    const priceY = descY + descHeight;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, priceY - 5, 182, 35, 'F');

    doc.setFont(undefined, 'bold');
    doc.text('Información Financiera', 14, priceY);

    // Tabla Precios manual
    const pY = priceY + 10;

    doc.setFontSize(10);
    doc.text('Costo Unitario:', 20, pY);
    doc.text('Precio Venta:', 110, pY);

    doc.setFontSize(14);
    doc.text(`C$ ${selectedArticulo.costo?.toFixed(2)}`, 20, pY + 8);
    doc.setTextColor(40, 167, 69); // Green
    doc.text(`C$ ${selectedArticulo.precio?.toFixed(2)}`, 110, pY + 8);
    doc.setTextColor(0, 0, 0);



    // Footer
    const footerY = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado el ${dayjs().format('DD/MM/YYYY HH:mm')}`, 105, footerY, { align: 'center' });

    doc.save(`Ficha_Producto_${selectedArticulo.codigo}.pdf`);
  };

  // Estilos "INASOFTWARE" Style
  const headerStyle = { backgroundColor: 'rgba(111, 66, 193, 1)', color: 'white' }; // Purple header from image
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
              className="border-end-0 border-secondary bg-white text-dark"
              style={{ border: '1px solid #ced4da' }}
            />
            <span className="input-group-text bg-white border-secondary text-muted">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <Button color="success" size="sm" className="opacity-90" onClick={exportAllToExcel}>
            <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Exportar Todo
          </Button>
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

      <div className="p-1 px-md-2">
        {/* 2. Tabla Densa */}
        <Card className="shadow-sm mb-4 border-0">
          <div className="table-responsive">
            <Table hover striped size="sm" className="mb-0 align-middle">
              <thead
                className="text-center text-uppercase mt-2"
                style={{ backgroundColor: '#343a40', color: 'black', fontSize: '0.75rem' }}
              >
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2">Código</th>
                  <th className="py-2 text-start">Producto</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Mín.</th>
                  <th className="py-2 text-end">Costo</th>
                  <th className="py-2 text-end">Venta</th>
                  <th className="py-2 text-end">Total</th>
                  <th className="py-2 text-start">Observación</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(articulo => {
                    const hasStock = (articulo.existencia || 0) > 0;
                    const isLowStock = (articulo.existencia || 0) <= (articulo.existenciaMinima || 0);
                    const stockBg = !hasStock ? '#ff0000' : isLowStock ? '#ffc107' : '#00a000';
                    const isSelected = selectedArticulo?.id === articulo.id;

                    return (
                      <tr
                        key={articulo.id}
                        style={isSelected ? rowSelectedStyle : {}}
                        className={`text-center ${!articulo.activo ? 'text-muted' : ''}`}
                      >
                        <td className="fw-bold text-primary">{articulo.id}</td>
                        <td>{articulo.codigo}</td>
                        <td className="text-start">{articulo.nombre}</td>
                        <td>
                          <Badge
                            color={articulo.activo ? 'light' : 'danger'}
                            className={articulo.activo ? 'text-success border border-success' : 'text-white'}
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
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-2 border-top bg-light">
                <small className="text-muted ps-2">
                  Mostrando {Math.min(indexOfLastItem, articulosFiltrados.length)} de {articulosFiltrados.length} artículos
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
                <Button size="sm" color="success" outline onClick={exportToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" /> Excel
                </Button>
                <Button size="sm" color="danger" outline onClick={exportToPDF}>
                  <FontAwesomeIcon icon={faFilePdf} className="me-2" /> PDF
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
                        <p className="text-dark mb-0" style={{ lineHeight: '1.4' }}>{selectedArticulo.descripcion || 'Sin descripción detallada.'}</p>
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
