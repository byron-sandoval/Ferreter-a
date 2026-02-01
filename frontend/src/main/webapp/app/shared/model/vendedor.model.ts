export interface IVendedor {
  id?: number;
  idKeycloak?: string;
  cedula?: string;
  nombre?: string;
  apellido?: string | null;
  telefono?: string | null;
  activo?: boolean | null;
}

export const defaultVendedor: Readonly<IVendedor> = {
  activo: true,
};
