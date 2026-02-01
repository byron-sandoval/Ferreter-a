import { IArticulo } from './articulo.model';
import { IVenta } from './venta.model';

export interface IDetalleVenta {
  id?: number;
  cantidad?: number;
  precioVenta?: number;
  descuento?: number | null;
  monto?: number;
  articulo?: IArticulo | null;
  venta?: IVenta | null;
}

export const defaultDetalleVenta: Readonly<IDetalleVenta> = {};
