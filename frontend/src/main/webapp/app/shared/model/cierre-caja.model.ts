import { IUsuario } from './usuario.model';

export interface ICierreCaja {
    id?: number;
    fecha?: string;
    montoApertura?: number;
    montoVentasEfectivo?: number;
    montoVentasTarjeta?: number;
    montoVentasTransferencia?: number;
    montoDevoluciones?: number;
    totalVentasBrutas?: number;
    montoEsperado?: number;
    montoFisico?: number;
    montoSiguienteCaja?: number;
    diferencia?: number;
    observaciones?: string;
    usuario?: IUsuario;
}
