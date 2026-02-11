import axios from 'axios';
import { IDevolucion } from '../shared/model/devolucion.model';

const API_URL = 'api/devolucions';

export const DevolucionService = {
  create(devolucion: IDevolucion) {
    return axios.post<IDevolucion>(API_URL, devolucion);
  },
  getAll() {
    return axios.get<IDevolucion[]>(API_URL);
  },
  getById(id: number) {
    return axios.get<IDevolucion>(`${API_URL}/${id}`);
  },
  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
  getByVenta(ventaId: number) {
    return axios.get<IDevolucion[]>(`${API_URL}/venta/${ventaId}`);
  }
};

export default DevolucionService;
