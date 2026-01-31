export interface ICategoria {
  id?: number;
  nombre?: string;
  descripcion?: string | null;
  imagen?: string | null;
  imagenContentType?: string | null;
  activo?: boolean | null;
  padre?: ICategoria | null;
}

export const defaultCategoria: Readonly<ICategoria> = {
  activo: true,
};
