import axios from 'axios';
import { IIngreso } from '../shared/model/ingreso.model';
import { IDetalleIngreso } from '../shared/model/detalle-ingreso.model';

const API_INGRESOS = 'api/ingresos';
const API_DETALLES = 'api/detalle-ingresos';

export const IngresoService = {
  createIngreso(ingreso: IIngreso) {
    return axios.post<IIngreso>(API_INGRESOS, ingreso);
  },

  addDetalle(detalle: IDetalleIngreso) {
    return axios.post<IDetalleIngreso>(API_DETALLES, detalle);
  },

  getIngresosRecientes() {
    return axios.get<IIngreso[]>(`${API_INGRESOS}?sort=id,desc&size=10`);
  },
};

export default IngresoService;
