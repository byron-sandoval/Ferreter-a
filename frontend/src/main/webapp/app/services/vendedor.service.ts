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
};

export default VendedorService;
