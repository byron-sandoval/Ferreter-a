import axios from 'axios';
import { IHistorialPrecio } from '../shared/model/historial-precio.model';

const API_HISTORIAL = 'api/historial-precios';

export const HistorialPrecioService = {
  getAll() {
    return axios.get<IHistorialPrecio[]>(API_HISTORIAL);
  },

  getByArticulo(articuloId: number) {
    return axios.get<IHistorialPrecio[]>(`${API_HISTORIAL}?articuloId=${articuloId}`);
  },

  get(id: number) {
    return axios.get<IHistorialPrecio>(`${API_HISTORIAL}/${id}`);
  },
};

export default HistorialPrecioService;
