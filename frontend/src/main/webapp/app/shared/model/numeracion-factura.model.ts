export interface INumeracionFactura {
  id?: number;
  serie?: string;
  correlativoActual?: number;
  activo?: boolean | null;
}

export const defaultNumeracionFactura: Readonly<INumeracionFactura> = {
  activo: true,
};
