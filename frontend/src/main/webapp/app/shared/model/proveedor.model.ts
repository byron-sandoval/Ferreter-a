export interface IProveedor {
  id?: number;
  nombre?: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean | null;
  ruc?: string | null;
}

export const defaultProveedor: Readonly<IProveedor> = {
  activo: true,
};
