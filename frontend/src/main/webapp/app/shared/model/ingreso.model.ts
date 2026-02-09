import dayjs from 'dayjs';
import { IUsuario } from './usuario.model';
import { IProveedor } from './proveedor.model';
import { IDetalleIngreso } from './detalle-ingreso.model';

export interface IIngreso {
  id?: number;
  fecha?: dayjs.Dayjs;
  noDocumento?: string;
  total?: number;
  observaciones?: string | null;
  activo?: boolean | null;
  detalles?: IDetalleIngreso[] | null;
  usuario?: IUsuario | null;
  proveedor?: IProveedor | null;
}

export const defaultIngreso: Readonly<IIngreso> = {
  activo: true,
};
