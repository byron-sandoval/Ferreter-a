export interface IUnidadMedida {
  id?: number;
  nombre?: string;
  simbolo?: string;
  activo?: boolean | null;
}

export const defaultUnidadMedida: Readonly<IUnidadMedida> = {
  activo: true,
};
