import axios from 'axios';
import { IVenta } from '../shared/model/venta.model';
import { IDetalleVenta } from '../shared/model/detalle-venta.model';

const API_VENTAS = 'api/ventas';
const API_DETALLES = 'api/detalle-ventas';

export const VentaService = {
  // Crear la cabecera de la venta
  createVenta(venta: IVenta) {
    return axios.post<IVenta>(API_VENTAS, venta);
  },

  // Agregar un producto a la venta
  addDetalle(detalle: IDetalleVenta) {
    return axios.post<IDetalleVenta>(API_DETALLES, detalle);
  },

  // Obtener ventas del día (para el Dashboard)
  getVentasHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return axios.get<IVenta[]>(`${API_VENTAS}?fecha.greaterThanOrEqual=${hoy}T00:00:00Z`);
  },

  // Obtener una factura completa por ID
  getFactura(id: number) {
    return axios.get<IVenta>(`${API_VENTAS}/${id}`);
  },

  getAll() {
    return axios.get<IVenta[]>(API_VENTAS);
  },

  getAllDetalles() {
    return axios.get<IDetalleVenta[]>(API_DETALLES);
  },
};

export default VentaService;
