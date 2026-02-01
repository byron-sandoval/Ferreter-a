export interface IEmpresa {
  id?: number;
  nombre?: string;
  ruc?: string;
  regimenFiscal?: string;
  direccion?: string;
  telefono?: string | null;
  correo?: string | null;
  logo?: string | null;
  logoContentType?: string | null;
  eslogan?: string | null;
}

export const defaultEmpresa: Readonly<IEmpresa> = {};
