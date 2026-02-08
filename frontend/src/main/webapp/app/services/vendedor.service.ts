import axios from 'axios';
import { IVendedor } from '../shared/model/vendedor.model';

const API_URL = 'api/vendedors';

export const VendedorService = {
  getAll() {
    return axios.get<IVendedor[]>(API_URL);
  },
  getById(id: number) {
    return axios.get<IVendedor>(`${API_URL}/${id}`);
  },
  getByKeycloakId(id: string) {
    return axios.get<IVendedor[]>(`${API_URL}?idKeycloak.equals=${id}`);
  },
  create(vendedor: IVendedor) {
    return axios.post<IVendedor>(API_URL, vendedor);
  },
  update(vendedor: IVendedor) {
    return axios.put<IVendedor>(`${API_URL}/${vendedor.id}`, vendedor);
  },
  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
};

export default VendedorService;
