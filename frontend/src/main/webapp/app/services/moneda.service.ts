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
};

export default MonedaService;
