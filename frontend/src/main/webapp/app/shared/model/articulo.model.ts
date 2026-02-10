import { ICategoria } from './categoria.model';
import { IUnidadMedida } from './unidad-medida.model';

export interface IArticulo {
  id?: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  existencia?: number;
  existenciaMinima?: number;
  precio?: number;
  costo?: number;
  imagen?: string | null;
  imagenContentType?: string | null;
  activo?: boolean | null;
  categoria?: ICategoria | null;
  unidadMedida?: IUnidadMedida | null;
  priceChangeReason?: string | null;
}

export const defaultArticulo: Readonly<IArticulo> = {
  activo: true,
};
