import dayjs from 'dayjs';
import { IVenta } from 'app/shared/model/venta.model';

export interface IDevolucion {
  id?: number;
  fecha?: dayjs.Dayjs | null;
  motivo?: string;
  montoTotal?: number;
  venta?: IVenta | null;
}

export const defaultDevolucion: Readonly<IDevolucion> = {};
