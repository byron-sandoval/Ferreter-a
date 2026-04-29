import dayjs from 'dayjs';
import { IVenta } from 'app/shared/model/venta.model';
import { IDetalleDevolucion } from 'app/shared/model/detalle-devolucion.model';

export interface IDevolucion {
  id?: number;
  fecha?: dayjs.Dayjs | null;
  motivo?: string;
  total?: number;
  venta?: IVenta | null;
  detalles?: IDetalleDevolucion[] | null;
}

export const defaultDevolucion: Readonly<IDevolucion> = {};
