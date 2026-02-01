import axios from 'axios';
import { INumeracionFactura } from '../shared/model/numeracion-factura.model';

const API_URL = 'api/numeracion-facturas';

export const NumeracionService = {
  getAll() {
    return axios.get<INumeracionFactura[]>(API_URL);
  },
  getById(id: number) {
    return axios.get<INumeracionFactura>(`${API_URL}/${id}`);
  },
};

export default NumeracionService;
