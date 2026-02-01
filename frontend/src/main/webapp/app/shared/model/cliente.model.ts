export enum GeneroEnum {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export interface ICliente {
  id?: number;
  cedula?: string;
  nombre?: string;
  genero?: GeneroEnum;
  direccion?: string | null;
  telefono?: string | null;
  saldo?: number | null;
  activo?: boolean | null;
}

export const defaultCliente: Readonly<ICliente> = {
  activo: true,
};
