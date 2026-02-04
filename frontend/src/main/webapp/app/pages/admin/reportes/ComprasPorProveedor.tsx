import React, { useEffect, useState } from 'react';
import { Card, CardBody, Table, Badge, Button, Row, Col, Input, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faArrowLeft, faEye, faFileExcel, faCalendar, faClipboardList } from '@fortawesome/free-solid-svg-icons';
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
  const [loadingItems, setLoadingItems] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<IProveedor | null>(null);
  const [itemsProveedor, setItemsProveedor] = useState<any[]>([]);

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

  const verDetallesDirecto = async (proveedor: IProveedor) => {
    setProveedorSeleccionado(proveedor);
    setLoadingItems(true);
    setItemsProveedor([]);
    try {
      const comprasProv = ingresos.filter(ing => ing.proveedor?.id === proveedor.id && ing.activo);

      // Cargamos los detalles de cada ingreso de forma paralela para ser "directos"
      const detailedIngresos = await Promise.all(comprasProv.map(ing => IngresoService.get(ing.id)));

      // Aplanamos todos los detalles en una sola lista para el reporte
      const allItems: any[] = [];
      detailedIngresos.forEach(res => {
        const ing = res.data;
        ing.detalles?.forEach(det => {
          allItems.push({
            ...det,
            fecha: ing.fecha,
            noDocumento: ing.noDocumento,
          });
        });
      });

      // Ordenar por fecha descendente
      setItemsProveedor(allItems.sort((a, b) => dayjs(b.fecha).unix() - dayjs(a.fecha).unix()));
    } catch (error) {
      console.error('Error cargando detalles del proveedor:', error);
    }
    setLoadingItems(false);
  };

  const headerStyle = { backgroundColor: '#08c4d1ff', color: 'white' };

  if (proveedorSeleccionado) {
    return (
      <div className="animate__animated animate__fadeIn p-1">
        <div
          className="d-flex justify-content-between align-items-center mb-2 px-2 py-1 text-white rounded shadow-sm"
          style={{ backgroundColor: '#343a40' }}
        >
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faTruck} />
            <div>
              <h5 className="m-0 fw-bold">Historial: {proveedorSeleccionado.nombre}</h5>
              <small className="opacity-75">RUC / ID: {proveedorSeleccionado.ruc || '-'}</small>
            </div>
          </div>
          <Button color="light" size="sm" onClick={() => setProveedorSeleccionado(null)} style={{ fontSize: '0.75rem' }}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Volver a Lista
          </Button>
        </div>

        <Card className="shadow-sm border-0 mb-3">
          <CardBody className="p-0">
            {loadingItems ? (
              <div className="text-center py-5">
                <Spinner color="primary" size="sm" className="me-2" />
                <span className="text-muted small">Cargando historial detallado...</span>
              </div>
            ) : (
              <Table hover responsive size="sm" className="mb-0 align-middle">
                <thead className="text-center text-uppercase small bg-light fw-bold" style={{ fontSize: '0.7rem' }}>
                  <tr>
                    <th className="py-2 px-3 text-start">Fecha</th>
                    <th className="py-2">Factura</th>
                    <th className="py-2 text-start">Producto</th>
                    <th className="py-2">Cantidad</th>
                    <th className="py-2 text-end">Costo Unit.</th>
                    <th className="py-2 text-end px-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsProveedor.length > 0 ? (
                    itemsProveedor.map((item, idx) => (
                      <tr key={idx} style={{ fontSize: '0.8rem' }}>
                        <td className="px-3 text-muted">{dayjs(item.fecha).format('DD/MM/YY')}</td>
                        <td className="text-center fw-bold text-primary">{item.noDocumento}</td>
                        <td>
                          <div className="fw-bold">{item.articulo?.nombre}</div>
                          <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                            {item.articulo?.codigo}
                          </small>
                        </td>
                        <td className="text-center">
                          <Badge color="light" className="text-dark border">
                            {item.cantidad}
                          </Badge>
                        </td>
                        <td className="text-end">C$ {item.costoUnitario?.toLocaleString()}</td>
                        <td className="text-end fw-bold px-3 text-success">C$ {item.monto?.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted small">
                        No se encontraron productos para este proveedor.
                      </td>
                    </tr>
                  )}
                </tbody>
                {itemsProveedor.length > 0 && (
                  <tfoot>
                    <tr className="bg-light fw-bold border-top" style={{ fontSize: '0.85rem' }}>
                      <td colSpan={5} className="text-end py-2">
                        TOTAL HISTÓRICO:
                      </td>
                      <td className="text-end px-3 text-primary">
                        C$ {itemsProveedor.reduce((sum, item) => sum + (item.monto || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn p-1">
      <div
        className="d-flex justify-content-between align-items-center mb-2 px-1 py-1 text-white rounded shadow-sm"
        style={{ backgroundColor: '#343a40' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faTruck} />
          <h5 className="m-0 fw-bold">Reporte de Compras por Proveedor</h5>
        </div>
        <Button color="secondary" size="sm" outline onClick={() => navigate('/admin/reportes')} style={{ fontSize: '0.75rem' }}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Volver
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Table hover responsive size="sm" className="mb-0">
          <thead className="text-center text-uppercase small fw-bold" style={{ ...headerStyle, fontSize: '0.75rem' }}>
            <tr>
              <th className="py-2 text-start px-3">Proveedor</th>
              <th className="py-2">RUC / ID</th>
              <th className="py-2">Teléfono</th>
              <th className="py-2">No. Compras</th>
              <th className="py-2 text-end">Total Comprado</th>
              <th className="py-2 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <Spinner color="primary" />
                </td>
              </tr>
            ) : proveedores.length > 0 ? (
              proveedores.map(prov => {
                const totalCompras = calcularTotalPorProveedor(prov.id);
                const numCompras = contarComprasPorProveedor(prov.id);
                return (
                  <tr key={prov.id} className="align-middle" style={{ fontSize: '0.8rem' }}>
                    <td className="fw-bold px-3">{prov.nombre}</td>
                    <td className="text-center text-muted small">{prov.ruc || '-'}</td>
                    <td className="text-center small text-muted">{prov.telefono || '-'}</td>
                    <td className="text-center">
                      <Badge color="primary" pill style={{ fontSize: '0.7rem' }}>
                        {numCompras} envíos
                      </Badge>
                    </td>
                    <td className="text-end fw-bold text-success">C$ {totalCompras.toLocaleString()}</td>
                    <td className="text-center">
                      <Badge color={prov.activo ? 'success' : 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                        {prov.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-center px-3">
                      <Button
                        size="sm"
                        className="bg-white shadow-sm border text-decoration-none fw-bold px-3 py-1"
                        onClick={() => verDetallesDirecto(prov)}
                        disabled={numCompras === 0}
                        style={{ fontSize: '0.75rem', color: '#8e44ad', borderRadius: '8px', border: '1px solid #dee2e6' }}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-2" />
                        VER COMPRAS
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted small">
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
