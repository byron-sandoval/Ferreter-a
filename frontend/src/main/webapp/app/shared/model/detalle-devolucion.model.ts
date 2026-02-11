import { IArticulo } from 'app/shared/model/articulo.model';
import { IDevolucion } from 'app/shared/model/devolucion.model';

export interface IDetalleDevolucion {
    id?: number;
    cantidad?: number;
    precioUnitario?: number;
    montoTotal?: number;
    articulo?: IArticulo | null;
    devolucion?: IDevolucion | null;
}

export const defaultDetalleDevolucion: Readonly<IDetalleDevolucion> = {};
