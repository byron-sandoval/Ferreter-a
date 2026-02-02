import React, { useEffect, useState } from 'react';
import { Card, CardBody, Table, Badge, Button, Row, Col, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faArrowLeft, faEye, faFileExcel, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import IngresoService from 'app/services/ingreso.service';
import ProveedorService from 'app/services/proveedor.service';
import { IIngreso } from 'app/shared/model/ingreso.model';
import { IProveedor } from 'app/shared/model/proveedor.model';
import dayjs from 'dayjs';

export const ComprasPorProveedor = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<IProveedor[]>([]);
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<IProveedor | null>(null);
  const [comprasProveedor, setComprasProveedor] = useState<IIngreso[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ingresoDetalle, setIngresoDetalle] = useState<IIngreso | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provRes, ingRes] = await Promise.all([ProveedorService.getAll(), IngresoService.getAll()]);
      setProveedores(provRes.data);
      setIngresos(ingRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const calcularTotalPorProveedor = (proveedorId: number) => {
    return ingresos.filter(ing => ing.proveedor?.id === proveedorId && ing.activo).reduce((sum, ing) => sum + (ing.total || 0), 0);
  };

  const contarComprasPorProveedor = (proveedorId: number) => {
    return ingresos.filter(ing => ing.proveedor?.id === proveedorId && ing.activo).length;
  };

  const verComprasProveedor = (proveedor: IProveedor) => {
    const compras = ingresos.filter(ing => ing.proveedor?.id === proveedor.id && ing.activo);
    setProveedorSeleccionado(proveedor);
    setComprasProveedor(compras);
  };

  const verDetalleIngreso = async (id: number) => {
    try {
      const res = await IngresoService.get(id);
      setIngresoDetalle(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const headerStyle = { backgroundColor: '#0d6efd', color: 'white' };

  if (proveedorSeleccionado) {
    return (
      <div className="animate__animated animate__fadeIn p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold text-dark m-0">
              <FontAwesomeIcon icon={faTruck} className="me-2 text-info" />
              Compras a: {proveedorSeleccionado.nombre}
            </h4>
            <small className="text-muted">Total de compras: {comprasProveedor.length}</small>
          </div>
          <Button color="secondary" size="sm" outline onClick={() => setProveedorSeleccionado(null)}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver a Proveedores
          </Button>
        </div>

        <Card className="shadow-sm border-0">
          <Table hover responsive size="sm" className="mb-0">
            <thead className="text-center text-uppercase small" style={headerStyle}>
              <tr>
                <th className="py-2">Fecha</th>
                <th className="py-2">No. Documento</th>
                <th className="py-2 text-end">Total</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprasProveedor.length > 0 ? (
                comprasProveedor.map(ing => (
                  <tr key={ing.id} className="text-center align-middle">
                    <td className="small">
                      <FontAwesomeIcon icon={faCalendar} className="me-1 text-muted" />
                      {dayjs(ing.fecha).format('DD/MM/YYYY')}
                    </td>
                    <td className="fw-bold">{ing.noDocumento}</td>
                    <td className="text-end fw-bold text-success">C$ {ing.total?.toLocaleString()}</td>
                    <td>
                      <Badge color={ing.activo ? 'success' : 'secondary'} pill>
                        {ing.activo ? 'Procesado' : 'Anulado'}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" color="info" outline onClick={() => ing.id && verDetalleIngreso(ing.id)}>
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No hay compras registradas para este proveedor
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="table-light fw-bold">
                <td colSpan={2} className="text-end">
                  TOTAL GENERAL:
                </td>
                <td className="text-end text-success">
                  C$ {comprasProveedor.reduce((sum, ing) => sum + (ing.total || 0), 0).toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </Table>
        </Card>

        {/* Modal Detalle de Compra */}
        <Modal isOpen={showModal} toggle={() => setShowModal(false)} size="lg" centered>
          <ModalHeader toggle={() => setShowModal(false)} className="bg-dark text-white">
            <FontAwesomeIcon icon={faTruck} className="me-2 text-info" />
            Detalle de Compra #{ingresoDetalle?.noDocumento}
          </ModalHeader>
          <ModalBody>
            <div className="mb-3">
              <strong>Proveedor:</strong> {ingresoDetalle?.proveedor?.nombre}
              <br />
              <strong>RUC:</strong> {ingresoDetalle?.proveedor?.ruc || 'N/A'}
              <br />
              <strong>Fecha:</strong> {dayjs(ingresoDetalle?.fecha).format('DD/MM/YYYY')}
            </div>
            <Table hover responsive borderless size="sm">
              <thead className="table-dark small">
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-end">Costo Unit.</th>
                  <th className="text-end">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ingresoDetalle?.detalles?.map((det, i) => (
                  <tr key={i}>
                    <td>
                      <div className="fw-bold">{det.articulo?.nombre}</div>
                      <small className="text-muted">{det.articulo?.codigo}</small>
                    </td>
                    <td className="text-center">
                      <Badge color="info" outline>
                        {det.cantidad}
                      </Badge>
                    </td>
                    <td className="text-end">C$ {det.costoUnitario?.toLocaleString()}</td>
                    <td className="text-end fw-bold">C$ {det.monto?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-end mt-3 p-3 bg-light rounded">
              <h5 className="fw-bold m-0">Total: C$ {ingresoDetalle?.total?.toLocaleString()}</h5>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark m-0">
            <FontAwesomeIcon icon={faTruck} className="me-2 text-info" />
            Compras por Proveedor
          </h4>
          <small className="text-muted">Resumen de compras realizadas a cada proveedor</small>
        </div>
        <Button color="secondary" size="sm" outline onClick={() => navigate('/admin/reportes')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Volver a Reportes
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="text-center text-uppercase small" style={headerStyle}>
            <tr>
              <th className="py-2 text-start">Proveedor</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">No. Compras</th>
              <th className="py-2 text-end">Total Comprado</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
            ) : proveedores.length > 0 ? (
              proveedores.map(prov => {
                const totalCompras = calcularTotalPorProveedor(prov.id);
                const numCompras = contarComprasPorProveedor(prov.id);
                return (
                  <tr key={prov.id} className="align-middle">
                    <td className="fw-bold">{prov.nombre}</td>
                    <td className="text-center small">{prov.telefono || '-'}</td>
                    <td className="text-center">
                      <Badge color="primary" pill>
                        {numCompras}
                      </Badge>
                    </td>
                    <td className="text-end fw-bold text-success">C$ {totalCompras.toLocaleString()}</td>
                    <td className="text-center">
                      <Badge color={prov.activo ? 'success' : 'secondary'} pill>
                        {prov.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button size="sm" color="info" outline onClick={() => verComprasProveedor(prov)} disabled={numCompras === 0}>
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        Ver Compras
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  No hay proveedores registrados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ComprasPorProveedor;
