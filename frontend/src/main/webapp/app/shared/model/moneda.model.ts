export interface IMoneda {
  id?: number;
  nombre?: string;
  simbolo?: string;
  tipoCambio?: number;
}

export const defaultMoneda: Readonly<IMoneda> = {};
