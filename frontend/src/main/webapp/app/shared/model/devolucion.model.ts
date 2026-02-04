import dayjs from 'dayjs';
import { IVenta } from 'app/shared/model/venta.model';

export interface IDevolucion {
  id?: number;
  fecha?: dayjs.Dayjs | null;
  motivo?: string;
  total?: number;
  venta?: IVenta | null;
}

export const defaultDevolucion: Readonly<IDevolucion> = {};
