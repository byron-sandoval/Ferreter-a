export interface IMoneda {
  id?: number;
  nombre?: string;
  simbolo?: string;
  tipoCambio?: number;
  activo?: boolean;
}

export const defaultMoneda: Readonly<IMoneda> = {};
