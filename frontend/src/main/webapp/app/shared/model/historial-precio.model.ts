import { IArticulo } from './articulo.model';

export interface IHistorialPrecio {
  id?: number;
  precioAnterior?: number;
  precioNuevo?: number;
  fecha?: string;
  motivo?: string | null;
  articulo?: IArticulo | null;
}

export const defaultHistorialPrecio: Readonly<IHistorialPrecio> = {};
