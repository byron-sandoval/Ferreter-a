import axios from 'axios';
import { ICliente } from '../shared/model/cliente.model';

const API_URL = 'api/clientes';

export const ClienteService = {
  getAll() {
    return axios.get<ICliente[]>(API_URL);
  },

  getById(id: number) {
    return axios.get<ICliente>(`${API_URL}/${id}`);
  },

  getByCedula(cedula: string) {
    return axios.get<ICliente[]>(`${API_URL}?cedula.equals=${cedula}`);
  },

  create(cliente: ICliente) {
    return axios.post<ICliente>(API_URL, cliente);
  },

  update(cliente: ICliente) {
    return axios.put<ICliente>(`${API_URL}/${cliente.id}`, cliente);
  },

  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },

  search(query: string) {
    return axios.get<ICliente[]>(`${API_URL}?nombre.contains=${query}`);
  },
};

export default ClienteService;
