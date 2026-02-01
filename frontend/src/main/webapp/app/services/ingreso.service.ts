import axios from 'axios';
import { IIngreso } from '../shared/model/ingreso.model';
import { IDetalleIngreso } from '../shared/model/detalle-ingreso.model';

const API_INGRESOS = 'api/ingresos';
const API_DETALLES = 'api/detalle-ingresos';

export const IngresoService = {
  getAll() {
    return axios.get<IIngreso[]>(API_INGRESOS);
  },

  get(id: number) {
    return axios.get<IIngreso>(`${API_INGRESOS}/${id}`);
  },

  create(ingreso: IIngreso) {
    return axios.post<IIngreso>(API_INGRESOS, ingreso);
  },

  update(ingreso: IIngreso) {
    return axios.put<IIngreso>(`${API_INGRESOS}/${ingreso.id}`, ingreso);
  },

  delete(id: number) {
    return axios.delete(`${API_INGRESOS}/${id}`);
  },

  getIngresosRecientes() {
    return axios.get<IIngreso[]>(`${API_INGRESOS}?sort=id,desc&size=10`);
  },
};

export default IngresoService;
