import { IArticulo } from './articulo.model';
import { IIngreso } from './ingreso.model';

export interface IDetalleIngreso {
  id?: number;
  cantidad?: number;
  costoUnitario?: number;
  monto?: number;
  articulo?: IArticulo | null;
  ingreso?: IIngreso | null;
}

export const defaultDetalleIngreso: Readonly<IDetalleIngreso> = {};
