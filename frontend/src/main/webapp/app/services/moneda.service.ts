import axios from 'axios';
import { IMoneda } from '../shared/model/moneda.model';

const API_URL = 'api/monedas';

export const MonedaService = {
  getAll() {
    return axios.get<IMoneda[]>(API_URL);
  },
  getById(id: number) {
    return axios.get<IMoneda>(`${API_URL}/${id}`);
  },
  create(moneda: IMoneda) {
    return axios.post<IMoneda>(API_URL, moneda);
  },
  update(moneda: IMoneda) {
    return axios.put<IMoneda>(`${API_URL}/${moneda.id}`, moneda);
  },
  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
};

export default MonedaService;
