import dayjs from 'dayjs';
import { ICliente } from './cliente.model';
import { IVendedor } from './vendedor.model';
import { IMoneda } from './moneda.model';
import { INumeracionFactura } from './numeracion-factura.model';
import { IDetalleVenta } from './detalle-venta.model';

export enum MetodoPagoEnum {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export interface IVenta {
  id?: number;
  fecha?: dayjs.Dayjs;
  noFactura?: number;
  subtotal?: number;
  iva?: number;
  total?: number;
  totalEnMonedaBase?: number | null;
  metodoPago?: MetodoPagoEnum;
  stripeId?: string | null;
  esContado?: boolean;
  tipoCambioVenta?: number | null;
  anulada?: boolean | null;
  descuento?: number | null;
  importeRecibido?: number | null;
  cambio?: number | null;
  detalles?: IDetalleVenta[] | null;
  cliente?: ICliente | null;
  vendedor?: IVendedor | null;
  moneda?: IMoneda | null;
  numeracion?: INumeracionFactura | null;
}

export const defaultVenta: Readonly<IVenta> = {
  esContado: true,
  anulada: false,
};
